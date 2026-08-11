# Stage 1 MVP

The thin end-to-end path is implemented. The current work is separating reusable domain logic from HTTP/UI orchestration so the product can grow without rewriting the workflow.

## Implemented

```text
Topic + notes
  -> server-side LLM adapter (or deterministic demo fallback)
  -> scene breakdown
  -> Unsplash / Pexels / Pixabay official API adapters
  -> scene visual gallery
  -> asset provenance + content hash
  -> local project history
  -> editable project/settings/scenes
  -> immutable script snapshots
  -> manual OpenAI-compatible image generation
  -> generation-attempt tracking
  -> reusable asset registry domain
  -> provider/external-ID + content-hash deduplication
  -> usage tracking + registry summaries
  -> reusable script-version snapshot/restore domain
```

## New domain modules

- `lib/asset-registry.mjs` owns asset identity, deduplication, usage records and registry summaries.
- `lib/script-versions.mjs` owns immutable snapshots and restoration semantics while preserving existing scene assets.
- `docs/WORKFLOW.md` documents the production lifecycle and domain boundaries.

The modules are intentionally storage-agnostic so the current JSON persistence can later be replaced with SQLite/Postgres without changing the product concepts.

## Run locally

```bash
cp .env.example .env
npm start
```

Then open `http://localhost:3000`.

No provider credential is required to exercise the UI. The LLM falls back to a deterministic demo script; stock cards remain empty until official stock API keys are configured; AI image generation remains disabled until its server-side provider settings are configured.

## Next implementation slice

1. Wire the global asset registry into stock and generated-asset creation.
2. Add API queries for asset inventory and cross-project usage history.
3. Expose script-version history and restore in the UI.
4. Add script-version diffing.
5. Formalize LLM/image provider adapters behind common interfaces.
6. Add automated smoke tests and validation.
7. Begin the production asset browser/editor before video rendering.
