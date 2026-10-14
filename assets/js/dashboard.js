import {
  users, projects, tasks, memberships,
  currentUser, userById, projectById,
  roleInProject, isLeadOnAny
} from './data.js';

/* ---------- Read scope from URL ---------- */
const params = new URLSearchParams(location.search);
const scopeProject = params.get('p');       // null or 'p1'
const scopeMine    = params.get('mine') === '1';

/* ---------- Populate project dropdown ---------- */
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

/* ---------- Filter tasks by scope ---------- */
let visible = tasks;
if (scopeProject) visible = visible.filter(t => t.projectId === scopeProject);
if (scopeMine)    visible = visible.filter(t => t.assignee === currentUser);

/* ---------- Role detection ---------- */
const visibleProjectIds = scopeProject
  ? [scopeProject]
  : [...new Set(visible.map(t => t.projectId))];
const isLead = isLeadOnAny(currentUser, visibleProjectIds);

/* ---------- Apply role visibility ---------- */
document.querySelectorAll('[data-lead-only]').forEach(el => {
  el.style.display = isLead ? '' : 'none';
});

/* ---------- Summary cards ---------- */
const counts = {
  todo:     visible.filter(t => t.status === 'todo').length,
  progress: visible.filter(t => t.status === 'progress').length,
  review:   visible.filter(t => t.status === 'review').length,
  done:     visible.filter(t => t.status === 'done').length
};

document.getElementById('summary').innerHTML = `
  <div class="card"><div class="num">${counts.todo}</div>     <div class="label">To do</div></div>
  <div class="card"><div class="num">${counts.progress}</div> <div class="label">In progress</div></div>
  <div class="card"><div class="num">${counts.review}</div>   <div class="label">In review</div></div>
  <div class="card"><div class="num">${counts.done}</div>     <div class="label">Done</div></div>
`;

/* ---------- Row builder ---------- */
function taskRow(t, extra = '') {
  const u = userById(t.assignee);
  return `
    <div class="task-row">
      <span class="dot ${t.priority}"></span>
      <span>${t.title}</span>
      <span class="task-meta">${u.initials} · ${t.due}${extra}</span>
    </div>
  `;
}

/* ---------- Workload per member (lead-only) ---------- */
const workloadEl = document.getElementById('workload');
const openTasks = visible.filter(t => t.status !== 'done');
const byUser = {};
openTasks.forEach(t => { byUser[t.assignee] = (byUser[t.assignee] || 0) + 1; });

workloadEl.innerHTML = Object.entries(byUser)
  .sort((a, b) => b[1] - a[1])
  .map(([uid, n]) => {
    const u = userById(uid);
    return `
      <div class="task-row">
        <div class="avatar">${u.initials}</div>
        <span>${u.name}</span>
        <span class="task-meta">${n} open task${n === 1 ? '' : 's'}</span>
      </div>
    `;
  })
  .join('') || `<p class="empty">No open tasks in this scope.</p>`;

/* ---------- My upcoming tasks ---------- */
document.getElementById('mine').innerHTML = visible
  .filter(t => t.assignee === currentUser && t.status !== 'done')
  .map(t => taskRow(t))
  .join('') || `<p class="empty">Nothing assigned to you here. Nice.</p>`;

/* ---------- Needs attention ---------- */
document.getElementById('attention').innerHTML = visible
  .filter(t => t.status !== 'done' && (t.priority === 'high' || t.status === 'review'))
  .map(t => taskRow(t))
  .join('') || `<p class="empty">Nothing urgent.</p>`;

/* ---------- Across projects ---------- */
document.getElementById('acrossProjects').innerHTML = projects.map(p => {
  const pt = tasks.filter(t => t.projectId === p.id);
  if (!pt.length) return '';
  const done = pt.filter(t => t.status === 'done').length;
  const pct = Math.round((done / pt.length) * 100);
  const role = roleInProject(currentUser, p.id);
  return `
    <div class="task-row">
      <span>${p.name}</span>
      <span class="task-meta">${role} · ${done}/${pt.length} · ${pct}%</span>
    </div>
  `;
}).join('');

/* ---------- Wire the scope bar ---------- */
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

/* ---------- Mobile sidebar toggle ---------- */
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

/* ---------- Reflect user in topbar ---------- */
const me = userById(currentUser);
document.getElementById('userAvatar').textContent = me.initials;
document.getElementById('userName').textContent = me.name.split(' ')[0];
