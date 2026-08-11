export function buildCaptionSegments(text, durationSeconds, options = {}) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const maxWords = Math.max(1, Number(options.maxWords || 8));
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) chunks.push(words.slice(i, i + maxWords));
  const duration = Math.max(0.1, Number(durationSeconds || 1));
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.join(' ').length, 0) || 1;
  let cursor = 0;
  return chunks.map((chunk, index) => {
    const weight = chunk.join(' ').length / totalChars;
    const startSeconds = cursor;
    const endSeconds = index === chunks.length - 1 ? duration : cursor + duration * weight;
    cursor = endSeconds;
    return { id: `caption_${index + 1}`, text: chunk.join(' '), startSeconds, endSeconds };
  });
}

export function buildProjectCaptions(project) {
  return (project.scenes || []).flatMap(scene => buildCaptionSegments(scene.spokenText || scene.voiceover?.text || '', scene.durationSeconds, { maxWords: 8 }).map(caption => ({ ...caption, sceneId: scene.id })));
}
