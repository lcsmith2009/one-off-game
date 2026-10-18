/* ONE OFF shared rules and local records. No network or runtime dependencies. */
(function (root) {
  'use strict';
  const KEY = 'oneoff-v1', DAY = 86400000;
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  function dayKey(date = new Date()) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function previousDay(day) { return new Date(Date.parse(day) - DAY).toISOString().slice(0, 10); }
  function challengeNumber(day) { return Math.round((Date.parse(day) - Date.parse('2026-09-23')) / DAY) + 1; }
  function normalize(value) {
    const s = object(value) ? { ...value } : {};
    s.runs = count(s.runs); s.best = Math.min(5, count(s.best)); s.streak = count(s.streak);
    s.lastDaily = validDay(s.lastDaily) ? s.lastDaily : '';
    s.dailyRuns = count(s.dailyRuns); s.practiceRuns = count(s.practiceRuns); s.bestPerfectTime = count(s.bestPerfectTime);
    s.dailyScores = Object.fromEntries(Object.entries(object(s.dailyScores) ? s.dailyScores : {})
      .filter(([day, score]) => validDay(day) && Number.isInteger(score) && score >= 0 && score <= 5));
    return s;
  }
  function currentStreak(state, day = dayKey()) {
    return state.lastDaily === day || state.lastDaily === previousDay(day) ? state.streak : 0;
  }
  function createStore(getStorage) {
    let memory = normalize({}), available = true;
    function read() {
      try { const raw = getStorage().getItem(KEY); memory = normalize(raw ? JSON.parse(raw) : {}); available = true; }
      catch (_) { available = false; }
      return normalize(memory);
    }
    function write(state) {
      memory = normalize(state);
      try { getStorage().setItem(KEY, JSON.stringify(memory)); available = true; }
      catch (_) { available = false; }
    }
    function record({ daily, day, score, elapsed }) {
      const s = read();
      // Re-read at completion so a second tab cannot replace the first score.
      const replay = daily && s.dailyScores[day] !== undefined;
      s.runs++; s.best = Math.max(s.best, score); s[daily ? 'dailyRuns' : 'practiceRuns']++; s.lastTime = elapsed;
      const old = s.bestPerfectTime;
      if (score === 5) s.bestPerfectTime = old ? Math.min(old, elapsed) : elapsed;
      if (daily && !replay) {
        s.dailyScores[day] = score;
        // A run left open overnight belongs to its original challenge date.
        if (!s.lastDaily || day > s.lastDaily) {
          s.streak = s.lastDaily === previousDay(day) ? s.streak + 1 : 1;
          s.lastDaily = day;
        }
      }
      write(s);
      return { state: s, replay, saved: available, newBest: score === 5 && (!old || elapsed < old) };
    }
    return { read, record, get available() { return available; } };
  }
  function hash(text) {
    let h = 2166136261;
    for (const char of text) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function generate(seed) {
    // Preserve the approved Build 19 random sequence, targets, and choice order.
    function rnd() {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return ['pick', 'type', 'slider', 'flash', 'pick'].map(mode => {
      const target = Math.floor(rnd() * 77) + 12, c = { mode, target };
      if (mode === 'pick') {
        const sign = rnd() > .5 ? 1 : -1;
        c.choices = [target + sign, target, target + sign * 2, target + sign * 3];
        for (let i = 3; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c.choices[i], c.choices[j]] = [c.choices[j], c.choices[i]]; }
      }
      if (mode === 'flash') {
        const sign = rnd() > .5 ? 1 : -1;
        c.sequence = [target + sign * 4, target + sign * 3, target + sign * 2, target + sign, target, target - sign * 2];
      }
      return c;
    });
  }
  function typedNumber(text) {
    const trimmed = text.trim();
    if (!/^[+-]?\d+$/.test(trimmed)) return null;
    const number = Number(trimmed);
    return Number.isSafeInteger(number) ? number : null;
  }
  function shareText({ daily, replay, day, score, elapsed, results }) {
    return 'ONE OFF ' + (daily ? (replay ? 'Replay #' : 'Daily #') + challengeNumber(day) : 'Practice') +
      ' ' + score + '/5 • ' + elapsed + 's\n' + results.map(x => x ? '🟩' : '🟥').join('') +
      '\n🎯 Miss perfectly.\nhttps://lcsmith2009.github.io/one-off-game/';
  }
  const api = { KEY, dayKey, previousDay, challengeNumber, normalize, currentStreak, createStore, hash, generate, typedNumber, shareText };
  root.OneOffCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
