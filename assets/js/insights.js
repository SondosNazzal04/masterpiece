import { tasks, users, projects, userById, projectById } from './data.js';

/* ---------- Scope ---------- */
const params = new URLSearchParams(location.search);
const scopeProject = params.get('p');
const visible = scopeProject ? tasks.filter(t => t.projectId === scopeProject) : tasks;

/* ---------- Helpers ---------- */
const open = t => t.status !== 'done';
const openByUser = {};
users.forEach(u => { openByUser[u.id] = visible.filter(t => t.assignee === u.id && open(t)).length; });

const avgOpen = Object.values(openByUser).reduce((a, b) => a + b, 0) / users.length;
const overloadThreshold = Math.max(3, Math.ceil(avgOpen * 1.5));
const underuseThreshold = 1;

/* ---------- Risks ---------- */
const overdue = visible.filter(open).slice(0, 3);
const overloaded = Object.entries(openByUser)
  .filter(([, n]) => n >= overloadThreshold)
  .map(([uid, n]) => ({ user: userById(uid), count: n }));
const underused = Object.entries(openByUser)
  .filter(([, n]) => n <= underuseThreshold)
  .map(([uid, n]) => ({ user: userById(uid), count: n }));
const stalled = visible.filter(t => t.status === 'review').slice(0, 3);

/* ---------- Summary tiles ---------- */
const riskCount = overdue.length + overloaded.length + stalled.length;

document.getElementById('riskSummary').innerHTML = `
  <div class="risk-tile ${overdue.length ? 'risk-tile-warn' : ''}">
    <div class="risk-num">${overdue.length}</div>
    <div class="risk-label">Overdue</div>
  </div>
  <div class="risk-tile ${overloaded.length ? 'risk-tile-warn' : ''}">
    <div class="risk-num">${overloaded.length}</div>
    <div class="risk-label">Overloaded</div>
  </div>
  <div class="risk-tile ${stalled.length ? 'risk-tile-warn' : ''}">
    <div class="risk-num">${stalled.length}</div>
    <div class="risk-label">Stalled</div>
  </div>
  <div class="risk-tile">
    <div class="risk-num">${riskCount}</div>
    <div class="risk-label">Total flags</div>
  </div>
`;

/* ---------- Meta line ---------- */
const scopeName = scopeProject ? projectById(scopeProject).name : 'all projects';
document.getElementById('insightsMeta').textContent =
  `Looking at ${scopeName}. ${riskCount} item${riskCount === 1 ? '' : 's'} need attention.`;

/* ---------- Section renderer ---------- */
function section(title, items, render) {
  if (!items.length) return '';
  return `
    <section class="risk-section">
      <div class="risk-section-head">
        <h2>${title}</h2>
        <span class="risk-count">${items.length}</span>
      </div>
      <div class="risk-list">${items.map(render).join('')}</div>
    </section>
  `;
}

function actionRow(actions) {
  return `<div class="risk-actions">${actions.map(a =>
    `<button class="risk-action" data-action="${a.key}">${a.label}</button>`
  ).join('')}</div>`;
}

/* ---------- Sections ---------- */
let html = '';

html += section('Overdue', overdue, t => {
  const u = userById(t.assignee);
  return `
    <div class="risk-item">
      <div class="risk-item-main">
        <div class="risk-item-title">
          <span class="risk-dot risk-dot-danger"></span>
          <span class="risk-id">${t.id}</span>
          <span>${t.title}</span>
        </div>
        <div class="risk-item-sub">Assigned to ${u.name} · due ${t.due}</div>
        <div class="risk-ai">
          <span class="risk-ai-tag">AI</span>
          Past the due date with no linked activity. This task likely needs a decision, not more time.
        </div>
      </div>
      ${actionRow([
        { key: 'reassign', label: 'Reassign' },
        { key: 'extend',   label: 'Extend deadline' },
        { key: 'blocked',  label: 'Mark blocked' }
      ])}
    </div>
  `;
});

html += section('Workload imbalance', overloaded, ({ user, count }) => {
  const others = underused.map(x => x.user.name).join(', ') || 'a teammate';
  return `
    <div class="risk-item">
      <div class="risk-item-main">
        <div class="risk-item-title">
          <span class="risk-dot risk-dot-warn"></span>
          <span>${user.name} has ${count} open tasks</span>
        </div>
        <div class="risk-item-sub">Compare with ${others}.</div>
        <div class="risk-ai">
          <span class="risk-ai-tag">AI</span>
          Suggest moving the lowest-priority task to a teammate with capacity. Keeps the schedule on track without overloading one person.
        </div>
      </div>
      ${actionRow([
        { key: 'reassign', label: 'Reassign a task' },
        { key: 'ignore',   label: 'Ignore' }
      ])}
    </div>
  `;
});

html += section('Stalled in review', stalled, t => {
  const u = userById(t.assignee);
  return `
    <div class="risk-item">
      <div class="risk-item-main">
        <div class="risk-item-title">
          <span class="risk-dot risk-dot-warn"></span>
          <span class="risk-id">${t.id}</span>
          <span>${t.title}</span>
        </div>
        <div class="risk-item-sub">In review · assignee ${u.name}</div>
        <div class="risk-ai">
          <span class="risk-ai-tag">AI</span>
          Sitting in review with no recent movement. Ask the reviewer to confirm or reopen.
        </div>
      </div>
      ${actionRow([
        { key: 'nudge',  label: 'Nudge reviewer' },
        { key: 'done',   label: 'Move to done' },
        { key: 'reopen', label: 'Reopen' }
      ])}
    </div>
  `;
});

if (html) {
  document.getElementById('riskSections').innerHTML = html;
} else {
  document.getElementById('allClear').hidden = false;
}

/* ---------- Mobile sidebar ---------- */
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

/* ---------- Action buttons (placeholders) ---------- */
document.getElementById('riskSections').addEventListener('click', e => {
  const btn = e.target.closest('.risk-action');
  if (!btn) return;
  const item = btn.closest('.risk-item');
  item.style.opacity = '0.4';
  item.style.pointerEvents = 'none';
});
