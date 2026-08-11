export function buildTimeline(project) {
  let cursor = 0;
  return (project.scenes || []).map((scene, index) => {
    const durationSeconds = Math.max(1, Number(scene.durationSeconds || 5));
    const item = {
      sceneId: scene.id,
      order: scene.order || index + 1,
      startSeconds: cursor,
      endSeconds: cursor + durationSeconds,
      durationSeconds,
      assetIds: (scene.assets || []).map(asset => asset.assetId || asset.id || asset.externalId).filter(Boolean)
    };
    cursor += durationSeconds;
    return item;
  });
}

export function timelineDuration(timeline) {
  return timeline.reduce((max, item) => Math.max(max, item.endSeconds), 0);
}

export function updateSceneDuration(project, sceneId, durationSeconds) {
  const scene = (project.scenes || []).find(item => item.id === sceneId);
  if (!scene) throw new Error('Scene not found');
  scene.durationSeconds = Math.max(1, Math.round(Number(durationSeconds) || 1));
  project.updatedAt = new Date().toISOString();
  return buildTimeline(project);
}
