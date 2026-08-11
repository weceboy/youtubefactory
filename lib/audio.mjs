export function createVoiceoverRecord({ provider, model, voice, text, audioUrl = null, durationSeconds = null }) {
  return {
    id: crypto.randomUUID(),
    assetType: 'audio',
    sourceType: 'generated',
    provider,
    model,
    voice,
    text,
    audioUrl,
    durationSeconds,
    status: audioUrl ? 'ready' : 'pending',
    createdAt: new Date().toISOString()
  };
}

export function attachVoiceover(scene, voiceover) {
  scene.voiceover = voiceover;
  if (Number.isFinite(voiceover.durationSeconds) && voiceover.durationSeconds > 0) {
    scene.durationSeconds = Math.max(scene.durationSeconds || 1, Math.ceil(voiceover.durationSeconds));
  }
  return scene;
}
