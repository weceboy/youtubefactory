export function buildMultitrackArgs(manifest, media) {
  const inputs = [];
  const filters = [];
  const maps = [];
  let inputIndex = 0;

  for (const scene of manifest.scenes || []) {
    const visual = media.visuals?.[scene.id];
    if (!visual) throw new Error(`Missing visual for scene ${scene.id}`);
    inputs.push('-loop', '1', '-t', String(scene.durationSeconds), '-i', visual);
    filters.push(`[${inputIndex}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v${inputIndex}]`);
    inputIndex += 1;
  }

  const videoLabels = (manifest.scenes || []).map((_, i) => `[v${i}]`).join('');
  if ((manifest.scenes || []).length) filters.push(`${videoLabels}concat=n=${manifest.scenes.length}:v=1:a=0[vout]`);

  const voiceInputs = [];
  for (const scene of manifest.scenes || []) {
    if (scene.voiceover?.audioUrl) {
      inputs.push('-i', media.audio?.[scene.id] || scene.voiceover.audioUrl);
      voiceInputs.push({ scene, index: inputIndex });
      inputIndex += 1;
    }
  }

  if (voiceInputs.length) {
    const audioLabels = voiceInputs.map(item => `[${item.index}:a]`).join('');
    filters.push(`${audioLabels}concat=n=${voiceInputs.length}:v=0:a=1[aout]`);
    maps.push('-map', '[vout]', '-map', '[aout]', '-c:a', 'aac');
  } else {
    maps.push('-map', '[vout]', '-an');
  }

  return [...inputs, '-filter_complex', filters.join(';'), ...maps, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
}
