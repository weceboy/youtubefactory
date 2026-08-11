import { randomUUID } from 'node:crypto';
import { makeSnapshot } from './script-versions.mjs';

export function normalizeScene(scene, index) {
  const prompt = String(scene.imagePrompt || scene.visualDescription || '').trim();
  return { ...scene, id: scene.id || `scene_${String(index + 1).padStart(2, '0')}`, order: index + 1, imagePrompt: prompt, visualDescription: scene.visualDescription || prompt, assets: Array.isArray(scene.assets) ? scene.assets : [] };
}

export function createProjectRecord(input, generated) {
  const scenes = (generated.scenes || []).map(normalizeScene);
  const project = {
    id: randomUUID(),
    topic: String(input.topic || '').trim(),
    notes: String(input.notes || ''),
    title: generated.title,
    hook: generated.hook,
    provider: generated.provider,
    status: 'draft',
    settings: { language: 'en', format: '16:9', targetDurationSeconds: 60, ...(input.settings || {}) },
    scriptVersions: [], generationAttempts: [], scenes,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  project.scriptVersions.push(makeSnapshot(project, 'initial script'));
  return project;
}
