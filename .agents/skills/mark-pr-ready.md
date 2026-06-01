# Mark PR Ready Skill

Remove draft status from a pull request, making it ready for review.
This triggers the smoke CI job.

## Command

```bash
gh pr ready <PR_NUMBER> --repo 11thandOrange/BusyBuddy_v2
```

## Verify

```bash
gh pr view <PR_NUMBER> --json isDraft -q '.isDraft'
# Must return: false
```
