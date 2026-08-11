const form = document.querySelector('#project-form');
const projectEl = document.querySelector('#project');
const errorEl = document.querySelector('#error');
const historyEl = document.querySelector('#history-list');
const healthEl = document.querySelector('#health');
const submit = document.querySelector('#submit');

const esc = (value = '') => String(value).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function assetCard(asset) {
  if (asset.error) return `<div class="asset unavailable"><b>${esc(asset.provider)}</b><small>${esc(asset.error)}</small></div>`;
  return `<a class="asset" href="${esc(asset.sourceUrl || '#')}" target="_blank" rel="noreferrer">
    ${asset.thumbUrl || asset.imageUrl ? `<img src="${esc(asset.thumbUrl || asset.imageUrl)}" alt="" loading="lazy">` : '<div class="placeholder">No preview</div>'}
    <div><b>${esc(asset.provider)}</b><small>${esc(asset.creator || 'Unknown creator')}</small><small>Asset: ${esc(asset.assetId || asset.externalId)}</small></div>
  </a>`;
}

function renderProject(project) {
  projectEl.hidden = false;
  projectEl.innerHTML = `<div class="project-head">
    <div><p class="eyebrow">${esc(project.provider)} generation</p><h2>${esc(project.title)}</h2><p>${esc(project.hook)}</p></div>
    <span class="status">${esc(project.status)}</span>
  </div>
  <div class="scenes">${project.scenes.map(scene => `<article class="scene">
    <div class="scene-copy"><span class="scene-number">${String(scene.order).padStart(2, '0')}</span><div><h3>Scene ${String(scene.order).padStart(2, '0')}</h3><p>${esc(scene.text)}</p><label>Image prompt<input value="${esc(scene.imagePrompt)}" readonly></label></div></div>
    <div class="assets">${scene.assets.length ? scene.assets.map(assetCard).join('') : '<div class="empty">No configured stock provider. Add API keys to .env.</div>'}</div>
  </article>`).join('')}</div>`;
}

async function loadHistory() {
  const projects = await fetch('/api/projects').then(r => r.json());
  historyEl.innerHTML = projects.length ? projects.map(p => `<button class="history-item" data-id="${esc(p.id)}"><b>${esc(p.title)}</b><span>${new Date(p.createdAt).toLocaleString()}</span></button>`).join('') : '<p class="muted">No projects yet.</p>';
  historyEl.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', async () => {
    const selected = projects.find(p => p.id === button.dataset.id);
    if (selected) renderProject(selected);
  }));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  submit.disabled = true;
  submit.textContent = 'Generating…';
  try {
    const response = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: document.querySelector('#topic').value, notes: document.querySelector('#notes').value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Generation failed');
    renderProject(payload);
    await loadHistory();
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  } finally {
    submit.disabled = false;
    submit.textContent = 'Generate MVP project';
  }
});

fetch('/api/health').then(r => r.json()).then(() => { healthEl.textContent = 'online'; }).catch(() => { healthEl.textContent = 'offline'; });
loadHistory().catch(() => { historyEl.innerHTML = '<p class="muted">Could not load projects.</p>'; });
