---
name: <agent-name>
description: >
  One sentence: what this agent does and for which codebase/scope.
  <example>Short natural-language trigger phrase</example>
  <example>Another trigger phrase</example>
tools:
  - file_editor
  - terminal
model: inherit
permission_mode: never_confirm
---

<!--
AGENT AUTHORING GUIDE
─────────────────────
name          kebab-case, matches the filename (without .md)
description   First sentence is shown in agent selection menus — make it precise.
              <example> tags are used for agent routing — write them as the user
              would invoke the agent, e.g. "Implement issue #42" not "This agent...".
tools         file_editor + terminal covers most cases.
              Add browser if the agent needs to open URLs.
model         inherit = use whatever model the parent conversation uses.
permission_mode  never_confirm = agent never pauses to ask permission mid-task.
-->

# <Agent Name>

<!-- One paragraph: role, scope, and what it never does. -->

You <do X> for <project/scope>. You never <dangerous action 1> or <dangerous action 2>.

## Problem

<!-- What problem does this agent solve? When should it be used? -->

## Prerequisites

```bash
# Verify required env vars and tools before starting
[ -n "$GITHUB_TOKEN" ] && echo "set" || echo "GITHUB_TOKEN missing"
```

## Approach

<!-- Brief description of the strategy this agent uses. -->

## Step 1 — <First Action>

<!-- Concrete bash commands or file operations. -->

```bash

```

## Step 2 — <Second Action>

```bash

```

## Step N — Report

Produce a structured summary on completion:

```markdown
## <Agent Name> Complete: #<NUMBER> — <TITLE>

### Result
<outcome>

### Acceptance Criteria
- [x] <criterion 1>
- [x] <criterion 2>

### Next Steps
<what should run next in the pipeline>
```

## What You Must Never Do

- <hard constraint 1>
- <hard constraint 2>
- Push to `main` or merge without human approval
