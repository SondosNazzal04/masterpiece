import {
  projects, tasks, currentUser,
  userById, projectById, roleInProject, isLeadOnAny
} from './data.js';

/* ---------- Scope from URL ---------- */
const params = new URLSearchParams(location.search);
const scopeProject = params.get('p');
const scopeMine    = params.get('mine') === '1';

/* ---------- Project dropdown ---------- */
const projectFilter = document.getElementById('projectFilter');
projects.forEach(p => {
  const opt = document.createElement('option');
  opt.value = p.id;
  opt.textContent = p.name;
  projectFilter.appendChild(opt);
});
projectFilter.value = scopeProject || '';

const roleFilter = document.getElementById('roleFilter');
roleFilter.value = scopeMine ? 'assigned' : 'all';

/* ---------- Filter ---------- */
let visible = tasks;
if (scopeProject) visible = visible.filter(t => t.projectId === scopeProject);
if (scopeMine)    visible = visible.filter(t => t.assignee === currentUser);

/* ---------- Role detection ---------- */
const visibleProjectIds = scopeProject
  ? [scopeProject]
  : [...new Set(visible.map(t => t.projectId))];
const isLead = isLeadOnAny(currentUser, visibleProjectIds);

document.querySelectorAll('[data-lead-only]').forEach(el => {
  el.style.display = isLead ? '' : 'none';
});

/* ---------- Columns ---------- */
const COLUMNS = [
  { key: 'todo',     label: 'To Do'       },
  { key: 'progress', label: 'In Progress' },
  { key: 'review',   label: 'In Review'   },
  { key: 'done',     label: 'Done'        }
];

function cardHTML(t) {
  const u = userById(t.assignee);
  return `
    <div class="task-card" data-task-id="${t.id}">
      <div class="card-id">${t.id}</div>
      <div class="card-title">${t.title}</div>
      <div class="card-meta">
        <div class="avatar avatar-sm">${u.initials}</div>
        <span class="card-due">${t.due}</span>
      </div>
    </div>
  `;
}

document.getElementById('board').innerHTML = COLUMNS.map(col => {
  const items = visible.filter(t => t.status === col.key);
  const body = items.length
    ? items.map(cardHTML).join('')
    : `<p class="empty">No tasks here.</p>`;
  return `
    <div class="column">
      <div class="column-head">
        <span>${col.label}</span>
        <span class="column-count">${items.length}</span>
      </div>
      ${body}
    </div>
  `;
}).join('');

/* ---------- Modal ---------- */
const backdrop = document.getElementById('modalBackdrop');
const modalBody = document.getElementById('modalBody');

function openTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const u = userById(t.assignee);
  const p = projectById(t.projectId);

  modalBody.innerHTML = `
    <div class="modal-id">${t.id} · ${p.name}</div>
    <h2>${t.title}</h2>
    <div class="modal-tags">
      <span class="tag tag-${t.priority}">${t.priority} priority</span>
      <span class="tag">difficulty ${t.difficulty}/5</span>
      <span class="tag tag-${t.status}">${t.status}</span>
    </div>
    <div class="modal-assignee">
      <div class="avatar avatar-sm">${u.initials}</div>
      <div>
        <div style="font-weight:500">${u.name}</div>
        <div style="color:var(--muted);font-size:13px">Due ${t.due}</div>
      </div>
    </div>
    <h3 class="modal-section">Definition of Done</h3>
    <ul class="dod">
      ${t.dod.map(d => `<li>${d}</li>`).join('')}
    </ul>
  `;
  backdrop.classList.add('open');
}

function closeModal() {
  backdrop.classList.remove('open');
}

document.getElementById('board').addEventListener('click', e => {
  const card = e.target.closest('.task-card');
  if (card) openTask(card.dataset.taskId);
});

document.getElementById('modalClose').addEventListener('click', closeModal);

backdrop.addEventListener('click', e => {
  if (e.target === backdrop) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- Scope bar ---------- */
projectFilter.addEventListener('change', e => {
  const url = new URL(location.href);
  if (e.target.value) url.searchParams.set('p', e.target.value);
  else url.searchParams.delete('p');
  location.href = url.toString();
});

roleFilter.addEventListener('change', e => {
  const url = new URL(location.href);
  if (e.target.value === 'assigned') url.searchParams.set('mine', '1');
  else url.searchParams.delete('mine');
  location.href = url.toString();
});

/* ---------- Mobile sidebar ---------- */
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

/* ---------- Topbar user ---------- */
const me = userById(currentUser);
document.getElementById('userAvatar').textContent = me.initials;
document.getElementById('userName').textContent = me.name.split(' ')[0];
