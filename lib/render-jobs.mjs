import { randomUUID } from 'node:crypto';

export function createRenderJob(project, options = {}) {
  return {
    id: randomUUID(),
    projectId: project.id,
    scriptVersionId: options.scriptVersionId || project.scriptVersions?.at(-1)?.id || null,
    status: 'queued',
    format: options.format || project.settings?.format || '16:9',
    resolution: options.resolution || '1920x1080',
    fps: Number(options.fps || 30),
    includeCaptions: options.includeCaptions !== false,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    output: null,
    error: null
  };
}

export function transitionRenderJob(job, status, patch = {}) {
  const allowed = { queued: ['running','cancelled'], running: ['completed','failed','cancelled'], completed: [], failed: [], cancelled: [] };
  if (!allowed[job.status]?.includes(status)) throw new Error(`Invalid render transition: ${job.status} -> ${status}`);
  Object.assign(job, patch, { status });
  if (status === 'running') job.startedAt = new Date().toISOString();
  if (['completed', 'failed', 'cancelled'].includes(status)) job.completedAt = new Date().toISOString();
  return job;
}
