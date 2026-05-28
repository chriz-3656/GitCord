async function fetchData() {
    try {
        const [reposResponse, leaderboardResponse] = await Promise.all([
            fetch('/api/repositories'),
            fetch('/api/leaderboard')
        ]);

        const repos = await reposResponse.json();
        const leaderboard = await leaderboardResponse.json();

        renderRepos(repos);
        renderLeaderboard(leaderboard);
        renderStats(repos, leaderboard);
        document.getElementById('status').textContent = 'System Online • ' + new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('status').textContent = 'System Error';
    }
}

function renderRepos(repos) {
    const list = document.getElementById('repo-list');
    list.innerHTML = repos.map(repo => `
        <tr class="border-t border-zinc-800">
            <td class="p-4 font-medium">${repo.fullName}</td>
            <td class="p-4 text-zinc-400 font-mono text-sm">${repo.channelId}</td>
        </tr>
    `).join('');
}

function renderLeaderboard(contributors) {
    const list = document.getElementById('contributor-list');
    list.innerHTML = contributors.map((c, i) => `
        <div class="flex items-center justify-between mb-4 last:mb-0">
            <div class="flex items-center gap-3">
                <span class="text-zinc-500 font-mono w-4">${i + 1}</span>
                <img src="${c.avatarUrl || 'https://github.com/identicons/gitcord.png'}" class="w-8 h-8 rounded-full border border-zinc-700">
                <span class="font-medium">${c.username}</span>
            </div>
            <div class="flex gap-4 text-xs font-mono">
                <span class="text-green-500">${c.commits} C</span>
                <span class="text-indigo-400">${c.prs} PR</span>
            </div>
        </div>
    `).join('');
}

function renderStats(repos, contributors) {
    const container = document.getElementById('stats');
    const totalCommits = contributors.reduce((acc, c) => acc + c.commits, 0);
    
    const stats = [
        { label: 'Active Repositories', value: repos.length, color: 'text-indigo-500' },
        { label: 'Total Contributors', value: contributors.length, color: 'text-green-500' },
        { label: 'Total Commits', value: totalCommits, color: 'text-orange-500' }
    ];

    container.innerHTML = stats.map(s => `
        <div class="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <p class="text-sm text-zinc-400 mb-1">${s.label}</p>
            <p class="text-3xl font-bold ${s.color}">${s.value}</p>
        </div>
    `).join('');
}

fetchData();
setInterval(fetchData, 30000);
