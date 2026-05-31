const themeKey = 'gitcord-theme';

function getPreferredTheme() {
  return localStorage.getItem(themeKey) || 'dark';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(themeKey, theme);
}

function setRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  elements.forEach((element) => observer.observe(element));
}

function pickName(item, fallback) {
  return item?.username || item?.name || item?.fullName || item?.title || fallback;
}

function renderRepos(repos) {
  const list = document.getElementById('repo-list');

  if (!Array.isArray(repos) || repos.length === 0) {
    list.innerHTML = '<li class="placeholder">No repositories registered yet.</li>';
    return;
  }

  list.innerHTML = repos.slice(0, 5).map((repo) => {
    const meta = [repo.status, repo.category].filter(Boolean).join(' • ');
    return `
      <li>
        <div>
          <strong>${repo.fullName}</strong>
          <div class="meta">${repo.channelId}</div>
        </div>
        <span class="meta">${meta || 'Showcase ready'}</span>
      </li>
    `;
  }).join('');
}

function renderLeaderboard(entries) {
  const list = document.getElementById('leaderboard-list');

  if (!Array.isArray(entries) || entries.length === 0) {
    list.innerHTML = '<li class="placeholder">No leaderboard entries yet.</li>';
    return;
  }

  list.innerHTML = entries.slice(0, 5).map((entry, index) => {
    const label = pickName(entry, `Entry ${index + 1}`);
    const score = entry.reputation ?? entry.score ?? entry.points ?? entry.commits ?? entry.prs ?? 0;
    return `
      <li>
        <div>
          <strong>${index + 1}. ${label}</strong>
          <div class="meta">${entry.tier || entry.category || 'Community ranking'}</div>
        </div>
        <span class="meta">${score}</span>
      </li>
    `;
  }).join('');
}

function renderStats(repos, entries) {
  const repoCount = Array.isArray(repos) ? repos.length : 0;
  const leaderboardCount = Array.isArray(entries) ? entries.length : 0;

  document.querySelector('[data-live-stat="repos"]').textContent = String(repoCount);
  document.querySelector('[data-live-stat="leaders"]').textContent = String(leaderboardCount);
}

async function fetchData() {
  try {
    const [reposResponse, leaderboardResponse] = await Promise.all([
      fetch('/api/repositories'),
      fetch('/api/leaderboard'),
    ]);

    const repos = reposResponse.ok ? await reposResponse.json() : [];
    const leaderboard = leaderboardResponse.ok ? await leaderboardResponse.json() : [];

    renderRepos(repos);
    renderLeaderboard(leaderboard);
    renderStats(repos, leaderboard);
  } catch (error) {
    console.error('Failed to load landing page data:', error);
    renderRepos([]);
    renderLeaderboard([]);
    renderStats([], []);
  }
}

function setupThemeToggle() {
  const button = document.getElementById('theme-toggle');
  applyTheme(getPreferredTheme());

  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });
}

setupThemeToggle();
setRevealAnimations();
fetchData();
setInterval(fetchData, 60000);
