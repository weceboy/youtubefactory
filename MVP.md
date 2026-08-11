# MVP Kick-off

The first implementation follows README section 2.0: a thin end-to-end path before the full asset graph.

## Current flow

```text
Topic + notes
  -> server-side LLM adapter (or deterministic demo fallback)
  -> scene breakdown
  -> Unsplash / Pexels / Pixabay official API adapters
  -> scene visual gallery
  -> minimal asset provenance metadata
  -> local project history
```

## Run locally

```bash
cp .env.example .env
# add provider credentials if available
npm start
```

Then open `http://localhost:3000`.

No provider credential is required to exercise the UI: the LLM falls back to a deterministic demo script and stock cards remain empty until an official stock API key is configured.

## Environment

- `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`: any OpenAI-compatible chat provider.
- `UNSPLASH_ACCESS_KEY`: Unsplash API.
- `PEXELS_API_KEY`: Pexels API.
- `PIXABAY_API_KEY`: Pixabay API.

Secrets are read only by the Node server and `.env` is ignored by Git.

## Next implementation slice

1. Add explicit project settings (language, format, target duration, channel).
2. Add script versioning and scene editing.
3. Add manual AI image generation through the provider abstraction.
4. Replace the local JSON store with a durable database once the workflow is validated.
5. Add generation attempts, content hashes, and complete usage history.
