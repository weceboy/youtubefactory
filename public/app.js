const form = document.querySelector('#project-form');
const projectEl = document.querySelector('#project');
const errorEl = document.querySelector('#error');
const historyEl = document.querySelector('#history-list');
const healthEl = document.querySelector('#health');
const submit = document.querySelector('#submit');
let currentProject = null;
const esc = (value = '') => String(value).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const assetCard = asset => asset.error ? `<div class="asset unavailable"><b>${esc(asset.provider)}</b><small>${esc(asset.error)}</small></div>` : `<a class="asset" href="${esc(asset.sourceUrl || '#')}" target="_blank" rel="noreferrer">${asset.thumbUrl || asset.imageUrl ? `<img src="${esc(asset.thumbUrl || asset.imageUrl)}" alt="" loading="lazy">` : '<div class="placeholder">No preview</div>'}<div><b>${esc(asset.provider)}</b><small>${esc(asset.creator || asset.model || 'Generated asset')}</small><small>Asset: ${esc(asset.assetId || asset.externalId)}</small></div></a>`;

function renderProject(project) {
  currentProject = project;
  projectEl.hidden = false;
  projectEl.innerHTML = `<div class="project-head"><div><p class="eyebrow">${esc(project.provider)} generation · v${project.scriptVersions?.length || 1}</p><input id="project-title" class="title-input" value="${esc(project.title)}"><textarea id="project-hook" class="hook-input" rows="2">${esc(project.hook)}</textarea></div><span class="status">${esc(project.status)}</span></div><div class="settings card"><h3>Project settings</h3><div class="settings-grid"><label>Language<input id="setting-language" value="${esc(project.settings?.language || 'en')}"></label><label>Format<select id="setting-format"><option ${project.settings?.format === '16:9' ? 'selected' : ''}>16:9</option><option ${project.settings?.format === '9:16' ? 'selected' : ''}>9:16</option><option ${project.settings?.format === '1:1' ? 'selected' : ''}>1:1</option></select></label><label>Target seconds<input id="setting-duration" type="number" min="15" value="${Number(project.settings?.targetDurationSeconds || 60)}"></label></div><button id="save-project" type="button">Save changes</button><span id="save-status"></span></div><div class="scenes">${project.scenes.map(scene => `<article class="scene"><div class="scene-copy"><span class="scene-number">${String(scene.order).padStart(2, '0')}</span><div><h3>Scene ${String(scene.order).padStart(2, '0')}</h3><textarea class="scene-text" data-scene="${esc(scene.id)}">${esc(scene.text)}</textarea><label>Image prompt<input class="scene-prompt" data-scene="${esc(scene.id)}" value="${esc(scene.imagePrompt)}"></label><button class="generate-image" data-scene="${esc(scene.id)}" type="button">Generate AI image</button></div></div><div class="assets">${scene.assets?.length ? scene.assets.map(assetCard).join('') : '<div class="empty">No visuals yet.</div>'}</div></article>`).join('')}</div>`;
  document.querySelector('#save-project').addEventListener('click', saveProject);
  document.querySelectorAll('.generate-image').forEach(button => button.addEventListener('click', () => generateImage(button.dataset.scene, button)));
}

async function saveProject() {
  const scenes = currentProject.scenes.map(scene => ({ ...scene, text: document.querySelector(`.scene-text[data-scene="${scene.id}"]`).value, imagePrompt: document.querySelector(`.scene-prompt[data-scene="${scene.id}"]`).value }));
  const response = await fetch(`/api/projects/${currentProject.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: document.querySelector('#project-title').value, hook: document.querySelector('#project-hook').value, settings: { language: document.querySelector('#setting-language').value, format: document.querySelector('#setting-format').value, targetDurationSeconds: Number(document.querySelector('#setting-duration').value) }, scenes }) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Could not save project');
  renderProject(payload); document.querySelector('#save-status').textContent = 'Saved'; await loadHistory();
}

async function generateImage(sceneId, button) {
  const scene = currentProject.scenes.find(s => s.id === sceneId); if (!scene) return;
  button.disabled = true; button.textContent = 'Generating…'; errorEl.hidden = true;
  try { const prompt = document.querySelector(`.scene-prompt[data-scene="${sceneId}"]`).value; const response = await fetch(`/api/projects/${currentProject.id}/scenes/${sceneId}/generate-image`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Image generation failed'); renderProject(payload); } catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; } finally { button.disabled = false; button.textContent = 'Generate AI image'; }
}

async function loadHistory() { const projects = await fetch('/api/projects').then(r => r.json()); historyEl.innerHTML = projects.length ? projects.map(p => `<button class="history-item" data-id="${esc(p.id)}"><b>${esc(p.title)}</b><span>${new Date(p.createdAt).toLocaleString()}</span></button>`).join('') : '<p class="muted">No projects yet.</p>'; historyEl.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => { const selected = projects.find(p => p.id === button.dataset.id); if (selected) renderProject(selected); })); }
form.addEventListener('submit', async event => { event.preventDefault(); errorEl.hidden = true; submit.disabled = true; submit.textContent = 'Generating…'; try { const response = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: document.querySelector('#topic').value, notes: document.querySelector('#notes').value }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Generation failed'); renderProject(payload); await loadHistory(); } catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; } finally { submit.disabled = false; submit.textContent = 'Generate MVP project'; } });
fetch('/api/health').then(r => r.json()).then(() => { healthEl.textContent = 'online'; }).catch(() => { healthEl.textContent = 'offline'; });
loadHistory().catch(() => { historyEl.innerHTML = '<p class="muted">Could not load projects.</p>'; });
