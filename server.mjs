import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');
const DATA = join(ROOT, 'data');
const PROJECTS = join(DATA, 'projects.json');

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

async function readProjects() {
  try {
    return JSON.parse(await readFile(PROJECTS, 'utf8'));
  } catch {
    return [];
  }
}

async function saveProjects(projects) {
  await mkdir(DATA, { recursive: true });
  await writeFile(PROJECTS, JSON.stringify(projects, null, 2));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (raw.length > 1_000_000) throw new Error('Request too large');
  return raw ? JSON.parse(raw) : {};
}

function demoScript(topic) {
  const safe = topic.trim();
  return {
    title: safe || 'Untitled YouTube Story',
    hook: `What if the thing you thought you knew about ${safe || 'this topic'} is wrong?`,
    scenes: [
      { text: `Open with the surprising question behind ${safe || 'the topic'}.`, visual: `Cinematic establishing shot representing ${safe || 'the topic'}.` },
      { text: `Explain the core idea in one clear, useful step.`, visual: `Editorial close-up illustrating the core idea of ${safe || 'the topic'}.` },
      { text: `Show the practical consequence and why viewers should care.`, visual: `Documentary-style scene showing the consequence in context.` },
      { text: `Close with the key takeaway and a reason to keep watching.`, visual: `Hopeful cinematic ending related to ${safe || 'the topic'}.` }
    ]
  };
}

async function generateScript(topic, notes = '') {
  if (!process.env.LLM_BASE_URL || !process.env.LLM_API_KEY || !process.env.LLM_MODEL) {
    return { ...demoScript(topic), provider: 'demo' };
  }

  const prompt = `Return ONLY valid JSON with this shape: {"title":string,"hook":string,"scenes":[{"text":string,"visual":string}]}\nCreate a concise faceless YouTube script about: ${topic}\nOptional research/notes: ${notes}\nUse 4-8 scenes. Each scene needs spoken text and a concrete image search description.`;
  const base = process.env.LLM_BASE_URL.replace(/\/$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.LLM_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.LLM_MODEL, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
  });
  if (!response.ok) throw new Error(`LLM provider returned ${response.status}`);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM provider returned no content');
  const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return { ...JSON.parse(cleaned), provider: 'llm' };
}

async function searchStock(provider, query) {
  const encoded = encodeURIComponent(query);
  if (provider === 'unsplash' && process.env.UNSPLASH_ACCESS_KEY) {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encoded}&per_page=3`, { headers: { authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } });
    if (!r.ok) throw new Error(`Unsplash returned ${r.status}`);
    const data = await r.json();
    return data.results.map((x) => ({ provider, externalId: x.id, sourceUrl: x.links?.html, imageUrl: x.urls?.regular, thumbUrl: x.urls?.small, creator: x.user?.name, license: 'See provider terms' }));
  }
  if (provider === 'pexels' && process.env.PEXELS_API_KEY) {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encoded}&per_page=3`, { headers: { authorization: process.env.PEXELS_API_KEY } });
    if (!r.ok) throw new Error(`Pexels returned ${r.status}`);
    const data = await r.json();
    return data.photos.map((x) => ({ provider, externalId: String(x.id), sourceUrl: x.url, imageUrl: x.src?.large, thumbUrl: x.src?.medium, creator: x.photographer, license: 'See provider terms' }));
  }
  if (provider === 'pixabay' && process.env.PIXABAY_API_KEY) {
    const r = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encoded}&image_type=photo&per_page=3`);
    if (!r.ok) throw new Error(`Pixabay returned ${r.status}`);
    const data = await r.json();
    return data.hits.map((x) => ({ provider, externalId: String(x.id), sourceUrl: x.pageURL, imageUrl: x.largeImageURL, thumbUrl: x.previewURL, creator: x.user, license: 'See provider terms' }));
  }
  return [];
}

async function searchAllStock(query) {
  const providers = ['unsplash', 'pexels', 'pixabay'];
  const results = await Promise.all(providers.map(async (provider) => {
    try { return await searchStock(provider, query); } catch (error) { return [{ provider, error: error.message }]; }
  }));
  return results.flat();
}

async function createProject(input) {
  const topic = String(input.topic || '').trim();
  if (!topic) throw new Error('Topic is required');
  const generated = await generateScript(topic, String(input.notes || ''));
  const scenes = (generated.scenes || []).map((scene, index) => ({
    id: `scene_${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    text: scene.text,
    visualDescription: scene.visual,
    imagePrompt: scene.visual,
    assets: []
  }));
  for (const scene of scenes) {
    const stock = await searchAllStock(scene.imagePrompt);
    scene.assets = stock.map((asset) => ({ ...asset, assetId: randomUUID(), sourceType: 'stock', usage: [{ sceneId: scene.id }] }));
  }
  return {
    id: randomUUID(),
    topic,
    notes: String(input.notes || ''),
    title: generated.title,
    hook: generated.hook,
    provider: generated.provider,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenes
  };
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, service: 'youtube-factory' });
    if (req.method === 'GET' && url.pathname === '/api/projects') return json(res, 200, await readProjects());
    if (req.method === 'POST' && url.pathname === '/api/projects') {
      const project = await createProject(await body(req));
      const projects = await readProjects();
      projects.unshift(project);
      await saveProjects(projects);
      return json(res, 201, project);
    }

    const relative = normalize(url.pathname).replace(/^([.][.][/\\])+/, '');
    const file = relative === '/' ? 'index.html' : relative.slice(1);
    const path = join(PUBLIC, file);
    if (!path.startsWith(PUBLIC) || !existsSync(path)) return json(res, 404, { error: 'Not found' });
    const data = await readFile(path);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
    res.writeHead(200, { 'content-type': `${types[extname(path)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(data);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: error.message || 'Internal server error' });
  }
});

server.listen(PORT, () => console.log(`YouTube Factory running on http://localhost:${PORT}`));
