/* The Society Atlas V2 — the mentors: three senior PhD students who guide a first-year.
   They are invented characters with drawn portraits (original Canvas art).
   Lines are short, event-driven, prioritised and rate-limited so nobody nags. */
(function () {
  'use strict';
  const SA = window.SA, TAU = Math.PI * 2;
  const MENTORS = {
    ines: { key: 'ines', name: 'Inés Valdivia', year: 'Fifth-year PhD student · sociology', bio: 'Networks and fieldwork. Believes every dataset began as somebody’s afternoon.', pitch: 640,
      face: { skin: '#c98a62', hair: '#3a2418', style: 'long', top: '#2f6f6a', accent: '#e0b04a', bg: ['#31524f', '#1d302f'], earrings: '#e0b04a' } },
    tomek: { key: 'tomek', name: 'Tomasz Brandt', year: 'Sixth-year PhD student · political economy', bio: 'Causal inference, strong coffee, weak puns. Asks “compared with what?” in his sleep.', pitch: 400,
      face: { skin: '#f0c9a4', hair: '#a8854e', style: 'short', beard: '#b8955c', glasses: true, top: '#5d6470', accent: '#b8483a', bg: ['#4a4658', '#28263a'] } },
    amara: { key: 'amara', name: 'Amara Okafor', year: 'Fourth-year PhD student · computational social science', bio: 'Trusts a model exactly as far as she can validate it. Collects broken dashboards.', pitch: 540,
      face: { skin: '#7d4f33', hair: '#1b1512', style: 'curls', top: '#3f5f8a', accent: '#e0705a', bg: ['#5a3f4a', '#33232b'], earrings: '#f1e2b0', band: '#e0705a' } },
  };
  const FOR = { ines: [1, 2, 3, 4, 6, 8, 19, 21, 24, 35, 37, 0], tomek: [5, 7, 14, 15, 16, 17, 18, 20, 22, 25, 26, 27, 28, 29, 32, 33, 34], amara: [9, 10, 11, 12, 13, 23, 30, 31, 36] };
  const PLAYER_LOOKS = [
    { skin: '#e0ac7e', hair: '#2a211b', style: 'bob', top: '#3f5a7a', accent: '#c7483a', bg: ['#3d4f66', '#22303f'] },
    { skin: '#f3d5b5', hair: '#7a5230', style: 'short', top: '#49683b', accent: '#c7483a', bg: ['#3f5a44', '#243527'] },
    { skin: '#a56a43', hair: '#1b1512', style: 'curls', top: '#7c2f2f', accent: '#e0b04a', bg: ['#5a3a3a', '#331f1f'] },
    { skin: '#c68a5c', hair: '#1b1b1f', style: 'long', top: '#5b4a7a', accent: '#6fb3a8', bg: ['#4a4066', '#2a243c'] },
  ];

  // ---------- portrait drawing ----------
  function portrait(c, f, expr, t, size, talking) {
    const s = size / 120; c.save(); c.scale(s, s);
    const g = c.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, f.bg[0]); g.addColorStop(1, f.bg[1]); c.fillStyle = g; c.fillRect(0, 0, 120, 120);
    c.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(60, 58); c.arc(60, 58, 110, i * 1.047, i * 1.047 + 0.26); c.fill(); }
    const bob = Math.sin(t * 1.4) * 0.8, tilt = expr === 'thinking' ? -0.06 : expr === 'amused' ? 0.05 : 0;
    c.translate(60, 66 + bob); c.rotate(tilt);
    const shade = SA.shade, skin = f.skin, dark = shade(skin, -34);
    // hair behind
    c.fillStyle = f.hair;
    if (f.style === 'long') { c.beginPath(); c.ellipse(0, -8, 34, 38, 0, 0, TAU); c.fill(); c.fillRect(-34, -8, 68, 52); }
    else if (f.style === 'curls') { for (let i = 0; i < 11; i++) { const a = Math.PI + (i / 10) * Math.PI; c.beginPath(); c.arc(Math.cos(a) * 28, -16 + Math.sin(a) * 26, 13, 0, TAU); c.fill(); } c.beginPath(); c.ellipse(0, -14, 32, 30, 0, 0, TAU); c.fill(); }
    else if (f.style === 'bob') { c.beginPath(); c.ellipse(0, -8, 33, 36, 0, 0, TAU); c.fill(); c.fillRect(-33, -8, 66, 26); }
    // shoulders
    c.fillStyle = f.top; c.beginPath(); c.moveTo(-52, 60); c.quadraticCurveTo(-46, 30, -18, 26); c.lineTo(18, 26); c.quadraticCurveTo(46, 30, 52, 60); c.closePath(); c.fill();
    c.fillStyle = shade(f.top, 22); c.beginPath(); c.moveTo(-18, 26); c.lineTo(0, 44); c.lineTo(18, 26); c.lineTo(10, 22); c.lineTo(-10, 22); c.closePath(); c.fill();
    if (f.accent) { c.fillStyle = f.accent; c.beginPath(); c.moveTo(-20, 24); c.quadraticCurveTo(0, 38, 20, 24); c.lineTo(17, 17); c.quadraticCurveTo(0, 27, -17, 17); c.closePath(); c.fill(); }
    // neck and head
    c.fillStyle = dark; c.fillRect(-9, 10, 18, 16);
    c.fillStyle = skin; c.beginPath(); c.moveTo(-25, -14); c.quadraticCurveTo(-27, 14, -12, 24); c.quadraticCurveTo(0, 30, 12, 24); c.quadraticCurveTo(27, 14, 25, -14); c.quadraticCurveTo(24, -40, 0, -41); c.quadraticCurveTo(-24, -40, -25, -14); c.fill();
    c.fillStyle = skin; c.beginPath(); c.ellipse(-26, -4, 4.5, 7, 0, 0, TAU); c.ellipse(26, -4, 4.5, 7, 0, 0, TAU); c.fill();
    if (f.earrings) { c.strokeStyle = f.earrings; c.lineWidth = 1.6; c.beginPath(); c.arc(-27, 6, 3.4, 0, TAU); c.stroke(); c.beginPath(); c.arc(27, 6, 3.4, 0, TAU); c.stroke(); }
    c.fillStyle = 'rgba(210,90,70,.16)'; c.beginPath(); c.ellipse(-15, 6, 6, 4, 0, 0, TAU); c.ellipse(15, 6, 6, 4, 0, 0, TAU); c.fill();
    if (f.beard) { c.fillStyle = SA.alpha(f.beard, 0.75); c.beginPath(); c.moveTo(-23, 2); c.quadraticCurveTo(-22, 22, 0, 29); c.quadraticCurveTo(22, 22, 23, 2); c.quadraticCurveTo(12, 12, 0, 11); c.quadraticCurveTo(-12, 12, -23, 2); c.fill(); }
    // hair front
    c.fillStyle = f.hair;
    if (f.style === 'short') { c.beginPath(); c.moveTo(-26, -12); c.quadraticCurveTo(-28, -44, 0, -45); c.quadraticCurveTo(28, -44, 26, -12); c.quadraticCurveTo(20, -30, 4, -30); c.quadraticCurveTo(-14, -29, -26, -12); c.fill(); }
    else if (f.style === 'long' || f.style === 'bob') { c.beginPath(); c.moveTo(-27, -6); c.quadraticCurveTo(-30, -45, 2, -45); c.quadraticCurveTo(30, -44, 27, -6); c.quadraticCurveTo(22, -28, 6, -33); c.quadraticCurveTo(-8, -22, -27, -6); c.fill(); }
    else { c.beginPath(); c.moveTo(-25, -18); c.quadraticCurveTo(-20, -36, 0, -36); c.quadraticCurveTo(20, -36, 25, -18); c.quadraticCurveTo(12, -30, 0, -29); c.quadraticCurveTo(-12, -30, -25, -18); c.fill(); if (f.band) { c.strokeStyle = f.band; c.lineWidth = 4; c.beginPath(); c.moveTo(-26, -24); c.quadraticCurveTo(0, -36, 26, -24); c.stroke(); } }
    // eyes
    const blink = (t % 4.3) < 0.13 || ((t + 1.7) % 6.1) < 0.1, look = expr === 'thinking' ? [-1.6, -1.6] : [0, 0];
    for (const sx of [-1, 1]) {
      const ex = sx * 10.5, ey = -8;
      if (blink || (expr === 'amused' && sx === 1) || expr === 'pleased') { c.strokeStyle = '#2a211b'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - 4, ey); c.quadraticCurveTo(ex, ey + (expr === 'pleased' || expr === 'amused' ? -3 : 1.5), ex + 4, ey); c.stroke(); }
      else { c.fillStyle = '#fbf6ea'; c.beginPath(); c.ellipse(ex, ey, 4.6, expr === 'worried' ? 4.4 : 3.6, 0, 0, TAU); c.fill(); c.fillStyle = '#2a211b'; c.beginPath(); c.arc(ex + look[0], ey + look[1] + 0.4, 2.3, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + look[0] + 0.8, ey + look[1] - 0.5, 0.7, 0, TAU); c.fill(); }
      // brows
      c.strokeStyle = shade(f.hair, 10); c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath();
      const inner = expr === 'worried' ? -3.4 : expr === 'thinking' && sx === 1 ? -2.6 : expr === 'sceptical' && sx === 1 ? -3.5 : 0, outer = expr === 'worried' ? 1.4 : 0;
      c.moveTo(ex - sx * 5.5, ey - 8 + outer); c.quadraticCurveTo(ex, ey - 10 + (expr === 'pleased' ? -1.2 : 0), ex + sx * -(-5.5), ey - 8 + inner * 0 + (sx === 1 ? 0 : 0)); c.stroke();
      void inner;
    }
    if (f.glasses) { c.strokeStyle = '#3a2f26'; c.lineWidth = 1.5; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 10.5, -8, 7.2, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-3.4, -8); c.lineTo(3.4, -8); c.stroke(); }
    // nose
    c.strokeStyle = dark; c.lineWidth = 1.5; c.beginPath(); c.moveTo(1, -2); c.quadraticCurveTo(4, 5, 0, 6); c.stroke();
    // mouth
    const open = talking ? Math.abs(Math.sin(t * 13)) * 3.2 + 0.6 : 0;
    c.lineWidth = 2; c.lineCap = 'round';
    if (open > 0.5) { c.fillStyle = '#5a2c2c'; c.beginPath(); c.ellipse(0, 14, 5.4, open + 1, 0, 0, TAU); c.fill(); c.fillStyle = '#f4ede0'; c.fillRect(-3.6, 12.6 - open * 0.4, 7.2, 1.5); }
    else {
      c.strokeStyle = '#7a3b3b'; c.beginPath();
      if (expr === 'pleased' || expr === 'amused') { c.moveTo(-7, 12); c.quadraticCurveTo(0, 19, 7, 12); c.stroke(); c.fillStyle = '#f4ede0'; c.beginPath(); c.moveTo(-5, 13); c.quadraticCurveTo(0, 16.6, 5, 13); c.closePath(); c.fill(); }
      else if (expr === 'worried') { c.moveTo(-5, 15.5); c.quadraticCurveTo(0, 12, 5, 15.5); c.stroke(); }
      else if (expr === 'thinking' || expr === 'sceptical') { c.moveTo(-4, 14); c.quadraticCurveTo(1, 13, 6, 12); c.stroke(); }
      else { c.moveTo(-5, 13.5); c.quadraticCurveTo(0, 16, 5, 13.5); c.stroke(); }
    }
    c.restore();
  }

  // ---------- lines ----------
  const L = {
    arrive: { ines: ['Welcome to {campus}. First rule of fieldwork: read the notice board before you ask anyone anything.', '{campus}. Take a breath and look around; the plaza directory is our first stop.'], tomek: ['{campus}, {era}. The directory in the plaza will tell us whom to bother.', 'Here we are. Find the directory before I find the coffee.'], amara: ['{campus}. Let’s get our bearings at the directory before we trust any map.', 'New campus, same method: directory first, opinions later.'] },
    note: { ines: ['{note}'], tomek: ['{note}'], amara: ['{note}'] },
    directory: { ines: ['Good. Now you know the door. I’ve marked it on your map.', 'The directory gives the direction; the gold arrow will get you there.'], tomek: ['Noted. I’ve pinned the research door on your map.'], amara: ['Directory read. The research door is flagged on your minimap now.'] },
    office: { ines: ['This is the place. Say hello; professors are people who were once exactly this nervous.'], tomek: ['Here’s the door. Ask what the method assumes. It always assumes something.'], amara: ['Found it. Ask how they know what they know. That’s the whole job.'] },
    taskStart: { ines: ['Fieldwork first. Legs, notebook, patience.', 'Off we go. Evidence rarely walks to the office by itself.'], tomek: ['A small errand with a large lesson. Mind the clock if there is one.'], amara: ['Field task. Keep notes on what you could not observe as well.'] },
    taskDone: { ines: ['That’s real fieldwork. Take it back to the office.', 'Nicely done. Now the professor will want to see it.'], tomek: ['Good. Back to the office before the result changes its mind.'], amara: ['Logged. Let’s see what the lab makes of it.'] },
    labOpen: { ines: ['Predict first, then look. Being wrong on paper is the cheap way to learn.'], tomek: ['Commit to a prediction. A guess you never wrote down can’t be wrong, which is the problem.'], amara: ['Write your prediction before you run anything. Future you will try to cheat.'] },
    labWrong: { ines: ['Not quite. What did the experiment actually show, and what did it leave out?'], tomek: ['Hm. Try asking what the toy result cannot tell us.'], amara: ['Close the claim to what the data can carry.'] },
    labHint: { ines: ['Here’s a nudge. No shame in it; I needed three in my first year.'], tomek: ['Take the hint. Pride is a poor estimator.'], amara: ['Hint unlocked. Use it.'] },
    labDone: { ines: ['You’ve added a method to the notebook. And its limits, which matter as much.', 'That’s one more way of asking a better question.'], tomek: ['Solid. A bounded claim beats a grand one every time.', 'Good work. Evidence, with error bars on its ambitions.'], amara: ['Validated and bounded. That’s how it’s done.', 'Nice. Now we know one more thing we still don’t know.'] },
    sketch: { ines: ['A field sketch! Keep those; places forget themselves quickly.'], tomek: ['A sketch for the collection. Marginally useful, wholly charming.'], amara: ['Sketch collected. Metadata: lovely.'] },
    egg: { ines: ['Ha. Every campus has one of those.'], tomek: ['I see you have found the local superstition.'], amara: ['That’s going in my notes under “unexplained but delightful”.'] },
    birds: { ines: ['You startled them. Observer effect, with feathers.'], tomek: ['The birds decline to participate in your study.'], amara: ['Non-response, in flight.'] },
    cat: { ines: ['That cat turns up everywhere. I’ve stopped asking how.'], tomek: ['Ah, the Atlas cat. Sample size of one, enormous effect.'], amara: ['The cat again. I’m starting to suspect a confound.'] },
    squirrel: { ines: ['It’ll remember you. Squirrels keep excellent records.'], tomek: ['Bribing the locals. A time-honoured method.'], amara: ['Snack accepted. No consent form needed.'] },
    bell: { ines: ['Class change. Watch the paths fill up.'], tomek: ['The bell. Everyone suddenly remembers where they should be.'], amara: ['There’s the bell. A natural experiment in foot traffic.'] },
    idle: { ines: ['Stuck? Your objective is on the left, and there’s a marker on the minimap.', 'When in doubt, walk. Campuses explain themselves if you let them.'], tomek: ['If you’re lost, the objective card on the left is more reliable than I am.'], amara: ['Need direction? Check the objective card, or press C to centre on yourself.'] },
    dusk: { ines: ['Lamps are coming on. Places look different in the evening; so does evidence.'], tomek: ['Evening already. The best ideas and the worst ideas both arrive after dark.'], amara: ['Light’s going. Remember that anything photographed now is evening data.'] },
    water: { ines: ['Lovely by the water. Careful with the notebook.'], tomek: ['A river. Somewhere an economist is modelling its banks.'], amara: ['Water. Nice ambient noise for thinking.'] },
    tram: { ines: ['There goes the tram. Who can reach the stop is always worth asking.'], tomek: ['Public transport: the original network effect.'], amara: ['Tram’s in. Timetables are data too.'] },
    rank: { ines: ['Look at you: {rank}. I’m telling everyone.'], tomek: ['Promoted to {rank}. The stipend, I regret to say, is unchanged.'], amara: ['{rank}! That’s a real milestone.'] },
    travel: { ines: ['Next stop: {campus}. I’ll bring the snacks.'], tomek: ['On to {campus}. Try to sleep on the way; you won’t.'], amara: ['{campus} next. I’ve already bookmarked three papers.'] },
    hub: { ines: ['Back in Bellwether. Listen to people here; the festival question is theirs before it is ours.', 'Bellwether. See what has changed since we started asking.'], tomek: ['Bellwether again. The gate, the canal, the committee: keep all three in mind.'], amara: ['Home base. Let’s pin what we have to the evidence board at Fellowship House.'] },
    gate: { ines: ['The evening gate. Who decides when it closes?'], tomek: ['A gate is a rule made of iron. Rules have authors.'], amara: ['Check the hours posted here against what people actually report.'] },
    relaxed: { ines: ['Relaxed mode is on: no timers. Fieldwork at a human pace.'], tomek: ['No timers, then. Civilised.'], amara: ['Timers off. Take the time you need.'] },
    finale: { ines: ['You’re ready for the colloquium at the Town Hall. Bring your doubts; they’re part of the proposal.'], tomek: ['Enough methods to make a proposal that someone could knock down. That’s the standard.'], amara: ['Colloquium time. Claims, evidence, limits, in that order.'] },
    legacy: { ines: ['The first edition of the Atlas still opens. It’s on the title page.'], tomek: ['Fond of the first edition? It’s kept, unchanged.'], amara: ['The original Atlas is archived and playable.'] },
  };
  const PRIORITY = { arrive: 8, directory: 8, office: 8, taskStart: 7, taskDone: 8, labOpen: 6, labWrong: 6, labHint: 7, labDone: 9, rank: 9, finale: 9, hub: 7, travel: 7, note: 4, sketch: 5, egg: 6, gate: 6, cat: 4, squirrel: 3, birds: 2, bell: 3, idle: 3, dusk: 3, water: 2, tram: 2, relaxed: 5, legacy: 2 };
  const EXPR = { arrive: 'pleased', labDone: 'pleased', labWrong: 'worried', labHint: 'thinking', sketch: 'pleased', egg: 'amused', birds: 'amused', cat: 'amused', squirrel: 'amused', idle: 'thinking', rank: 'pleased', taskDone: 'pleased', dusk: 'thinking', directory: 'neutral', office: 'neutral', gate: 'thinking', finale: 'pleased' };

  const Q = { queue: [], busyUntil: 0, lastAt: {}, used: {} };
  function mentorFor(encId) { for (const k of Object.keys(FOR)) if (FOR[k].includes(Number(encId))) return k; return 'ines'; }
  function say(trigger, vars = {}, opts = {}) {
    const save = SA.save, level = save ? save.settings.guidance : 2, pr = PRIORITY[trigger] || 3;
    if (!opts.force && (level === 0 || (level === 1 && pr < 7) || (level === 2 && pr < 3))) return false;
    const now = performance.now() / 1000, gap = { 2: 45, 3: 30, 4: 22, 5: 12, 6: 8 }[pr] || 0;
    if (!opts.force && Q.lastAt[trigger] && now - Q.lastAt[trigger] < gap) return false;
    const key = opts.mentor || SA.Game?.mentor || 'ines', bank = (L[trigger] || {})[key] || []; if (!bank.length) return false;
    const n = (Q.used[trigger + key] = ((Q.used[trigger + key] ?? -1) + 1) % bank.length);
    const text = bank[n].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    if (!text.trim()) return false;
    Q.lastAt[trigger] = now;
    const item = { key, text, expr: opts.expr || EXPR[trigger] || 'neutral', pr, trigger };
    if (Q.queue.length >= 3) { const low = Q.queue.reduce((a, b) => (a.pr <= b.pr ? a : b)); if (low.pr >= pr) return false; Q.queue.splice(Q.queue.indexOf(low), 1); }
    Q.queue.push(item); Q.queue.sort((a, b) => b.pr - a.pr);
    return true;
  }
  function tick() {                                            // called from the game loop
    const now = performance.now() / 1000; if (now < Q.busyUntil || !Q.queue.length || !SA.UI || SA.UI.modalOpen?.()) return;
    const item = Q.queue.shift(), dur = Math.max(3.8, item.text.length * 0.062 + 2.2); Q.busyUntil = now + dur + 0.6;
    SA.UI.mentorShow(item, dur);
    if (SA.save) { SA.save.mentorLog.push({ m: item.key, text: item.text }); if (SA.save.mentorLog.length > 40) SA.save.mentorLog.shift(); SA.save.stats.lines++; }
  }
  SA.Mentors = { all: MENTORS, get: (k) => MENTORS[k] || MENTORS.ines, mentorFor, say, tick, portrait, PLAYER_LOOKS, lines: L, clear: () => { Q.queue.length = 0; Q.busyUntil = 0; } };
})();
