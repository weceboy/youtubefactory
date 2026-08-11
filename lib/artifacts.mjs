import { createHash } from 'node:crypto';
import { stat } from 'node:fs/promises';

export async function registerVideoArtifact(filePath, metadata = {}) {
  const info = await stat(filePath);
  if (!info.isFile() || info.size === 0) throw new Error('Rendered artifact is empty');
  return {
    id: crypto.randomUUID(),
    type: 'video',
    path: filePath,
    sizeBytes: info.size,
    sha256: await sha256File(filePath),
    projectId: metadata.projectId || null,
    renderJobId: metadata.renderJobId || null,
    manifestId: metadata.manifestId || null,
    mimeType: 'video/mp4',
    createdAt: new Date().toISOString()
  };
}

async function sha256File(filePath) {
  const { createReadStream } = await import('node:fs');
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}
