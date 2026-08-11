import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { resolveAsset } from './media-resolver.mjs';
import { buildFfmpegCommand } from './ffmpeg-command.mjs';
import { validateRenderManifest } from './render-validation.mjs';

export async function renderManifest(manifest, { ffmpegPath = 'ffmpeg' } = {}) {
  const validation = validateRenderManifest(manifest);
  if (!validation.valid) throw new Error(`Invalid render manifest: ${validation.errors.join('; ')}`);
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'youtubefactory-'));
  try {
    const imageInputs = [];
    for (const scene of manifest.scenes) {
      const image = scene.assets.find(asset => asset.sourceType !== 'audio' && asset.sourceUrl);
      if (!image) continue;
      const resolved = await resolveAsset(image, workspace);
      imageInputs.push({ path: resolved, durationSeconds: scene.durationSeconds });
    }
    if (!imageInputs.length) throw new Error('No visual media available for render');
    const output = path.join(workspace, 'output.mp4');
    const args = buildFfmpegCommand({ imageInputs, output, durationSeconds: manifest.timeline.at(-1)?.endSeconds || 1, fps: manifest.settings.fps });
    await new Promise((resolve, reject) => {
      const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', chunk => { stderr += chunk.toString(); });
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited with ${code}: ${stderr.slice(-4000)}`)));
    });
    return { output, workspace };
  } catch (error) {
    await fs.rm(workspace, { recursive: true, force: true });
    throw error;
  }
}
