import { randomUUID } from 'node:crypto';

export function snapshot(project, reason = 'snapshot') {
  return {
    id: randomUUID(),
    version: (project.scriptVersions?.length || 0) + 1,
    createdAt: new Date().toISOString(),
    reason,
    title: project.title,
    hook: project.hook,
    scenes: structuredClone(project.scenes || []).map(({ assets, ...scene }) => scene)
  };
}

export function restore(project, versionId) {
  const version = (project.scriptVersions || []).find(item => item.id === versionId);
  if (!version) throw new Error('Script version not found');
  project.title = version.title;
  project.hook = version.hook;
  const existing = new Map((project.scenes || []).map(scene => [scene.id, scene]));
  project.scenes = structuredClone(version.scenes).map(scene => ({
    ...scene,
    assets: existing.get(scene.id)?.assets || []
  }));
  project.updatedAt = new Date().toISOString();
  return project;
}
