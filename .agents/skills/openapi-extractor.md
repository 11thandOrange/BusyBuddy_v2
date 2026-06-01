# OpenAPI Extractor Skill — BusyBuddy_v2

Extract REST API endpoint definitions from BusyBuddy_v2's Express route files
and generate TypeScript `Endpoint[]` definitions for the documentation site.

## Quick Reference

### Find All Route Files
```bash
find web/backend/routes -name "*.js" | sort
```

### Extract All Endpoints
```bash
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" \
  web/backend/routes/ --include="*.js" |
  sed 's/.*router\.//; s/([^,]*/'/
```

### Check for Route Changes
```bash
git diff HEAD~1 --name-only | grep "web/backend/routes/"
```

## Express Pattern Mapping

| Express pattern | HTTP method | Path |
|-----------------|-------------|------|
| `router.get('/', ...)` | GET | `/api/<feature>/` |
| `router.post('/', ...)` | POST | `/api/<feature>/` |
| `router.put('/:id', ...)` | PUT | `/api/<feature>/:id` |
| `router.delete('/:id', ...)` | DELETE | `/api/<feature>/:id` |
| `router.get('/:id', ...)` | GET | `/api/<feature>/:id` |

## TypeScript Output Schema

```typescript
import { Endpoint } from '../types/api';

export const [feature]Endpoints: Endpoint[] = [
  {
    id: '[feature]-list',
    method: 'GET',
    path: '/api/[feature]',
    title: 'List [Feature]',
    description: 'Returns all [feature] for the authenticated shop.',
    parameters: [
      {
        name: 'shop',
        type: 'string',
        required: true,
        description: 'Shop domain from Shopify session header',
        location: 'header',
      },
    ],
    requestBody: null,
    responseExample: {
      success: true,
      data: [],
    },
  },
];
```

## Extraction Script

```bash
#!/bin/bash
# Run from repo root
echo "Extracting Express routes..."
for routefile in web/backend/routes/*/index.js; do
  feature=$(echo "$routefile" | sed 's|web/backend/routes/||; s|/index.js||')
  echo "--- $feature ---"
  grep -n "router\." "$routefile" | grep -E "get|post|put|delete|patch"
done
echo "Done. Update docs/frontend/src/data/endpoints.ts"
```
