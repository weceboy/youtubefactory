import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

export const contentHash = (value) => createHash('sha256').update(String(value)).digest('hex');

export async function readRegistry(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return [];
  }
}

export async function writeRegistry(path, assets) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(assets, null, 2));
}

export function registerAsset(registry, asset, usage) {
  const normalized = {
    ...asset,
    contentHash: asset.contentHash || contentHash(asset.imageUrl || asset.sourceUrl || asset.externalId || asset.prompt),
    usage: []
  };
  const existing = registry.find((item) =>
    (normalized.externalId && item.provider === normalized.provider && item.externalId === normalized.externalId) ||
    (normalized.contentHash && item.contentHash === normalized.contentHash)
  );
  if (existing) {
    existing.usage ??= [];
    if (usage && !existing.usage.some((entry) => entry.projectId === usage.projectId && entry.sceneId === usage.sceneId)) {
      existing.usage.push({ ...usage, usedAt: usage.usedAt || new Date().toISOString() });
    }
    return { asset: existing, created: false };
  }
  if (usage) normalized.usage.push({ ...usage, usedAt: usage.usedAt || new Date().toISOString() });
  registry.push(normalized);
  return { asset: normalized, created: true };
}

export function registrySummary(registry) {
  return {
    count: registry.length,
    usages: registry.reduce((sum, asset) => sum + (asset.usage?.length || 0), 0),
    providers: [...new Set(registry.map((asset) => asset.provider).filter(Boolean))],
    types: [...new Set(registry.map((asset) => asset.assetType).filter(Boolean))]
  };
}
