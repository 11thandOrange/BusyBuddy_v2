#!/bin/bash
# Claude Code Platform Automation
# Uses Claude AI to work on an issue

set -e

ISSUE_NUMBER="$1"
LABEL_NAME="$2"
REPOSITORY="$3"
GITHUB_TOKEN="$4"

# Claude API configuration
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
CLAUDE_MODEL="${CLAUDE_MODEL:-claude-sonnet-4-20250514}"

main() {
    echo "=== Claude Code Platform ==="
    echo "Issue: #$ISSUE_NUMBER"
    echo "Repository: $REPOSITORY"
    echo ""
    
    if [[ -z "$ANTHROPIC_API_KEY" ]]; then
        echo "::error::ANTHROPIC_API_KEY not set"
        exit 1
    fi
    
    # Set up git config
    setup_git_config
    
    # Create branch for this work
    create_branch
    
    # Fetch issue details
    fetch_issue_details
    
    # Run Claude Code
    run_claude
    
    # Create PR if there are changes
    create_pr_if_needed
    
    # Post comment
    post_comment
}

setup_git_config() {
    echo "Setting up git config..."
    git config --global user.email "automation@github-actions.ai"
    git config --global user.name "GitHub Actions Automation"
}

create_branch() {
    echo ""
    echo "Creating working branch..."
    BRANCH_NAME="automation/issue-${ISSUE_NUMBER}-$(date +%Y%m%d%H%M%S)"
    git checkout -b "$BRANCH_NAME"
    echo "Branch: $BRANCH_NAME"
}

fetch_issue_details() {
    echo ""
    echo "Fetching issue #$ISSUE_NUMBER details..."
    
    ISSUE_DATA=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPOSITORY/issues/$ISSUE_NUMBER")
    
    ISSUE_TITLE=$(echo "$ISSUE_DATA" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
    ISSUE_BODY=$(echo "$ISSUE_DATA" | python3 -c "import json,sys; body=json.load(sys.stdin).get('body',''); print(body if body else 'No description provided')")
    
    echo "Title: $ISSUE_TITLE"
    
    # Save to file for Claude
    cat > /tmp/issue_context.md << EOF
# Issue #$ISSUE_NUMBER: $ISSUE_TITLE

## Description
$ISSUE_BODY

## Repository
$REPOSITORY

## Issue URL
https://github.com/$REPOSITORY/issues/$ISSUE_NUMBER
EOF
    
    echo "Context saved to /tmp/issue_context.md"
}

run_claude() {
    echo ""
    echo "=== Running Claude Code ==="
    
    # Install Claude CLI if not present
    if ! command -v claude &> /dev/null; then
        echo "Installing Claude CLI..."
        npm install -g @anthropic/claude-code
    fi
    
    # Set API key
    export ANTHROPIC_API_KEY
    
    # Create prompt for Claude
    cat > /tmp/claude_prompt.txt << 'EOF'
Analyze and implement the changes for this GitHub issue. 

Steps:
1. Read the issue details in /tmp/issue_context.md
2. Understand the requirements
3. Explore the codebase to understand the structure
4. Implement the required changes
5. Ensure code quality and consistency with existing patterns
6. Write tests if applicable
7. Commit your changes

Be thorough but practical. Focus on solving the actual problem.
EOF
    
    # Run Claude Code with the prompt
    claude --print --no-input \
        --model "$CLAUDE_MODEL" \
        --max-turns 50 \
        "$(cat /tmp/claude_prompt.txt)"
    
    echo ""
    echo "Claude Code completed"
}

create_pr_if_needed() {
    echo ""
    echo "Checking for changes..."
    
    if git diff --quiet && git diff --staged --quiet; then
        echo "No changes to commit"
        return 0
    fi
    
    echo "Changes detected, creating commit..."
    git add -A
    git commit -m "feat: implement issue #$ISSUE_NUMBER

Automated commit by Claude Code

Issue: https://github.com/$REPOSITORY/issues/$ISSUE_NUMBER"
    
    echo "Pushing branch..."
    git push -u origin HEAD
    
    echo "Creating pull request..."
    gh pr create \
        --title "Implement issue #$ISSUE_NUMBER" \
        --body "## Summary
Automated implementation of issue #$ISSUE_NUMBER by Claude Code.

## Issue
$(cat /tmp/issue_context.md)

## Changes
See diff in this pull request." \
        --base main
    
    echo "Pull request created"
}

post_comment() {
    echo ""
    echo "Posting comment on issue #$ISSUE_NUMBER..."
    
    PR_URL=$(gh pr list --head "$(git rev-parse --abbrev-ref HEAD)" --json url --jq '.[0].url' 2>/dev/null || echo "")
    
    if [[ -n "$PR_URL" ]]; then
        COMMENT_BODY="🤖 Claude Code has implemented this issue. 

Pull Request: $PR_URL

The automation has analyzed the issue, made the necessary changes, and created a pull request for review."
    else
        COMMENT_BODY="🤖 Claude Code has analyzed this issue. 

Note: No changes were made (possibly the issue doesn't require code changes)."
    fi
    
    gh issue comment "$ISSUE_NUMBER" --body "$COMMENT_BODY"
}

main "$@"
