export function flattenProjectAssets(projects) {
  const rows = [];
  for (const project of projects || []) {
    for (const scene of project.scenes || []) {
      for (const asset of scene.assets || []) {
        rows.push({
          ...asset,
          projectId: project.id,
          projectTitle: project.title,
          sceneId: scene.id,
          sceneOrder: scene.order
        });
      }
    }
  }
  return rows;
}

export function findAssetUsage(projects, assetId) {
  return flattenProjectAssets(projects)
    .filter(asset => asset.assetId === assetId)
    .map(({ projectId, projectTitle, sceneId, sceneOrder, assetId: id }) => ({ projectId, projectTitle, sceneId, sceneOrder, assetId: id }));
}

export function filterAssets(assets, filters = {}) {
  const query = String(filters.query || '').trim().toLowerCase();
  return assets.filter(asset => {
    if (filters.provider && asset.provider !== filters.provider) return false;
    if (filters.sourceType && asset.sourceType !== filters.sourceType) return false;
    if (query) {
      const haystack = [asset.provider, asset.creator, asset.prompt, asset.externalId, asset.projectTitle, asset.license].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function summarizeAssets(assets) {
  return {
    total: assets.length,
    stock: assets.filter(asset => asset.sourceType === 'stock').length,
    generated: assets.filter(asset => asset.sourceType === 'generated').length,
    providers: [...new Set(assets.map(asset => asset.provider).filter(Boolean))],
    projects: [...new Set(assets.map(asset => asset.projectId))].length
  };
}
