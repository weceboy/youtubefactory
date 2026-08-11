const form = document.querySelector('#project-form');
const projectEl = document.querySelector('#project');
const errorEl = document.querySelector('#error');
const historyEl = document.querySelector('#history-list');
const healthEl = document.querySelector('#health');
const submit = document.querySelector('#submit');
let currentProject = null;
let allProjects = [];
const esc = (value = '') => String(value).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const assetCard = asset => asset.error ? `<div class="asset unavailable"><b>${esc(asset.provider)}</b><small>${esc(asset.error)}</small></div>` : `<a class="asset" href="${esc(asset.sourceUrl || '#')}" target="_blank" rel="noreferrer">${asset.thumbUrl || asset.imageUrl ? `<img src="${esc(asset.thumbUrl || asset.imageUrl)}" alt="" loading="lazy">` : '<div class="placeholder">No preview</div>'}<div><b>${esc(asset.provider)}</b><small>${esc(asset.creator || asset.model || 'Generated asset')}</small><small>${esc(asset.sourceType || 'asset')} · ${esc(asset.assetId || asset.externalId)}</small></div></a>`;
const collectAssets = projects => projects.flatMap(project => (project.scenes || []).flatMap(scene => (scene.assets || []).map(asset => ({ ...asset, projectId: project.id, projectTitle: project.title, sceneId: scene.id, sceneOrder: scene.order }))));

function renderVersions(project) {
  const versions = [...(project.scriptVersions || [])].reverse();
  return `<div class="card version-panel"><div class="panel-head"><div><p class="eyebrow">HISTORY</p><h3>Script versions</h3></div><span class="badge">${versions.length}</span></div>${versions.length ? `<div class="version-list">${versions.map(v => `<div class="version-row"><div><b>v${v.version}</b><span>${esc(v.reason || 'snapshot')}</span><small>${new Date(v.createdAt).toLocaleString()}</small></div><button type="button" class="restore-version" data-version="${esc(v.id)}" ${v.id === project.scriptVersions.at(-1)?.id ? 'disabled' : ''}>${v.id === project.scriptVersions.at(-1)?.id ? 'Current' : 'Restore'}</button></div>`).join('')}</div>` : '<p class="muted">No versions yet.</p>'}</div>`;
}

function renderProject(project) {
  currentProject = project;
  projectEl.hidden = false;
  projectEl.innerHTML = `<div class="project-head"><div><p class="eyebrow">${esc(project.provider)} generation · v${project.scriptVersions?.length || 1}</p><input id="project-title" class="title-input" value="${esc(project.title)}"><textarea id="project-hook" class="hook-input" rows="2">${esc(project.hook)}</textarea></div><span class="status">${esc(project.status)}</span></div><div class="settings card"><h3>Project settings</h3><div class="settings-grid"><label>Language<input id="setting-language" value="${esc(project.settings?.language || 'en')}"></label><label>Format<select id="setting-format"><option ${project.settings?.format === '16:9' ? 'selected' : ''}>16:9</option><option ${project.settings?.format === '9:16' ? 'selected' : ''}>9:16</option><option ${project.settings?.format === '1:1' ? 'selected' : ''}>1:1</option></select></label><label>Target seconds<input id="setting-duration" type="number" min="15" value="${Number(project.settings?.targetDurationSeconds || 60)}"></label></div><button id="save-project" type="button">Save changes</button> <span id="save-status"></span></div>${renderVersions(project)}<div class="scenes">${project.scenes.map(scene => `<article class="scene"><div class="scene-copy"><span class="scene-number">${String(scene.order).padStart(2, '0')}</span><div><h3>Scene ${String(scene.order).padStart(2, '0')}</h3><textarea class="scene-text" data-scene="${esc(scene.id)}">${esc(scene.text)}</textarea><label>Image prompt<input class="scene-prompt" data-scene="${esc(scene.id)}" value="${esc(scene.imagePrompt)}"></label><button class="generate-image" data-scene="${esc(scene.id)}" type="button">Generate AI image</button></div></div><div class="assets">${scene.assets?.length ? scene.assets.map(assetCard).join('') : '<div class="empty">No visuals yet.</div>'}</div></article>`).join('')}</div>`;
  document.querySelector('#save-project').addEventListener('click', saveProject);
  document.querySelectorAll('.generate-image').forEach(button => button.addEventListener('click', () => generateImage(button.dataset.scene, button)));
  document.querySelectorAll('.restore-version').forEach(button => button.addEventListener('click', () => restoreVersion(button.dataset.version, button)));
}

async function saveProject() {
  try {
    const scenes = currentProject.scenes.map(scene => ({ ...scene, text: document.querySelector(`.scene-text[data-scene="${scene.id}"]`).value, imagePrompt: document.querySelector(`.scene-prompt[data-scene="${scene.id}"]`).value }));
    const response = await fetch(`/api/projects/${currentProject.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: document.querySelector('#project-title').value, hook: document.querySelector('#project-hook').value, settings: { language: document.querySelector('#setting-language').value, format: document.querySelector('#setting-format').value, targetDurationSeconds: Number(document.querySelector('#setting-duration').value) }, scenes }) });
    const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Could not save project'); renderProject(payload); document.querySelector('#save-status').textContent = 'Saved'; await loadHistory();
  } catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; }
}

async function restoreVersion(versionId, button) {
  button.disabled = true; button.textContent = 'Restoring…';
  try { const response = await fetch(`/api/projects/${currentProject.id}/versions/${versionId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Restore failed'); renderProject(payload); await loadHistory(); } catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; } finally { button.disabled = false; }
}

async function generateImage(sceneId, button) {
  const scene = currentProject.scenes.find(s => s.id === sceneId); if (!scene) return;
  button.disabled = true; button.textContent = 'Generating…'; errorEl.hidden = true;
  try { const prompt = document.querySelector(`.scene-prompt[data-scene="${sceneId}"]`).value; const response = await fetch(`/api/projects/${currentProject.id}/scenes/${sceneId}/generate-image`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Image generation failed'); renderProject(payload); await loadHistory(); } catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; } finally { button.disabled = false; button.textContent = 'Generate AI image'; }
}

function renderAssetLibrary() {
  const library = document.querySelector('#asset-library'); if (!library) return;
  const query = (document.querySelector('#asset-search')?.value || '').toLowerCase(); const provider = document.querySelector('#asset-provider')?.value || ''; const type = document.querySelector('#asset-type')?.value || '';
  const assets = collectAssets(allProjects).filter(asset => { const haystack = [asset.provider, asset.creator, asset.model, asset.prompt, asset.projectTitle, asset.externalId].filter(Boolean).join(' ').toLowerCase(); return (!query || haystack.includes(query)) && (!provider || asset.provider === provider) && (!type || asset.sourceType === type); });
  const count = document.querySelector('#asset-count'); if (count) count.textContent = String(assets.length);
  if (!assets.length) { library.innerHTML = '<p class="muted">No matching assets.</p>'; return; }
  library.innerHTML = assets.map(asset => `<div class="library-asset">${asset.thumbUrl || asset.imageUrl ? `<img src="${esc(asset.thumbUrl || asset.imageUrl)}" alt="" loading="lazy">` : '<div class="placeholder">No preview</div>'}<div><b>${esc(asset.provider)}</b><small>${esc(asset.creator || asset.model || 'Generated asset')}</small><small>${esc(asset.projectTitle)} · Scene ${esc(asset.sceneOrder)}</small><small>${esc(asset.sourceType || 'asset')}</small></div></div>`).join('');
}

function updateProviderFilter() { const select = document.querySelector('#asset-provider'); if (!select) return; const providers = [...new Set(collectAssets(allProjects).map(a => a.provider).filter(Boolean))]; select.innerHTML = '<option value="">All providers</option>' + providers.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join(''); }

async function loadHistory() {
  allProjects = await fetch('/api/projects').then(r => r.json());
  const count = document.querySelector('#project-count'); if (count) count.textContent = String(allProjects.length);
  historyEl.innerHTML = allProjects.length ? allProjects.map(p => `<button class="history-item" data-id="${esc(p.id)}"><b>${esc(p.title)}</b><span>v${p.scriptVersions?.length || 1} · ${new Date(p.updatedAt || p.createdAt).toLocaleString()}</span></button>`).join('') : '<p class="muted">No projects yet.</p>';
  historyEl.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => { const selected = allProjects.find(p => p.id === button.dataset.id); if (selected) renderProject(selected); }));
  updateProviderFilter(); renderAssetLibrary();
}

form.addEventListener('submit', async event => { event.preventDefault(); errorEl.hidden = true; submit.disabled = true; submit.textContent = 'Generating…'; try { const response = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: document.querySelector('#topic').value, notes: document.querySelector('#notes').value }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Generation failed'); renderProject(payload); await loadHistory(); } catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; } finally { submit.disabled = false; submit.textContent = 'Generate project'; } });
['asset-search', 'asset-provider', 'asset-type'].forEach(id => document.querySelector(`#${id}`)?.addEventListener('input', renderAssetLibrary));
fetch('/api/health').then(r => r.json()).then(() => { healthEl.textContent = 'online'; }).catch(() => { healthEl.textContent = 'offline'; });
loadHistory().catch(() => { historyEl.innerHTML = '<p class="muted">Could not load projects.</p>'; });
