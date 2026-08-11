# Asset Inventory API

The asset inventory domain is designed to sit above the current project JSON store. It exposes a normalized view of scene assets across projects without changing the underlying project format.

## Filters

- `provider`: stock/AI provider identifier
- `sourceType`: `stock` or `generated`
- `query`: searches creator, prompt, external ID, project title and license

## Future HTTP surface

```text
GET /api/assets
GET /api/assets/summary
GET /api/assets/:assetId
GET /api/assets/:assetId/usage
```

The query domain is intentionally independent of HTTP so pagination, sorting, authentication and database-backed storage can be added later without moving business rules into the server router.
