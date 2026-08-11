export function buildFfmpegCommand({ imageInputs = [], audioInput = null, output, durationSeconds, fps = 30 }) {
  if (!output) throw new Error('Output path is required');
  const args = ['-y'];
  for (const image of imageInputs) args.push('-loop', '1', '-t', String(image.durationSeconds), '-i', image.path);
  if (audioInput) args.push('-i', audioInput);
  args.push('-r', String(fps), '-t', String(durationSeconds), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output);
  return args;
}
