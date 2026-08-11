# YouTube Factory Workflow

## Production lifecycle

1. Create a project from a topic and optional notes.
2. Generate a script and scene breakdown.
3. Edit title, hook, spoken text, and image prompts.
4. Save creates a version snapshot without losing the current asset assignments.
5. Discover stock visuals through official provider APIs.
6. Generate AI visuals through the configured image provider.
7. Register assets by content hash/provider identity.
8. Track project/scene usage and provenance.
9. Restore an earlier script version when needed.

## Domain boundaries

- `lib/asset-registry.mjs`: identity, deduplication, usage and summary logic.
- `lib/script-versions.mjs`: immutable script snapshots and restoration semantics.
- `server.mjs`: HTTP/API orchestration and persistence.
- `public/app.js`: presentation and user interaction.

The JSON store is intentionally retained while the workflow is being validated. A database migration should preserve the same domain concepts rather than leaking storage details into the UI.
