import { registrySummary } from './asset-registry.mjs';

export function buildAssetInventory(projects, filters = {}) {
  const assets = [];
  for (const project of projects) {
    for (const scene of project.scenes || []) {
      for (const asset of scene.assets || []) {
        assets.push({
          ...asset,
          projectId: project.id,
          projectTitle: project.title,
          sceneId: scene.id,
          sceneOrder: scene.order
        });
      }
    }
  }
  return assets.filter(asset => {
    if (filters.provider && asset.provider !== filters.provider) return false;
    if (filters.sourceType && asset.sourceType !== filters.sourceType) return false;
    if (filters.query) {
      const q = String(filters.query).toLowerCase();
      const haystack = [asset.creator, asset.prompt, asset.externalId, asset.projectTitle, asset.license].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function inventorySummary(assets) {
  return registrySummary(assets);
}
