function setRevealAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
    return;
  }

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

function pickLabel(item, fallback) {
  return item?.username || item?.name || item?.fullName || item?.title || fallback;
}

function renderRepos(repos) {
  const list = document.getElementById('repo-list');

  if (!Array.isArray(repos) || repos.length === 0) {
    list.innerHTML = '<li class="placeholder">NO REPOSITORIES REGISTERED YET.</li>';
    return;
  }

  list.innerHTML = repos.slice(0, 6).map((repo) => {
    const meta = [repo.status, repo.category].filter(Boolean).join(' / ');
    return `
      <li>
        <div>
          <strong>${repo.fullName}</strong>
          <div class="meta">${repo.channelId}</div>
        </div>
        <span class="meta">${meta || 'SHOWCASE READY'}</span>
      </li>
    `;
  }).join('');
}

function renderLeaderboard(entries) {
  const list = document.getElementById('leaderboard-list');

  if (!Array.isArray(entries) || entries.length === 0) {
    list.innerHTML = '<li class="placeholder">NO LEADERBOARD ENTRIES YET.</li>';
    return;
  }

  list.innerHTML = entries.slice(0, 6).map((entry, index) => {
    const label = pickLabel(entry, `ENTRY ${index + 1}`);
    const score = entry.reputation ?? entry.score ?? entry.points ?? entry.commits ?? entry.prs ?? 0;

    return `
      <li>
        <div>
          <strong>${index + 1}. ${label}</strong>
          <div class="meta">${entry.tier || entry.category || 'COMMUNITY RANKING'}</div>
        </div>
        <span class="meta">${score}</span>
      </li>
    `;
  }).join('');
}

function renderStats(repos, entries) {
  const repoCount = Array.isArray(repos) ? repos.length : 0;
  const leaderboardCount = Array.isArray(entries) ? entries.length : 0;

  const repoStat = document.querySelector('[data-live-stat="repos"]');
  const repoCountStat = document.querySelector('[data-live-stat="repos-count"]');
  const leaderboardStat = document.querySelector('[data-live-stat="leaders"]');

  if (repoStat) repoStat.textContent = String(repoCount);
  if (repoCountStat) repoCountStat.textContent = String(repoCount);
  if (leaderboardStat) leaderboardStat.textContent = String(leaderboardCount);
}

async function fetchSiteMeta() {
  try {
    const response = await fetch('/api/site-meta');
    if (!response.ok) return;

    const meta = await response.json();
    document.querySelectorAll('[data-site-link="invite"]').forEach((link) => {
      if (meta.inviteUrl) link.href = meta.inviteUrl;
    });
    document.querySelectorAll('[data-site-link="dashboard"]').forEach((link) => {
      if (meta.dashboardUrl) link.href = meta.dashboardUrl;
    });
    document.querySelectorAll('[data-site-link="profile"]').forEach((link) => {
      if (meta.profileUrl) link.href = meta.profileUrl;
    });

    const brandSmall = document.querySelector('.brand small');
    if (brandSmall && meta.botStatus) {
      brandSmall.textContent = meta.botStatus;
    }
  } catch (error) {
    console.error('Failed to load site metadata:', error);
  }
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

setRevealAnimations();
fetchSiteMeta();
fetchData();
setInterval(fetchData, 60000);
