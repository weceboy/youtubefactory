# API

## Projects

- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:id`

## Script versions

- `GET /api/projects/:id/versions`
- `POST /api/projects/:id/versions/:versionId` restores a version and creates a new restore snapshot.

## Assets

- `GET /api/assets?query=&provider=&sourceType=`
- `GET /api/assets/summary`
- `GET /api/assets/:assetId`
- `GET /api/assets/:assetId/usage`

Asset results include project and scene context so the client does not need to reconstruct usage by loading every project.

## Generation

- `POST /api/projects/:projectId/scenes/:sceneId/generate-image`

Provider credentials are never accepted from API request bodies.
