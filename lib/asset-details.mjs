export function findAsset(projects, assetId) {
  for (const project of projects || []) {
    for (const scene of project.scenes || []) {
      const asset = (scene.assets || []).find(item => (item.assetId || item.id || item.externalId) === assetId);
      if (asset) return { ...asset, projectId: project.id, projectTitle: project.title, sceneId: scene.id, sceneOrder: scene.order };
    }
  }
  return null;
}

export function assetUsage(projects, assetId) {
  const usages = [];
  for (const project of projects || []) for (const scene of project.scenes || []) for (const asset of scene.assets || []) {
    if ((asset.assetId || asset.id || asset.externalId) === assetId) usages.push({ projectId: project.id, projectTitle: project.title, sceneId: scene.id, sceneOrder: scene.order });
  }
  return usages;
}
