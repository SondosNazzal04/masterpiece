import { users } from './data.js';

// Static sample — swap with real GitHub data later
const skillData = {
  u1: [
    { name: 'JavaScript', source: 'GitHub',   strength: 4, confidence: 'high' },
    { name: 'Project planning', source: 'Self', strength: 3, confidence: 'medium' },
    { name: 'PHP', source: 'Course', strength: 2, confidence: 'medium' }
  ],
  u2: [
    { name: 'HTML & CSS', source: 'GitHub',   strength: 5, confidence: 'high' },
    { name: 'JavaScript', source: 'GitHub',   strength: 4, confidence: 'high' },
    { name: 'Figma', source: 'Self',          strength: 3, confidence: 'medium' }
  ],
  u3: [
    { name: 'PHP', source: 'Course',          strength: 4, confidence: 'high' },
    { name: 'MySQL', source: 'Course',        strength: 4, confidence: 'high' },
    { name: 'APIs', source: 'GitHub',         strength: 3, confidence: 'medium' }
  ],
  u4: [
    { name: 'UI design', source: 'Self',      strength: 5, confidence: 'high' },
    { name: 'CSS', source: 'GitHub',          strength: 4, confidence: 'high' },
    { name: 'Bootstrap', source: 'GitHub',    strength: 3, confidence: 'medium' }
  ]
};

document.getElementById('skillProfiles').innerHTML = users.map(u => {
  const skills = skillData[u.id] || [];
  return `
    <div class="skill-card">
      <div class="skill-head">
        <div class="avatar">${u.initials}</div>
        <div>
          <div class="skill-name">${u.name}</div>
          <div class="skill-sub">${skills.length} skill${skills.length === 1 ? '' : 's'} on record</div>
        </div>
      </div>
      <div class="skill-list">
        ${skills.map(s => `
          <div class="skill-row">
            <div class="skill-row-name">${s.name}</div>
            <div class="skill-row-meta">
              <span class="skill-source">${s.source}</span>
              <div class="skill-bar">
                <div class="skill-bar-fill" style="width:${(s.strength / 5) * 100}%"></div>
              </div>
              <span class="skill-confidence">${s.confidence}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}).join('');

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
