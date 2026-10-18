const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const core = require('../core.js');
const source = name => fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8');
function boot({ home=false, standalone=false, search='?mode=daily', storage=new Map(), navigator={}, blocked=false }={}) {
  const { window, document } = parseHTML(source(standalone?'one-off-itch.html':home?'index.html':'v2.html'));
  window.HTMLElement.prototype.focus = function(){document._focused=this};
  window.HTMLElement.prototype.select = function(){document._selected=this};
  window.HTMLElement.prototype.showModal = function(){this.setAttribute('open','')};
  window.HTMLElement.prototype.close = function(){this.removeAttribute('open')};
  let now=0, timerID=0;
  const timers=new Map();
  const storageAPI = {getItem:key=>{if(blocked)throw Error('blocked');return storage.get(key)??null},setItem:(key,value)=>{if(blocked)throw Error('blocked');storage.set(key,value)}};
  const addTimer=(fn,delay,interval)=>{const id=++timerID;timers.set(id,{fn,at:now+delay,interval});return id};
  class FixedDate extends Date {constructor(...args){super(...(args.length?args:['2026-10-18T12:00:00Z']))} static now(){return 1792324800000+now}}
  const context=vm.createContext({document,window,navigator,localStorage:storageAPI,location:{search,reload(){}},Date:FixedDate,URLSearchParams,performance:{now:()=>now},setTimeout:(fn,delay)=>addTimer(fn,delay,0),setInterval:(fn,delay)=>addTimer(fn,delay,delay),clearTimeout:id=>timers.delete(id),clearInterval:id=>timers.delete(id),console});
  if(standalone){for(const script of document.querySelectorAll('script'))vm.runInContext(script.textContent,context)}
  else {vm.runInContext(source('core.js'),context);vm.runInContext(source(home?'app.js':'play-v2.js'),context)}
  function tick(ms){const end=now+ms;let guard=0;while(true){const next=[...timers.entries()].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;if(guard++>10000)throw Error('timer loop');const [id,t]=next;now=t.at;if(!t.interval)timers.delete(id);t.fn();if(t.interval&&timers.has(id))t.at+=t.interval}now=end}
  const el=id=>document.getElementById(id);
  const click=id=>{assert.ok(el(id),'Missing '+id);el(id).click()};
  return {document,window,storage,tick,el,click,get pendingTimers(){return timers.size}};
}
function answerPick(p,correct=true){const target=Number(p.el('target').textContent);const buttons=[...p.document.querySelectorAll('.choice')];buttons.find(b=>correct?Math.abs(Number(b.textContent)-target)===1:Number(b.textContent)===target).click()}
function finish(p,{perfect=true,timeout=false}={}){
  answerPick(p,perfect);p.click('nextBtn');
  p.el('num').value=String(Number(p.el('target').textContent)+(perfect?1:0));p.click('submit');p.click('nextBtn');
  p.el('range').value=String(Number(p.el('target').textContent)+(perfect?1:0));p.click('lock');p.click('nextBtn');
  p.click('flash');p.tick(timeout?5000:900+650*(perfect?3:4));if(!timeout)p.click('flash');p.click('nextBtn');
  answerPick(p,perfect);p.click('nextBtn');
}
test('all five real UI rounds finish perfectly, save once, and preserve frozen sharing time',async()=>{
  let shared='';const p=boot({navigator:{clipboard:{writeText:async text=>{shared=text}}}});
  finish(p);assert.equal(p.el('resultTitle').textContent,'PERFECTLY WRONG.');
  assert.equal(p.document.querySelector('.score-ring b').textContent,'5/5');
  assert.equal(JSON.parse(p.storage.get(core.KEY)).runs,1);
  p.tick(90000);p.click('share');await new Promise(setImmediate);
  assert.match(shared,/5\/5 • 3s/);assert.match(shared,/https:\/\/lcsmith2009.github.io/);
  assert.equal(p.el('shareStatus').textContent,'Result copied!');assert.equal(p.pendingTimers,0);
});
test('zero-score game and Quick Tap timeout complete without a dead end',()=>{
  const p=boot();finish(p,{perfect:false,timeout:true});
  assert.equal(p.document.querySelector('.score-ring b').textContent,'0/5');
  assert.equal(p.pendingTimers,0);assert.equal(JSON.parse(p.storage.get(core.KEY)).dailyScores['2026-10-18'],0);
});
test('invalid answers keep the round open, Enter submits once, and locked inputs disable',()=>{
  const p=boot();answerPick(p);p.click('nextBtn');
  for(const invalid of ['', '  ','abc','Infinity','42.5']){
    p.el('num').value=invalid;p.click('submit');
    assert.match(p.el('feedback').textContent,/whole number/);
    assert.ok(p.el('nextBtn').classList.contains('hidden'));
  }
  p.el('num').value='43';p.el('num').onkeydown({key:'Enter',preventDefault(){}});
  assert.match(p.el('feedback').textContent,/PERFECTLY WRONG/);assert.equal(p.el('num').disabled,true);
  p.el('num').onkeydown({key:'Enter',preventDefault(){}});p.click('nextBtn');
  assert.match(p.el('roundText').textContent,/ROUND 3\/5/);
});
test('rapid Next and duplicate answer events cannot skip rounds or double-score',()=>{
  const p=boot();p.click('nextBtn');assert.match(p.el('roundText').textContent,/ROUND 1\/5/);
  const choice=[...p.document.querySelectorAll('.choice')].find(b=>b.textContent==='84');
  choice.click();choice.click();p.click('nextBtn');p.click('nextBtn');
  assert.match(p.el('roundText').textContent,/ROUND 2\/5/);
  assert.equal(p.document.querySelectorAll('.dot.good').length,1);
});
test('Quick Tap waits for readiness, ignores ready clicks, uses one pass, and announces timeout',()=>{
  const p=boot();answerPick(p);p.click('nextBtn');p.el('num').value='43';p.click('submit');p.click('nextBtn');p.click('lock');p.click('nextBtn');
  p.tick(10000);assert.equal(p.el('flash').textContent,'TAP TO START');
  p.click('flash');p.click('flash');assert.equal(p.el('flash').textContent,'GET READY');
  p.tick(4800);assert.match(p.el('feedback').textContent,/TOO LATE/);assert.equal(p.pendingTimers,0);
});
test('replay results preserve the first daily score and identify the replay',()=>{
  const storage=new Map([[core.KEY,JSON.stringify({runs:1,dailyScores:{'2026-10-18':2},lastDaily:'2026-10-18',streak:1})]]);
  const p=boot({storage});finish(p);assert.match(p.el('game').textContent,/REPLAY #26/);
  assert.match(p.el('game').textContent,/first Daily score stays 2\/5/);
  assert.equal(JSON.parse(storage.get(core.KEY)).dailyScores['2026-10-18'],2);
});
test('absent and rejected sharing APIs expose a selectable result with a playable URL',async()=>{
  for(const navigator of [{},{share:async()=>{throw Error('denied')},clipboard:{writeText:async()=>{throw Error('denied')}}}]){
    const p=boot({navigator});finish(p);p.click('share');await new Promise(setImmediate);
    assert.equal(p.el('shareFallback').classList.contains('hidden'),false);
    assert.match(p.el('shareText').value,/https:\/\/lcsmith2009.github.io/);
  }
});
test('native share cancellation is handled without a false success claim',async()=>{
  const p=boot({navigator:{share:async()=>{const e=Error('cancel');e.name='AbortError';throw e}}});finish(p);p.click('share');await new Promise(setImmediate);
  assert.equal(p.el('shareStatus').textContent,'');assert.ok(p.el('shareFallback').classList.contains('hidden'));
});
test('game and sharing remain usable when localStorage is blocked',()=>{
  const p=boot({blocked:true});finish(p);assert.equal(p.document.querySelector('.score-ring b').textContent,'5/5');
  assert.match(p.el('game').textContent,/could not be saved/);
});
test('home loads existing stats, including zero best, and opens/closes its native dialog',()=>{
  const p=boot({home:true,storage:new Map([[core.KEY,JSON.stringify({runs:4,best:0,streak:2,lastDaily:'2026-10-17',dailyScores:{'2026-10-18':0}})]])});
  assert.equal(p.el('playsHome').textContent,'4');assert.equal(p.el('bestHome').textContent,'0/5');assert.equal(p.el('streakHome').textContent,'2');
  assert.match(p.el('playBtn').textContent,/0\/5/);p.click('statsBtn');assert.ok(p.el('modal').hasAttribute('open'));p.click('closeModal');assert.ok(!p.el('modal').hasAttribute('open'));
});
test('home resets stale completed-day copy and refreshes after storage changes',()=>{
  const storage=new Map([[core.KEY,JSON.stringify({runs:3,best:4,lastDaily:'2026-10-18',streak:1,dailyScores:{'2026-10-18':4}})]]);
  const p=boot({home:true,storage});storage.clear();p.window.dispatchEvent(new p.window.Event('storage'));
  assert.equal(p.el('playBtn').textContent,"PLAY TODAY'S 5");assert.equal(p.el('returnNote').textContent,'');assert.equal(p.el('playsHome').textContent,'0');
});
test('both daily and practice play through the generated standalone itch.io file',()=>{
  for(const search of ['?mode=daily','?mode=practice']){
    const p=boot({standalone:true,search});finish(p);
    assert.equal(p.document.querySelector('.score-ring b').textContent,'5/5');
    assert.match(p.el('game').innerHTML,/href="\?mode=practice"/);
    assert.match(p.el('game').innerHTML,/href="\?"/);
    assert.equal(p.document.querySelectorAll('script[src],link[rel=stylesheet]').length,0);
  }
  const home=boot({standalone:true,search:''});assert.ok(home.el('home').classList.contains('active'));
});
