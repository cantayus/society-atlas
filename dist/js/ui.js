/* The Society Atlas V2 — interface: heads-up display, panels, the atlas, the notebook,
   the research room, and the title screen (the Atlas as a pop-up book). */
(function () {
  'use strict';
  const SA = window.SA, esc = SA.esc, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const UI = {}, sfx = (n, a) => SA.Audio && SA.Audio.sfx(n, a);
  const ICON = {
    atlas: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>', book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M9 7h6M9 11h6"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.8.2 5 2.6 5 5.8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    city: '<path d="M3 21V9l5-3v15M8 21V4l6 3v14M14 21V11l7 2v8M3 21h18"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const E = () => SA.Encounters, G = () => SA.Game, save = () => SA.save;

  // ---------- basics ----------
  UI.toast = (html, ms = 4200) => { const t = document.createElement('div'); t.className = 'toast glass'; t.setAttribute('role', 'status'); t.innerHTML = html; $('#toasts').appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, ms); };
  let current = null;
  UI.modalOpen = () => !!current;
  UI.modal = (o) => {
    UI.closeModal(true); const root = $('#modal-root');
    root.innerHTML = `<section class="panel ${o.cls || ''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><header><div><div class="eyebrow">${esc(o.kicker || '')}</div><h2>${esc(o.title)}</h2></div><button class="btn x" data-close aria-label="Close">✕</button></header><div class="body">${o.body || ''}</div>${o.footer ? `<footer>${o.footer}</footer>` : ''}</section>`;
    root.classList.add('open'); current = { o, el: root.firstChild }; sfx('open'); if (G()) G().pauseInput = true;
    root.onclick = (ev) => { const b = ev.target.closest('[data-close]'); if (b || (ev.target === root && !o.sticky)) UI.closeModal(); const a = ev.target.closest('[data-act]'); if (a && o.on && o.on[a.dataset.act]) { sfx('click'); o.on[a.dataset.act](a, ev); } };
    const f = current.el.querySelector('[autofocus], .btn.primary, button'); if (f) f.focus({ preventScroll: true });
    return current.el;
  };
  UI.closeModal = (silent) => { if (!current) return; const c = current; current = null; $('#modal-root').classList.remove('open'); $('#modal-root').innerHTML = ''; if (!silent) sfx('close'); if (G()) G().pauseInput = false; if (c.o.onClose) c.o.onClose(); };
  UI.fade = (title, sub, ms, mid) => new Promise((res) => { const f = $('.fade'); f.innerHTML = `<div><h2>${esc(title || '')}</h2><p>${esc(sub || '')}</p></div>`; f.classList.add('on'); setTimeout(() => { if (mid) mid(); setTimeout(() => { f.classList.remove('on'); res(); }, 250); }, ms || 900); });

  // portraits: a caricature strip (five expressions) or a monogram medallion
  const EXP = { neutral: 0, pleased: 1, thinking: 2, sceptical: 3, worried: 4 };
  UI.portrait = (name, expr = 'neutral', cls = '') => {
    const p = (SA.PORTRAITS || {})[name];
    if (p) return `<div class="portrait ${cls}" data-name="${esc(name)}" role="img" aria-label="Caricature of ${esc(name)}" style="background-image:url('${esc(p.file)}');background-position:${EXP[expr] * 25}% 0"></div>`;
    const ini = name.split(/\s+/).map((w) => w[0]).filter((ch) => /[A-ZÀ-Ý]/.test(ch)).slice(0, 2).join('');
    return `<div class="portrait ${cls}" data-name="${esc(name)}" role="img" aria-label="${esc(name)}"><div class="mono">${esc(ini)}<small>portrait to come</small></div></div>`;
  };
  const setExpr = (root, expr) => $$('.portrait.on, .portrait.single', root).forEach((p) => { if (p.style.backgroundImage) p.style.backgroundPosition = `${(EXP[expr] ?? 0) * 25}% 0`; });
  let typing = null;
  function type(node, text, pitch, done) {
    clearInterval(typing); node.textContent = ''; let i = 0; const reduced = save().settings.reduced;
    if (reduced) { node.textContent = text; if (done) done(); return; }
    typing = setInterval(() => { i += 2; node.textContent = text.slice(0, i); if (i % 6 === 0 && text[i] && text[i] !== ' ') sfx('blip', pitch); if (i >= text.length) { clearInterval(typing); if (done) done(); } }, 24);
  }

  // ---------- heads-up display ----------
  UI.init = () => {
    $('#hud').innerHTML = `
      <div class="topbar glass"><div class="place"><b id="place-name"></b><span id="place-sub"></span></div>
        <div class="chips"><span class="chip" id="chip-insight" title="Insight points"><i>✦</i><b>0</b></span><span class="chip" id="chip-methods" title="Methods in your notebook"><i>▣</i><b>0</b></span><span class="chip opt" id="chip-sketch" title="Field sketches found here"><i>✎</i><b>0/5</b></span><span class="chip opt" id="chip-time" title="Time of day"><i>☀</i><b>09:30</b></span></div>
        <div class="iconbar"><button class="ib" data-ui="atlas" data-tip="Atlas (M)" aria-label="Atlas">${icon('atlas')}</button><button class="ib" data-ui="notebook" data-tip="Notebook (N)" aria-label="Notebook">${icon('book')}</button><button class="ib" data-ui="roster" data-tip="Contacts" aria-label="Contacts">${icon('people')}</button><button class="ib" data-ui="settings" data-tip="Settings" aria-label="Settings">${icon('gear')}</button><button class="ib" data-ui="menu" data-tip="Title page" aria-label="Title page">${icon('home')}</button></div></div>
      <aside class="objective glass" aria-live="polite"></aside>
      <div class="mentor"><canvas width="184" height="184" aria-hidden="true"></canvas><div class="bubble glass"><b></b><span></span></div></div>
      <div class="prompt glass"></div>
      <div class="bottom"><div class="me glass"><canvas width="116" height="116" aria-hidden="true"></canvas><div><b id="me-name"></b><div class="small muted" id="me-rank"></div><div class="xp"><i></i></div></div></div>
        <div class="actions glass"><button class="btn" data-ui="interact">Interact<kbd>E</kbd></button><button class="btn" data-ui="centre">Centre<kbd>C</kbd></button><button class="btn" data-ui="pause">Pause<kbd>Space</kbd></button></div>
        <div class="minimap glass"><div class="zoom"><button class="ib" data-ui="zoomout" aria-label="Zoom out">−</button><button class="ib" data-ui="zoomin" aria-label="Zoom in">+</button></div><canvas id="mini" width="444" height="236" aria-label="Campus map. Click to look there."></canvas></div></div>`;
    $('#hud').addEventListener('click', (ev) => { const b = ev.target.closest('[data-ui]'); if (!b) return; sfx('click'); const k = b.dataset.ui; if (UI[k]) UI[k](); else G().command(k); });
    $('#hud').addEventListener('mouseover', (ev) => { if (ev.target.closest('.ib,.btn') && !ev.relatedTarget?.closest?.('.ib,.btn')) sfx('hover'); });
    $('#mini').addEventListener('pointerdown', (ev) => { const r = ev.target.getBoundingClientRect(), p = SA.Render.miniToTile(ev.target, ev.clientX - r.left, ev.clientY - r.top); G().lookAt(p.x, p.y); });
  };
  UI.hud = (on) => $('#hud').classList.toggle('hidden', !on);
  let lastChips = {};
  UI.refresh = () => {
    const g = G(), s = save(), enc = g.enc; if (!enc) return;
    $('#place-name').textContent = g.world.def.fictional ? 'Bellwether' : enc.campus; $('#place-sub').textContent = g.world.def.fictional ? 'The city at the centre of the question' : `${enc.shortName || enc.name} · ${enc.era} · ${enc.method}`;
    const set = (id, v) => { const c = $('#' + id), b = c.querySelector('b'); if (b.textContent !== String(v)) { b.textContent = v; if (lastChips[id] !== undefined) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); } lastChips[id] = v; } };
    set('chip-insight', SA.Progress.insight()); set('chip-methods', `${s.completed.length}/${E().count}`); set('chip-sketch', `${(s.collect.sketches[g.world.key + ':' + (enc.id || 0)] || []).length}/5`);
    const h = g.hour, hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10; $('#chip-time b').textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); $('#chip-time i').textContent = h > 19.5 || h < 6 ? '☾' : '☀';
    const rank = SA.Progress.rank(); $('#me-name').textContent = s.player.name; $('#me-rank').textContent = rank.name; $('.me .xp i').style.width = Math.round(rank.progress * 100) + '%';
  };
  UI.objective = (title, steps, extra = '') => { $('.objective').innerHTML = `<div class="eyebrow">Current objective</div><h3>${esc(title)}</h3><ol>${steps.map((s) => `<li class="${s.done ? 'done' : s.now ? 'now' : ''}">${esc(s.text)}</li>`).join('')}</ol>${extra}`; };
  UI.prompt = (text) => { const p = $('.prompt'); if (!text) { p.classList.remove('show'); return; } if (p.dataset.t !== text) { p.dataset.t = text; p.innerHTML = `<kbd>E</kbd>${esc(text)}`; } p.classList.add('show'); };
  let mentorTimer = null, mentorNow = null;
  UI.mentorShow = (item, dur) => {
    const box = $('.mentor'), m = SA.Mentors.get(item.key); mentorNow = { ...item, until: performance.now() + dur * 1000, talkUntil: performance.now() + Math.min(dur, item.text.length * 0.03 + 0.4) * 1000 };
    box.querySelector('b').textContent = m.name; box.classList.add('show'); type(box.querySelector('span'), item.text, m.pitch); SA.Audio.duck(Math.min(dur, 3));
    clearTimeout(mentorTimer); mentorTimer = setTimeout(() => { box.classList.remove('show'); mentorNow = null; }, dur * 1000);
  };
  UI.frame = (t) => {                                         // animated portraits
    if (mentorNow) { const c = $('.mentor canvas').getContext('2d'); SA.Mentors.portrait(c, SA.Mentors.get(mentorNow.key).face, mentorNow.expr, t, 184, performance.now() < mentorNow.talkUntil); }
    const mc = $('.me canvas'); if (mc && Math.floor(t * 8) !== UI._meTick) { UI._meTick = Math.floor(t * 8); SA.Mentors.portrait(mc.getContext('2d'), SA.Mentors.PLAYER_LOOKS[save().player.look % 4], 'neutral', t, 116, false); }
  };

  // ---------- the research room ----------
  function scholarColumn(enc, lines) {
    const names = E().scholars(enc.id), single = names.length === 1;
    return `<aside class="scholar">${single ? UI.portrait(names[0], 'neutral', 'single') : `<div class="portraits">${names.map((n, i) => UI.portrait(n, 'neutral', i ? '' : 'on')).join('')}</div>`}
      <div><h3 id="speaker">${esc(names[0])}</h3><div class="small muted">${esc(enc.campus)} · ${esc(enc.era)}</div></div>
      <div class="say glass"><span class="who">Dramatization</span><span id="say-text"></span></div>
      <div class="choices">${lines.map((l, i) => `<button class="btn small" data-act="ask" data-i="${i}">${esc(l.q)}</button>`).join('')}</div>
      <p class="note">Educational dramatization: invented teaching dialogue, not a quotation or an endorsement. Portraits are caricatures made from identified photographs.</p></aside>`;
  }
  function talkLines(enc) {
    const d = (enc.dialogue || []).filter((l) => !/^Narrator:/i.test(l)), narr = (enc.dialogue || []).find((l) => /^Narrator:/i.test(l)), src = E().sourcesFor(enc)[0];
    const joke = (window.CampusPlay && window.CampusPlay.jokes && window.CampusPlay.jokes[enc.id]) || SA.Progress.joke(enc.id);
    return [
      { q: 'What are we doing here?', a: d[0] || enc.objective, e: 'neutral' }, { q: 'How does the method work?', a: d[1] || d[0] || enc.objective, e: 'thinking' },
      { q: 'What should I be careful about?', a: enc.limitation, e: 'sceptical' }, { q: 'How does this help in Bellwether?', a: enc.transfer, e: 'neutral' },
      { q: 'Tell me about the original study.', a: (narr ? narr.replace(/^Narrator:\s*/i, '') + ' ' : '') + (src ? src.note : ''), e: 'thinking', narrator: true }, { q: 'A lighter thought?', a: joke, e: 'pleased' },
    ].filter((l) => l.a);
  }
  function wireScholar(root, enc, lines, first) {
    const names = E().scholars(enc.id); let who = 0;
    const speak = (l) => { const node = $('#say-text', root); $('.say .who', root).textContent = l.narrator ? 'Narrator' : 'Dramatization · ' + names[who]; setExpr(root, l.e || 'neutral'); $$('.portrait', root).forEach((p) => p.classList.remove('talking')); const pt = $('.portrait.on, .portrait.single', root); if (pt && !l.narrator) pt.classList.add('talking'); type(node, l.a, 480 + who * 70, () => pt && pt.classList.remove('talking')); };
    root.addEventListener('click', (ev) => { const p = ev.target.closest('.portraits .portrait'); if (p) { $$('.portraits .portrait', root).forEach((x) => x.classList.remove('on')); p.classList.add('on'); who = names.indexOf(p.dataset.name); $('#speaker', root).textContent = names[who]; sfx('click'); } });
    speak(first || lines[0]); return speak;
  }
  // First meeting at the office door: conversation, then fieldwork or the lab.
  UI.meet = (enc) => {
    const g = G(), lines = talkLines(enc), task = SA.Tasks.forEncounter(enc.id), taskDone = !!save().tasks[enc.id]?.done, sign = E().SIGN[enc.id];
    const el = UI.modal({ title: enc.office || 'Research rooms', kicker: `${enc.campus} · ${enc.era}`, cls: 'narrow', body: `<div class="grid">${scholarColumn(enc, lines)}${sign ? `<p class="small muted">On the desk: ${esc(sign[0])}. You arrive to find the room’s occupant ${esc(sign[1])}.</p>` : ''}</div>`,
      footer: taskDone || !task ? `<button class="btn" data-close>Back to campus</button><button class="btn primary" data-act="lab">Open the research problem</button>` : `<button class="btn" data-close>Back to campus</button><button class="btn primary" data-act="task">Begin the fieldwork: ${esc(task.title)}</button>`,
      on: { ask: (b) => speak(lines[+b.dataset.i]), lab: () => UI.research(enc), task: () => { UI.closeModal(); g.startTask(); } } });
    const speak = wireScholar(el, enc, lines, taskDone || !task ? { a: 'You have done the legwork. Sit down, and let us see what it can and cannot tell us.', e: 'pleased' } : { a: (enc.dialogue || [])[0] + ' But first, some fieldwork: ' + task.brief, e: 'neutral' });
  };
  UI.research = (enc) => {
    const g = G(), s = save(), lines = talkLines(enc), done = s.completed.includes(enc.id);
    const el = UI.modal({ title: enc.title, kicker: `Research ${String(enc.id).padStart(2, '0')} · ${enc.method}`, cls: 'wide', sticky: true,
      body: `<div class="room">${scholarColumn(enc, lines)}<section><div class="strip" id="challenge"></div><div class="paper"><div id="lab"></div></div><div id="after"></div><p class="note" style="margin-top:12px">All playable data are fictional or synthetic. Nothing here calls a live AI service. <a href="#" data-act="sources" style="color:var(--gold)">Source context</a></p></section></div>`,
      footer: `<span class="small muted" style="margin-right:auto">Hints appear after two incorrect answers; five end the attempt. First clear: 100 points within 2 minutes of active work, 50 within 5, 25 after.</span><button class="btn" data-close>Return to campus</button>`,
      on: { ask: (b) => speak(lines[+b.dataset.i]), sources: (b, ev) => { ev.preventDefault(); UI.notebook('sources'); }, atlas: () => UI.atlas(), gazette: () => UI.gazette(s.gazette.find((z) => z.id === enc.id)), retry: () => { g.retryChallenge(enc); UI.research(enc); } },
      onClose: () => { g.challenge?.destroy?.(); g.challenge = null; clearInterval(tick); } });
    const speak = wireScholar(el, enc, lines, { a: (enc.dialogue || []).filter((l) => !/^Narrator:/i.test(l))[1] || enc.objective, e: 'thinking' });
    const strip = () => {
      const c = g.challenge?.snapshot?.(), box = $('#challenge', el); if (!box) return;
      if (!c) { box.innerHTML = `<div><span>Answer attempts</span>Completed · practice replay</div><div><span>Active research</span>Unscored</div><div><span>Notebook reward</span>${esc(s.challenges[enc.id]?.award?.label || 'Recorded')}</div>`; return; }
      const sec = Math.floor(c.elapsedMs / 1000);
      box.innerHTML = `<div><span>Answer attempts</span>${c.status === 'failed' ? '5 / 5 incorrect · attempt ended' : c.status === 'passed' ? 'Correct answer connected' : `${c.errors} / 5 incorrect`}</div><div><span>Active research</span>${c.status === 'ready' ? 'Begins with your first action' : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`}</div><div><span>Notebook reward</span>${c.award ? `${esc(c.award.label)} · +${c.award.points}` : '100 · 50 · 25 points'}</div>`;
    };
    const after = () => { if (!s.completed.includes(enc.id)) return; const box = $('#after', el), next = E().next(s.completed); box.innerHTML = `<div class="done-card"><div class="eyebrow">Method added to your notebook</div><h3>Evidence, with its limits</h3><p>${esc(enc.evidence)}</p><p><b>Bounded conclusion:</b> ${esc(enc.limitation)}</p><div class="row"><button class="btn primary" data-act="atlas">${next ? 'Open the Atlas: next, ' + esc(next.shortName || next.name) : 'Open the Atlas'}</button><button class="btn" data-act="gazette">Read the Gazette</button></div></div>`; };
    const failed = () => { $('#after', el).innerHTML = `<div class="done-card" style="border-color:var(--red);background:rgba(223,111,92,.12)"><div class="eyebrow">Five incorrect answers</div><h3>A fresh attempt is ready when you are</h3><p>${esc(enc.limitation)}</p><button class="btn primary" data-act="retry">Retry this encounter</button></div>`; };
    g.openChallenge(enc, strip); strip(); const tick = setInterval(strip, 1000);
    const api = { state: s.puzzles[enc.id] || (s.puzzles[enc.id] = {}), save: () => SA.persist(), note: (t) => UI.toast(esc(t)), sound: (t) => sfx(t === 'complete' ? 'success' : 'click'),
      interact: () => { g.challenge?.start?.(); strip(); }, isFailed: () => g.challenge?.snapshot?.().status === 'failed',
      submit: (ans) => { if (!g.challenge) return { replay: true, errors: 0, failed: false }; const r = ans.correct ? g.challenge.correct() : g.challenge.wrong(); strip(); if (!ans.correct) { sfx('error'); setExpr(el, 'worried'); SA.Mentors.say(r.autoHint ? 'labHint' : 'labWrong'); } return { ...r, failed: r.status === 'failed' }; },
      gameOver: () => failed(), complete: (text) => { g.completeEncounter(enc, text); setExpr(el, 'pleased'); strip(); after(); } };
    if (g.challenge && g.challenge.snapshot().status === 'failed') failed();
    else if (enc.id <= 18 && window.Research) window.Research.mount($('#lab', el), enc, api); else SA.Labs2.mount($('#lab', el), enc, api);
    after(); if (!done) SA.Mentors.say('labOpen');
  };

  // ---------- the atlas ----------
  const GEO = { penn: [-75.19, 39.95], harvard: [-71.12, 42.37], mit: [-71.09, 42.36], northeastern: [-71.09, 42.34], indiana: [-86.53, 39.17], ucla: [-118.44, 34.07], notreDame: [-86.24, 41.7], columbia: [-73.96, 40.81], stanford: [-122.17, 37.43], pennState: [-77.86, 40.8], washu: [-90.31, 38.65], cmu: [-79.94, 40.44], princeton: [-74.66, 40.34], chicago: [-87.6, 41.79], michigan: [-83.74, 42.28], yale: [-72.92, 41.31], rochester: [-77.63, 43.13], duke: [-78.94, 36.0], toronto: [-79.4, 43.66] };
  const NUDGE = { harvard: [10, -16], mit: [26, -2], northeastern: [16, 14], princeton: [-18, 10], columbia: [10, -8], yale: [14, -22], penn: [-6, 18], cmu: [-10, 10], pennState: [-4, -12], chicago: [-12, -8], notreDame: [10, 4], toronto: [-16, -14], rochester: [12, 6] };
  const USA = [[-124.7, 48.4], [-123, 49], [-95, 49], [-89.5, 48], [-84.5, 46.5], [-82.5, 45.3], [-82.4, 43], [-79, 42.8], [-76.5, 43.6], [-75, 45], [-71.5, 45], [-69.2, 47.4], [-67, 45], [-70, 43.6], [-70.7, 42], [-70, 41.5], [-74, 40.6], [-75.5, 38.5], [-76, 37], [-75.5, 35.2], [-78.5, 33.8], [-81, 31.5], [-80, 26.5], [-81.3, 25.2], [-82.8, 27.8], [-84, 30], [-88, 30.3], [-90, 29.2], [-94, 29.5], [-97.2, 26], [-99.5, 27.5], [-101.5, 29.8], [-104.5, 29.6], [-106.5, 31.8], [-111, 31.3], [-114.8, 32.5], [-117.1, 32.5], [-118.5, 34], [-120.6, 34.6], [-122.4, 37.2], [-124.2, 40.3], [-124.5, 43], [-124, 46.3]];
  function pins(w, h) {
    const P = {}, proj = ([lon, lat]) => [(lon + 126) / 60 * w * 0.74 + w * 0.02, (50.5 - lat) / 27 * h * 0.8 + h * 0.08];
    for (const k of Object.keys(GEO)) { const [x, y] = proj(GEO[k]), n = NUDGE[k] || [0, 0]; P[k] = { x: x + n[0], y: y + n[1], ax: x, ay: y }; }
    const far = { lund: [0.905, 0.115], cambridge: [0.85, 0.185], oxford: [0.805, 0.25], paris: [0.85, 0.325], zurich: [0.925, 0.335], peking: [0.82, 0.5], kyoto: [0.925, 0.525], capetown: [0.815, 0.665], bellwether: [0.9, 0.81] };
    const us = Object.keys(P); for (let it = 0; it < 80; it++) for (let i = 0; i < us.length; i++) for (let j = i + 1; j < us.length; j++) { const a = P[us[i]], b = P[us[j]], dx = Math.abs(a.x - b.x), dy = b.y - a.y; if (dx < 96 && Math.abs(dy) < 23) { const push = (23 - Math.abs(dy)) / 2 + 0.2, sgn = dy >= 0 ? 1 : -1; a.y -= push * sgn; b.y += push * sgn; } }
    for (const k of Object.keys(far)) if (SA.Campuses[k]) P[k] = { x: w * far[k][0], y: h * far[k][1], ax: w * far[k][0], ay: h * far[k][1] };
    return { P, proj };
  }
  UI.atlas = (focus) => {
    const s = save(), g = G(), all = E().all, byUni = {}; for (const e of all) (byUni[SA.VISITS[e.id].uni] = byUni[SA.VISITS[e.id].uni] || []).push(e);
    let sel = focus || (g.enc && g.world ? g.world.key : 'penn');
    const unlocked = (e) => e.id === 1 || s.completed.includes(1);
    const list = () => { const def = SA.Campuses[sel], here = g.world && g.world.key === sel;
      if (sel === 'bellwether') return `<div class="card"><div class="eyebrow">The fictional city</div><h3>Bellwether</h3><p class="small">${esc(def.notes.join(' '))}</p><p class="small muted">Return here between campuses: listen to residents, pin evidence at Fellowship House, and hold the colloquium at the Town Hall once you have eighteen methods.</p><button class="btn primary" data-act="go" data-id="0" ${s.completed.includes(1) ? '' : 'disabled'}>${s.completed.includes(1) ? 'Travel to Bellwether' : 'Opens after Philadelphia'}</button></div>`;
      return `<div class="card"><div class="eyebrow">${esc(def.city)}</div><h3>${esc(def.name)}</h3><p class="small">${esc(def.notes[0])}</p></div>` + (byUni[sel] || []).map((e) => `<button class="visit ${s.completed.includes(e.id) ? 'done' : ''} ${here && g.enc.id === e.id ? 'here' : ''}" data-act="go" data-id="${e.id}" ${unlocked(e) ? '' : 'disabled'}><span class="n">${s.completed.includes(e.id) ? '✓' : e.id}</span><span><b>${esc(e.name)}</b><span>${esc(e.title)} · ${esc(e.method)} · ${esc(e.era)}</span></span><span class="small muted">${unlocked(e) ? (here && g.enc.id === e.id ? 'You are here' : 'Travel') : 'After Philadelphia'}</span></button>`).join(''); };
    const el = UI.modal({ title: 'The Atlas', kicker: `${s.completed.length} of ${all.length} methods · choose a campus, then a visit`, cls: 'wide', body: `<div class="atlas"><canvas id="atlas-map" width="1400" height="820" aria-label="Map of campuses"></canvas><div class="visits" id="visits"></div></div>`,
      footer: `<span class="small muted" style="margin-right:auto">The route is yours. A suggested next stop is ringed in gold. Journeys are fiction; they imply no real meeting.</span><button class="btn" data-close>Close</button>`,
      on: { go: (b) => { const id = +b.dataset.id; UI.closeModal(); g.travel(id); } } });
    const cv = $('#atlas-map', el), c = cv.getContext('2d'), W = cv.width, H = cv.height, { P, proj } = pins(W, H), next = E().next(s.completed), nextUni = next ? SA.VISITS[next.id].uni : null;
    const draw = () => {
      const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#efe2bf'); gr.addColorStop(1, '#dcc993'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(120,90,40,.16)'; c.lineWidth = 1; for (let lon = -120; lon <= -70; lon += 10) { const [x] = proj([lon, 50]); c.beginPath(); c.moveTo(x, 20); c.lineTo(x, H - 20); c.stroke(); } for (let lat = 25; lat <= 50; lat += 5) { const [, y] = proj([-100, lat]); c.beginPath(); c.moveTo(20, y); c.lineTo(W * 0.76, y); c.stroke(); }
      c.beginPath(); USA.forEach((q, i) => { const [x, y] = proj(q); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fillStyle = '#cdbb86'; c.fill(); c.strokeStyle = '#7a6238'; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = 'rgba(122,98,56,.35)'; c.lineWidth = 7; c.stroke();
      // Europe inset and the island of Bellwether
      for (const [name, y0, hh, x0, ww] of [['Europe', 0.04, 0.36, 0.775, 0.215], ['East Asia', 0.42, 0.16, 0.775, 0.215], ['Africa', 0.6, 0.11, 0.775, 0.1]]) { c.fillStyle = 'rgba(205,187,134,.55)'; c.strokeStyle = '#7a6238'; c.lineWidth = 2; c.beginPath(); c.roundRect(W * x0, H * y0, W * ww, H * hh, 14); c.fill(); c.stroke(); c.fillStyle = '#5a4322'; c.font = '600 20px Georgia'; c.fillText(name, W * x0 + 14, H * y0 + 30); }
      c.beginPath(); c.ellipse(P.bellwether.x, P.bellwether.y + 6, 88, 44, -0.2, 0, 7); c.fillStyle = '#cdbb86'; c.fill(); c.stroke(); c.font = 'italic 19px Georgia'; c.fillStyle = '#5a4322'; c.fillText('Bellwether (fictional)', P.bellwether.x - 86, P.bellwether.y + 72);
      c.save(); c.translate(W * 0.06, H * 0.84); c.strokeStyle = '#7a6238'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.stroke(); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -44); c.lineTo(7, 0); c.lineTo(-7, 0); c.fillStyle = i === 3 ? '#7a2f2f' : '#7a6238'; c.fill(); } c.restore();
      // the journey so far
      const seq = s.completed.map((id) => SA.VISITS[id].uni).filter((k) => P[k]); c.strokeStyle = 'rgba(122,47,47,.6)'; c.lineWidth = 2.5; c.setLineDash([8, 7]); c.beginPath(); seq.forEach((k, i) => { const p = P[k]; i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }); c.stroke(); c.setLineDash([]);
      for (const k of Object.keys(P)) {
        const p = P[k], list2 = byUni[k] || [], doneAll = list2.length && list2.every((e) => s.completed.includes(e.id)), some = list2.some((e) => s.completed.includes(e.id));
        if (p.ax !== p.x) { c.strokeStyle = 'rgba(90,67,34,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.ax, p.ay); c.lineTo(p.x, p.y); c.stroke(); }
        if (k === nextUni) { c.strokeStyle = '#c59a4c'; c.lineWidth = 4; c.beginPath(); c.arc(p.x, p.y, 21, 0, 7); c.stroke(); }
        c.beginPath(); c.arc(p.x, p.y, k === sel ? 15 : 11, 0, 7); c.fillStyle = k === 'bellwether' ? '#3f6a52' : doneAll ? '#5c8a56' : some ? '#b8904a' : '#7a2f2f'; c.fill(); c.strokeStyle = k === sel ? '#fff6d8' : '#3a2a16'; c.lineWidth = k === sel ? 4 : 2; c.stroke();
        c.font = (k === sel ? '700 ' : '600 ') + '19px Georgia'; c.fillStyle = '#2a2014'; const label = SA.Campuses[k].short; c.fillText(label, p.x + 17, p.y + 6);
      }
    };
    const refresh = () => { $('#visits', el).innerHTML = list(); draw(); };
    cv.addEventListener('click', (ev) => { const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width, y = (ev.clientY - r.top) * H / r.height; let best = null, bd = 40; for (const k of Object.keys(P)) { const d = Math.hypot(P[k].x - x, P[k].y - y); if (d < bd) { bd = d; best = k; } } if (best) { sel = best; sfx('page'); refresh(); } });
    refresh();
  };

  // ---------- notebook ----------
  UI.notebook = (tab = 'evidence') => {
    const s = save(), Pg = SA.Progress, body = () => {
      if (tab === 'evidence') return s.evidence.length ? `<div class="grid g2">${s.evidence.map((ev) => { const e = E().get(ev.id); return `<div class="card"><div class="eyebrow">${esc(e.method)}</div><h3>${esc(e.shortName || e.name)} · ${esc(e.title)}</h3><p class="small">${esc(ev.text || e.evidence)}</p><p class="small muted"><b>Limit:</b> ${esc(e.limitation)}</p>${s.tasks[e.id]?.note ? `<p class="small muted"><b>Field note:</b> ${esc(s.tasks[e.id].note)}</p>` : ''}</div>`; }).join('')}</div>` : '<p class="muted">Your notebook is waiting. Find the Philadelphia fieldwork contact and investigate the missing street.</p>';
      if (tab === 'hypotheses') return `<p class="muted">Why are so few Eastbank residents at the festival? Keep several explanations alive. Each method you learn can test some of them.</p><div class="grid g2">${(window.ATLAS_DATA.hypotheses || []).map((h) => { const sup = s.completed.filter((id) => Pg.HYP[h.id].includes(id)); return `<div class="card"><h3>${esc(h.title)}</h3><p class="small">${esc(h.claim)}</p><p class="small muted">${sup.length ? 'Methods that can test it: ' + sup.map((id) => esc(E().get(id).shortName)).join(', ') : 'No method in your notebook tests this yet.'}</p></div>`; }).join('')}</div>`;
      if (tab === 'collections') return Pg.collectionsHTML();
      if (tab === 'achievements') return `<div class="grid g3">${Pg.ACH.map((a) => `<div class="card ${s.achievements[a.id] ? '' : 'locked'}"><h3>${s.achievements[a.id] ? '★ ' : ''}${esc(a.name)}</h3><p class="small">${esc(a.text)}</p></div>`).join('')}</div>`;
      if (tab === 'sources') return `<p class="muted">Research anchors are real and linked. Campuses, rooms, dialogue and data are teaching reconstructions.</p><div class="grid g2">${E().sources.map((x) => `<div class="card"><h3 style="font-size:1em">${esc(x.title)}</h3><p class="small muted">${esc(x.note || '')}</p><a class="small" href="${esc(x.url)}" target="_blank" rel="noopener" style="color:var(--gold)">Open source ↗</a></div>`).join('')}</div><h3 style="margin:18px 0 8px">Portraits</h3><div class="grid g3">${Object.entries(SA.PORTRAITS || {}).map(([n, p]) => `<div class="card"><b>${esc(n)}</b><p class="small muted">Photo: ${esc(p.author || 'see source')} · ${esc(p.license || 'no open licence on record')}</p><a class="small" href="${esc(p.source)}" target="_blank" rel="noopener" style="color:var(--gold)">Photo source ↗</a></div>`).join('')}</div><p class="small muted" style="margin-top:14px">Caricatures were made from these photographs by deterministic image processing. Music and sound are original and synthesized in your browser. Scenery is original Canvas drawing; buildings use the first edition’s architecture renderer.</p>`;
      return `<div class="grid g2"><div class="card"><h3>Your journey</h3><p class="small">${s.completed.length} methods · ${Pg.insight()} insight points · ${Pg.rank().name}</p><div class="row"><button class="btn" data-act="export">Export journey</button><label class="btn">Import journey<input type="file" accept="application/json" hidden id="imp"></label></div><p class="small muted">Saves stay in this browser. The first edition keeps its own save; importing it here never changes it.</p></div><div class="card"><h3>What your mentors said</h3>${s.mentorLog.slice(-12).reverse().map((m) => `<p class="small"><b style="color:var(--gold)">${esc(SA.Mentors.get(m.m).name.split(' ')[0])}:</b> ${esc(m.text)}</p>`).join('') || '<p class="small muted">Nothing yet.</p>'}</div></div>`;
    };
    const tabs = [['evidence', 'Evidence'], ['hypotheses', 'Hypotheses'], ['collections', 'Collections'], ['achievements', 'Achievements'], ['sources', 'Sources & credits'], ['journey', 'Journey']];
    const el = UI.modal({ title: 'Field notebook', kicker: 'Evidence, sources and open questions', cls: 'wide', body: `<div class="tabs">${tabs.map(([k, n]) => `<button data-act="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}</div><div id="nb">${body()}</div>`,
      on: { tab: (b) => UI.notebook(b.dataset.tab), export: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 1)], { type: 'application/json' })); a.download = 'society-atlas-journey.json'; a.click(); } } });
    const imp = $('#imp', el); if (imp) imp.onchange = () => { const f = imp.files[0]; if (!f) return; f.text().then((txt) => { let data; try { data = JSON.parse(txt); } catch (e) { UI.toast('That file is not a journey.'); return; } const ok = data && (data.version === 2 || data.version === 1); if (!ok) { UI.toast('That file is not a journey.'); return; } SA.save = data.version === 1 ? SA.migrateV1(data) : SA.normalizeSave(data); SA.persist(true); UI.closeModal(); UI.toast('<b>Journey imported.</b>'); G().toMenu(); }); };
  };
  UI.roster = () => {
    const s = save(); UI.modal({ title: 'Contacts', kicker: 'Mentors and the scholars you have met', cls: 'wide', body: `<h3 style="margin-bottom:10px">Your mentors</h3><div class="grid g3">${Object.values(SA.Mentors.all).map((m) => `<div class="card"><canvas class="mface" data-m="${m.key}" width="160" height="160" style="width:80px;height:80px;border-radius:12px;float:left;margin-right:12px;border:1.5px solid var(--gold)"></canvas><h3>${esc(m.name)}</h3><div class="small muted">${esc(m.year)}</div><p class="small">${esc(m.bio)}</p></div>`).join('')}</div><h3 style="margin:18px 0 10px">Scholars</h3>${s.contacts.length ? `<div class="grid g4">${s.contacts.map((id) => { const e = E().get(id); return `<div class="card">${UI.portrait(E().scholars(id)[0], 'pleased', 'single')}<h3 style="margin-top:8px">${esc(e.name)}</h3><div class="small muted">${esc(e.method)}</div><p class="small">${esc(e.transfer)}</p></div>`; }).join('')}</div>` : '<p class="muted">Complete a research problem and its scholar joins your contacts.</p>'}` });
    $$('.mface').forEach((cv) => SA.Mentors.portrait(cv.getContext('2d'), SA.Mentors.get(cv.dataset.m).face, 'pleased', 1, 160, false));
  };
  UI.settings = () => {
    const st = save().settings, rng = (k, label) => `<label class="set"><span>${label}</span><input type="range" min="0" max="1" step="0.05" value="${st[k]}" data-k="${k}"></label>`, chk = (k, label) => `<label class="set"><span>${label}</span><input type="checkbox" ${st[k] ? 'checked' : ''} data-k="${k}"></label>`;
    const el = UI.modal({ title: 'Settings', kicker: 'Sound, motion and guidance', cls: 'narrow', body: `${rng('music', 'Music')}${rng('ambience', 'Ambience')}${rng('effects', 'Effects')}${rng('voice', 'Voice blips')}${chk('muted', 'Mute everything')}${chk('reduced', 'Reduced motion')}${chk('large', 'Large text')}${chk('daynight', 'Day and night')}${chk('relaxed', 'Relaxed mode: no timers in fieldwork')}<label class="set"><span>Mentor guidance</span><select data-k="guidance"><option value="0">Quiet</option><option value="1">Key moments</option><option value="2">Normal</option><option value="3">Chatty</option></select></label><label class="set"><span>Walking speed</span><input type="range" min="0.7" max="1.6" step="0.1" value="${st.speed}" data-k="speed"></label><p class="small muted">Controls: click or tap to walk; WASD to step; Shift to run; E to interact; C to centre; M atlas; N notebook; mouse wheel or pinch to zoom; drag to look around; Space to pause.</p><label class="set"><span>Your name</span><input type="text" value="${esc(save().player.name)}" data-k="name" maxlength="18" style="width:180px;padding:6px;border-radius:7px;border:1px solid var(--line);background:rgba(0,0,0,.3);color:var(--text)"></label><label class="set"><span>Your look</span><span class="row">${[0, 1, 2, 3].map((i) => `<button class="btn small" data-act="look" data-i="${i}">${i + 1}</button>`).join('')}</span></label>`,
      on: { look: (b) => { save().player.look = +b.dataset.i; SA.persist(); UI._meTick = -1; } } });
    $('select[data-k=guidance]', el).value = String(st.guidance);
    el.addEventListener('input', (ev) => { const k = ev.target.dataset.k; if (!k) return; if (k === 'name') save().player.name = ev.target.value.trim() || 'You'; else st[k] = ev.target.type === 'checkbox' ? ev.target.checked : Number(ev.target.value); G().applySettings(); SA.persist(); });
  };
  UI.gazette = (z) => { if (!z) return; UI.modal({ title: 'The Bellwether Gazette', kicker: 'Evening edition', cls: '', body: `<div class="paper"><div class="gazette"><h1>The Bellwether Gazette</h1><div class="dateline">${esc(z.dateline)}</div><h2>${esc(z.head)}</h2><p>${esc(z.lead)}</p><h3>${esc(z.sub)}</h3><p>${esc(z.body)}</p><h3>In brief</h3><p>${esc(z.brief)}</p><h3>Letters</h3><p><i>${esc(z.letter)}</i></p></div></div>`, footer: '<span class="small muted" style="margin-right:auto">A fictional newspaper. It reports your play, not the world.</span><button class="btn primary" data-close>Fold the paper</button>' }); sfx('page'); };
  UI.menu = () => G().toMenu();

  // ---------- title screen: the Atlas opens as a pop-up book ----------
  UI.title = () => {
    const s = save(), m = $('#menu'), q = (window.ATLAS_QUOTES?.menu || [])[0];
    const items = [
      { act: 'new', label: s.started ? 'New journey' : 'Begin the journey', b: { name: 'Great Dome', type: 'landmark', style: 'dome', w: 12, h: 6, height: 60, wall: '#cfc8b4', roof: '#8e948a' }, x: 27, y: 44, sc: 0.5 },
      { act: 'continue', label: 'Continue', b: { name: 'Rush Rhees Library', type: 'landmark', style: 'columns', w: 12, h: 6, height: 62, wall: '#a96a50', roof: '#626268' }, x: 50, y: 30, sc: 0.44, off: !s.started },
      { act: 'tutorial', label: 'Tutorial', b: { name: 'Nassau Hall', type: 'archive', w: 12, h: 5, height: 46, wall: '#b7785a', roof: '#5f5f5a' }, x: 14, y: 70, sc: 0.44 },
      { act: 'atlas', label: 'The Atlas', b: { name: 'Radcliffe Camera', type: 'landmark', style: 'clocktower', w: 6, h: 6, height: 58, wall: '#d0c5a8', roof: '#5d6268' }, x: 73, y: 46, sc: 0.56 },
      { act: 'notebook', label: 'Notebook', b: { name: 'Widener Library', type: 'library', w: 12, h: 6, height: 52, wall: '#a3523c', roof: '#5a3b33' }, x: 38, y: 78, sc: 0.46 },
      { act: 'settings', label: 'Settings', b: { name: 'Burton Tower', type: 'landmark', style: 'cupola', w: 5, h: 5, height: 48, wall: '#b9a98a', roof: '#4d544e' }, x: 62, y: 80, sc: 0.5 },
      { act: 'legacy', label: 'First edition (V1)', b: { type: 'rowhouse', w: 6, h: 3, height: 40, wall: '#9c5b44', roof: '#4a4c4e' }, x: 87, y: 74, sc: 0.66 },
    ];
    m.innerHTML = `<div class="glow"></div><div class="title"><h1>The Society <em>Atlas</em></h1><p>A research adventure across ${Object.keys(SA.Campuses).length - 1} universities on four continents</p></div>
      ${q ? `<blockquote class="quote glass">“${esc(q.text)}”<cite>${esc(q.author)} · <a href="${esc(q.source)}" target="_blank" rel="noopener" style="color:var(--gold)">source</a></cite></blockquote>` : ''}
      <div class="book"><div class="cover"></div><div class="page l"><canvas width="900" height="960"></canvas></div><div class="page r"><canvas width="900" height="960"></canvas></div><div class="gutter"></div>
      ${items.map((it, i) => `<div class="shadowcard" style="left:${it.x}%;top:${it.y}%;width:${it.sc * 300}px;height:${it.sc * 70}px"></div><button class="pop" data-act="${it.act}" ${it.off ? 'disabled' : ''} style="left:${it.x}%;top:${it.y}%;animation-delay:${0.25 + i * 0.12}s" aria-label="${esc(it.label)}"><span class="tag">${esc(it.label)}</span></button>`).join('')}</div>
      <div class="foot"><span>Version ${SA.VERSION}</span><button data-act="credits">Sources &amp; credits</button><a href="legacy/index.html" target="_blank" rel="noopener">Play the original (V1)</a><span>Research anchors are real; campuses and dialogue are teaching fiction.</span></div>`;
    m.classList.add('open'); UI.hud(false);
    // paint the pages: an old campus plan in ink
    $$('.page canvas', m).forEach((cv, pi) => { const c = cv.getContext('2d'), r = SA.rng(11 + pi); c.strokeStyle = 'rgba(110,80,40,.28)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(0, 60 + i * 110 + r() * 30); c.bezierCurveTo(300, 40 + i * 110 + r() * 80, 600, 90 + i * 110 - r() * 80, 900, 60 + i * 110 + r() * 40); c.stroke(); } c.strokeStyle = 'rgba(110,80,40,.2)'; for (let i = 0; i < 40; i++) { const x = r() * 900, y = r() * 960; c.strokeRect(x, y, 30 + r() * 70, 20 + r() * 50); } c.fillStyle = 'rgba(110,80,40,.5)'; c.font = 'italic 34px Georgia'; c.fillText(pi ? 'Plate II · Routes between the universities' : 'Plate I · A living atlas of universities', 50, 70); c.save(); c.translate(pi ? 760 : 120, 840); c.strokeStyle = 'rgba(110,80,40,.6)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 56, 0, 7); c.stroke(); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, -70); c.lineTo(i % 2 ? 6 : 12, 0); c.lineTo(i % 2 ? -6 : -12, 0); c.fillStyle = 'rgba(110,80,40,.5)'; c.fill(); } c.restore(); });
    $$('.pop', m).forEach((b, i) => { const it = items[i], cv = SA.Render.thumb(it.b, 1.4); cv.style.width = cv.width / 1.4 * it.sc * 1.5 + 'px'; cv.style.height = cv.height / 1.4 * it.sc * 1.5 + 'px'; b.prepend(cv); });
    // labels float above the book so they stay upright and legible
    const lab = document.createElement('div'); lab.className = 'mlabels'; lab.innerHTML = items.map((it) => `<span class="${it.off ? 'off' : ''}">${esc(it.label)}</span>`).join(''); m.appendChild(lab);
    const place = () => { const pops = $$('.pop', m), ls = $$('.mlabels span', m); pops.forEach((p, i) => { const r = (p.querySelector('canvas') || p).getBoundingClientRect(); ls[i].style.left = r.left + r.width / 2 + 'px'; ls[i].style.top = r.bottom - 4 + 'px'; ls[i].classList.toggle('hot', p.matches(':hover, :focus-visible')); }); if (m.classList.contains('open')) requestAnimationFrame(place); }; requestAnimationFrame(place);
    const book = $('.book', m); m.onmousemove = (ev) => { if (save().settings.reduced) return; const dx = ev.clientX / innerWidth - 0.5, dy = ev.clientY / innerHeight - 0.5; book.style.transform = `translate(-50%,-50%) rotateX(${54 - dy * 7}deg) rotateZ(${-4 + dx * 7}deg)`; };
    m.onmouseover = (ev) => { if (ev.target.closest('.pop') && !ev.relatedTarget?.closest?.('.pop')) sfx('hover'); };
    m.onclick = (ev) => { const b = ev.target.closest('[data-act]'); if (!b || b.disabled) return; SA.Audio.unlock(); SA.Music.play('menu'); sfx('page'); const a = b.dataset.act, g = G();
      if (a === 'new') g.newJourney(); else if (a === 'continue') g.continueJourney(); else if (a === 'atlas') UI.atlas(); else if (a === 'notebook') UI.notebook(); else if (a === 'settings') UI.settings(); else if (a === 'credits') UI.notebook('sources'); else if (a === 'legacy') { let w = null; try { w = window.open('legacy/index.html', '_blank'); } catch (e) { w = null; } if (!w) location.href = 'legacy/index.html'; } else if (a === 'tutorial') UI.tutorial(); };
  };
  UI.titleClose = () => { $('#menu').classList.remove('open'); $('#menu').innerHTML = ''; };
  UI.tutorial = () => {
    if (!window.AtlasTutorial) { UI.toast('The tutorial is unavailable.'); return; }
    let ctl = null; const el = UI.modal({ title: 'Before the journey', kicker: 'Hands-on practice from the first edition', cls: 'wide', body: '<div class="paper"><div id="tut"></div></div><p class="note" style="margin-top:10px">This practice room comes from the first edition and teaches the research steps. Movement in V2 also offers running (Shift), zoom and the minimap.</p>', onClose: () => ctl?.destroy?.() });
    ctl = window.AtlasTutorial.mount($('#tut', el), { reduced: save().settings.reduced, keys: save().settings.keys, onComplete: () => { save().tutorial.completed = true; SA.persist(); } });
  };
  SA.UI = UI;
})();
