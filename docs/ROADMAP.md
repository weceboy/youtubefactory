# Production roadmap

## Completed foundation

- Topic -> script -> scenes
- Editable project settings and scenes
- Stock discovery adapters
- AI image generation attempts
- Asset provenance and hashing
- Script snapshots and restore domain
- Global asset inventory/query domain
- Provider configuration boundary

## Current milestone: production management

1. Wire asset inventory into HTTP API.
2. Add script history/restore endpoints.
3. Build asset browser UI.
4. Build version history UI.
5. Move provider network calls into dedicated adapters.
6. Add smoke tests and fixture data.

## Next milestone: media production

1. Voice-over generation.
2. Audio asset registry.
3. Timeline/scene duration model.
4. Subtitle/caption model.
5. Video render job abstraction.
6. FFmpeg/local render prototype.
7. Render artifact registry.

The product should not jump directly to rendering until script, scene, asset and provenance data are stable enough to make a render reproducible.
