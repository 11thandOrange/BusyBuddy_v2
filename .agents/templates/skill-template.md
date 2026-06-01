# <Skill Name> Skill

<!--
SKILL AUTHORING GUIDE
─────────────────────
Skills are reference documents — no YAML frontmatter, no agent persona.
They describe HOW to do something (commands, patterns, error handling).
Agents read skills and execute the steps themselves.

A skill should answer:
  1. What does this do?
  2. What are the prerequisites?
  3. What are the exact commands?
  4. What does success look like?
  5. What does failure look like and how do you fix it?

Keep it imperative and concrete. No "you should" — just commands and outcomes.
-->

<!-- One sentence: what this skill does and for which scope/project. -->

## Problem

<!-- What problem does this skill solve? When is it used in the pipeline? -->

## Prerequisites

```bash
# Check required env vars and tools
[ -n "$REQUIRED_VAR" ] && echo "set" || echo "missing"
```

## Approach

<!-- Brief description of the strategy or mechanism used. -->

## Commands

<!-- Core commands. Add inline comments explaining non-obvious flags. -->

```bash

```

## Success Output

<!-- What does a successful run look like? Paste representative output. -->

```
<expected output>
```

## Pipeline Usage

<!-- How an agent calls this skill in context. -->

```bash
# Example invocation from a pipeline step

```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| | | |

## Never Do

- <hard constraint 1>
- <hard constraint 2>
