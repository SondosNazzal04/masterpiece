export const users = [
  { id: 'u1', name: 'Yazan Ahmad', initials: 'YA' },
  { id: 'u2', name: 'Lina Odeh',   initials: 'LO' },
  { id: 'u3', name: 'Omar Khalil', initials: 'OK' },
  { id: 'u4', name: 'Sara Nasser', initials: 'SN' }
];

export const projects = [
  {
    id: 'p1',
    name: 'CampusConnect',
    due: 'Nov 06, 2026',
    description: 'A student-built platform to discover campus events.',
    coverSlug: 'forest',        // gradient preset — swap for coverImage later
    coverImage: null            // '/assets/images/covers/campusconnect.jpg'
  },
  {
    id: 'p2',
    name: 'Portfolio site',
    due: 'Dec 01, 2026',
    description: 'Personal portfolio for graduation showcase.',
    coverSlug: 'terracotta',
    coverImage: null
  }
];

export const memberships = [
  { userId: 'u1', projectId: 'p1', role: 'lead'   },
  { userId: 'u1', projectId: 'p2', role: 'member' },
  { userId: 'u2', projectId: 'p1', role: 'member' },
  { userId: 'u3', projectId: 'p1', role: 'member' },
  { userId: 'u4', projectId: 'p1', role: 'member' },
  { userId: 'u2', projectId: 'p2', role: 'member' },
  { userId: 'u3', projectId: 'p2', role: 'member' }
];

// Currently signed-in user (hardcoded for the static phase)
export const currentUser = 'u1';

export const tasks = [
  // --- CampusConnect (p1) ---
  { id: 'TF-105', projectId: 'p1', title: 'Build event discovery page',
    status: 'progress', priority: 'high', difficulty: 3,
    assignee: 'u2', due: 'Oct 14',
    dod: ['Grid layout done', 'Filter by category', 'Empty state designed'] },

  { id: 'TF-106', projectId: 'p1', title: 'Connect event registration API',
    status: 'progress', priority: 'high', difficulty: 4,
    assignee: 'u3', due: 'Oct 15',
    dod: ['POST /register returns 201', 'Duplicate check works'] },

  { id: 'TF-107', projectId: 'p1', title: 'Design student profile',
    status: 'progress', priority: 'med', difficulty: 2,
    assignee: 'u4', due: 'Oct 16',
    dod: ['Mobile layout approved'] },

  { id: 'TF-108', projectId: 'p1', title: 'Test sign-in flow',
    status: 'review', priority: 'high', difficulty: 2,
    assignee: 'u2', due: 'Oct 14',
    dod: ['Wrong password shows error', 'Session persists on refresh'] },

  { id: 'TF-109', projectId: 'p1', title: 'Write README setup steps',
    status: 'todo', priority: 'low', difficulty: 1,
    assignee: 'u1', due: 'Oct 20',
    dod: ['Steps tested on clean machine'] },

  { id: 'TF-110', projectId: 'p1', title: 'Fix header on small screens',
    status: 'todo', priority: 'med', difficulty: 2,
    assignee: 'u4', due: 'Oct 18',
    dod: ['No overflow at 375px'] },

  { id: 'TF-101', projectId: 'p1', title: 'Set up project repo',
    status: 'done', priority: 'high', difficulty: 1,
    assignee: 'u1', due: 'Oct 01',
    dod: ['Repo created', 'README added'] },

  { id: 'TF-102', projectId: 'p1', title: 'Database schema draft',
    status: 'done', priority: 'high', difficulty: 3,
    assignee: 'u3', due: 'Oct 05',
    dod: ['Tables defined', 'Reviewed by team'] },

  { id: 'TF-103', projectId: 'p1', title: 'Landing page wireframe',
    status: 'done', priority: 'med', difficulty: 2,
    assignee: 'u4', due: 'Oct 08',
    dod: ['Approved by team'] },

  { id: 'TF-104', projectId: 'p1', title: 'Auth flow spec',
    status: 'done', priority: 'high', difficulty: 2,
    assignee: 'u1', due: 'Oct 10',
    dod: ['Documented in wiki'] },

  // --- Portfolio site (p2) ---
  { id: 'TF-201', projectId: 'p2', title: 'Write about section',
    status: 'progress', priority: 'med', difficulty: 1,
    assignee: 'u1', due: 'Nov 10',
    dod: ['Two paragraphs done'] },

  { id: 'TF-202', projectId: 'p2', title: 'Publish first project case study',
    status: 'todo', priority: 'high', difficulty: 3,
    assignee: 'u1', due: 'Nov 20',
    dod: ['Screenshots included', 'Outcome summarized'] }
];

// --- Helpers ---
export function userById(id) {
  return users.find(u => u.id === id);
}

export function projectById(id) {
  return projects.find(p => p.id === id);
}

export function roleInProject(userId, projectId) {
  const m = memberships.find(x => x.userId === userId && x.projectId === projectId);
  return m ? m.role : null;
}

// Is the current user a lead on *any* of the visible projects?
export function isLeadOnAny(userId, projectIds) {
  return memberships.some(m =>
    m.userId === userId &&
    m.role === 'lead' &&
    (projectIds.length === 0 || projectIds.includes(m.projectId))
  );
}
