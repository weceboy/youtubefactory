export function validateRenderManifest(manifest) {
  const errors = [];
  if (!manifest?.projectId) errors.push('projectId is required');
  if (!manifest?.scriptVersionId) errors.push('scriptVersionId is required');
  if (!Array.isArray(manifest?.scenes) || !manifest.scenes.length) errors.push('at least one scene is required');
  if (!Array.isArray(manifest?.timeline)) errors.push('timeline is required');
  for (const scene of manifest?.scenes || []) {
    if (!scene.id) errors.push('scene id is required');
    if (!(Number(scene.durationSeconds) > 0)) errors.push(`scene ${scene.id || '?'} has invalid duration`);
  }
  for (const item of manifest?.timeline || []) {
    if (!(item.endSeconds > item.startSeconds)) errors.push(`timeline item ${item.sceneId || '?'} has invalid range`);
  }
  return { valid: errors.length === 0, errors };
}
