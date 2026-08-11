# Asset Registry

The factory keeps one global logical record for every reusable visual/audio/video asset.

## Identity

An asset is deduplicated by provider + external ID when available, otherwise by a SHA-256 content hash. The registry must never require copying the underlying media to create another usage reference.

## Required provenance

Every registered asset should retain:

- `assetId`
- `assetType`
- `sourceType`
- `provider`
- `externalId`
- `sourceUrl`
- `imageUrl` / storage reference
- `creator`
- `license`
- `contentHash`
- `usage[]`

Generated assets additionally retain the model, prompt and generation-attempt ID.

## Usage history

Each usage contains `projectId`, `sceneId`, and `usedAt`. This makes it possible to answer both provenance questions:

1. Where did this asset come from?
2. Which projects/scenes have used it?

## Safety rule

A provider license is never inferred as unrestricted. The registry stores the provider/license reference so the final publishing pipeline can perform an explicit rights check.

## Storage

The current MVP uses `data/assets.json` deliberately. Once the workflow is validated, this file should be replaced by a transactional database without changing the asset-domain contract.
