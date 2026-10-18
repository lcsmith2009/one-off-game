/* Home and stats only; all gameplay uses play-v2.js. */
(function () {
  'use strict';
  const core = OneOffCore, store = core.createStore(() => localStorage);
  const el = id => document.getElementById(id);
  function updateStats() {
    const s = store.read(), today = core.dayKey(), streak = core.currentStreak(s, today);
    const best = s.runs ? s.best + '/5' : '—';
    for (const [id, value] of Object.entries({ streakHome: streak, bestHome: best, playsHome: s.runs,
      modalRuns: s.runs, modalBest: best, modalStreak: streak })) el(id).textContent = value;
    el('dailyLabel').textContent = "TODAY'S RUN • " + today;
    el('perfectTimeHome').textContent = s.bestPerfectTime ? 'FASTEST PERFECT • ' + s.bestPerfectTime + ' SEC' : '';
    const next = [3, 7, 14, 30].find(n => n > streak) || (Math.floor(streak / 10) + 1) * 10;
    el('milestone').textContent = streak ? '🔥 ' + streak + ' day streak • ' + (next - streak) + ' to ' + next : 'Start your first streak today.';
    const done = s.dailyScores[today] !== undefined;
    el('playBtn').textContent = done ? 'PLAY TODAY AGAIN • ' + s.dailyScores[today] + '/5' : "PLAY TODAY'S 5";
    el('returnNote').textContent = done ? 'Today is complete. Replays keep your first score. A fresh Daily arrives tomorrow.' : '';
    el('storageNote').textContent = store.available ? '' : 'Stats cannot be saved in this browser. You can still play.';
  }
  const dialog = el('modal');
  el('statsBtn').onclick = () => { updateStats(); dialog.showModal(); };
  el('closeModal').onclick = () => dialog.close();
  dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
  window.addEventListener('pageshow', updateStats);
  window.addEventListener('storage', updateStats);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateStats(); });
  updateStats();
})();
