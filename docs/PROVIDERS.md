# Provider boundaries

YouTube Factory keeps external AI and stock providers behind explicit adapter boundaries.

## Current providers

- LLM: OpenAI-compatible `/chat/completions` endpoint.
- Image: OpenAI-compatible `/images/generations` endpoint.
- Stock: Unsplash, Pexels and Pixabay official APIs.

`lib/provider-adapters.mjs` exposes configuration state without exposing credentials to the client. The next refactor will move network calls themselves into provider modules so the HTTP server only coordinates domain services.

## Security rules

- Provider API keys stay server-side.
- Never persist provider secrets in project JSON.
- Generated asset records store model/provider metadata, not credentials.
- Stock provenance should retain the source URL, creator where supplied, and provider terms reference.
