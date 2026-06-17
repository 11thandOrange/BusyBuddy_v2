# OpenHands Cloud - Postman Collection

Postman collection and environment for managing OpenHands Cloud automations.

## Files

- `OpenHands_Automations.postman_collection.json` - API requests for all automation operations
- `OpenHands_Cloud.postman_environment.json` - Environment variables (API key, automation IDs)

## Repositories Covered

- `11thandOrange/BusyBuddy_v2`
- `11thandOrange/OrderMate`
- `HeyItsChloe/mates4ever` (Orbit)
- `openhands/openhands`

## Setup

### 1. Import into Postman

1. Open Postman
2. Click **Import** → Select both JSON files
3. The collection and environment will be added

### 2. Configure Environment

1. Select the **OpenHands Cloud** environment
2. Set your API key:
   - Go to https://app.all-hands.dev/settings/api-keys
   - Copy your API key
   - Paste into the `OPENHANDS_API_KEY` variable (mark as "Secret")

## How to Specify an Issue (Option 3)

**You can specify which GitHub issue to process via a message sent after triggering!**

### Step-by-Step Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. SET ENVIRONMENT VARIABLES                                     │
│     • ISSUE_NUMBER = 42 (your issue number)                      │
│     • REPO = 11thandOrange/BusyBuddy_v2                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. TRIGGER AUTOMATION                                           │
│     Navigate to repo folder → Pipeline → "Trigger with Issue"     │
│     → Click Send                                                  │
│     → Copy the run_id from response                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. POLL FOR STATUS                                              │
│     Core Operations → Poll Run Status                            │
│     → Use the run_id from step 2                                 │
│     → Click Send repeatedly until status=RUNNING                 │
│     → Copy the conversation_id                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. SEND ISSUE CONTEXT MESSAGE ★                                  │
│     Core Operations → Send Issue Context Message                  │
│     → conversation_id is auto-filled                             │
│     → ISSUE_NUMBER and REPO are used in the message              │
│     → This tells the agent WHICH issue to process!               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. VIEW LOGS                                                    │
│     Core Operations → Get Conversation Messages                  │
│     → Click Send to see agent progress                            │
│     → Keep polling to watch the agent work                       │
└──────────────────────────────────────────────────────────────────┘
```

### The Message Payload

When you use "Send Issue Context Message", it sends:

```json
{
  "role": "user",
  "content": "Please process GitHub issue #42 in repository 11thandOrange/BusyBuddy_v2.\n\nFetch the issue details, implement the requested changes, create tests, and open a pull request.\n\nIssue URL: https://github.com/11thandOrange/BusyBuddy_v2/issues/42"
}
```

The agent will:
1. Fetch the issue from GitHub
2. Understand the requirements
3. Implement the changes
4. Create tests
5. Open a pull request

## Automations Available

| Repository | Pipeline | Automation ID |
|------------|----------|--------------|
| BusyBuddy_v2 | Autonomous Dev | `dcef1629-3d1d-460e-aabc-df497b3a1780` |
| BusyBuddy_v2 | Complex Logic | `a90b4b0a-4e2c-442b-8900-2fc9404621f7` |
| OrderMate | Autonomous Dev | `a2160444-1cd6-4b58-867c-f80bf244c288` |
| OrderMate | Complex Logic | `4b407b72-551f-4f99-8950-d168759be2b7` |
| mates4ever (Orbit) | Autonomous Dev | `c14e1769-8b86-4554-8c4b-f9f4d25400aa` |
| mates4ever (Orbit) | Complex Logic | `d4e8824f-cb8d-4176-a902-ee4821e348a4` |
| openhands/openhands | Dev Pipeline | `c0bcb429-57fb-4f9b-af84-90adfec5e01a` |

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/automation/v1/{id}/dispatch` | Trigger automation |
| GET | `/automation/v1/{id}/runs/{run_id}` | Poll run status |
| POST | `/conversation/{id}/messages` | Send issue context |
| GET | `/conversation/{id}/messages` | View logs |

## Postman Collection Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `baseUrl` | `https://app.all-hands.dev/api` | API base URL |
| `OPENHANDS_API_KEY` | (empty) | Your API key |
| `ISSUE_NUMBER` | `42` | GitHub issue to process |
| `REPO` | `11thandOrange/BusyBuddy_v2` | Repository |
| `AUTOMATION_ID` | (set by trigger) | Current automation |
| `run_id` | (set by trigger) | Current run |
| `conversation_id` | (set by poll) | For logs |

## Troubleshooting

### "401 Unauthorized"
- Check that `OPENHANDS_API_KEY` is set correctly
- Make sure it's marked as a "Secret" type in Postman

### No `conversation_id` in response
- Poll the run status endpoint every 5-10 seconds
- Status lifecycle: `PENDING` → `RUNNING` → `COMPLETED/FAILED`

### View in Browser
For real-time log viewing, open:
```
https://app.all-hands.dev/conversations/{conversation_id}
```

## Important Notes

- **NO NEW AUTOMATIONS ARE CREATED** in this repository
- **NO BRANCHES OR ISSUES** are created in `openhands/openhands`
- The workflow lets you specify ANY issue via the message payload
- You can re-use the same automation for different issues by changing `ISSUE_NUMBER` and `REPO`
