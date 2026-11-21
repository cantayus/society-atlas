/* The Society Atlas V2 — the game: loop, input, camera, objectives, interaction, travel. */
(function () {
  'use strict';
  const SA = window.SA, R = SA.Render, esc = SA.esc, clamp = SA.clamp;
  const $ = (s) => document.querySelector(s);
  const HUB = { id: 0, name: 'Bellwether', shortName: 'Bellwether', campus: 'Bellwether', era: 'this evening', year: 2026, method: 'The festival question', title: 'Who is missing from the festival?', office: 'Fellowship House' };
  const G = { enc: null, world: null, hour: 9.5, mentor: 'ines', pauseInput: false, challenge: null, mode: 'boot', paused: false, task: null, t: 0 };
  const player = { x: 0, y: 0, path: [], front: true, flip: false, walk: false, run: false, trail: [] };
  const keys = new Set();
  let fx = [], opening = false, stepSide = 1;
  let cast = null, follow = true, zoomTo = 1, pending = null, near = null, bubbles = [], dest = null, stepT = 0, saveT = 0, ambT = 0, nearT = 0, idleT = 0, lastHour = 0, waterMap = null, behind = null, flags = {}, lastTile = -1, companion = { x: 0, y: 0, front: true, flip: false, walk: false };

  // ---------- small talk (invented; nobody real is quoted) ----------
  const CHAT = {
    old: ['They say electric light will ruin our eyes. I say the reading already has.', 'I counted every lamp post on the avenue for a wager. Sampling would have been quicker.', 'Mind the tram. It has right of way and a poor temper.', 'The library closes at dusk. Knowledge keeps office hours.', 'My landlady charges extra for candles. I study economics in self-defense.', 'A census taker came by twice. We gave him two different answers, to be fair.'],
    mid: ['The punch-card machine ate my thesis. It seemed to enjoy it.', 'Everyone is running surveys. Has anyone asked whether people want to be asked?', 'Coffee is a nickel and the seminar is free. One of them keeps me awake.', 'My adviser says “interesting” the way other people say “no”.', 'We ran the numbers by hand. Twice. They disagreed, which is at least honest.', 'Somebody left a slide rule on that bench on Tuesday. It is still there. A natural experiment in honesty.'],
    modern: ['My code runs. I do not know why. I am not touching it.', 'The dataset has four million rows and one of them is a cat.', 'Reviewer two wants a robustness check. Reviewer two always wants a robustness check.', 'I came for one seminar and stayed for the pizza. Selection effects are real.', 'The wifi is down, so everyone is talking to each other. It is unsettling.', 'I have been “almost done” with this chapter since spring.', 'Someone asked my sample size and I said “adequate” with real confidence.'],
    any: ['The squirrels are bolder every term. Somebody should run a panel study.', 'If you can hear the bell, you are late for something.', 'The plaza directory knows where everyone is. It is the most cited object on campus.', 'The cat belongs to no department. That is why everyone likes it.', 'A fine day for fieldwork. It is always a fine day for someone else’s fieldwork.'],
    hub: ['The festival is for everyone. That is what the poster says.', 'My sister is in Eastbank. Her invitation came on Thursday. The festival was Wednesday.', 'The east gate shuts at six. The lanterns are lit at seven. Work that one out.', 'The council counted the crowd from the Town Hall steps. You cannot see the canal bridge from there.', 'Eastbank folk do not care for festivals. Everyone on this side says so.', 'I would go, but who minds the little ones? It is not the walk, it is the evening.'],
  };
  const HUBTALK = {
    festival: ['A stallholder wipes her hands. “Same faces every year. Lovely faces. The same ones.”', 'An organiser shows you the poster. “Everyone is welcome. It says so right here.” The poster is pinned on this side of the canal.'],
    gate: ['The gatekeeper shrugs. “East gate shuts at six. Always has. Festival starts at seven. Nobody ever asked me about it.”', 'A boy on the wall says the long way round takes forty minutes, “if you know it”.'],
    eastbank: ['“I finish at the mill at eight. By then the lanterns are for other people.”', '“My neighbour went once. Nobody was rude. Nobody spoke to her either.”', '“We heard about it the day after. We usually do.”'],
  };

  // ---------- helpers ----------
  const s = () => SA.save;
  const stage = () => { const id = G.enc.id, v = s(), found = v.found.includes(id), fieldDone = !!v.tasks[id]?.done || !SA.Tasks.forEncounter(id); return v.completed.includes(id) ? 4 : found && fieldDone ? 3 : found ? 2 : v.clues.includes(id) ? 1 : 0; };
  const compass = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, ang = Math.atan2(-(dx + dy), dx - dy); return ['east', 'north-east', 'north', 'north-west', 'west', 'south-west', 'south', 'south-east'][((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8]; };
  const pack = (bits) => { const out = new Uint8Array(Math.ceil(bits.length / 8)); for (let i = 0; i < bits.length; i++) if (bits[i]) out[i >> 3] |= 1 << (i & 7); let str = ''; for (const b of out) str += String.fromCharCode(b); return btoa(str); };
  const unpack = (str, n) => { const bits = new Uint8Array(n); try { const raw = atob(str); for (let i = 0; i < n; i++) if (raw.charCodeAt(i >> 3) & (1 << (i & 7))) bits[i] = 1; } catch (e) { /* a damaged record starts unexplored */ } return bits; };
  const visitKey = () => G.world.key + ':' + (G.world.visit.variant || 0);
  const sketchKey = () => G.world.key + ':' + G.enc.id;
  const spriteLook = (f, extra) => ({ seed: 3, skin: f.skin, hair: f.hair, top: f.top, bot: '#3b4150', longHair: f.style === 'long' || f.style === 'bob', glasses: !!f.glasses, scarf: f.accent, ...extra });
  const say = (trigger, vars, opts) => SA.Mentors.say(trigger, { campus: G.world.def.short, era: G.enc.era, ...vars }, opts);
  function nearestFree(x, y, r = 4) { const w = G.world; x = Math.round(x); y = Math.round(y); if (w.walkable(x, y)) return { x, y }; let best = null, bd = 1e9; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (w.walkable(x + dx, y + dy)) { const d = dx * dx + dy * dy + (dy > 0 || dx > 0 ? -0.5 : 0); if (d < bd) { bd = d; best = { x: x + dx, y: y + dy }; } } return best; }
  function bubble(a, text, ms = 5200) { bubbles = bubbles.filter((b) => b.a !== a); bubbles.push({ a, text, until: performance.now() + ms }); }

  // ---------- entering a campus ----------
  function enter(id, fresh) {
    const v = s(), enc = id ? SA.Encounters.get(id) : HUB, visit = SA.VISITS[id] || SA.VISITS[1], def = SA.Campuses[visit.uni];
    const world = SA.World.generate(def, { year: enc.year, office: enc.office, season: visit.season || def.season || 'autumn', variant: visit.variant || 0 });
    G.enc = enc; G.world = world; G.task = null; G.challenge = null; G.mode = 'play'; G.paused = false; G.mentor = SA.Mentors.mentorFor(id); G.hour = visit.hour || 9.5; lastHour = Math.floor(G.hour);
    R.setWorld(world); R.revealAll();
    player.x = world.spawn.x; player.y = world.spawn.y; player.path = []; player.trail = []; companion.x = player.x - 0.8; companion.y = player.y + 0.6; R.reveal(player.x, player.y, 9); lastTile = -1;
    cast = new SA.Actors.Cast(world, { people: id ? 22 : 26 }); G.cast = cast; bubbles = []; near = null; pending = null; dest = null; flags = {}; follow = true; fx = []; opening = false;
    // distance to water, for the ambience
    const N = world.N; waterMap = new Uint8Array(N * N).fill(255); const q = []; for (let i = 0; i < N * N; i++) if (world.terrain[i] === world.T.WATER) { waterMap[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) { const i = q[h], d = waterMap[i]; if (d >= 8) continue; const x = i % N, y = (i - x) / N; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; const k = yy * N + xx; if (waterMap[k] > d + 1) { waterMap[k] = d + 1; q.push(k); } } }
    const lm = world.pois.landmark && world.pois.landmark.b; behind = lm ? nearestFree(lm.x + lm.w / 2, lm.y - 2, 5) : null; if (behind && behind.y >= lm.y) behind = null;
    R.zoom = zoomTo = innerWidth < 760 ? 0.85 : innerWidth < 1200 ? 1.1 : 1.3; R.centre(player.x, player.y);
    v.current = id; v.started = true; SA.persist();
    SA.UI.titleClose(); SA.UI.hud(true); SA.UI.refresh(); objective();
    SA.Music.play(world.key); ambience(); SA.Mentors.clear();
    setTimeout(() => { if (!id) say('hub', {}, { force: true }); else if (stage() >= 4) say('travel'); else say('arrive', {}, { force: true }); }, fresh ? 1400 : 700);
    if (def.notes && !v.quests['seen:' + world.key]) { v.quests['seen:' + world.key] = 1; setTimeout(() => SA.UI.toast(`<b>${esc(def.name)}</b><br>${esc(def.notes[0])}`, 6500), 2600); }
  }
  function ambience() { const w = G.world, i = Math.round(player.y) * w.N + Math.round(player.x), d = waterMap ? waterMap[i] ?? 255 : 255; SA.Audio.ambience({ season: w.season, hour: G.hour, water: clamp(1 - d / 7, 0, 1), crowd: G.enc.id ? 0.35 : 0.7, rain: false, city: w.roads.length > 0 }); }

  // ---------- objectives ----------
  function objective() {
    const enc = G.enc, v = s();
    if (!enc.id) {
      const heard = ['festival', 'gate', 'eastbank'].filter((k) => v.quests['hub:' + k]).length, n = v.completed.length;
      SA.UI.objective('Who is missing from the festival?', [{ text: `Listen at the festival ground, the evening gate and in Eastbank (${heard} of 3)`, done: heard >= 3, now: heard < 3 }, { text: 'Review your hypotheses at Fellowship House', done: !!v.quests['hub:board'], now: heard >= 3 && !v.quests['hub:board'] }, { text: n >= 18 ? 'Hold the colloquium at the Town Hall' : `Hold the colloquium at the Town Hall (needs 18 methods; you have ${n})`, done: !!v.proposal, now: n >= 18 && !v.proposal }, { text: 'Open the Atlas (M) to travel on', now: false }]);
      return;
    }
    const st = stage(), task = SA.Tasks.forEncounter(enc.id), steps = [{ text: 'Read the plaza directory', done: st >= 1, now: st === 0 }, { text: `Find ${enc.office || 'the research rooms'}`, done: st >= 2, now: st === 1 }];
    if (task) steps.push({ text: `Fieldwork: ${task.title}`, done: !!v.tasks[enc.id]?.done, now: st === 2 });
    steps.push({ text: 'Solve the research problem', done: st >= 4, now: st === 3 }, { text: 'Open the Atlas (M) and travel on', now: st >= 4 });
    SA.UI.objective(enc.title, steps, G.task && !G.task.done ? G.task.hud() : '');
  }
  function target() {                                           // where the gold marker points
    const w = G.world, v = s(), enc = G.enc; if (!enc.id) { for (const k of ['festival', 'gate', 'eastbank']) if (!v.quests['hub:' + k]) return w.pois[k]; return v.completed.length >= 18 && !v.proposal ? w.pois.landmark : !v.quests['hub:board'] ? w.pois.office : null; }
    const st = stage(); if (G.task && !G.task.done) return null; if (st === 0) return w.pois.directory; if (st <= 3) return w.pois.office; return null;
  }

  // ---------- interaction ----------
  function candidates() {
    const w = G.world, v = s(), out = [], px = player.x, py = player.y, add = (x, y, label, fn, r = 1.9, bias = 0) => { const d = Math.hypot(x - px, y - py); if (d < r) out.push({ d: d - bias, label, fn, x, y }); };
    if (G.task && !G.task.done) { const st = G.task.near(px, py); if (st) add(st.x, st.y, G.task.verb(st), () => { G.task.visit(st); objective(); }, 2, 1); }
    const P = w.pois, id = G.enc.id;
    if (P.directory) add(P.directory.x, P.directory.y, id ? 'Read the directory' : 'Read the notice board', directory);
    if (P.office) add(P.office.x, P.office.y, id ? `Knock: ${P.office.label}` : 'Enter Fellowship House', () => doorway(P.office, office), 1.9, 0.3);
    if (P.archive) add(P.archive.x, P.archive.y, 'Visit the archive', () => doorway(P.archive, archive));
    if (P.library) add(P.library.x, P.library.y, 'Visit the library', () => doorway(P.library, library));
    if (P.landmark) add(P.landmark.x, P.landmark.y, !id ? 'Enter the Town Hall' : v.collect.stamps.includes(w.key) ? `Admire ${P.landmark.label}` : `Stamp your atlas: ${P.landmark.label}`, () => doorway(P.landmark, landmark));
    if (P.workshop) add(P.workshop.x, P.workshop.y, 'Try the workshop table', workshop);
    if (!id) for (const k of ['festival', 'eastbank']) add(P[k].x, P[k].y, 'Listen', () => hubTalk(k), 2.2);
    const eggs = SA.Progress.EGGS[w.key] || [];
    for (const th of w.interact) { const i = eggs.findIndex((e) => e.thing === th.kind); add(th.x, th.y, th.label || 'Look closer', () => { if (!id && th.kind === 'gate' && (!v.quests['hub:gate'] || v.collect.pokes[w.key + ':' + i])) return hubTalk('gate'); if (i < 0 || !SA.Progress.eggFound(w.key, i)) SA.UI.toast('Nothing new here. Still worth the look.', 2200); }, 2.1); }
    eggs.forEach((e, i) => { if (!e.prop || v.collect.pokes[w.key + ':' + i]) return; const p = w.props.find((q) => q.k === e.prop); if (p) add(p.x, p.y, 'Look closer', () => SA.Progress.eggFound(w.key, i), 2.3); });
    for (const a of cast.list) {
      if (a.kind === 'npc' && (a.line !== null && a.line !== undefined || a.piper)) add(a.x, a.y, a.piper ? 'Listen to the piper' : 'Talk', () => talk(a), 1.7, -0.2);
      else if (a.kind === 'cat') add(a.x, a.y, 'Greet the cat', () => petCat(a), 1.7);
      else if (a.kind === 'squirrel' && !a.moving) add(a.x, a.y, 'Offer an acorn', () => { a.tame = true; a.wait = 6; SA.Audio.sfx('chitter'); bubble(a, '!', 1500); say('squirrel'); v.stats.pokes++; }, 1.5, -0.3);
      else if (a.kind === 'dog') add(a.x, a.y, 'Greet the dog', () => { SA.Audio.sfx('chitter'); bubble(a, 'Woof.', 1800); }, 1.6);
    }
    return out.sort((a, b) => a.d - b.d);
  }
  function interact() { if (G.pauseInput || G.mode !== 'play') return; const c = near || candidates()[0]; if (!c) { SA.Audio.sfx('blip', 300); return; } idleT = 0; c.fn(); SA.UI.refresh(); }
  function talk(a) {
    const v = s(), w = G.world;
    if (a.piper) { SA.Audio.sfx('pipes'); bubble(a, '♪ ♫ ♪', 4200); const i = (SA.Progress.EGGS[w.key] || []).findIndex((e) => e.event === 'piper'); if (i >= 0) SA.Progress.eggFound(w.key, i); return; }
    const era = w.visit.year < 1925 ? 'old' : w.visit.year < 1970 ? 'mid' : 'modern', pool = G.enc.id ? [...CHAT[era], ...CHAT.any] : CHAT.hub, text = pool[(a.line + Math.floor(SA.hash(w.seed, a.line, 3) * 7) + (a.said || 0)) % pool.length];
    a.said = (a.said || 0) + 1; a.wait = Math.max(a.wait, 5); a.path = []; a.front = true; bubble(a, text); SA.Audio.sfx('blip', 420 + (a.line % 5) * 60); v.talked[w.key + ':' + a.id] = 1; SA.Progress.check(); SA.persist();
  }
  function petCat(a) { const v = s(), w = G.world; SA.Audio.sfx('purr'); bubble(a, 'Prrrp.', 2600); if (!v.collect.cats.includes(w.key)) { v.collect.cats.push(w.key); SA.Progress.bonus(3, 'You met the Atlas cat'); } say('cat'); const i = (SA.Progress.EGGS[w.key] || []).findIndex((e) => e.event === 'cat'); if (i >= 0) SA.Progress.eggFound(w.key, i); SA.Progress.check(); }
  function directory() {
    const w = G.world, P = w.pois, v = s(), enc = G.enc, from = P.directory;
    if (!enc.id) { SA.UI.modal({ title: 'Town notice board', kicker: 'Bellwether', cls: 'narrow', body: `<p style="font-family:var(--serif);font-size:1.12em;line-height:1.55">THE EVENING FESTIVAL · all districts welcome · lanterns lit at seven.</p><p class="small">Pinned underneath, in another hand: <i>“Then where is Eastbank?”</i></p><p class="small muted">Listen at the festival ground, at the evening gate and across the canal. Fellowship House keeps your hypotheses. The Town Hall hosts the colloquium once your notebook holds eighteen methods.</p>`, footer: '<button class="btn primary" data-close>Understood</button>' }); return; }
    const row = (p, what) => (p ? `<tr><td style="padding:5px 14px 5px 0"><b>${esc(what)}</b></td><td>${esc(p.label || '')}</td><td style="padding-left:14px;color:var(--gold)">${compass(from, p)}</td></tr>` : '');
    const eggs = Object.keys(v.collect.pokes).filter((k) => k.startsWith(w.key + ':')).length;
    SA.UI.modal({ title: 'Plaza directory', kicker: `${enc.campus} · ${enc.era}`, cls: 'narrow', body: `<table style="font-family:var(--serif);font-size:1.08em;border-collapse:collapse">${row(P.office, 'Research')}${row(P.archive, 'Archive')}${row(P.library, 'Library')}${row(P.landmark, 'Landmark')}</table><p class="small" style="margin-top:12px">${esc(SA.Encounters.scholars(enc.id).join(' and '))}: ${esc(enc.objective)}</p><p class="small muted">Directions are as you see the map: north is the top of the screen. ${esc(w.def.notes[1] || '')} Campus secrets found here: ${eggs} of 2.</p>`, footer: '<button class="btn primary" data-close>Set off</button>' });
    if (!v.clues.includes(enc.id)) { v.clues.push(enc.id); SA.Audio.sfx('quest'); say('directory'); SA.persist(); } objective();
  }
  function office() {
    const v = s(), enc = G.enc;
    if (!enc.id) { v.quests['hub:board'] = 1; SA.persist(); objective(); SA.UI.notebook('hypotheses'); return; }
    if (!v.found.includes(enc.id)) { v.found.push(enc.id); if (!v.clues.includes(enc.id)) v.clues.push(enc.id); say('office'); SA.persist(); }
    objective(); SA.UI.meet(enc);
  }
  function archive() {
    const v = s(), enc = G.enc, id = enc.id, src = id ? SA.Encounters.sourcesFor(enc) : [], first = id && !v.collect.cards.includes(id);
    if (!id) { SA.UI.modal({ title: 'City Archive', kicker: 'Bellwether', cls: 'narrow', body: `<p style="font-family:var(--serif);font-size:1.1em;line-height:1.55">The attendance ledgers go back twenty years. Every year the count is taken at the Town Hall steps at half past seven. Nobody has ever counted at the canal.</p><p class="small muted">A fictional record for a fictional city.</p>`, footer: '<button class="btn primary" data-close>Close the ledger</button>' }); return; }
    SA.UI.modal({ title: 'Archive card', kicker: `${enc.campus} · catalogue ${String(id).padStart(2, '0')}`, cls: 'narrow', body: `<div class="paper">${src.map((x) => `<h3 style="font-size:1.05em;margin-bottom:4px">${esc(x.title)}</h3><p class="small">${esc(x.note || '')}</p><p><a href="${esc(x.url)}" target="_blank" rel="noopener">Open the source ↗</a></p>`).join('') || '<p>No card on file.</p>'}</div><p class="note" style="margin-top:10px">The studies on this card are real. The rooms, conversations and numbers you meet on campus were made up for the game.</p>`, footer: '<button class="btn primary" data-close>File the card</button>' });
    if (first) { v.collect.cards.push(id); SA.Progress.bonus(3, 'Archive card collected'); SA.Audio.sfx('page'); SA.Progress.check(); }
  }
  function library() {
    const enc = G.enc, w = G.world, q = window.ATLAS_QUOTES && (window.ATLAS_QUOTES.records || {})[w.key];
    SA.UI.modal({ title: w.pois.library.label || 'Library', kicker: w.def.name, cls: 'narrow', body: (q && q.text ? `<blockquote style="font-family:var(--serif);font-size:1.15em;line-height:1.5;margin:0 0 8px">“${esc(q.text)}”</blockquote><p class="small muted">${esc(q.author)}${q.role ? ', ' + esc(q.role) : ''} · <a href="${esc(q.source)}" target="_blank" rel="noopener" style="color:var(--gold)">source</a></p>` : '<p class="muted">Rows of quiet desks. Someone has left a pencil in every third book.</p>') + (enc.id ? `<div class="card" style="margin-top:12px"><div class="eyebrow">On the reading list</div><h3>${esc(enc.method)}</h3><p class="small">${esc(enc.objective)}</p><p class="small muted"><b>Keep in mind:</b> ${esc(enc.limitation)}</p></div>` : ''), footer: '<button class="btn" data-act="src">All sources</button><button class="btn primary" data-close>Back outside</button>', on: { src: () => SA.UI.notebook('sources') } });
  }
  function landmark() {
    const v = s(), w = G.world, lm = (window.CAMPUS_LANDMARKS || {})[w.key], def = w.def;
    if (!G.enc.id) return colloquium();
    const first = !v.collect.stamps.includes(w.key); if (first) { v.collect.stamps.push(w.key); SA.Audio.sfx('stamp'); SA.Progress.bonus(3, 'Landmark stamp'); SA.Progress.check(); }
    const b = w.pois.landmark.b, cv = b ? R.thumb(b, 1.3) : null;
    const el = SA.UI.modal({ title: def.landmark.name, kicker: `${def.name} · landmark stamp${first ? ' added' : ''}`, cls: 'narrow', body: `<div id="lm-pic" style="text-align:center;margin-bottom:8px"></div><p style="font-family:var(--serif);font-size:1.1em;line-height:1.5">${esc(def.notes[0])}</p>${lm ? `<p class="small">${lm.yearBuilt ? 'Built ' + esc(lm.yearBuilt) + '. ' : ''}${esc(lm.material || '')}.</p>` : ''}<p class="small muted">The campus has been squeezed to fit a game. Don’t find your way around the real one by it.</p>`, footer: '<button class="btn primary" data-close>Onward</button>' });
    if (cv) { cv.style.maxWidth = '100%'; cv.style.height = 'auto'; el.querySelector('#lm-pic').appendChild(cv); }
  }
  function workshop() {
    const id = G.enc.id, CP = window.CampusPlay; let ctl = null;
    const el = SA.UI.modal({ title: CP && id <= 18 ? CP.gadget(id).name : 'The workshop table', kicker: 'An optional detour · nothing here is graded', cls: 'wide', body: '<div class="paper"><div id="toy"></div></div>', onClose: () => ctl && ctl.destroy && ctl.destroy() });
    if (CP && id >= 1 && id <= 18) { try { ctl = CP.mount(el.querySelector('#toy'), id, { reduced: s().settings.reduced }); } catch (e) { el.querySelector('#toy').textContent = 'The installation is being repaired.'; } } else el.querySelector('#toy').innerHTML = `<p style="font-family:var(--serif);font-size:1.15em;line-height:1.55">${esc(SA.Progress.joke(id) || 'Someone has left a half-finished model made of pencils and string. It nearly stands up.')}</p>`;
  }
  function hubTalk(k) {
    const v = s(), n = (v.quests['hubn:' + k] = (v.quests['hubn:' + k] || 0) + 1), lines = HUBTALK[k], text = lines[(n - 1) % lines.length];
    SA.UI.modal({ title: G.world.pois[k].label, kicker: 'Bellwether · a resident speaks', cls: 'narrow', body: `<p style="font-family:var(--serif);font-size:1.15em;line-height:1.55">${esc(text)}</p><p class="small muted">An invented resident. One remark proves nothing, but it is worth writing down.</p>`, footer: '<button class="btn primary" data-close>Note it down</button>' });
    if (!v.quests['hub:' + k]) { v.quests['hub:' + k] = 1; SA.Progress.bonus(3, 'A resident’s account'); if (k === 'gate') say('gate'); } SA.persist(); objective();
  }
  function colloquium() {
    const v = s(), D = window.ATLAS_DATA, F = D.finale, n = v.completed.length;
    if (n < 18) { SA.UI.modal({ title: 'Bellwether Town Hall', kicker: 'The colloquium', cls: 'narrow', body: `<p style="font-family:var(--serif);font-size:1.12em;line-height:1.55">The hall is booked in your name. The clerk checks your notebook: ${n} of the eighteen methods a proposal needs.</p><p class="small muted">Come back when you can test a claim against its rivals.</p>`, footer: '<button class="btn primary" data-close>Back to the square</button>' }); return; }
    const pick = { hyp: null, ev: new Set(), lim: null, plan: null };
    const opt = (group, i, text) => `<button class="btn small" data-act="pick" data-g="${group}" data-i="${i}" style="text-align:left;white-space:normal">${esc(text)}</button>`;
    const el = SA.UI.modal({ title: F.title, kicker: F.subtitle, cls: 'wide', body: `<p>${esc(F.introduction)}</p><div class="grid g2"><div class="card"><div class="eyebrow">1 · Your claim</div><div class="choices">${D.hypotheses.map((h, i) => opt('hyp', i, h.title + ': ' + h.claim)).join('')}</div></div><div class="card"><div class="eyebrow">2 · At least three pieces of evidence</div><div class="choices" style="max-height:260px;overflow:auto">${v.evidence.map((e, i) => opt('ev', i, SA.Encounters.get(e.id).shortName + ': ' + (e.text || SA.Encounters.get(e.id).evidence))).join('')}</div></div><div class="card"><div class="eyebrow">3 · A limitation you will state</div><div class="choices">${F.limitations.map((t, i) => opt('lim', i, t)).join('')}</div></div><div class="card"><div class="eyebrow">4 · A study that could change your mind</div><div class="choices">${F.interventions.map((t, i) => opt('plan', i, t)).join('')}</div></div></div><div id="fin"></div>`,
      footer: `<span class="small muted" style="margin-right:auto">${esc(F.evidencePrompt)}</span><button class="btn primary" data-act="present" disabled>Present the proposal</button>`,
      on: { pick: (b) => { const g = b.dataset.g, i = +b.dataset.i; if (g === 'ev') { pick.ev.has(i) ? pick.ev.delete(i) : pick.ev.add(i); b.classList.toggle('primary'); } else { pick[g] = i; el.querySelectorAll(`[data-g=${g}]`).forEach((x) => x.classList.toggle('primary', x === b)); } el.querySelector('[data-act=present]').disabled = !(pick.hyp !== null && pick.ev.size >= 3 && pick.lim !== null && pick.plan !== null); },
        present: () => { v.proposal = { claim: D.hypotheses[pick.hyp].id, evidence: [...pick.ev].map((i) => v.evidence[i].id), limitation: F.limitations[pick.lim], plan: F.interventions[pick.plan], date: new Date().toISOString() }; SA.Audio.sfx('success'); SA.Audio.sfx('bell'); el.querySelector('.body').innerHTML = `<div class="done-card"><div class="eyebrow">The colloquium applauds, then asks questions</div><h3>${esc(D.hypotheses[pick.hyp].title)}</h3><p>${esc(F.ending)}</p><p class="small muted">Your proposal: ${esc(v.proposal.plan)}. Stated limit: ${esc(v.proposal.limitation)}</p></div>`; el.querySelector('footer').innerHTML = '<button class="btn primary" data-close>Step out into the evening</button>'; say('finale', {}, { force: true }); SA.Progress.bonus(50, 'Colloquium presented'); SA.Progress.check(); SA.persist(true); objective(); } } });
  }

  // ---------- fieldwork ----------
  G.startTask = () => { if (G.task && !G.task.done) return; G.task = SA.Tasks.start(G); if (!G.task) return; say('taskStart'); SA.Audio.sfx('quest'); SA.UI.toast(`<b>${esc(G.task.cfg.title)}</b><br>${esc(G.task.cfg.brief.charAt(0).toUpperCase() + G.task.cfg.brief.slice(1))}`, 9000); objective(); };
  SA.on('task-done', (rt) => {
    if (rt !== G.task) return; const v = s(), id = G.enc.id, first = !v.tasks[id]?.done;
    v.tasks[id] = { done: true, note: rt.note, good: !!rt.good }; SA.Audio.sfx('success'); if (first) SA.Progress.bonus(rt.good ? 15 : 10, 'Fieldwork complete');
    SA.UI.modal({ title: rt.cfg.title, kicker: 'Field note', cls: 'narrow', body: `<div class="paper"><p style="font-family:var(--serif);font-size:1.15em;line-height:1.55">${esc(rt.note)}</p></div><p class="small muted" style="margin-top:10px">Invented fieldwork with invented people. Take the note back to ${esc(G.enc.office || 'the research rooms')}.</p>`, footer: '<button class="btn primary" data-close>Back to the office</button>' });
    say('taskDone'); SA.Progress.check(); SA.persist(true); objective();
  });

  // ---------- research ----------
  G.openChallenge = (enc, onChange) => { G.challenge?.destroy?.(); G.challenge = null; const v = s(); if (!window.AtlasChallenge || v.completed.includes(enc.id)) return; const record = v.challenges[enc.id] || (v.challenges[enc.id] = {}); G.challenge = window.AtlasChallenge.create(record, { onChange: () => { SA.persist(); if (onChange) onChange(); } }); };
  G.retryChallenge = (enc) => { const v = s(), record = v.challenges[enc.id]; if (record && window.AtlasChallenge) { const c = window.AtlasChallenge.create(record, {}); c.reset(); c.destroy(); } v.puzzles[enc.id] = {}; SA.persist(true); };
  G.completeEncounter = (enc, text) => {
    const v = s(); if (!v.completed.includes(enc.id) && v.challenges[enc.id]?.status === 'failed') return;
    const before = SA.Progress.rank().index, first = !v.completed.includes(enc.id);
    if (first) { v.completed.push(enc.id); v.evidence.push({ id: enc.id, text: text || enc.evidence, date: new Date().toISOString() }); if (!v.contacts.includes(enc.id)) v.contacts.push(enc.id); if (!v.found.includes(enc.id)) v.found.push(enc.id); const c = v.challenges[enc.id] || {}; SA.Progress.gazette(enc, { award: c.award, errors: c.errors || 0, task: !!v.tasks[enc.id]?.done }); }
    SA.Audio.sfx('success'); const after = SA.Progress.rank();
    if (first) { if (after.index > before) { SA.Audio.sfx('rank'); SA.UI.toast(`<b>New standing</b> · ${esc(after.name)}`, 6000); say('rank', { rank: after.name }, { force: true }); } else say('labDone', {}, { force: true }); if (v.completed.length === 18) setTimeout(() => SA.UI.toast('<b>Eighteen methods.</b> The Town Hall in Bellwether will host your colloquium.', 8000), 2500); }
    SA.Progress.check(); SA.persist(true); SA.UI.refresh(); objective();
  };

  // ---------- travel and the title page ----------
  G.travel = (id) => {
    const v = s(), enc = id ? SA.Encounters.get(id) : HUB, def = SA.Campuses[(SA.VISITS[id] || SA.VISITS[1]).uni], go = () => { v.stats.travel++; SA.Audio.sfx('whoosh'); SA.Music.stop(true); SA.UI.fade(id ? enc.campus : 'Bellwether', id ? `${enc.era} · ${def.city}` : 'The city at the centre of the question', 1300, () => enter(id, true)); };
    if (G.mode === 'play' && G.enc && G.enc.id === id) return; storeFog();
    if (G.mode === 'play') SA.Progress.travelEvent(go); else go();
  };
  let menuCam = null;
  function backdrop() {                                          // the title screen looks out over a campus at the end of the afternoon
    const pool = ['oxford', 'rochester', 'cambridge', 'stanford', 'harvard', 'princeton', 'kyoto', 'duke'].filter((k) => SA.Campuses[k]), def = SA.Campuses[pool[Math.floor(Math.random() * pool.length)]];
    const world = SA.World.generate(def, { year: 2000, season: def.season || 'autumn', variant: 0 }), lm = world.pois.landmark || world.spawn;
    G.world = world; G.enc = null; R.setWorld(world); R.revealAll(); cast = new SA.Actors.Cast(world, { people: 18 }); G.cast = cast; bubbles = []; near = null; dest = null;
    menuCam = { x: lm.x + 5, y: lm.y + 1 }; R.zoom = zoomTo = innerWidth < 760 ? 0.9 : 1.2; R.centre(menuCam.x, menuCam.y); G.hour = 17.4;
  }
  G.toMenu = () => { storeFog(); G.mode = 'menu'; G.task = null; SA.Audio.ambienceStop(); SA.UI.closeModal(true); SA.UI.title(); if (SA.Audio.ctx) SA.Music.play('menu'); try { backdrop(); } catch (e) { G.world = null; } };
  G.continueJourney = () => { const v = s(); if (!v.started) return G.newJourney(); G.travel(v.current); };
  G.newJourney = () => {
    const begin = () => { const keep = s().settings; SA.save = SA.blankSave(); SA.save.settings = keep; intro(); };
    if (s().started) SA.UI.modal({ title: 'Begin again?', kicker: 'New journey', cls: 'narrow', body: '<p>A new journey replaces this edition’s saved journey in this browser. The first edition keeps its own save. You can export your journey first from the notebook.</p>', footer: '<button class="btn" data-close>Keep my journey</button><button class="btn primary" data-act="go">Begin again</button>', on: { go: () => { SA.UI.closeModal(true); begin(); } } }); else begin();
  };
  function intro() {
    const v = s(), M = SA.Mentors;
    const el = SA.UI.modal({ title: 'A letter from Bellwether', kicker: 'The fellowship', cls: '', sticky: true, body: `<div class="paper" style="font-family:var(--serif);font-size:1.1em;line-height:1.6"><p>Dear first-year,</p><p>Your fellowship comes with an unusual book: a living Atlas of universities, joined across places and eras. Every route in it leads to a different way of asking a question.</p><p>Ours is this. Bellwether’s evening festival is open to everyone, and the official map says every district is connected. Yet almost nobody from Eastbank comes. Why?</p><p>Travel. Do the fieldwork on foot. Learn ${SA.Encounters.count} methods from the people who shaped them, and bring back evidence with its limits attached.</p><p style="text-align:right">The Fellowship Committee</p></div><div class="grid g2" style="margin-top:14px"><label class="set"><span>Your name</span><input id="nm" type="text" maxlength="18" placeholder="You" style="width:180px;padding:7px;border-radius:7px;border:1px solid var(--line);background:rgba(0,0,0,.3);color:var(--text)"></label><label class="set"><span>Your look</span><span class="row" id="looks">${M.PLAYER_LOOKS.map((_, i) => `<canvas data-act="look" data-i="${i}" width="96" height="96" style="width:48px;height:48px;border-radius:10px;cursor:pointer;border:2px solid ${i ? 'transparent' : 'var(--gold)'}"></canvas>`).join('')}</span></label></div>`,
      footer: '<span class="small muted" style="margin-right:auto">You are a first-year PhD student. Three senior students will show you the ropes.</span><button class="btn primary" data-act="next">Meet your mentors</button>',
      on: { look: (b) => { v.player.look = +b.dataset.i; el.querySelectorAll('#looks canvas').forEach((c) => (c.style.borderColor = c === b ? 'var(--gold)' : 'transparent')); }, next: () => { v.player.name = (el.querySelector('#nm').value || '').trim() || 'You'; mentors(); } } });
    el.querySelectorAll('#looks canvas').forEach((c, i) => M.portrait(c.getContext('2d'), M.PLAYER_LOOKS[i], 'pleased', 1, 96, false));
  }
  function mentors() {
    const M = SA.Mentors;
    const el = SA.UI.modal({ title: 'Your mentors', kicker: 'Senior PhD students of the fellowship', cls: 'wide', sticky: true, body: `<div class="grid g3">${Object.values(M.all).map((m) => `<div class="card" style="text-align:center"><canvas class="mface" data-m="${m.key}" width="220" height="220" style="width:110px;height:110px;border-radius:16px;border:1.5px solid var(--gold)"></canvas><h3 style="margin-top:8px">${esc(m.name)}</h3><div class="small muted">${esc(m.year)}</div><p class="small">${esc(m.bio)}</p></div>`).join('')}</div><p class="small muted" style="margin-top:12px">Whoever knows a campus best walks it with you and speaks up when it helps. Set how talkative they are in Settings. They are invented characters.</p>`,
      footer: '<button class="btn primary" data-act="go">Open the Atlas at Philadelphia, 1896</button>', on: { go: () => { SA.UI.closeModal(true); s().started = true; s().createdAt = new Date().toISOString(); SA.persist(true); G.travel(1); } } });
    el.querySelectorAll('.mface').forEach((c) => M.portrait(c.getContext('2d'), M.get(c.dataset.m).face, 'pleased', 1, 220, false));
  }
  function storeFog() { if (G.world && G.mode === 'play') SA.persist(); }
  G.applySettings = () => { const st = s().settings; SA.Audio.setLevels(st); document.body.classList.toggle('large', !!st.large); document.body.classList.toggle('reduced', !!st.reduced); };
  G.lookAt = (x, y) => { follow = false; R.centre(x, y); };
  G.command = (k) => { if (k === 'interact') interact(); else if (k === 'centre') { follow = true; } else if (k === 'pause') { G.paused = !G.paused; SA.UI.toast(G.paused ? 'Paused. Press Space to carry on.' : 'On we go.', 1600); } else if (k === 'zoomin') zoomTo = clamp(zoomTo * 1.18, 0.55, 2); else if (k === 'zoomout') zoomTo = clamp(zoomTo / 1.18, 0.55, 2); else if (k === 'taskstop' && G.task) { G.task.stop(); objective(); } };

  // ---------- input ----------
  function walkTo(tx, ty, then) { const w = G.world, goal = nearestFree(tx, ty); if (!goal) return; const path = w.findPath(Math.round(player.x), Math.round(player.y), goal.x, goal.y); if (!path || !path.length) { if (Math.hypot(goal.x - player.x, goal.y - player.y) < 1.5 && then) then(); return; } player.path = path; dest = goal; pending = then || null; follow = true; idleT = 0; }
  function input() {
    const cv = $('#world'), ptr = new Map(); let drag = null, pinch = 0;
    cv.addEventListener('pointerdown', (ev) => { SA.Audio.unlock(); cv.setPointerCapture(ev.pointerId); ptr.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); if (ptr.size === 1) drag = { x: ev.clientX, y: ev.clientY, moved: false, t: performance.now() }; else { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; } });
    cv.addEventListener('pointermove', (ev) => { if (!ptr.has(ev.pointerId)) return; const p = ptr.get(ev.pointerId), dx = ev.clientX - p.x, dy = ev.clientY - p.y; p.x = ev.clientX; p.y = ev.clientY; if (ptr.size >= 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) zoomTo = clamp(zoomTo * (d / pinch), 0.55, 2); pinch = d; return; } if (!drag || G.mode !== 'play') return; if (!drag.moved && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) > 7) drag.moved = true; if (drag.moved) { follow = false; R.cam.x -= dx / R.zoom; R.cam.y -= dy / R.zoom; } });
    const up = (ev) => { const had = ptr.delete(ev.pointerId); if (!had) return; if (ptr.size < 2) pinch = 0; if (!drag || drag.moved || G.mode !== 'play' || G.pauseInput) { drag = null; return; } drag = null; const r = cv.getBoundingClientRect(), tl = R.screenToTile(ev.clientX - r.left, ev.clientY - r.top), tx = Math.round(tl.fx), ty = Math.round(tl.fy);
      if (tx < 0 || ty < 0 || tx >= G.world.N || ty >= G.world.N) return; SA.Audio.sfx('click');
      // a click on something you can use walks there and uses it
      const hit = hotspots().filter((h) => Math.hypot(h.x - tl.fx, h.y - tl.fy) < 1.6).sort((a, b) => Math.hypot(a.x - tl.fx, a.y - tl.fy) - Math.hypot(b.x - tl.fx, b.y - tl.fy))[0];
      const b = G.world.buildings.find((q) => tx >= q.x && tx < q.x + q.w && ty >= q.y && ty < q.y + q.h);
      if (hit) walkTo(hit.x, hit.y, () => { near = null; const c = candidates().find((q) => Math.hypot(q.x - hit.x, q.y - hit.y) < 0.6) || candidates()[0]; if (c) { c.fn(); SA.UI.refresh(); } });
      else if (b) walkTo(b.door.x, b.door.y, b.role ? () => interact() : null); else walkTo(tx, ty); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (ev) => { ptr.delete(ev.pointerId); drag = null; });
    cv.addEventListener('wheel', (ev) => { ev.preventDefault(); zoomTo = clamp(zoomTo * (ev.deltaY > 0 ? 0.9 : 1.11), 0.55, 2); }, { passive: false });
    addEventListener('keydown', (ev) => {
      if (ev.target.matches && ev.target.matches('input, textarea, select')) return; const k = ev.key.toLowerCase(), K = s().settings.keys;
      if (k === 'escape') { if (SA.UI.modalOpen()) SA.UI.closeModal(); return; }
      if (G.mode !== 'play' || G.pauseInput) return; SA.Audio.unlock();
      if ([K.up, K.down, K.left, K.right, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) { keys.add(k); ev.preventDefault(); return; }
      if (ev.repeat) return;
      if (k === K.interact || k === 'enter') interact(); else if (k === K.center) follow = true; else if (k === 'm') SA.UI.atlas(); else if (k === 'n') SA.UI.notebook(); else if (k === ' ') { ev.preventDefault(); G.command('pause'); } else if (k === '+' || k === '=') G.command('zoomin'); else if (k === '-') G.command('zoomout');
    });
    addEventListener('keyup', (ev) => keys.delete(ev.key.toLowerCase())); addEventListener('blur', () => keys.clear());
    addEventListener('resize', () => R.resize()); addEventListener('beforeunload', () => { storeFog(); SA.persist(true); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { storeFog(); SA.persist(true); } });
  }
  function hotspots() {                                          // things worth a click
    const w = G.world, out = [], P = w.pois; for (const k of ['directory', 'office', 'archive', 'library', 'landmark', 'workshop', 'festival', 'eastbank']) if (P[k]) out.push({ x: P[k].x, y: P[k].y });
    for (const th of w.interact) out.push({ x: th.x, y: th.y }); if (G.task && !G.task.done) for (const st of G.task.visible()) out.push({ x: st.x, y: st.y });
    for (const a of cast.list) if ((a.kind === 'npc' && a.line !== null && a.line !== undefined) || a.kind === 'cat' || a.piper) out.push({ x: a.x, y: a.y });
    return out;
  }

  // ---------- update ----------
  function movePlayer(dt) {
    const w = G.world, K = s().settings.keys, sp = 4.3 * (s().settings.speed || 1) * (keys.has('shift') ? 1.65 : 1);
    let vx = 0, vy = 0; if (keys.has(K.up) || keys.has('arrowup')) { vx -= 1; vy -= 1; } if (keys.has(K.down) || keys.has('arrowdown')) { vx += 1; vy += 1; } if (keys.has(K.left) || keys.has('arrowleft')) { vx -= 1; vy += 1; } if (keys.has(K.right) || keys.has('arrowright')) { vx += 1; vy -= 1; }
    const ox = player.x, oy = player.y; player.run = keys.has('shift');
    if (vx || vy) {
      const l = Math.hypot(vx, vy), nx = player.x + (vx / l) * sp * dt, ny = player.y + (vy / l) * sp * dt; player.path = []; pending = null; dest = null; follow = true;
      if (w.walkable(nx, ny)) { player.x = nx; player.y = ny; } else if (w.walkable(nx, player.y)) player.x = nx; else if (w.walkable(player.x, ny)) player.y = ny;
    } else if (player.path.length) {
      let left = sp * dt; while (left > 0 && player.path.length) { const p = player.path[0], dx = p.x - player.x, dy = p.y - player.y, d = Math.hypot(dx, dy); if (d <= left) { player.x = p.x; player.y = p.y; player.path.shift(); left -= d; } else { player.x += (dx / d) * left; player.y += (dy / d) * left; left = 0; } }
      if (!player.path.length) { dest = null; if (pending) { const f = pending; pending = null; f(); } }
    }
    const dx = player.x - ox, dy = player.y - oy, moved = Math.hypot(dx, dy); player.walk = moved > 0.0005;
    if (player.walk) {
      player.front = dx + dy > 0 || (dx + dy === 0 && player.front); if (Math.abs(dx - dy) > 0.0005) player.flip = dx - dy < 0; idleT = 0; s().stats.steps += moved;
      stepT -= moved; if (stepT <= 0) { stepT = player.run ? 1.25 : 0.95; const tt = w.tile(Math.round(player.x), Math.round(player.y)), T = w.T; const surface = w.season === 'winter' && SA.World.GREEN.has(tt) ? 'snow' : SA.World.GREEN.has(tt) ? 'grass' : tt === T.BRIDGE ? 'wood' : tt === T.GRAVEL || tt === T.DIRT || tt === T.SAND ? 'gravel' : 'stone'; SA.Audio.sfx('step', surface); stepSide = -stepSide; fx.push({ k: surface === 'snow' || tt === T.SAND ? 'print' : 'puff', surface, x: player.x, y: player.y, t: G.t, side: stepSide, run: player.run }); if (fx.length > 80) fx.shift(); }
      player.trail.push({ x: player.x, y: player.y }); if (player.trail.length > 26) player.trail.shift();
    }
    // the mentor walks a few steps behind
    const tr = player.trail[Math.max(0, player.trail.length - 22)] || { x: player.x - 0.8, y: player.y + 0.6 }, cdx = tr.x - companion.x, cdy = tr.y - companion.y, cd = Math.hypot(cdx, cdy);
    companion.walk = cd > 0.12 && player.walk; if (cd > 6) { companion.x = tr.x; companion.y = tr.y; } else if (cd > 0.05) { const stp = Math.min(cd, sp * dt * (cd > 2 ? 1.4 : 1)); companion.x += (cdx / cd) * stp; companion.y += (cdy / cd) * stp; companion.front = cdx + cdy > 0; if (Math.abs(cdx - cdy) > 0.01) companion.flip = cdx - cdy < 0; }
  }
  function discoveries() {
    const w = G.world, v = s(), tx = Math.round(player.x), ty = Math.round(player.y), tile = ty * w.N + tx;
    lastTile = tile;
    // sketches
    const key = sketchKey(), got = v.collect.sketches[key] || (v.collect.sketches[key] = []);
    for (const sk of w.sketches) if (!got.includes(sk.i) && Math.hypot(sk.x - player.x, sk.y - player.y) < 1.15) { got.push(sk.i); SA.Audio.sfx('collect'); SA.Audio.sfx('pencil'); SA.Progress.bonus(2, `Field sketch ${got.length} of 5`); say('sketch'); SA.Progress.check(); SA.UI.refresh(); }
    // secrets that are places
    const eggs = SA.Progress.EGGS[w.key] || []; eggs.forEach((e, i) => {
      if (!e.spot || v.collect.pokes[w.key + ':' + i] || (e.thing && w.interact.some((th) => th.kind === e.thing)) || SA.UI.modalOpen()) return;
      const tt = w.terrain[tile], T = w.T; if ((e.spot === 'bridge' && tt === T.BRIDGE) || (e.spot === 'shore' && waterMap[tile] <= 1) || (e.spot === 'behind' && behind && Math.hypot(behind.x - player.x, behind.y - player.y) < 2.4)) SA.Progress.eggFound(w.key, i);
    });
    if (waterMap[tile] <= 2 && !flags.water) { flags.water = 1; say('water'); }
  }
  function clock(dt) {
    const night = G.hour >= 21.5 || G.hour < 5.5; G.hour = (G.hour + (dt / 75) * (night ? 6 : 1)) % 24; const h = Math.floor(G.hour);
    if (h !== lastHour) { lastHour = h; if (h >= 8 && h <= 20) { SA.Audio.sfx('smallbell'); cast.ringBell(); if (h === 12 || h === 17) say('bell'); } }
    if (G.hour > 19.6 && !flags.dusk) { flags.dusk = 1; say('dusk'); if (!s().stats.night) { s().stats.night = 1; SA.Progress.check(); } }
  }
  function update(dt) {
    if (G.paused) return;
    if (!G.pauseInput) { movePlayer(dt); discoveries(); if (G.task && !G.task.done) G.task.update(dt); idleT += dt; if (idleT > 55) { idleT = 0; say('idle'); } }
    cast.update(dt, player, G.t); clock(dt);
    if ((nearT -= dt) <= 0) { nearT = 0.12; near = G.pauseInput ? null : candidates()[0] || null; SA.UI.prompt(near ? near.label : ''); }
    if ((ambT -= dt) <= 0) { ambT = 0.6; ambience(); SA.UI.refresh(); if (G.task && !G.task.done) objective(); }
    if ((saveT -= dt) <= 0) { saveT = 20; storeFog(); }
    if (follow) { const p = R.C(player.x, player.y), k = 1 - Math.pow(0.002, dt); R.cam.x += (p.x - R.cam.x) * k; R.cam.y += (p.y - 26 - R.cam.y) * k; }
    R.zoom += (zoomTo - R.zoom) * (1 - Math.pow(0.001, dt));
    SA.Mentors.tick();
  }

  // ---------- drawing on top of the world ----------
  function pill(c, x, y, text, o = {}) { c.font = `${o.bold ? '700' : '600'} ${o.size || 11}px system-ui, sans-serif`; c.textAlign = 'center'; const w = c.measureText(text).width + 14, h = (o.size || 11) + 8; c.fillStyle = o.bg || 'rgba(20,17,13,.84)'; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 6); c.fill(); if (o.line) { c.strokeStyle = o.line; c.lineWidth = 1.2; c.stroke(); } c.fillStyle = o.col || '#f1e7cf'; c.fillText(text, x, y - 6); }
  function wrap(c, text, max) { const words = text.split(' '), lines = []; let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines; }
  // dust at the feet, prints in snow and sand, lamplight spilling from an opened door
  function underlay(c) {
    const now = G.t; fx = fx.filter((f) => now - f.t < (f.k === 'print' ? 8 : f.k === 'door' ? 1.7 : 0.55));
    for (const f of fx) {
      const a = now - f.t, p = R.C(f.x, f.y);
      if (f.k === 'puff') { const k = a / 0.55, col = f.surface === 'grass' ? '128,158,96' : f.surface === 'wood' ? '176,146,104' : f.surface === 'gravel' ? '206,192,160' : '196,190,176', n = f.run ? 4 : 3; for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${col},${(1 - k) * (f.surface === 'stone' ? 0.28 : 0.46)})`; c.beginPath(); c.ellipse(p.x + f.side * 3 + (i - 1) * (3 + k * 7), p.y + 4 - k * (4 + i * 2), 1.8 + k * (f.run ? 5 : 3.6), 1.2 + k * 2.2, 0, 0, 7); c.fill(); } }
      else if (f.k === 'print') { c.fillStyle = f.surface === 'snow' ? `rgba(96,116,140,${0.34 * (1 - a / 8)})` : `rgba(120,96,60,${0.3 * (1 - a / 8)})`; c.beginPath(); c.ellipse(p.x + f.side * 3.2, p.y + 3, 3.2, 1.7, f.side * 0.3, 0, 7); c.fill(); }
      else if (f.k === 'door') { const k = Math.min(1, a / 0.3) * (a > 1.1 ? Math.max(0, 1 - (a - 1.1) / 0.6) : 1), g = c.createRadialGradient(p.x, p.y - 4, 2, p.x, p.y, 52); g.addColorStop(0, `rgba(255,214,140,${0.55 * k})`); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(p.x, p.y, 52, 26, 0, 0, 7); c.fill(); }
    }
  }
  function doorway(poi, then) {                                  // the door swings in, light falls on the step, then you are inside
    if (opening) return; if (!poi || !poi.b) { then(); return; } opening = true; SA.Audio.sfx('door'); fx.push({ k: 'door', x: poi.x, y: poi.y, b: poi.b, t: G.t });
    setTimeout(() => { opening = false; if (G.mode === 'play') { then(); SA.UI.refresh(); } }, 430);
  }
  function overlay(c) {                                          // rings on the ground, in world space
    const t = G.t;
    for (const f of fx) if (f.k === 'door') { const a = t - f.t, k = Math.min(1, a / 0.3) * (a > 1.1 ? Math.max(0, 1 - (a - 1.1) / 0.6) : 1), b = f.b, w0 = SA.iso(b.door.x + 0.2, b.y + b.h), w1 = SA.iso(b.door.x + 0.8, b.y + b.h), h = 24, mid = { x: w0.x + (w1.x - w0.x) * (1 - 0.82 * k), y: w0.y + (w1.y - w0.y) * (1 - 0.82 * k) };
      c.fillStyle = `rgba(255,206,128,${0.9 * k})`; c.beginPath(); c.moveTo(w0.x, w0.y); c.lineTo(w1.x, w1.y); c.lineTo(w1.x, w1.y - h); c.lineTo(w0.x, w0.y - h); c.closePath(); c.fill();
      c.fillStyle = '#4a2f1e'; c.strokeStyle = 'rgba(20,12,6,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(w0.x, w0.y); c.lineTo(mid.x, mid.y); c.lineTo(mid.x, mid.y - h); c.lineTo(w0.x, w0.y - h); c.closePath(); c.fill(); c.stroke(); }
    if (dest) { const p = R.C(dest.x, dest.y), k = (t * 1.6) % 1; c.strokeStyle = `rgba(255,224,138,${0.9 - k * 0.7})`; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y, 10 + k * 12, 5 + k * 6, 0, 0, 7); c.stroke(); }
    if (near && !G.pauseInput) { const q = R.C(near.x, near.y); c.strokeStyle = 'rgba(255,240,200,.85)'; c.lineWidth = 1.6; c.setLineDash([5, 4]); c.lineDashOffset = -t * 14; c.beginPath(); c.ellipse(q.x, q.y, 22, 11, 0, 0, 7); c.stroke(); c.setLineDash([]); }
  }
  function screen(c) {                                           // names, the objective arrow and speech, after the lighting
    const w = G.world, t = G.t, now = performance.now(), tg = target(), z = R.zoom, P = w.pois;
    for (const k of ['office', 'archive', 'library', 'landmark', 'directory', 'festival', 'gate', 'eastbank']) { const p = P[k]; if (!p || !p.label || !R.isExplored(p.x, p.y)) continue; const isT = tg === p, d = Math.hypot(p.x - player.x, p.y - player.y); if (!isT && d > 9) continue; const q = R.tileToScreen(p.x, p.y, p.b ? p.b.height * 0.9 + 46 : 58); c.globalAlpha = isT ? 1 : clamp((9 - d) / 3, 0, 1) * 0.92; pill(c, q.x, q.y, p.label, isT ? { bold: true, line: '#e0b04a', col: '#ffe9b0', size: 12 } : {}); c.globalAlpha = 1; }
    if (tg) { const q = R.tileToScreen(tg.x, tg.y, (tg.b ? tg.b.height * 0.9 + 46 : 58) + 24 / z), bob = Math.sin(t * 3) * 4; c.fillStyle = '#e0b04a'; c.strokeStyle = '#2a1f10'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(q.x, q.y + 16 + bob); c.lineTo(q.x - 9, q.y + bob); c.lineTo(q.x + 9, q.y + bob); c.closePath(); c.fill(); c.stroke(); }
    bubbles = bubbles.filter((b) => b.until > now);
    for (const b of bubbles) { const q = R.tileToScreen(b.a.x, b.a.y, 58); c.font = '500 13px Georgia, serif'; const lines = wrap(c, b.text, 210), bw = Math.max(...lines.map((l) => c.measureText(l).width)) + 20, bh = lines.length * 17 + 12, x = clamp(q.x - bw / 2, 8, innerWidth - bw - 8), y = q.y - bh, a = clamp((b.until - now) / 400, 0, 1); c.globalAlpha = a; c.fillStyle = 'rgba(250,244,226,.97)'; c.strokeStyle = 'rgba(60,45,25,.55)'; c.lineWidth = 1; c.beginPath(); c.roundRect(x, y, bw, bh, 9); c.fill(); c.stroke(); c.beginPath(); c.moveTo(q.x - 6, y + bh - 0.5); c.lineTo(q.x, y + bh + 8); c.lineTo(q.x + 6, y + bh - 0.5); c.fillStyle = 'rgba(250,244,226,.97)'; c.fill(); c.fillStyle = '#2a2014'; c.textAlign = 'left'; lines.forEach((l, i) => c.fillText(l, x + 10, y + 19 + i * 17)); c.globalAlpha = 1; }
  }
  function actors() {
    const v = s(), w = G.world, t = G.t, list = cast.list.slice();
    const pl = SA.Mentors.PLAYER_LOOKS[v.player.look % 4], m = SA.Mentors.get(G.mentor).face;
    list.push({ x: companion.x, y: companion.y, always: true, draw: (c, tt) => SA.Actors.person(c, spriteLook(m, { front: companion.front, flip: companion.flip, walk: companion.walk, bag: '#5a4630', seed: 9 }), tt) });
    list.push({ x: player.x, y: player.y, always: true, draw: (c, tt) => SA.Actors.person(c, spriteLook(pl, { front: player.front, flip: player.flip, walk: player.walk, run: player.run && player.walk, bag: '#7a5230', ring: '#ffe08a' }), tt) });
    const got = v.collect.sketches[sketchKey()] || []; for (const sk of w.sketches) if (!got.includes(sk.i)) list.push({ x: sk.x, y: sk.y, draw: (c, tt) => SA.Props.defs.sparkle.draw(c, { v: sk.i }, tt) });
    if (G.task && !G.task.done) list.push(...G.task.actors(t));
    return list;
  }
  function marks() {
    const w = G.world, P = w.pois, out = [], tg = target(); for (const k of ['directory', 'archive', 'library', 'landmark', 'office']) if (P[k]) out.push({ x: P[k].x, y: P[k].y, col: '#f3ead1', r: 1.1 });
    if (G.task && !G.task.done) for (const st of G.task.visible()) out.push({ x: st.x, y: st.y, col: st.done ? '#8a8a7a' : '#ffe08a', r: 1.5, always: true });
    if (tg) out.push({ x: tg.x, y: tg.y, col: '#e0b04a', r: 2.1 + Math.sin(G.t * 4) * 0.5, always: true });
    return out;
  }

  // ---------- loop ----------
  let last = 0;
  function frame(ms) {
    const dt = Math.min(0.05, (ms - last) / 1000 || 0); last = ms; G.t += dt;
    try {
      if (G.world && G.mode === 'menu' && menuCam) { cast.update(dt, null, G.t); const p = R.C(menuCam.x + Math.cos(G.t * 0.05) * 5, menuCam.y + Math.sin(G.t * 0.04) * 4); R.cam.x += (p.x - R.cam.x) * 0.02; R.cam.y += (p.y - R.cam.y) * 0.02; R.draw({ t: G.t, hour: 17.4, daynight: true, reduced: s().settings.reduced, player: null, actors: cast.list, marks: [] }); }
      if (G.world && G.mode === 'play') {
        update(dt); const st = s().settings, state = { t: G.t, hour: G.hour, daynight: st.daynight, reduced: st.reduced, player, actors: actors(), underlay, overlay, screen, marks: marks() };
        R.draw(state); R.minimap($('#mini'), state); SA.UI.frame(G.t);
      }
    } catch (err) { if (!G.failed) { G.failed = true; console.error('[atlas] frame', err); } }
    requestAnimationFrame(frame);
  }
  SA.on('birds', () => { SA.Audio.sfx('flutter'); if (G.mode === 'play') say('birds'); });
  SA.on('tram-stop', (a) => { if (G.mode !== 'play') return; const d = Math.hypot(a.x - player.x, a.y - player.y); if (d < 14) SA.Audio.sfx('tram'); if (d < 9) { say('tram'); const w = G.world, i = (SA.Progress.EGGS[w.key] || []).findIndex((e) => e.event === 'tram'); if (i >= 0 && !SA.UI.modalOpen()) SA.Progress.eggFound(w.key, i); } });
  SA.on('music', (m) => { if (m && m.title && G.mode === 'play') SA.UI.toast(`<span class="muted">♪</span> ${esc(m.title)}`, 3800); });
  SA.on('save-failed', () => SA.UI.toast('This browser would not save the journey. Export it from the notebook to keep it.'));

  G.boot = () => {
    let store = { getItem: () => null }; try { if (window.localStorage) store = window.localStorage; } catch (e) { /* storage is unavailable here; play without saving */ }
    SA.save = SA.loadSave(store); R.init($('#world')); SA.UI.init(); G.applySettings(); input(); G.toMenu(); requestAnimationFrame(frame);
    if (SA.save.importedV1 && !SA.save.quests.v1note) { SA.save.quests.v1note = 1; SA.UI.toast('<b>Your first-edition journey came with you.</b> The original save is untouched.', 7000); }
  };
  G.player = player; G.effects = () => fx; SA.Game = G;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', G.boot); else G.boot();
})();
