#!/bin/bash
# OpenHands Platform Automation
# Triggers OpenHands to work on an issue

set -e

ISSUE_NUMBER="$1"
LABEL_NAME="$2"
REPOSITORY="$3"
GITHUB_TOKEN="$4"

OPENHANDS_HOST="${OPENHANDS_HOST:-http://localhost:18000}"
OPENHANDS_API_KEY="${OPENHANDS_API_KEY:-}"

main() {
    echo "=== OpenHands Platform ==="
    echo "OpenHands Host: $OPENHANDS_HOST"
    echo "Issue: #$ISSUE_NUMBER"
    echo ""
    
    # For local backend, set up tunnel
    if [[ -z "$OPENHANDS_HOST" || "$OPENHANDS_HOST" == "http://localhost:18000" ]]; then
        echo "Setting up cloudflared tunnel for local backend..."
        setup_tunnel
    fi
    
    # Trigger OpenHands
    trigger_openhands
    
    # Post comment
    post_comment
}

setup_tunnel() {
    echo "Installing cloudflared..."
    if ! command -v cloudflared &> /dev/null; then
        curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
        chmod +x /usr/local/bin/cloudflared
    fi
    
    TUNNEL_OUTPUT=$(mktemp)
    nohup cloudflared tunnel --url http://localhost:18000 > "$TUNNEL_OUTPUT" 2>&1 &
    CF_PID=$!
    echo "cloudflared PID: $CF_PID"
    
    # Wait for tunnel URL
    echo "Waiting for tunnel URL..."
    for i in {1..30}; do
        sleep 2
        TUNNEL_URL=$(grep -o 'https://[^ ]*trycloudflare.com' "$TUNNEL_OUTPUT" | head -1)
        if [[ -n "$TUNNEL_URL" ]]; then
            echo "Tunnel URL: $TUNNEL_URL"
            OPENHANDS_HOST="$TUNNEL_URL"
            rm -f "$TUNNEL_OUTPUT"
            return 0
        fi
        echo "Attempt $i/30 - waiting for tunnel..."
    done
    
    echo "::error::Failed to get tunnel URL"
    rm -f "$TUNNEL_OUTPUT"
    kill $CF_PID 2>/dev/null || true
    exit 1
}

trigger_openhands() {
    echo "Calling OpenHands API..."
    
    API_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 120 -X POST \
        "$OPENHANDS_HOST/api/v1/app-conversations" \
        -H "Content-Type: application/json" \
        ${OPENHANDS_API_KEY:+-H "Authorization: Bearer $OPENHANDS_API_KEY"} \
        -d "{
            \"initial_message\": {
                \"content\": [
                    {
                        \"type\": \"text\",
                        \"text\": \"Issue #$ISSUE_NUMBER has been labeled with '$LABEL_NAME'. Please analyze this issue and implement the required changes. Issue URL: https://github.com/$REPOSITORY/issues/$ISSUE_NUMBER\"
                    }
                ]
            },
            \"selected_repository\": \"$REPOSITORY\"
        }")
    
    HTTP_STATUS=$(echo "$API_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '$d')
    
    echo "HTTP Status: $HTTP_STATUS"
    echo "Response: $RESPONSE_BODY"
    
    if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "201" ]]; then
        echo "OpenHands triggered successfully"
        return 0
    else
        echo "::error::OpenHands API call failed"
        return 1
    fi
}

post_comment() {
    echo ""
    echo "Posting comment on issue #$ISSUE_NUMBER..."
    COMMENT_BODY="🤖 OpenHands has been triggered to work on this issue. Check progress at $OPENHANDS_HOST"
    gh issue comment "$ISSUE_NUMBER" --body "$COMMENT_BODY"
}

main "$@"
