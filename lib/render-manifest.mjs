import { randomUUID } from 'node:crypto';
import { buildTimeline } from './timeline.mjs';
import { buildProjectCaptions } from './captions.mjs';

export function createRenderManifest(project, options = {}) {
  const timeline = buildTimeline(project);
  return {
    id: randomUUID(),
    version: 1,
    projectId: project.id,
    scriptVersionId: options.scriptVersionId || project.scriptVersions?.at(-1)?.id || null,
    createdAt: new Date().toISOString(),
    settings: {
      format: options.format || project.settings?.format || '16:9',
      resolution: options.resolution || '1920x1080',
      fps: Number(options.fps || 30)
    },
    scenes: (project.scenes || []).map(scene => ({
      id: scene.id,
      order: scene.order,
      spokenText: scene.spokenText || scene.voiceover?.text || '',
      durationSeconds: scene.durationSeconds || 5,
      assets: (scene.assets || []).map(asset => ({
        assetId: asset.assetId || asset.id || asset.externalId || null,
        provider: asset.provider || null,
        sourceType: asset.sourceType || null,
        sourceUrl: asset.sourceUrl || asset.imageUrl || null
      })),
      voiceover: scene.voiceover ? {
        id: scene.voiceover.id,
        audioUrl: scene.voiceover.audioUrl || null,
        durationSeconds: scene.voiceover.durationSeconds || null,
        provider: scene.voiceover.provider || null,
        voice: scene.voiceover.voice || null
      } : null
    })),
    timeline,
    captions: options.includeCaptions === false ? [] : buildProjectCaptions(project)
  };
}
