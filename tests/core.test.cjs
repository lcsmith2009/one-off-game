const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');
function storage(initial) {
  const values = new Map(initial === undefined ? [] : [[core.KEY, JSON.stringify(initial)]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const run = (extra = {}) => ({ daily: true, day: '2026-10-18', score: 3, elapsed: 25, ...extra });
test('Build 19 daily targets and choice order stay unchanged', () => {
  const c = core.generate(core.hash('2026-10-18'));
  assert.deepEqual(c.map(x => x.target), [85,42,31,41,51]);
  assert.deepEqual(c[0].choices, [85,83,82,84]);
  assert.deepEqual(c[4].choices, [52,54,53,51]);
  assert.equal(core.challengeNumber('2026-10-18'), 26);
});
test('3,660 daily seeds have valid, winnable challenges', () => {
  for (let i = 0; i < 3660; i++) {
    const day = new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString().slice(0,10);
    const c = core.generate(core.hash(day));
    assert.deepEqual(c.map(x => x.mode), ['pick','type','slider','flash','pick']);
    for (const round of c) {
      assert.ok(round.target >= 12 && round.target <= 88);
      if (round.choices) {
        assert.equal(new Set(round.choices).size, 4);
        assert.equal(round.choices.filter(x => Math.abs(x-round.target) === 1).length, 1);
        assert.ok(round.choices.includes(round.target));
      }
      if (round.sequence) {
        assert.equal(round.sequence.filter(x => Math.abs(x-round.target) === 1).length,1);
        assert.equal(Math.abs(round.sequence.at(-1)-round.target),2);
      }
    }
  }
});
test('invalid input cannot become NaN, a blank zero, or scientific notation', () => {
  for (const value of ['', ' ', 'abc', '42.5', 'NaN', 'Infinity', '0x2A', '4e1', '9999999999999999999']) assert.equal(core.typedNumber(value), null);
  for (const [value, expected] of [['43',43],[' 41 ',41],['0',0],['-4',-4],['+42',42]]) assert.equal(core.typedNumber(value), expected);
});
test('old records are retained and malformed shapes are repaired', () => {
  const s = core.normalize({ runs: 12, best: 5, streak: 8, lastDaily:'2026-10-18', bestPerfectTime:19, dailyScores:{'2026-10-18':0,'2026-02-31':4, wrong:5}, custom:'keep' });
  assert.equal(s.runs,12); assert.equal(s.bestPerfectTime,19); assert.equal(s.custom,'keep');
  assert.deepEqual(s.dailyScores,{'2026-10-18':0});
  for(const bad of [null,[],5,'x',{dailyScores:[]}]) assert.deepEqual(core.normalize(bad).dailyScores,{});
});
test('first score, including zero, survives replays and another tab', () => {
  const bytes = storage(), a = core.createStore(()=>bytes), b = core.createStore(()=>bytes);
  a.read(); b.read();
  a.record(run({score:0}));
  const repeat = b.record(run({score:5,elapsed:20}));
  assert.equal(repeat.replay,true); assert.equal(repeat.state.dailyScores['2026-10-18'],0);
  assert.equal(repeat.state.streak,1); assert.equal(repeat.state.runs,2); assert.equal(repeat.state.best,5);
});
test('practice and imperfect runs do not change daily streak or perfect record', () => {
  const bytes = storage(), s = core.createStore(()=>bytes);
  s.record(run({score:5,elapsed:30}));
  s.record(run({daily:false,score:4,elapsed:2}));
  const result = s.read();
  assert.equal(result.bestPerfectTime,30); assert.equal(result.practiceRuns,1); assert.equal(result.dailyRuns,1); assert.equal(result.streak,1);
});
test('consecutive days grow a streak, gaps reset it, and old runs cannot move it backward', () => {
  const s = core.createStore(()=>storageBytes), storageBytes = storage();
  s.record(run({day:'2026-10-16'})); s.record(run({day:'2026-10-17'}));
  assert.equal(s.read().streak,2);
  s.record(run({day:'2026-10-19'})); assert.equal(s.read().streak,1);
  s.record(run({day:'2026-10-18'})); assert.equal(s.read().lastDaily,'2026-10-19');
  assert.equal(core.currentStreak(s.read(),'2026-10-21'),0);
});
test('challenge numbering and previous dates do not drift across DST', () => {
  assert.equal(core.challengeNumber('2026-11-02')-core.challengeNumber('2026-11-01'),1);
  assert.equal(core.previousDay('2026-03-09'),'2026-03-08');
  assert.equal(core.dayKey(new Date(2026,0,2,23,59)),'2026-01-02');
});
test('blocked storage and corrupt JSON cannot stop a completed game', () => {
  const blocked = core.createStore(()=>{throw new Error('blocked')});
  assert.equal(blocked.read().runs,0);
  assert.equal(blocked.record(run()).saved,false);
  assert.equal(blocked.read().runs,1);
  const corrupt = core.createStore(()=>({getItem:()=>'{',setItem:()=>{}}));
  assert.equal(corrupt.read().runs,0); assert.equal(corrupt.record(run()).state.runs,1);
});
test('spoiler-free shares include the frozen result, run identity, and playable URL', () => {
  const text = core.shareText({daily:true,replay:true,day:'2026-10-18',score:3,elapsed:54,results:[true,false,true,false,true]});
  assert.match(text,/Replay #26 3\/5 • 54s/); assert.match(text,/🟩🟥🟩🟥🟩/);
  assert.ok(text.endsWith('https://lcsmith2009.github.io/one-off-game/'));
  assert.ok(!text.includes('85'));
});
