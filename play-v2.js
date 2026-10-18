(function () {
  'use strict';
  const core = OneOffCore, store = core.createStore(() => localStorage);
  const el = id => document.getElementById(id);
  const daily = new URLSearchParams(location.search).get('mode') !== 'practice';
  const day = core.dayKey(), started = performance.now();
  const challenges = core.generate(daily ? core.hash(day) : Date.now() >>> 0);
  let replay = daily && store.read().dailyScores[day] !== undefined;
  let round = 0, score = 0, locked = false, finished = false, timer, readyTimer, elapsed;
  const results = [];
  const homeURL = document.body.dataset.standalone ? '?' : './index.html';
  const practiceURL = document.body.dataset.standalone ? '?mode=practice' : './v2.html?mode=practice&build=20';
  function clearTimers() { clearTimeout(readyTimer); clearInterval(timer); }
  function render() {
    clearTimers(); locked = false;
    const c = challenges[round], t = c.target;
    el('roundText').textContent = (daily ? (replay ? 'REPLAY #' : 'DAILY #') + core.challengeNumber(day) + ' • ' : 'PRACTICE • ') + 'ROUND ' + (round + 1) + '/5';
    el('target').textContent = t;
    el('feedback').textContent = '';
    el('feedback').className = 'feedback';
    el('nextBtn').classList.add('hidden');
    el('dots').innerHTML = results.map(good => '<i class="dot ' + (good ? 'good' : 'bad') + '"></i>').join('') + '<i class="dot"></i>'.repeat(5 - results.length);
    el('arena').innerHTML = '';
    el('modeLabel').textContent = { pick: 'PICK ONE', type: 'TYPE IT', slider: 'SLIDE IT', flash: 'QUICK TAP' }[c.mode];
    if (c.mode === 'pick') {
      el('instruction').textContent = round === 4 ? 'Final round. One perfect miss.' : 'Choose exactly ONE away.';
      const box = document.createElement('div'); box.className = 'choice-grid';
      c.choices.forEach(value => {
        const button = document.createElement('button');
        button.className = 'choice'; button.textContent = value; button.onclick = () => answer(value);
        box.appendChild(button);
      });
      el('arena').appendChild(box);
    }
    if (c.mode === 'type') {
      el('instruction').textContent = 'No choices. Type a number exactly ONE away.';
      el('arena').innerHTML = '<label class="sr-only" for="num">Your number</label><input class="number-input" id="num" inputmode="numeric" autocomplete="off" spellcheck="false" aria-describedby="instruction feedback" placeholder="?"><button class="primary submit" id="submit">LOCK IT</button>';
      const submit = () => {
        if (locked) return;
        const value = core.typedNumber(el('num').value);
        if (value === null) {
          el('num').setAttribute('aria-invalid', 'true');
          el('feedback').className = 'feedback bad';
          el('feedback').textContent = 'Enter a whole number first.';
          el('num').focus(); return;
        }
        el('num').removeAttribute('aria-invalid'); answer(value);
      };
      el('submit').onclick = submit;
      el('num').onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); submit(); } };
    }
    if (c.mode === 'slider') {
      el('instruction').textContent = 'Slide fast. Stop exactly ONE away.';
      el('arena').innerHTML = '<div class="slider-wrap"><label class="slider-label" id="sv" for="range">50</label><input id="range" aria-label="Your number" aria-describedby="instruction" class="slider" type="range" min="1" max="100" value="50"><div class="range-ends" aria-hidden="true"><span>1</span><span>100</span></div></div><button class="primary" id="lock">LOCK IT</button>';
      el('range').oninput = () => { el('sv').textContent = el('range').value; };
      el('lock').onclick = () => answer(Number(el('range').value));
    }
    if (c.mode === 'flash') {
      el('instruction').textContent = 'Tap to start. Then tap the big number when it reaches exactly ONE away. One pass only.';
      el('arena').innerHTML = '<button id="flash" class="flash ready" aria-describedby="instruction">TAP TO START</button>';
      const button = el('flash'); let running = false, value = null, i = 0;
      button.onclick = () => {
        if (!running) {
          running = true; button.classList.remove('ready'); button.textContent = 'GET READY';
          readyTimer = setTimeout(() => {
            if (locked) return;
            value = c.sequence[i++]; button.textContent = value;
            timer = setInterval(() => {
              if (i === c.sequence.length) { answer(value, true); return; }
              value = c.sequence[i++]; button.textContent = value;
            }, 650);
          }, 900);
        } else if (value !== null) answer(value);
      };
    }
    el('modeLabel').focus();
  }
  function answer(value, timedOut = false) {
    if (locked || finished) return;
    locked = true; clearTimers();
    document.querySelectorAll('#arena button, #arena input').forEach(control => { control.disabled = true; });
    const target = challenges[round].target, good = Math.abs(value - target) === 1;
    results.push(good); if (good) score++;
    if (navigator.vibrate) { try { navigator.vibrate(good ? 35 : [55, 45, 55]); } catch (_) {} }
    el('feedback').className = 'feedback ' + (good ? 'good' : 'bad');
    el('feedback').textContent = good ? '✓ PERFECTLY WRONG' : timedOut ? '✕ TOO LATE • OFF BY ' + Math.abs(value - target) : value === target ? '✕ TOO ACCURATE!' : '✕ OFF BY ' + Math.abs(value - target);
    el('nextBtn').textContent = round === 4 ? 'SEE SCORE' : 'NEXT';
    el('nextBtn').classList.remove('hidden');
    el('nextBtn').focus();
  }
  el('nextBtn').onclick = () => {
    if (!locked || finished) return;
    if (round < 4) { round++; render(); } else finish();
  };
  function finish() {
    if (finished) return;
    finished = true; clearTimers();
    elapsed = Math.max(1, Math.round((performance.now() - started) / 1000));
    const record = store.record({ daily, day, score, elapsed }); replay = record.replay;
    const blocks = results.map((good, i) => '<div class="result-box ' + (good ? 'good' : '') + '" role="img" aria-label="Round ' + (i + 1) + ': ' + (good ? 'one off' : 'missed') + '">' + (good ? '✓' : '×') + '</div>').join('');
    el('game').innerHTML = '<div class="eyebrow">RUN COMPLETE' + (daily ? ' • ' + (replay ? 'REPLAY #' : 'DAILY #') + core.challengeNumber(day) : ' • PRACTICE') + '</div><div class="score-ring"><b>' + score + '/5</b><span>ONE OFF</span></div><h1 class="result-title" id="resultTitle" tabindex="-1">' + (score === 5 ? 'PERFECTLY WRONG.' : score >= 3 ? 'NICE MISS.' : 'TOO ACCURATE.') + '</h1><p>' + (score === 5 ? 'You missed every target by exactly one.' : 'The target is a trap. Miss better next run.') + '</p><div class="result-grid">' + blocks + '</div><div class="record-line">' + elapsed + ' SEC' + (record.newBest ? ' • NEW PERFECT BEST!' : '') + '</div>' + (replay ? '<p class="note">Replay complete. Your first Daily score stays ' + record.state.dailyScores[day] + '/5.</p>' : '') + (!record.saved ? '<p class="note">Stats could not be saved. You can still share this result.</p>' : '') + '<button id="share" class="primary">SHARE RESULT</button><p class="note" id="shareStatus" role="status"></p><div id="shareFallback" class="hidden"><label for="shareText">Copy your result below:</label><textarea id="shareText" readonly rows="5"></textarea></div><a class="secondary" href="' + practiceURL + '">PRACTICE AGAIN</a><a class="secondary" href="' + homeURL + '">HOME</a>';
    el('game').setAttribute('aria-labelledby', 'resultTitle');
    el('share').onclick = share; el('resultTitle').focus();
  }
  async function share() {
    const text = core.shareText({ daily, replay, day, score, elapsed, results });
    if (navigator.share) {
      try { await navigator.share({ title: 'ONE OFF', text }); el('shareStatus').textContent = 'Result shared.'; return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); el('shareStatus').textContent = 'Result copied!'; return; }
      catch (_) { /* Embedded and private browsers may deny clipboard access. */ }
    }
    el('shareFallback').classList.remove('hidden');
    el('shareText').value = text; el('shareText').focus(); el('shareText').select();
    el('shareStatus').textContent = 'Select and copy your result to share it.';
  }
  window.addEventListener('pagehide', clearTimers);
  window.addEventListener('pageshow', event => { if (event.persisted && !finished) location.reload(); });
  render();
})();
