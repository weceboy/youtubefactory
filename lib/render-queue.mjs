import { createRenderJob, transitionRenderJob } from './render-jobs.mjs';
import { createRenderManifest } from './render-manifest.mjs';

export function enqueueRender(project, options = {}) {
  const job = createRenderJob(project, options);
  const manifest = createRenderManifest(project, options);
  job.manifestId = manifest.id;
  return { job, manifest };
}

export function startRender(job) {
  return transitionRenderJob(job, 'running');
}

export function completeRender(job, output) {
  return transitionRenderJob(job, 'completed', { output });
}

export function failRender(job, error) {
  return transitionRenderJob(job, 'failed', { error: String(error?.message || error) });
}
