import { users, tasks, memberships, projectById, currentUser } from './data.js';

const params = new URLSearchParams(location.search);
const scopeProject = params.get('p') || 'p1';

const team = memberships
  .filter(m => m.projectId === scopeProject)
  .map(m => {
    const user = users.find(u => u.id === m.userId);
    const userTasks = tasks.filter(t => t.projectId === scopeProject && t.assignee === m.userId);
    const open = userTasks.filter(t => t.status !== 'done').length;
    const done = userTasks.filter(t => t.status === 'done').length;
    return { user, role: m.role, open, done };
  });

document.getElementById('teamGrid').innerHTML = team.map(({ user, role, open, done }) => `
  <div class="member-card">
    <div class="member-avatar">${user.initials}</div>
    <div class="member-info">
      <div class="member-name">${user.name}</div>
      <div class="member-role">${role === 'lead' ? 'Team lead' : 'Member'}</div>
    </div>
    <div class="member-stats">
      <div class="member-stat">
        <div class="member-stat-num">${open}</div>
        <div class="member-stat-label">open</div>
      </div>
      <div class="member-stat">
        <div class="member-stat-num">${done}</div>
        <div class="member-stat-label">done</div>
      </div>
    </div>
  </div>
`).join('');

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
