# Stage 1 MVP

The thin end-to-end path is now implemented and the next slice is focused on making the workflow editable and traceable.

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
```

## Run locally

```bash
cp .env.example .env
npm start
```

Then open `http://localhost:3000`.

No provider credential is required to exercise the UI. The LLM falls back to a deterministic demo script; stock cards remain empty until official stock API keys are configured; AI image generation remains disabled until its server-side provider settings are configured.

## Environment

- `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`: any OpenAI-compatible chat provider.
- `IMAGE_BASE_URL`, `IMAGE_API_KEY`, `IMAGE_MODEL`: any compatible image-generation provider.
- `UNSPLASH_ACCESS_KEY`: Unsplash API.
- `PEXELS_API_KEY`: Pexels API.
- `PIXABAY_API_KEY`: Pixabay API.

Secrets are read only by the Node server and `.env` is ignored by Git.

## Next implementation slice

1. Promote asset metadata into a global asset registry.
2. Add cross-project usage-history queries.
3. Add provider/external-ID and content-hash deduplication.
4. Add script-version comparison and restore.
5. Formalize LLM/image provider adapters.
6. Add automated smoke tests before rendering work.
