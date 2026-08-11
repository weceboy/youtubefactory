import { join } from 'node:path';
import { readRegistry, registrySummary } from '../lib/asset-registry.mjs';

const registry = await readRegistry(join(process.cwd(), 'data', 'assets.json'));
const summary = registrySummary(registry);
console.log(JSON.stringify(summary, null, 2));
for (const asset of registry) {
  console.log(`${asset.assetId || '-'} | ${asset.provider || '-'} | ${asset.assetType || asset.sourceType || '-'} | usages=${asset.usage?.length || 0}`);
}
