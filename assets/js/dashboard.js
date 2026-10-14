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
/* ---------- Counts ---------- */
const counts = {
  todo:     visible.filter(t => t.status === 'todo').length,
  progress: visible.filter(t => t.status === 'progress').length,
  review:   visible.filter(t => t.status === 'review').length,
  done:     visible.filter(t => t.status === 'done').length
};

const totalTasks = visible.length;
const pct = totalTasks ? Math.round((counts.done / totalTasks) * 100) : 0;

/* ---------- Project cover ---------- */
const coverEl = document.getElementById('projectCover');
const activeProject = scopeProject
  ? projectById(scopeProject)
  : projects[0];

if (activeProject) {
  coverEl.dataset.slug = activeProject.coverSlug || 'forest';
  document.getElementById('coverTitle').textContent = activeProject.name;
  document.getElementById('coverDeadline').textContent = `Due ${activeProject.due}`;
  document.getElementById('coverProgressLabel').textContent = `${pct}% complete`;
  document.getElementById('coverProgressFill').style.width = pct + '%';

  if (activeProject.coverImage) {
    coverEl.dataset.hasImage = 'true';
    coverEl.style.setProperty('--cover-image', `url('${activeProject.coverImage}')`);
  }
}

/* ---------- Ring ---------- */
const CIRC = 2 * Math.PI * 34;   // 213.6 — circumference of r=34
const ringFill = document.getElementById('ringFill');
ringFill.setAttribute('stroke-dasharray', CIRC);
ringFill.setAttribute('stroke-dashoffset', CIRC);

requestAnimationFrame(() => {
  ringFill.style.strokeDashoffset = CIRC * (1 - pct / 100);
});

/* ---------- Ring number + banner text ---------- */
const ringNum = document.getElementById('ringNum');
countUp(ringNum, 0, pct, 900);

const doneCount = counts.done;
const totalCount = visible.length;
document.getElementById('progressSub').textContent =
  `${doneCount} of ${totalCount} task${totalCount === 1 ? '' : 's'} done`;

// Pick a message based on progress
const titleEl = document.getElementById('progressTitle');
if (pct === 100) {
  titleEl.textContent = 'Project complete. Nice work.';
} else if (pct >= 60) {
  titleEl.textContent = "You're almost there.";
} else if (pct >= 25) {
  titleEl.textContent = "You're making steady progress.";
} else if (pct > 0) {
  titleEl.textContent = 'Just getting started.';
} else {
  titleEl.textContent = 'Nothing done yet — pick a task.';
}
/* ---------- Summary cards ---------- */
document.getElementById('summary').innerHTML = `
  <div class="card"><div class="num" data-count="${counts.todo}">0</div>     <div class="label">To do</div></div>
  <div class="card"><div class="num" data-count="${counts.progress}">0</div> <div class="label">In progress</div></div>
  <div class="card"><div class="num" data-count="${counts.review}">0</div>   <div class="label">In review</div></div>
  <div class="card"><div class="num" data-count="${counts.done}">0</div>     <div class="label">Done</div></div>
`;

document.querySelectorAll('.summary .num[data-count]').forEach(el => {
  countUp(el, 0, parseInt(el.dataset.count, 10), 500);
});

/* ---------- Count-up helper ---------- */
function countUp(el, from, to, duration = 500, suffix = '') {
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);            // ease-out
    el.textContent = Math.round(from + (to - from) * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

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
