import fs from 'node:fs/promises';
import path from 'node:path';

export async function resolveAsset(asset, workspace) {
  const source = asset?.sourceUrl || asset?.audioUrl;
  if (!source) throw new Error(`Missing media source for asset ${asset?.assetId || asset?.id || 'unknown'}`);
  const ext = asset.assetType === 'audio' ? '.mp3' : '.jpg';
  const target = path.join(workspace, `${asset.assetId || asset.id || 'asset'}${ext}`);
  if (source.startsWith('file://')) {
    await fs.copyFile(new URL(source), target);
    return target;
  }
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Failed to fetch media (${response.status})`);
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
    return target;
  }
  throw new Error(`Unsupported media source for asset ${asset?.assetId || asset?.id || 'unknown'}`);
}
