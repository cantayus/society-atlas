/* The Society Atlas V2 — fieldwork. Each encounter begins with a short task done on
   foot that puts the method into the player's legs before the lab. Four engines
   (survey, courier, switch, search) are themed thirty ways. All people, counts and
   places in these tasks are invented. */
(function () {
  'use strict';
  const SA = window.SA, esc = SA.esc;
  // kind, title, brief, station labels, options, field note
  const T = {
    1: ['survey', 'Walk the survey route', 'walk the three marked streets and record each household count. Then ask whether the route covered every street.', ['Market Street', 'Pine Street', 'Cedar Street'], { pois: ['street0', 'street1', 'street2'], hidden: 'Canal Lane', hiddenPoi: 'street3', hint: 'Three streets recorded. Is that every street? Look beyond Cedar Street.' }, 'The marked route covered three streets. A fourth, Canal Lane, lay behind Cedar Street and was on nobody’s list.'],
    2: ['courier', 'Moving day', 'carry three households’ boxes from the cart to the empty lots they chose, and watch who ends up beside whom.', ['Empty lot A', 'Empty lot B', 'Empty lot C'], { source: 'The cart', items: 3 }, 'Each household moved for a modest reason of its own. Together they redrew the street.'],
    3: ['courier', 'The last invitation', 'you have four invitations. Hand them out before the bell and see how many different circles you reach.', ['Ana', 'Bo', 'Cy', 'Dee', 'Eli', 'Fen'], { items: 4, groups: [0, 0, 0, 1, 1, 2], timer: 80, pick: true }, null],
    4: ['switch', 'Opening the sluices', 'three sluice gates share one channel. Set things so the upstream, middle and downstream plots all get water.', ['Upstream gate', 'Middle gate', 'Downstream gate', 'Rota board'], { rule: 'water' }, 'With every gate open and no rule, the downstream plot ran dry. Agreeing a rota watered all three.'],
    5: ['switch', 'Close the side path', 'two routes lead to the square. Close the side path, light the main sign, and see whether the sign now matters.', ['Side path', 'Main sign'], { target: [0, 1], start: [1, 0] }, 'With the side path closed, changing the sign alone changed the flow. You intervened instead of watching.'],
    6: ['courier', 'Newcomers', 'walk four newcomers to a club stall. Each asks you which stall is busiest.', ['Chess club', 'Choir', 'Rowing', 'Debating'], { source: 'The gate', items: 4, rich: true }, 'Every newcomer asked for the busiest stall, so the busiest stall grew busier still.'],
    7: ['survey', 'Two listening rooms', 'visit both listening rooms and the tally board, and note each room’s favourite song.', ['Listening room A', 'Listening room B', 'The tally board'], {}, 'The two rooms crowned different songs. Only one room could see what others had chosen.'],
    8: ['courier', 'Twice told', 'a sign-up needs two friends to say yes before a third will. Visit all six neighbours before the bell.', ['No. 1', 'No. 2', 'No. 3', 'No. 4', 'No. 5', 'No. 6'], { items: 6, timer: 95 }, 'A single visit changed nothing. Neighbours who heard it from two friends signed up.'],
    9: ['survey', 'Before the sweep', 'copy the notices on three boards now, then go back to the first once the sweeper has passed.', ['North board', 'Market board', 'Gate board'], { revisit: 0, hint: 'The sweeper has been round. Read the first board again.' }, 'The complaints were still pinned up. The notice calling a meeting was gone.'],
    10: ['survey', 'Check the gauge', 'read the dashboard on the wall, then count for yourself at three doors.', ['The dashboard', 'West door', 'Hall door', 'New entrance'], {}, 'The dashboard and your count agreed at two doors and parted at the third, where the entrance had moved.'],
    11: ['survey', 'Timestamp walk', 'photograph three street corners and note the hour. Then photograph the first again at dusk.', ['Corner one', 'Corner two', 'The gate'], { revisit: 2, dusk: true, hint: 'The light has changed. Photograph the gate again.' }, 'By day the gate looked open in every frame. At dusk it was shut.'],
    12: ['courier', 'Sorting slips', 'carry six comment slips from the box to the trays where your codebook says they belong.', ['Tray: for', 'Tray: against', 'Tray: it depends'], { source: 'The slip box', items: 6, pick: true }, '“I would come if the gate were open” fitted neither tray until the codebook gained a third.'],
    13: ['survey', 'Where they stand', 'find where three groups are standing this morning, then check the first again after the bell.', ['The east group', 'The west group', 'The bridge group'], { revisit: 0, hint: 'The bell has gone. See where the first group stands now.' }, 'Two groups had drawn closer together. The third had stepped away from both.'],
    14: ['search', 'Good enough', 'six rooms might host the seminar and every look costs time. Inspect as many as you like, then choose.', ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6'], { budget: 4 }, null],
    15: ['survey', 'Two flyers', 'show the “keep” flyer to two passers-by and the “lose” flyer to two more. The offer is identical.', ['Passer-by, keep flyer', 'Passer-by, keep flyer', 'Passer-by, lose flyer', 'Passer-by, lose flyer'], {}, 'Told what they would keep, both took the sure thing. Told what they would lose, both gambled.'],
    16: ['courier', 'Who gets which seminar', 'walk three students to seminar rooms, then ask whether any student and room would rather have each other.', ['Seminar X', 'Seminar Y', 'Seminar Z'], { source: 'The noticeboard', items: 3, pick: true }, 'Your first arrangement left one student and one room each wishing for the other.'],
    17: ['survey', 'Drawing lots', 'draw a token at each of four neighbourhood tables, so that chance decides who is invited.', ['North table', 'East table', 'South table', 'West table'], {}, 'With lots drawn table by table, neighbours could not pass an invitation across the line between groups.'],
    18: ['switch', 'Who holds the key', 'three gates govern the market. Open them, then find the lever that decides who may change the rule.', ['North gate', 'River gate', 'Market gate', 'The council lever'], { target: [1, 1, 1, 1] }, 'Opening the gates helped for a season. Changing who could change the rule is what lasted.'],
    19: ['courier', 'Brief the listeners', 'deliver the festival notice to the person each circle listens to, before the evening broadcast.', ['The baker', 'The schoolteacher', 'The foreman', 'The choir leader', 'An empty doorway'], { items: 5, timer: 95 }, 'Four circles had someone they listened to. The fifth had nobody, and heard nothing.'],
    20: ['switch', 'The order of the vote', 'three ballot boxes can be counted in any order. Turn each one to see how the order changes the winner.', ['Ballot box one', 'Ballot box two', 'Ballot box three'], { touch: true }, 'The same ballots, counted in three different orders, produced three different winners.'],
    21: ['survey', 'Farm to farm', 'visit four farms and mark when the news reached each.', ['The first farm', 'The neighbour', 'The mill farm', 'The far farm'], {}, 'Each farm heard from a neighbour. The far one, beyond the water, heard last.'],
    22: ['switch', 'Just enough', 'five party offices hold 40, 25, 15, 12 and 8 seats. Light the lamps of a coalition that reaches 51 with no partner to spare.', ['40 seats', '25 seats', '15 seats', '12 seats', '8 seats'], { rule: 'coalition', seats: [40, 25, 15, 12, 8] }, 'A minimal coalition won with a few seats in hand and left everyone else outside.'],
    23: ['survey', 'Ask me again', 'put the same question to three residents now, and to the first again after the bell.', ['First resident', 'Second resident', 'Third resident'], { revisit: 0, hint: 'The bell has gone. Ask the first resident again.' }, 'Asked again, the first resident gave a different answer and could not say why.'],
    24: ['courier', 'Pass it on', 'carry a letter along a chain of acquaintances. Each names the next.', ['The grocer', 'The grocer’s cousin', 'A clerk', 'The clerk’s landlord', 'The addressee'], { items: 5, order: true }, 'Five hands reached the addressee. Three other letters that set out never came back.'],
    25: ['survey', 'The ones who stayed home', 'the pay ledger lists everyone who worked. Knock at three doors of people it does not list.', ['First door', 'Second door', 'Third door'], {}, 'Those missing from the ledger had been offered less or lived further off. The ledger never knew them.'],
    26: ['survey', 'A day at the stalls', 'trade once with each of four stallholders and note how each answers a kindness.', ['The cheese stall', 'The cloth stall', 'The spice stall', 'The knife-grinder'], {}, 'Three answered in kind. One poached every time, and had fewer partners by evening.'],
    27: ['survey', 'Count the staff', 'count the staff at two restaurants in each town today. The ledger holds last year’s numbers.', ['East town, first café', 'East town, second café', 'West town, first café', 'West town, second café'], {}, 'Both towns had changed since last year. Only the difference between their changes belonged to the new rule.'],
    28: ['courier', 'Knock on doors', 'your list was drawn by lottery. Knock at all five doors before dusk, whether or not anyone answers.', ['Door 3', 'Door 8', 'Door 12', 'Door 17', 'Door 21'], { items: 5, timer: 95 }, 'Two doors opened. All five stay on the treatment list.'],
    29: ['survey', 'Four ledgers', 'collect four ledgers, one from each generation of a family firm.', ['Founder’s ledger', 'Second generation', 'Third generation', 'This year’s books'], {}, 'Each generation began with what the last one had kept.'],
    30: ['courier', 'A month of the other side', 'deliver the daily digest to five volunteers drawn by lot from both camps.', ['Volunteer A', 'Volunteer B', 'Volunteer C', 'Volunteer D', 'Volunteer E'], { items: 5, timer: 95 }, 'Some read every digest and some none. Reading it did not bring the camps closer.'],
  };
  const forEncounter = (id) => { const t = T[id]; return t ? { kind: t[0], title: t[1], brief: t[2], labels: t[3], opt: t[4] || {}, note: t[5] } : null; };

  function place(world, n, seed, zone) {
    const seen = world.reach(world.spawn.x, world.spawn.y), N = world.N, z = zone || { x: 6, y: 6, w: N - 12, h: N - 12 }, out = [];
    let tries = 0, gap = 4;
    while (out.length < n && tries++ < 6000) {
      if (tries % 900 === 0) gap = Math.max(1.5, gap - 0.8);
      const x = z.x + Math.floor(SA.hash(tries, 1, seed) * z.w), y = z.y + Math.floor(SA.hash(tries, 2, seed) * z.h);
      if (x < 2 || y < 2 || x >= N - 2 || y >= N - 2 || !seen[y * N + x]) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.y - y) < gap)) continue;
      if (world.props.some((p) => Math.round(p.x) === x && Math.round(p.y) === y)) continue;
      out.push({ x, y });
    }
    while (out.length < n) out.push({ x: world.spawn.x + out.length, y: world.spawn.y - 1 });
    return out;
  }

  function start(game) {
    const enc = game.enc, world = game.world, cfg = forEncounter(enc.id); if (!cfg) return null;
    const o = cfg.opt, seed = world.seed + enc.id * 13, zone = world.pois.task && world.pois.task.w ? world.pois.task : null;
    const spots = o.pois ? o.pois.map((k) => ({ x: world.pois[k].x, y: world.pois[k].y })) : place(world, cfg.labels.length, seed, zone);
    const st = cfg.labels.map((label, i) => ({ i, label, x: spots[i].x, y: spots[i].y, done: false, on: o.start ? !!o.start[i] : false, touched: false, value: 3 + Math.floor(SA.hash(i, enc.id, 5) * 7) }));
    const rt = { cfg, stations: st, done: false, t: 0, carrying: 0, delivered: 0, log: [], phase: 0, picked: null, timeUp: false };
    if (o.source) { const p = place(world, 1, seed + 99, zone ? { x: zone.x, y: zone.y + zone.h - 3, w: zone.w, h: 4 } : null)[0]; rt.source = { i: -1, label: o.source, x: p.x, y: p.y, source: true }; }
    if (o.hiddenPoi) rt.hidden = { i: 99, label: o.hidden, x: world.pois[o.hiddenPoi].x, y: world.pois[o.hiddenPoi].y, hidden: true, done: false };
    const relaxed = () => SA.save.settings.relaxed, limit = o.timer || 0;
    const visible = () => [...st, ...(rt.source ? [rt.source] : []), ...(rt.hidden && rt.phase >= 1 ? [rt.hidden] : [])];
    rt.visible = visible;
    rt.near = (x, y) => visible().filter((s) => Math.hypot(s.x - x, s.y - y) < 1.7).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0] || null;
    rt.verb = (s) => (s.source ? `Collect from ${s.label}` : cfg.kind === 'switch' ? `${s.on ? 'Turn off' : 'Turn on'}: ${s.label}` : cfg.kind === 'search' ? `Inspect ${s.label}` : cfg.kind === 'courier' ? `Deliver to ${s.label}` : `Record: ${s.label}`);
    const finish = (note, good) => { if (rt.done) return; rt.done = true; rt.note = note; rt.good = good; SA.emit('task-done', rt); };
    const waterScore = () => { const open = st.slice(0, 3).filter((s) => s.on).length; return st[3].on ? open : Math.min(open, 2); };
    const coalition = () => { const seats = o.seats, sum = st.reduce((a, s, i) => a + (s.on ? seats[i] : 0), 0), minimal = sum >= 51 && st.every((s, i) => !s.on || sum - seats[i] < 51); return { sum, minimal }; };
    rt.status = () => {
      const k = cfg.kind;
      if (k === 'survey') { const n = st.filter((s) => s.done).length; return { text: rt.phase >= 1 ? (o.hint || 'One more observation.') : `${n} of ${st.length} recorded`, frac: (n + (rt.phase === 2 ? 1 : 0)) / (st.length + (o.hidden || o.revisit !== undefined ? 1 : 0)) }; }
      if (k === 'courier') { const need = o.items; return { text: o.source && !rt.carrying && rt.delivered < need ? `Collect from ${o.source} (${rt.delivered} of ${need} delivered)` : `${rt.delivered} of ${need} delivered`, frac: rt.delivered / need }; }
      if (k === 'switch') { if (o.rule === 'water') { const w = waterScore(); return { text: `${w} of 3 plots watered`, frac: w / 3 }; } if (o.rule === 'coalition') { const c = coalition(); return { text: `${c.sum} seats · ${c.sum < 51 ? 'not yet a majority' : c.minimal ? 'minimal and winning' : 'winning, with a partner to spare'}`, frac: Math.min(1, c.sum / 51) }; } const n = o.touch ? st.filter((s) => s.touched).length : st.filter((s, i) => (s.on ? 1 : 0) === o.target[i]).length; return { text: o.touch ? `${n} of ${st.length} tried` : `${n} of ${st.length} set`, frac: n / st.length }; }
      const used = st.filter((s) => s.done).length; return { text: `${used} of ${o.budget} looks used` + (used ? ` · best so far: ${Math.max(...st.filter((s) => s.done).map((s) => s.value))} of 9` : ''), frac: used / o.budget, stop: used > 0 };
    };
    rt.hud = () => { const s = rt.status(), left = limit && !relaxed() ? Math.max(0, limit - rt.t) : 0; return `<div class="task-hud"><b>${esc(cfg.title)}</b><div>${esc(s.text)}${left ? ` · <span style="color:${left < 15 ? 'var(--red)' : 'var(--gold)'}">${Math.ceil(left)}s to the bell</span>` : ''}</div><div class="bar"><i style="width:${Math.round(s.frac * 100)}%"></i></div>${s.stop ? '<div class="row"><button class="btn small primary" data-ui="taskstop">Choose the best so far</button></div>' : ''}</div>`; };
    rt.stop = () => { if (cfg.kind !== 'search') return; const seen = st.filter((s) => s.done), best = Math.max(...seen.map((s) => s.value)), top = Math.max(...st.map((s) => s.value)); finish(`You looked at ${seen.length} of ${st.length} rooms and settled for one scoring ${best} of 9. The best room scored ${top}. ${best === top ? 'You found it, at a price.' : seen.length <= 3 ? 'Good enough, and found in good time.' : 'Good enough, though the search was not cheap.'}`, best >= 6); };
    rt.visit = (s) => {
      if (rt.done) return; const k = cfg.kind; SA.Audio.sfx(k === 'switch' ? 'door' : 'pencil');
      if (s.source) { if (rt.delivered + rt.carrying >= o.items) return; rt.carrying = 1; SA.UI.toast(`Collected from ${esc(s.label)}.`, 1800); return; }
      if (k === 'survey') {
        if (s.hidden) { s.done = true; rt.phase = 2; return finish(cfg.note, true); }
        if (rt.phase === 1 && o.revisit === s.i) { rt.phase = 2; return finish(cfg.note, true); }
        if (s.done) return; s.done = true; SA.UI.toast(`<b>${esc(s.label)}</b> · recorded: ${s.value}`, 2200);
        if (st.every((x) => x.done)) { if (o.hidden || o.revisit !== undefined) { rt.phase = 1; SA.UI.toast(esc(o.hint), 5200); SA.Audio.sfx('quest'); if (o.revisit !== undefined) { SA.Audio.sfx('bell'); game.cast && game.cast.ringBell(); if (o.dusk) game.hour = 19.6; } } else finish(cfg.note, true); }
      } else if (k === 'courier') {
        if (o.source && !rt.carrying) { SA.UI.toast(`Collect from ${esc(o.source)} first.`, 2000); return; }
        if (o.order && s.i !== rt.delivered) { SA.UI.toast(`${esc(s.label)} does not know the sender yet. Follow the chain.`, 2600); return; }
        if (s.done && !o.rich && !o.pick) return;
        s.done = true; s.count = (s.count || 0) + 1; rt.carrying = 0; rt.delivered++; rt.log.push(s.i); SA.UI.toast(`Delivered: <b>${esc(s.label)}</b>`, 1800);
        if (rt.delivered >= o.items) {
          let note = cfg.note; if (o.groups) { const reach = new Set(rt.log.map((i) => o.groups[i])).size; note = reach >= 3 ? 'Four invitations reached all three circles, because one went to the friend who stands between them.' : `Four invitations reached ${reach} of three circles. Friends of friends had already heard; the far circle had not.`; }
          finish(note, !rt.timeUp);
        }
      } else if (k === 'switch') {
        s.on = !s.on; s.touched = true;
        if (o.rule === 'water') { if (waterScore() === 3) finish(cfg.note, true); }
        else if (o.rule === 'coalition') { if (coalition().minimal) finish(cfg.note, true); }
        else if (o.touch) { if (st.every((x) => x.touched)) finish(cfg.note, true); }
        else if (st.every((x, i) => (x.on ? 1 : 0) === o.target[i])) finish(cfg.note, true);
      } else if (k === 'search') {
        if (s.done) return; s.done = true; SA.UI.toast(`<b>${esc(s.label)}</b> scores ${s.value} of 9`, 2400);
        if (st.filter((x) => x.done).length >= o.budget) rt.stop();
      }
    };
    rt.update = (dt) => { if (rt.done) return; rt.t += dt; if (limit && !relaxed() && !rt.timeUp && rt.t >= limit) { rt.timeUp = true; SA.Audio.sfx('bell'); game.cast && game.cast.ringBell(); SA.UI.toast('The bell has rung. Finish what you can; the note will say so.', 4200); } };
    rt.actors = (t) => visible().map((s) => ({ x: s.x, y: s.y, always: true, draw: (c) => { SA.Props.defs.marker.draw(c, { col: s.source ? '#79c2b4' : s.hidden ? '#e58fb0' : s.on ? '#7fd08a' : '#e7c35a', done: s.done && cfg.kind !== 'switch' }, t); c.font = '600 10px system-ui'; c.textAlign = 'center'; const w = c.measureText(s.label).width + 10; c.fillStyle = 'rgba(20,17,13,.82)'; c.beginPath(); c.roundRect(-w / 2, -42, w, 15, 4); c.fill(); c.fillStyle = '#f1e7cf'; c.fillText(s.label, 0, -31); } }));
    return rt;
  }
  SA.Tasks = { forEncounter, start, all: T, place };
})();
