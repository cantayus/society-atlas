/* The Society Atlas V2 — research problems for encounters 19–30.
   Original, deterministic teaching simulations with the same contract as the
   first edition's labs: predict, run the comparison, state the boundary, transfer.
   Every number is computed from the rules shown or is labelled synthetic. */
(function () {
  'use strict';
  const SA = window.SA, esc = SA.esc, rng = SA.rng;
  const avg = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1), fmt = (n, d = 1) => Number(n).toFixed(d), pct = (n) => Math.round(100 * n) + '%';
  const options = (a, v) => a.map(([k, t]) => `<option value="${esc(k)}" ${String(k) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const select = (id, label, a, v) => `<label>${esc(label)}<select id="${id}">${options(a, v)}</select></label>`;
  const button = (id, t, off = false, cls = '') => `<button type="button" id="${id}" class="${cls}" ${off ? 'disabled' : ''}>${t}</button>`;
  const bars = (rows, unit = '') => `<div class="lab-bars">${rows.map(([name, val, max = 100, d = 1]) => `<div><span>${esc(name)}</span><i><b style="width:${Math.max(1, Math.min(100, (val / max) * 100))}%"></b></i><strong>${esc(fmt(val, d))}${unit}</strong></div>`).join('')}</div>`;
  const table = (heads, rows) => `<div class="lab-table-wrap"><table><thead><tr>${heads.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const dots = (flags) => `<span class="lab-dots">${flags.map((f) => `<i class="${f ? 'on' : ''}"></i>`).join('')}</span>`;

  const DEF = {
    19: { brief: 'Bellwether has five circles of eight residents. A wireless notice reaches some of them directly. Decide whom to brief in person, run the week, and count who ends up informed. People are invented.',
      hints: ['Run the week with nobody briefed first, so you have something to compare with.', 'The loudest person in a circle is not always the one the others ask.', 'Compare “nobody”, then “the person others say they ask”. Look closely at Canal End.'],
      limit: 'This town was built so that personal influence matters. The original panel inferred the two steps from interviews; it did not watch news travel, and later studies found more tangled routes.',
      transfer: 'Ask Eastbank residents whom they turn to for news, and check whether festival notices ever reach those people.' },
    20: { brief: 'One hundred residents rank three festival venues. The ballots never change. Choose how to count them, count, and watch the winner. Then withdraw a venue that was not going to win.',
      hints: ['Count the same ballots under two different rules.', 'Try an agenda: pair two venues first, then put the winner against the third.', 'Use Borda with all three venues, then withdraw Eastbank Green and count again.'],
      limit: 'These hundred ballots were arranged to cycle. Real electorates often do not, and the theorem says no ranking rule meets every fairness condition at once; it does not say voting is meaningless.',
      transfer: 'Find out who chose the festival’s venue and by what procedure, and whether another fair procedure would have chosen differently.' },
    21: { brief: 'A new way of drying hay starts on one farm. Each season, every farm that has it tells one other farm. Choose how far word travels, run five seasons, and read the map. The lake has no ferry.',
      hints: ['Run five seasons with neighbour-to-neighbour contact and look at the shape.', 'Now let word reach any farm with equal chance. Count adopters east of the lake.', 'Compare the two contact fields: totals may be close, but the maps differ.'],
      limit: 'The rule here is only “hear it, adopt it”. Real adoption also depends on cost, soil, trust and who can afford to wait, none of which is on this map.',
      transfer: 'Map where festival-goers live and who told them, to see whether word of the festival stops at the canal.' },
    22: { brief: 'Five parties hold 100 council seats: Lantern 40, Canal 25, Market 15, Orchard 12, Gate 8. A coalition with 51 or more governs and divides a prize of 100 by seat share. Build coalitions and record them.',
      hints: ['Record one coalition that wins comfortably.', 'A coalition is minimal if losing any one member would cost it the majority.', 'Compare the Lantern party’s share in an oversized coalition and in a minimal winning one.'],
      limit: 'The prize here is fixed and divisible, and everyone knows every seat count. Real parties also care about policy, trust and the next election, and oversized coalitions are common.',
      transfer: 'Ask which groups had to agree to the festival’s rules, and who was not needed for the majority.' },
    23: { brief: 'Forty invented residents answer the same yes-or-no question about the gate in March and in May. Read the turnover table, interview them a third time, then find a model that reproduces what you see.',
      hints: ['Interview a third time and compare all three pairs of waves.', 'If everyone drifted a little, the March–July agreement should be the lowest. Is it?', 'Simulate a stable core plus coin-flippers. Try different shares until agreement matches.'],
      limit: 'A stable core plus coin-flippers is the simplest story that fits. Later work showed that vague questions and measurement error can produce the same table from people who do hold views.',
      transfer: 'Ask Eastbank residents the same festival question twice, weeks apart, before treating any single answer as a settled view.' },
    24: { brief: 'Sixty letters set out for one addressee, hand to hand between acquaintances. Every hand may forward the letter or drop it. Send the letters and study the chains that arrive.',
      hints: ['Send a batch in the ideal world where everyone forwards.', 'Now send a batch where one hand in four drops the letter. Count arrivals.', 'Compare the average length of chains that arrived with the true average of all sixty.'],
      limit: 'Most letters in the original study never arrived, and starters were not a sample of everyone. Short chains among the letters that arrive do not show that everyone is close to everyone.',
      transfer: 'Trace how a festival invitation travels hand to hand, and record the chains that break as carefully as those that arrive.' },
    25: { brief: 'Sixty invented people are offered a wage. They take the job only if it beats what staying home is worth to them. The pay ledger lists workers only. Compare the two districts, then survey the people the ledger never met.',
      hints: ['Read the ledger and note the gap between districts.', 'Raise what staying home is worth, read the ledger again, and count the workers.', 'Survey those not in the ledger and compare the offer gap with the ledger gap.'],
      limit: 'Here you could simply survey the missing people. Usually you cannot, and correcting for selection needs assumptions about why people are missing that the data alone cannot check.',
      transfer: 'Before comparing festival-goers across districts, ask who never appears in the attendance count and why.' },
    26: { brief: 'Five stallholders trade side by side. Each round, two stalls either cooperate or poach. Choose who is in the market and how often they meet again, then run the tournament.',
      hints: ['Run the market where each pair meets only once.', 'Now let each pair meet fifty times.', 'Keep going until a different stallholder tops the table: more meetings, or a market with more reciprocators.'],
      limit: 'Tit for tat did well against the strategies it met. Change the field, add mistakes or shorten the future, and another rule wins. A tournament is not a law of nature.',
      transfer: 'Find out whether Eastbank and the festival committee deal with each other repeatedly, or only once a year.' },
    27: { brief: 'East Town raised its wage floor; West Town did not. Count average staff per café in both towns before and after. The figures are synthetic. Then decide which comparison isolates the change.',
      hints: ['Count all four cells first.', 'A before-and-after comparison in East Town includes everything else that changed that year.', 'Compute all three estimates, then check the year before to see whether the towns were moving together.'],
      limit: 'The estimate rests on the towns moving in parallel had nothing changed. Matching earlier trends make that plausible but cannot rule out a shock that hit one town during the study.',
      transfer: 'Compare festival attendance before and after a gate-hours change with a similar district where the hours stayed the same.' },
    28: { brief: 'Two thousand invented households. You may knock, phone or post a reminder before the festival vote. Decide who gets the reminder, run the campaign, and estimate what it did.',
      hints: ['Let the volunteers choose their own streets and note the estimate.', 'Now draw the list by lottery and run the same campaign.', 'Compare both estimates with each other; then compare knocking with posting.'],
      limit: 'A lottery gives an honest average effect for these households and this election. Many doors stay shut, and the effect on those who answered rests on further assumptions.',
      transfer: 'Offer an evening escort across the canal to households chosen by lottery, and compare attendance with households not offered it.' },
    29: { brief: 'A family fortune earns a return each year while the average wage grows with the economy. Set the return, the growth rate, a tax on returns and how much the heirs spend, then run fifty years.',
      hints: ['Run a world where the return is well above growth.', 'Now run one where growth matches or beats the return.', 'Try a tax on returns, or heirs who spend half of what the fortune earns.'],
      limit: 'This is arithmetic on stated assumptions. Whether returns stay above growth, how much heirs spend, and how wars, taxes and housing fit in are matters of evidence that economists still dispute.',
      transfer: 'Collect records of who has owned the land around the festival ground over several generations.' },
    30: { brief: 'Six hundred invented residents sit on two sides of a dispute. Does seeing the other side’s posts bring people closer? Study those who already follow both sides, then run an experiment.',
      hints: ['Start with the people who already follow both sides. What do they look like?', 'Now assign the other side’s feed by lottery for a month.', 'Compare the two designs, then read the experiment side by side and by who actually read the feed.'],
      limit: 'One platform, one month, volunteers willing to follow an automated account, in one country. The result does not say that every kind of contact across a divide backfires.',
      transfer: 'Before posting festival notices from one district to the other, test on a small random group how the notices are received.' },
  };
  const labs = {};

  // 19 — two steps: who hears, and from whom
  labs[19] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.mode = s.mode || 'none';
    const circles = ['Bakery Row', 'School Lane', 'The Works', 'Chapel Choir', 'Canal End'], names = { none: 'Nobody briefed', loud: 'The loudest voice in each circle', ask: 'The person others say they ask' };
    const run = (mode) => { const direct = rng(1901), pass = rng(1907 + (mode === 'loud' ? 3 : 0)); return circles.map((c, ci) => { const briefed = mode === 'loud' || (mode === 'ask' && ci !== 4), p = mode === 'ask' ? 0.85 : 0.2; return Array.from({ length: 8 }, (_, i) => { const d = direct() < 0.3, v = pass(); return d || (briefed && (i === 0 || v < p)); }); }); };
    const last = s.last ? run(s.last) : null;
    L.board.innerHTML = `<h3>The town this week</h3>${circles.map((c, i) => `<div class="lab-line"><span>${esc(c)}${i === 4 ? ' <em>· named nobody</em>' : ''}</span>${last ? dots(last[i]) + `<b>${last[i].filter(Boolean).length}/8</b>` : '<span class="muted">not yet run</span>'}</div>`).join('')}<p class="note">A filled mark is a resident who knows about the festival by Saturday. The wireless notice alone reaches about three in ten.</p>`;
    L.controls.innerHTML = `<h3>Whom will you brief in person?</h3>${select('mode', 'Brief', Object.entries(names), s.mode)}${button('run', 'Run the week')}${table(['Briefed', 'Informed of 40', 'Canal End'], s.runs.map((r) => [names[r.mode], r.total, r.canal + '/8']))}`;
    L.bind('mode', () => { s.mode = L.val('mode'); L.save(); }, 'change');
    L.bind('run', () => { if (!L.started()) return; const out = run(s.mode), total = out.flat().filter(Boolean).length, canal = out[4].filter(Boolean).length; s.last = s.mode; if (!s.runs.some((r) => r.mode === s.mode)) s.runs.push({ mode: s.mode, total, canal }); L.result(`${names[s.mode]}: ${total} of 40 residents informed. Canal End: ${canal} of 8.${s.mode === 'ask' ? ' Asked whom they turn to for news, Canal End named nobody, so there was nobody to brief.' : s.mode === 'loud' ? ' The loudest voices were heard by many and believed by few.' : ''}`); L.change(); });
    const get = (m) => s.runs.find((r) => r.mode === m);
    L.ready(() => !!get('none') && !!get('ask'), () => `The wireless alone informed ${get('none').total} of 40; briefing the people each circle asks informed ${get('ask').total}, but only ${get('ask').canal} of 8 at Canal End, where nobody was named.`);
  };

  // 20 — the same ballots, different winners
  const BLOCS = [[40, ['Riverside', 'Market Square', 'Eastbank Green']], [35, ['Market Square', 'Eastbank Green', 'Riverside']], [25, ['Eastbank Green', 'Riverside', 'Market Square']]];
  function count(rule, withdrawn) {
    const blocs = BLOCS.map(([n, o]) => [n, o.filter((v) => v !== withdrawn)]), venues = blocs[0][1].slice().sort(), tally = Object.fromEntries(venues.map((v) => [v, 0]));
    const duel = (a, b) => { let x = 0, y = 0; for (const [n, o] of blocs) o.indexOf(a) < o.indexOf(b) ? (x += n) : (y += n); return { win: x >= y ? a : b, a: x, b: y }; };
    if (venues.length < 2) return { winner: venues[0], detail: '' };
    if (rule === 'plurality') { for (const [n, o] of blocs) tally[o[0]] += n; }
    else if (rule === 'borda') { for (const [n, o] of blocs) o.forEach((v, i) => (tally[v] += n * (o.length - 1 - i))); }
    else if (rule === 'runoff') { for (const [n, o] of blocs) tally[o[0]] += n; const top = venues.slice().sort((a, b) => tally[b] - tally[a]).slice(0, 2), d = duel(top[0], top[1]); return { winner: d.win, detail: `First round: ${venues.map((v) => v + ' ' + tally[v]).join(', ')}. Run-off: ${top[0]} ${d.a}, ${top[1]} ${d.b}.` }; }
    else { const order = { agendaRM: ['Riverside', 'Market Square', 'Eastbank Green'], agendaME: ['Market Square', 'Eastbank Green', 'Riverside'], agendaRE: ['Riverside', 'Eastbank Green', 'Market Square'] }[rule].filter((v) => v !== withdrawn); const d1 = duel(order[0], order[1]); if (order.length < 3) return { winner: d1.win, detail: `${order[0]} ${d1.a}, ${order[1]} ${d1.b}.` }; const d2 = duel(d1.win, order[2]); return { winner: d2.win, detail: `${order[0]} ${d1.a} v ${order[1]} ${d1.b}; then ${d1.win} ${d2.a} v ${order[2]} ${d2.b}.` }; }
    const winner = venues.slice().sort((a, b) => tally[b] - tally[a])[0]; return { winner, detail: venues.map((v) => v + ' ' + tally[v]).join(', ') + '.', tally };
  }
  labs[20] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.rule = s.rule || 'plurality'; s.out = s.out || '';
    const rules = { plurality: 'Most first choices', borda: 'Points for rank (2, 1, 0)', runoff: 'Top two, then a run-off', agendaRM: 'Agenda: Riverside v Market, winner v Eastbank', agendaME: 'Agenda: Market v Eastbank, winner v Riverside', agendaRE: 'Agenda: Riverside v Eastbank, winner v Market' };
    L.board.innerHTML = `<h3>The ballots (they never change)</h3>${table(['Residents', 'First', 'Second', 'Third'], BLOCS.map(([n, o]) => [n, ...o]))}<p class="note">Every resident has a clear, consistent ranking. Only the counting changes.</p>${s.lastTally ? bars(Object.entries(s.lastTally).map(([k, v]) => [k, v, 200, 0])) : ''}`;
    L.controls.innerHTML = `<h3>How shall we count?</h3>${select('rule', 'Counting rule', Object.entries(rules), s.rule)}${select('out', 'Withdraw a venue', [['', 'All three stand'], ['Eastbank Green', 'Eastbank Green withdraws'], ['Riverside', 'Riverside withdraws'], ['Market Square', 'Market Square withdraws']], s.out)}${button('count', 'Count the ballots')}${table(['Rule', 'Withdrawn', 'Winner'], s.runs.map((r) => [rules[r.rule], r.out || 'none', r.winner]))}`;
    L.bind('rule', () => { s.rule = L.val('rule'); L.save(); }, 'change'); L.bind('out', () => { s.out = L.val('out'); L.save(); }, 'change');
    L.bind('count', () => { if (!L.started()) return; const r = count(s.rule, s.out); s.lastTally = r.tally || null; if (!s.runs.some((x) => x.rule === s.rule && x.out === s.out)) s.runs.push({ rule: s.rule, out: s.out, winner: r.winner }); L.result(`${rules[s.rule]}${s.out ? ', with ' + s.out + ' withdrawn' : ''}: ${r.winner} wins. ${r.detail}`); L.change(); });
    const winners = () => [...new Set(s.runs.filter((r) => !r.out).map((r) => r.winner))], flip = () => { for (const a of s.runs.filter((r) => r.out)) { const b = s.runs.find((r) => !r.out && r.rule === a.rule); if (b && b.winner !== a.winner && b.winner !== a.out) return [a, b]; } return null; };
    L.ready(() => s.runs.length >= 3 && winners().length >= 2 && s.runs.some((r) => r.out), () => `The same hundred ballots chose ${winners().join(' and ')} under different counting rules.${flip() ? ` Under “${rules[flip()[0].rule].toLowerCase()}”, withdrawing ${flip()[0].out} changed the winner from ${flip()[1].winner} to ${flip()[0].winner}.` : ''}`);
  };

  // 21 — innovation spreads across a map
  function diffuse(mode) {
    const W = 7, lake = (x, y) => x === 3 && y >= 1 && y <= 5, r = rng(mode === 'near' ? 2103 : 2111), when = new Array(49).fill(-1), farms = []; for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (!lake(x, y)) farms.push([x, y]);
    when[3 * W + 1] = 0;
    for (let season = 1; season <= 5; season++) { const tellers = farms.filter(([x, y]) => when[y * W + x] >= 0 && when[y * W + x] < season); for (const [x, y] of tellers) { const pool = mode === 'near' ? farms.filter(([a, b]) => (a !== x || b !== y) && Math.max(Math.abs(a - x), Math.abs(b - y)) <= 1) : farms.filter(([a, b]) => a !== x || b !== y); const [a, b] = pool[Math.floor(r() * pool.length)]; if (when[b * W + a] < 0) when[b * W + a] = season; } }
    const got = farms.filter(([x, y]) => when[y * W + x] >= 0), east = got.filter(([x]) => x > 3).length, clustered = got.filter(([x, y]) => when[y * W + x] > 0 && farms.some(([a, b]) => Math.max(Math.abs(a - x), Math.abs(b - y)) === 1 && when[b * W + a] >= 0 && when[b * W + a] < when[y * W + x])).length;
    return { when, total: got.length, east, clustered: got.length > 1 ? clustered / (got.length - 1) : 0, lake };
  }
  labs[21] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.mode = s.mode || 'near'; const names = { near: 'Neighbour to neighbour', far: 'Any farm, however far' }, d = s.last ? diffuse(s.last) : null;
    L.board.innerHTML = `<h3>The parish map${s.last ? ' · ' + names[s.last].toLowerCase() : ''}</h3><div class="lab-map" style="grid-template-columns:repeat(7,1fr)">${Array.from({ length: 49 }, (_, i) => { const x = i % 7, y = Math.floor(i / 7), lake = x === 3 && y >= 1 && y <= 5, w = d ? d.when[i] : i === 22 ? 0 : -1; return `<span class="${lake ? 'lake' : w >= 0 ? 'on s' + w : ''}" title="${lake ? 'Lake' : w >= 0 ? (w ? 'Adopted in season ' + w : 'The first farm') : 'Not yet'}">${lake ? '' : w >= 0 ? w || '★' : '·'}</span>`; }).join('')}</div><p class="note">★ the first farm · numbers show the season a farm adopted · blue is the lake.</p>`;
    L.controls.innerHTML = `<h3>How far does word travel?</h3>${select('mode', 'Each farm tells', Object.entries(names), s.mode)}${button('run', 'Run five seasons')}${table(['Contact', 'Adopters', 'East of the lake', 'Beside an earlier adopter'], s.runs.map((r) => [names[r.mode], r.total, r.east, pct(r.clustered)]))}`;
    L.bind('mode', () => { s.mode = L.val('mode'); L.save(); }, 'change');
    L.bind('run', () => { if (!L.started()) return; const o = diffuse(s.mode); s.last = s.mode; if (!s.runs.some((r) => r.mode === s.mode)) s.runs.push({ mode: s.mode, total: o.total, east: o.east, clustered: o.clustered }); L.result(`${names[s.mode]}: ${o.total} farms adopted in five seasons, ${o.east} of them east of the lake. ${pct(o.clustered)} of new adopters stood beside a farm that already had it.`); L.change(); });
    const g = (m) => s.runs.find((r) => r.mode === m);
    L.ready(() => !!g('near') && !!g('far'), () => `With neighbour-to-neighbour contact ${g('near').total} farms adopted, ${g('near').east} beyond the lake, in a tight cluster (${pct(g('near').clustered)} beside an earlier adopter). With contact at any distance ${g('far').total} adopted, ${g('far').east} beyond the lake (${pct(g('far').clustered)}).`);
  };

  // 22 — just enough to win
  const PARTIES = [['Lantern', 40], ['Canal', 25], ['Market', 15], ['Orchard', 12], ['Gate', 8]];
  labs[22] = (L) => {
    const { s } = L; s.in = s.in || [0, 0, 0, 0, 0]; s.rec = s.rec || [];
    const seats = (m) => m.reduce((a, on, i) => a + (on ? PARTIES[i][1] : 0), 0), wins = (m) => seats(m) >= 51, minimal = (m) => wins(m) && m.every((on, i) => !on || seats(m) - PARTIES[i][1] < 51), label = (m) => PARTIES.filter((_, i) => m[i]).map((p) => p[0]).join(' + ') || 'nobody';
    const total = seats(s.in);
    L.board.innerHTML = `<h3>The council chamber</h3><div class="lab-row">${PARTIES.map((p, i) => button('p' + i, `${p[0]} · ${p[1]}`, false, s.in[i] ? 'selected' : '')).join('')}</div>${bars([['Coalition seats', total, 100, 0]])}<p><b>${total} seats.</b> ${total < 51 ? 'Not a majority: this coalition wins nothing.' : minimal(s.in) ? 'A minimal winning coalition: every member is needed.' : 'A winning coalition with a partner to spare.'}</p>${wins(s.in) ? bars(PARTIES.filter((_, i) => s.in[i]).map((p) => [p[0] + '’s share', (p[1] / total) * 100, 100, 0])) : ''}`;
    L.controls.innerHTML = `<h3>The record</h3>${button('rec', 'Record this coalition', !wins(s.in))}${table(['Coalition', 'Seats', 'Kind', 'Largest member’s share'], s.rec.map((m) => { const big = PARTIES.find((_, i) => m[i]); return [label(m), seats(m), minimal(m) ? 'minimal winning' : 'oversized', Math.round((big[1] / seats(m)) * 100)]; }))}<p class="note">The prize of 100 is divided in proportion to seats among the members only.</p>`;
    PARTIES.forEach((p, i) => L.bind('p' + i, () => { if (!L.started()) return; s.in[i] = s.in[i] ? 0 : 1; L.change(); }));
    L.bind('rec', () => { if (!s.rec.some((m) => m.join() === s.in.join())) s.rec.push(s.in.slice()); const big = PARTIES.find((_, i) => s.in[i]); L.result(`${label(s.in)}: ${total} seats, ${minimal(s.in) ? 'minimal winning' : 'oversized'}. ${big[0]} takes ${Math.round((big[1] / total) * 100)} of the 100.`); L.change(); });
    const share = (m) => Math.round((PARTIES.find((_, i) => m[i])[1] / seats(m)) * 100), mins = () => s.rec.filter(minimal), overs = () => s.rec.filter((m) => !minimal(m));
    L.ready(() => mins().length > 0 && overs().length > 0, () => `An oversized coalition (${label(overs()[0])}, ${seats(overs()[0])} seats) gave its largest member ${share(overs()[0])} of 100; a minimal winning coalition (${label(mins()[0])}, ${seats(mins()[0])} seats) gave its largest member ${share(mins()[0])}.`);
  };

  // 23 — attitudes and non-attitudes
  function panel(stable, seed) { const r = rng(seed), n = 40, k = Math.round(n * stable); return Array.from({ length: n }, (_, i) => { if (i < k) { const v = r() < 0.55 ? 1 : 0; return [v, v, v]; } return [r() < 0.5 ? 1 : 0, r() < 0.5 ? 1 : 0, r() < 0.5 ? 1 : 0]; }); }
  const agree = (p, a, b) => p.filter((x) => x[a] === x[b]).length / p.length;
  labs[23] = (L) => {
    const { s } = L; s.sims = s.sims || []; s.share = s.share || '0.2'; const obs = panel(0.5, 2332), cell = (a, b) => obs.filter((x) => x[0] === a && x[1] === b).length;
    L.board.innerHTML = `<h3>“Should the east gate stay open later?”</h3>${table(['', 'May: yes', 'May: no'], [['March: yes', cell(1, 1), cell(1, 0)], ['March: no', cell(0, 1), cell(0, 0)]])}${bars([['March–May agree', agree(obs, 0, 1) * 100, 100, 0], ...(s.wave3 ? [['May–July agree', agree(obs, 1, 2) * 100, 100, 0], ['March–July agree', agree(obs, 0, 2) * 100, 100, 0]] : [])], '%')}<p class="note">Forty invented respondents, the same people each time. Half of all answers agreeing is what coin flips alone would give.</p>`;
    L.controls.innerHTML = `<h3>Explain the turnover</h3>${button('w3', s.wave3 ? '✓ Third interview done' : 'Interview everyone again in July', !!s.wave3)}${select('share', 'Model: share with a settled view (the rest flip a coin)', [['0.2', '20%'], ['0.5', '50%'], ['0.8', '80%'], ['1', '100%, and nobody flips']], s.share)}${button('sim', 'Simulate the model', !s.wave3)}${table(['Settled share', 'Model agreement', 'Observed', 'Gap'], s.sims.map((x) => [pct(x.share), pct(x.model), pct(x.obs), Math.round(Math.abs(x.model - x.obs) * 100) + ' pts']))}`;
    L.bind('w3', () => { if (!L.started()) return; s.wave3 = true; L.result(`July: agreement with May is ${pct(agree(obs, 1, 2))}, and agreement between March and July is ${pct(agree(obs, 0, 2))}. Opinions did not drift further apart over the longer gap.`); L.change(); });
    L.bind('share', () => { s.share = L.val('share'); L.save(); }, 'change');
    L.bind('sim', () => { const sh = Number(s.share), model = sh + (1 - sh) * 0.5, o = (agree(obs, 0, 1) + agree(obs, 1, 2) + agree(obs, 0, 2)) / 3; if (!s.sims.some((x) => x.share === sh)) s.sims.push({ share: sh, model, obs: o }); L.result(`If ${pct(sh)} hold a settled view and the rest flip a coin, any two interviews should agree ${pct(model)} of the time, at any gap. Observed: ${pct(o)}.`); L.change(); });
    const best = () => s.sims.slice().sort((a, b) => Math.abs(a.model - a.obs) - Math.abs(b.model - b.obs))[0];
    L.ready(() => !!s.wave3 && s.sims.length >= 2 && Math.abs(best().model - best().obs) < 0.07, () => `Agreement held near ${pct(best().obs)} whether interviews were two months or four months apart. A model in which ${pct(best().share)} hold a settled view and the rest answer at random reproduced it.`);
  };

  // 24 — the chains that arrive
  function letters(p) { const len = rng(2401), drop = rng(2409), chains = Array.from({ length: 60 }, () => 3 + Math.floor(len() * 8)), arrived = chains.filter((n) => { let ok = true; for (let i = 0; i < n; i++) if (drop() > p) ok = false; return ok; }); return { chains, arrived }; }
  labs[24] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.p = s.p || '1'; const names = { 1: 'Everyone forwards the letter', 0.75: 'One hand in four drops it', 0.67: 'One hand in three drops it' }, last = s.last ? letters(Number(s.last)) : null;
    const hist = (a) => Array.from({ length: 8 }, (_, i) => [`${i + 3} hands`, a.filter((n) => n === i + 3).length, 14, 0]);
    L.board.innerHTML = `<h3>Letters that reached the addressee</h3>${last ? bars(hist(last.arrived)) + `<p><b>${last.arrived.length} of 60 arrived.</b> Average chain among arrivals: ${fmt(avg(last.arrived))} hands.</p>` : '<p class="muted">No letters sent yet.</p>'}<p class="note">Each starter is really between 3 and 10 hands from the addressee. You only ever see the chains that complete.</p>`;
    L.controls.innerHTML = `<h3>Send sixty letters</h3>${select('p', 'At each hand', Object.entries(names), s.p)}${button('send', 'Post the letters')}${table(['World', 'Arrived', 'Average among arrivals', 'True average of all 60'], s.runs.map((r) => [names[r.p], r.n, fmt(r.mean), fmt(r.truth)]))}`;
    L.bind('p', () => { s.p = L.val('p'); L.save(); }, 'change');
    L.bind('send', () => { if (!L.started()) return; const o = letters(Number(s.p)); s.last = s.p; if (!s.runs.some((r) => r.p === s.p)) s.runs.push({ p: s.p, n: o.arrived.length, mean: avg(o.arrived), truth: avg(o.chains) }); L.result(`${names[s.p]}: ${o.arrived.length} of 60 letters arrived${o.arrived.length ? ', averaging ' + fmt(avg(o.arrived)) + ' hands' : ''}. All sixty starters were in truth ${fmt(avg(o.chains))} hands away on average.`); L.change(); });
    const ideal = () => s.runs.find((r) => r.p === '1'), lossy = () => s.runs.find((r) => r.p !== '1');
    L.ready(() => !!ideal() && !!lossy(), () => `When hands dropped letters, only ${lossy().n} of 60 arrived and those chains averaged ${fmt(lossy().mean)} hands; the true average for all sixty was ${fmt(lossy().truth)}. Long chains break more often, so arrivals look shorter than the world is.`);
  };

  // 25 — the people the ledger never met
  function workers(reserve) { const r = rng(2501), norm = () => (r() + r() + r() + r() - 2) * 2.2, mk = (mean) => Array.from({ length: 30 }, () => mean + norm()), W = mk(12), E = mk(9), w = (a) => a.filter((x) => x >= reserve); return { W, E, wW: w(W), wE: w(E) }; }
  labs[25] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.res = s.res || '7'; const names = { 7: 'Low: staying home is worth 7 an hour', 10: 'High: staying home is worth 10 an hour' }, o = workers(Number(s.res));
    L.board.innerHTML = `<h3>${s.read === s.res ? 'The pay ledger (workers only)' : 'The pay ledger is closed'}</h3>${s.read === s.res ? bars([['West, in work', avg(o.wW), 16], ['East, in work', avg(o.wE), 16]]) + `<p>${o.wW.length} of 30 West residents and ${o.wE.length} of 30 East residents appear in the ledger. Ledger gap: <b>${fmt(avg(o.wW) - avg(o.wE))}</b> an hour.</p>` : ''}${s.survey ? `<h3>Your survey (everyone’s offer)</h3>${bars([['West, all offers', avg(o.W), 16], ['East, all offers', avg(o.E), 16]])}<p>Offer gap: <b>${fmt(avg(o.W) - avg(o.E))}</b> an hour.</p>` : ''}<p class="note">Synthetic wages for sixty invented people. Someone takes a job only when the offer beats staying home.</p>`;
    L.controls.innerHTML = `<h3>Who shows up in the data?</h3>${select('res', 'What staying home is worth', Object.entries(names), s.res)}${button('read', 'Read the pay ledger')}${button('survey', s.survey ? '✓ Non-workers surveyed' : 'Survey those not in the ledger', !!s.survey || !s.runs.length)}${table(['Staying home', 'East in work', 'Ledger gap', 'Offer gap'], s.runs.map((r) => [r.res, r.east + '/30', fmt(r.gap), s.survey ? fmt(r.truth) : '?']))}`;
    L.bind('res', () => { s.res = L.val('res'); L.change(); }, 'change');
    L.bind('read', () => { if (!L.started()) return; s.read = s.res; if (!s.runs.some((r) => r.res === s.res)) s.runs.push({ res: s.res, east: o.wE.length, gap: avg(o.wW) - avg(o.wE), truth: avg(o.W) - avg(o.E) }); L.result(`Ledger: West workers average ${fmt(avg(o.wW))}, East workers ${fmt(avg(o.wE))}: a gap of ${fmt(avg(o.wW) - avg(o.wE))}. Only ${o.wE.length} of 30 East residents are in it.`); L.change(); });
    L.bind('survey', () => { s.survey = true; L.result(`Survey of everyone: West offers average ${fmt(avg(o.W))}, East offers ${fmt(avg(o.E))}: a gap of ${fmt(avg(o.W) - avg(o.E))}. The East residents with the lowest offers stayed home, so the ledger never recorded them.`); L.change(); });
    L.ready(() => s.runs.length >= 2 && !!s.survey, () => { const hi = s.runs.find((r) => r.res === '10'); return `With staying home worth 10, the ledger showed a gap of ${fmt(hi.gap)} between districts with only ${hi.east} of 30 East residents in work; the gap in what everyone was offered was ${fmt(hi.truth)}. The ledger understated it because low offers never became wages.`; });
  };

  // 26 — cooperation when there is a tomorrow
  const STRATS = { coop: ['Always shares', () => 1], defect: ['Always poaches', () => 0], tft: ['Tit for tat', (me, you) => (you.length ? you[you.length - 1] : 1)], grudge: ['Holds a grudge', (me, you) => (you.includes(0) ? 0 : 1)], coin: ['Flips a coin', (me, you, r) => (r() < 0.5 ? 1 : 0)] };
  function tournament(field, rounds) {
    const r = rng(2601), score = field.map(() => 0);
    for (let i = 0; i < field.length; i++) for (let j = i + 1; j < field.length; j++) { const a = [], b = []; for (let k = 0; k < rounds; k++) { const x = STRATS[field[i]][1](a, b, r), y = STRATS[field[j]][1](b, a, r); a.push(x); b.push(y); score[i] += x && y ? 3 : x && !y ? 0 : !x && y ? 5 : 1; score[j] += x && y ? 3 : y && !x ? 0 : !y && x ? 5 : 1; } }
    return field.map((f, i) => ({ f, avg: score[i] / (rounds * (field.length - 1)) })).sort((p, q) => q.avg - p.avg);
  }
  labs[26] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.rounds = s.rounds || '1'; s.field = s.field || 'mixed';
    const fields = { mixed: ['One of each', ['coop', 'defect', 'tft', 'grudge', 'coin']], harsh: ['Three poachers move in', ['defect', 'defect', 'defect', 'tft', 'coop']], kind: ['Three reciprocators', ['tft', 'tft', 'tft', 'defect', 'coop']] }, last = s.last ? tournament(fields[s.last.field][1], Number(s.last.rounds)) : null;
    L.board.innerHTML = `<h3>The market table</h3>${last ? bars(last.map((x) => [STRATS[x.f][0], x.avg, 5, 2])) : '<p class="muted">No market day yet.</p>'}<p class="note">Per meeting: both share 3 each · both poach 1 each · poach a sharer 5 and 0. Bars show the average per meeting.</p>`;
    L.controls.innerHTML = `<h3>Set up the market</h3>${select('field', 'Stallholders', Object.entries(fields).map(([k, v]) => [k, v[0]]), s.field)}${select('rounds', 'Each pair meets', [['1', 'Once, and never again'], ['10', 'Ten times'], ['50', 'Fifty times']], s.rounds)}${button('run', 'Open the market')}${table(['Stallholders', 'Meetings', 'Top of the table'], s.runs.map((r) => [fields[r.field][0], r.rounds, r.top]))}`;
    L.bind('field', () => { s.field = L.val('field'); L.save(); }, 'change'); L.bind('rounds', () => { s.rounds = L.val('rounds'); L.save(); }, 'change');
    L.bind('run', () => { if (!L.started()) return; const o = tournament(fields[s.field][1], Number(s.rounds)), top = STRATS[o[0].f][0]; s.last = { field: s.field, rounds: s.rounds }; if (!s.runs.some((r) => r.field === s.field && r.rounds === s.rounds)) s.runs.push({ field: s.field, rounds: s.rounds, top }); L.result(`${fields[s.field][0]}, ${s.rounds} meeting${s.rounds === '1' ? '' : 's'} per pair: “${top}” comes top with ${fmt(o[0].avg, 2)} per meeting; “${STRATS[o[o.length - 1].f][0]}” comes last.`); L.change(); });
    const once = () => s.runs.find((r) => r.rounds === '1'), many = () => s.runs.find((r) => r.rounds !== '1' && once() && r.top !== once().top);
    L.ready(() => !!once() && !!many(), () => `When pairs met once (${fields[once().field][0].toLowerCase()}), “${once().top}” topped the table. When they met ${many().rounds} times (${fields[many().field][0].toLowerCase()}), “${many().top}” did.`);
  };

  // 27 — difference in differences
  labs[27] = (L) => {
    const { s } = L; s.seen = s.seen || {}; s.est = s.est || {}; s.world = s.world || 'quiet';
    const D = { quiet: { Wb: 24, Wa: 22, Eb: 20, Ea: 21, Wp: 25, Ep: 21 }, shock: { Wb: 24, Wa: 19, Eb: 20, Ea: 21, Wp: 25, Ep: 21 } }[s.world], cells = [['Wb', 'West · before'], ['Wa', 'West · after'], ['Eb', 'East · before'], ['Ea', 'East · after']], all = cells.every(([k]) => s.seen[s.world + k]);
    const show = (k) => (s.seen[s.world + k] ? fmt(D[k]) : '?'), E = { ba: ['Before and after, East Town only', D.Ea - D.Eb], cross: ['East against West, after only', D.Ea - D.Wa], did: ['Difference in differences', D.Ea - D.Eb - (D.Wa - D.Wb)] };
    L.board.innerHTML = `<h3>Average staff per café (synthetic)</h3>${table(['', 'Before', 'After', 'Change'], [['West Town (no change)', show('Wb'), show('Wa'), all ? fmt(D.Wa - D.Wb) : '?'], ['East Town (wage floor raised)', show('Eb'), show('Ea'), all ? fmt(D.Ea - D.Eb) : '?']])}<div class="lab-row">${cells.map(([k, t]) => button('c' + k, (s.seen[s.world + k] ? '✓ ' : 'Count: ') + t, false, s.seen[s.world + k] ? 'selected' : '')).join('')}</div>${s.pre ? `<p class="note">The year before: West ${fmt(D.Wp)} → ${fmt(D.Wb)}, East ${fmt(D.Ep)} → ${fmt(D.Eb)}. Both towns were losing one worker per café a year.</p>` : ''}`;
    L.controls.innerHTML = `<h3>Which comparison?</h3>${select('world', 'The year in question', [['quiet', 'A quiet year in West Town'], ['shock', 'A cannery closed in West Town mid-study']], s.world)}${Object.entries(E).map(([k, v]) => button('e' + k, (s.est[s.world + k] ? '✓ ' : '') + v[0], !all)).join('')}${button('pre', s.pre ? '✓ Year before checked' : 'Check the year before', !all || !!s.pre)}${table(['Comparison', 'Estimated effect on staff'], Object.entries(E).filter(([k]) => s.est[s.world + k]).map(([k, v]) => [v[0], (v[1] > 0 ? '+' : '') + fmt(v[1])]))}`;
    cells.forEach(([k, t]) => L.bind('c' + k, () => { if (!L.started()) return; s.seen[s.world + k] = 1; L.result(`${t}: ${fmt(D[k])} staff per café on average.`); L.change(); }));
    L.bind('world', () => { s.world = L.val('world'); L.change(); }, 'change');
    Object.entries(E).forEach(([k, v]) => L.bind('e' + k, () => { s.est[s.world + k] = 1; L.result(`${v[0]}: ${(v[1] > 0 ? '+' : '') + fmt(v[1])} staff per café.${k === 'ba' ? ' That includes everything else that changed in East Town this year.' : k === 'cross' ? ' That includes every lasting difference between the towns.' : s.world === 'shock' ? ' The cannery closure hit West Town alone, so this now mixes the closure with the wage floor.' : ' West Town’s change stands in for what East Town would have done anyway.'}`); L.change(); }));
    L.bind('pre', () => { s.pre = true; L.result('The year before the change, both towns lost one worker per café. The trends were parallel then, which supports the comparison but cannot prove it for the study year.'); L.change(); });
    const q = (k) => s.est['quiet' + k];
    L.ready(() => q('ba') && q('cross') && q('did') && !!s.pre, () => `In the quiet year, before-and-after in East Town said +1.0, East against West said −1.0, and the difference in differences said +3.0 staff per café. The towns had moved in parallel the year before.${s.est.shockdid ? ' With a cannery closing in West Town, the same calculation said +6.0, mixing the closure with the wage floor.' : ''}`);
  };

  // 28 — a lottery decides who is asked
  const METHODS = { door: ['Knock on the door', 0.35, 0.1], phone: ['Telephone', 0.5, 0.02], post: ['Post a card', 1, 0.006] };
  function campaign(assign, method) {
    const r = rng(2801 + (assign === 'lottery' ? 0 : 5)), [, contact, effect] = METHODS[method], n = 2000, T = [], C = [];
    for (let i = 0; i < n; i++) { const friendly = i < n / 2, treated = assign === 'lottery' ? r() < 0.5 : r() < (friendly ? 0.8 : 0.2), base = friendly ? 0.55 : 0.35, reached = treated && r() < contact, voted = r() < base + (reached ? effect : 0); (treated ? T : C).push(voted ? 1 : 0); }
    return { t: avg(T), c: avg(C), est: avg(T) - avg(C), truth: contact * effect };
  }
  labs[28] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.assign = s.assign || 'choice'; s.method = s.method || 'door'; const A = { choice: 'Volunteers choose their streets', lottery: 'A lottery chooses the households' }, last = s.last ? campaign(s.last.assign, s.last.method) : null;
    L.board.innerHTML = `<h3>Turnout on the day</h3>${last ? bars([['Reminded', last.t * 100, 100], ['Not reminded', last.c * 100, 100]], '%') + `<p>Estimated effect of being on the list: <b>${(last.est > 0 ? '+' : '') + fmt(last.est * 100)} points</b>.</p>` : '<p class="muted">No campaign yet.</p>'}<p class="note">Half the households live on streets where people vote more anyway. Volunteers like those streets. Outcomes are simulated from stated rates.</p>`;
    L.controls.innerHTML = `<h3>Plan the campaign</h3>${select('assign', 'Who gets the reminder?', Object.entries(A), s.assign)}${select('method', 'How?', Object.entries(METHODS).map(([k, v]) => [k, v[0]]), s.method)}${button('run', 'Run the campaign')}${table(['List drawn by', 'Method', 'Estimate', 'Built-in effect'], s.runs.map((r) => [A[r.assign], METHODS[r.method][0], fmt(r.est * 100) + ' pts', s.runs.some((x) => x.assign === 'lottery') ? fmt(r.truth * 100) + ' pts' : '?']))}`;
    L.bind('assign', () => { s.assign = L.val('assign'); L.save(); }, 'change'); L.bind('method', () => { s.method = L.val('method'); L.save(); }, 'change');
    L.bind('run', () => { if (!L.started()) return; const o = campaign(s.assign, s.method); s.last = { assign: s.assign, method: s.method }; if (!s.runs.some((r) => r.assign === s.assign && r.method === s.method)) s.runs.push({ assign: s.assign, method: s.method, est: o.est, truth: o.truth }); L.result(`${A[s.assign]}, ${METHODS[s.method][0].toLowerCase()}: turnout ${pct(o.t)} among the reminded, ${pct(o.c)} among the rest. Estimate: ${fmt(o.est * 100)} points.${s.assign === 'choice' ? ' But the volunteers picked streets that vote more anyway.' : ` About ${pct(METHODS[s.method][1])} of the listed households were actually reached.`}`); L.change(); });
    const g = (a) => s.runs.find((r) => r.assign === a && r.method === 'door');
    L.ready(() => !!g('choice') && !!g('lottery'), () => `When volunteers chose their streets, door-knocking appeared to raise turnout by ${fmt(g('choice').est * 100)} points. When a lottery drew the list, the estimate was ${fmt(g('lottery').est * 100)} points, against a built-in effect of ${fmt(g('lottery').truth * 100)}.`);
  };

  // 29 — returns and growth
  labs[29] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.r = s.r || '5'; s.g = s.g || '1.5'; s.tax = s.tax || '0'; s.spend = s.spend || '0';
    const net = (o) => (Number(o.r) / 100) * (1 - Number(o.tax) / 100) * (1 - Number(o.spend)), path = (o) => Array.from({ length: 6 }, (_, d) => 20 * Math.pow((1 + net(o)) / (1 + Number(o.g) / 100), d * 10)), last = s.last ? path(s.last) : null;
    L.board.innerHTML = `<h3>The fortune, in years of the average wage</h3>${last ? bars(last.map((v, d) => [d ? `After ${d * 10} years` : 'Today', v, Math.max(120, ...last), 0])) : '<p class="muted">Set the dials and run fifty years.</p>'}<p class="note">The fortune starts at twenty years of the average wage. It grows at the return that is kept and reinvested; the wage grows with the economy.</p>`;
    L.controls.innerHTML = `<h3>Set the world</h3>${select('r', 'Return on the fortune', [['3', '3% a year'], ['5', '5% a year']], s.r)}${select('g', 'Growth of the economy', [['1.5', '1.5% a year'], ['3', '3% a year'], ['5', '5% a year']], s.g)}${select('tax', 'Tax on returns', [['0', 'None'], ['30', '30%']], s.tax)}${select('spend', 'Heirs spend', [['0', 'Nothing: every return is reinvested'], ['0.5', 'Half of each year’s return']], s.spend)}${button('run', 'Run fifty years')}${table(['Kept return', 'Growth', 'Fortune after 50 years'], s.runs.map((o) => [fmt(net(o) * 100) + '%', o.g + '%', Math.round(path(o)[5]) + ' years of wages']))}`;
    for (const k of ['r', 'g', 'tax', 'spend']) L.bind(k, () => { s[k] = L.val(k); L.save(); }, 'change');
    L.bind('run', () => { if (!L.started()) return; const o = { r: s.r, g: s.g, tax: s.tax, spend: s.spend }, p = path(o); s.last = o; if (!s.runs.some((x) => JSON.stringify(x) === JSON.stringify(o))) s.runs.push(o); L.result(`Kept return ${fmt(net(o) * 100)}% against growth of ${o.g}%: after fifty years the fortune is worth ${Math.round(p[5])} years of the average wage (it began at 20). ${net(o) * 100 > Number(o.g) ? 'The fortune outruns the economy.' : 'The economy keeps pace, and the fortune shrinks beside it.'}`); L.change(); });
    const up = () => s.runs.find((o) => net(o) * 100 > Number(o.g)), down = () => s.runs.find((o) => net(o) * 100 <= Number(o.g));
    L.ready(() => s.runs.length >= 3 && !!up() && !!down(), () => `With a kept return of ${fmt(net(up()) * 100)}% and growth of ${up().g}%, a fortune of 20 years’ wages became ${Math.round(path(up())[5])} in fifty years. With ${fmt(net(down()) * 100)}% against ${down().g}%, it became ${Math.round(path(down())[5])}.`);
  };

  // 30 — exposure, observed and assigned
  function exposure(design) {
    const r = rng(3001), noise = () => (r() + r() + r() - 1.5) * 1.2, rows = [];
    for (let i = 0; i < 600; i++) { const side = i % 2 ? 'Hill' : 'Harbour', mixer = r() < 0.2, base = 4.6 - (mixer ? 1.0 : 0) + noise(); let treated, read = false, y = base; if (design === 'observe') treated = mixer; else { treated = r() < 0.5; read = treated && r() < 0.6; y += read ? (side === 'Hill' ? 0.6 : 0.1) : 0; } rows.push({ side, treated, read, y }); }
    const m = (f) => avg(rows.filter(f).map((x) => x.y)), by = (sd) => m((x) => x.treated && x.side === sd) - m((x) => !x.treated && x.side === sd);
    return { all: m((x) => x.treated) - m((x) => !x.treated), hill: by('Hill'), harbour: by('Harbour'), readShare: rows.filter((x) => x.read).length / Math.max(1, rows.filter((x) => x.treated).length) };
  }
  labs[30] = (L) => {
    const { s } = L; s.runs = s.runs || []; s.design = s.design || 'observe'; const D = { observe: 'Compare people who already follow both sides', assign: 'Assign the other side’s feed by lottery for a month' }, last = s.last ? exposure(s.last) : null, sign = (v) => (v > 0 ? '+' : '') + fmt(v, 2);
    L.board.innerHTML = `<h3>Distance from the other side (1 close · 7 far)</h3>${last ? bars([['Hill residents', Math.abs(last.hill), 1.5, 2], ['Harbour residents', Math.abs(last.harbour), 1.5, 2]]) + `<p>${s.last === 'observe' ? 'People who follow both sides sit' : 'Those assigned the feed ended'} <b>${sign(last.all)}</b> points ${last.all < 0 ? 'closer to' : 'further from'} the other side than the rest. Hill: ${sign(last.hill)} · Harbour: ${sign(last.harbour)}.</p>` : '<p class="muted">No study yet.</p>'}<p class="note">Six hundred invented residents. Bars show the size of the difference; the text gives its direction.</p>`;
    L.controls.innerHTML = `<h3>Choose a design</h3>${select('design', 'Study', Object.entries(D), s.design)}${button('run', 'Run the study')}${table(['Design', 'Difference', 'Reading'], s.runs.map((r) => [D[r.design], sign(r.all), r.design === 'observe' ? 'who chooses to follow both' : `what the feed did (${pct(r.readShare)} read it)`]))}`;
    L.bind('design', () => { s.design = L.val('design'); L.save(); }, 'change');
    L.bind('run', () => { if (!L.started()) return; const o = exposure(s.design); s.last = s.design; if (!s.runs.some((r) => r.design === s.design)) s.runs.push({ design: s.design, all: o.all, hill: o.hill, harbour: o.harbour, readShare: o.readShare }); L.result(s.design === 'observe' ? `People who already follow both sides are ${fmt(Math.abs(o.all), 2)} points closer to the other side. They chose their feeds, and may have been moderate before they did.` : `Assigned by lottery, the feed shifted Hill residents ${sign(o.hill)} and Harbour residents ${sign(o.harbour)} points in distance from the other side (positive is further away). About ${pct(o.readShare)} of those assigned actually read it. Neither side moved meaningfully closer.`); L.change(); });
    const g = (d) => s.runs.find((r) => r.design === d);
    L.ready(() => !!g('observe') && !!g('assign'), () => `Residents who already followed both sides were ${fmt(Math.abs(g('observe').all), 2)} points closer to the other side. When the feed was assigned by lottery, Hill residents shifted ${sign(g('assign').hill)} and Harbour residents ${sign(g('assign').harbour)} points in distance: exposure did not bring either side meaningfully closer.`);
  };

  // ---------- the frame every lab shares ----------
  function mount(container, enc, api) {
    const id = Number(enc.id), D = DEF[id]; if (!labs[id] || !D) { container.textContent = 'This encounter is unavailable.'; return; }
    const st = api.state || {}; st.lab = st.lab || {}; const s = st.lab, attempts = st.researchAttempts || (st.researchAttempts = { errors: 0, failed: false });
    const tr = [['universal', 'Treat this small result as the final explanation for every district.'], ['evidence', D.transfer], ['ignore', 'Skip further evidence and act on the result across the city at once.']], order = [tr[id % 3], tr[(id + 1) % 3], tr[(id + 2) % 3]];
    container.innerHTML = `<article class="atlas-lab"><div class="lab-kicker">Research encounter ${id} / ${SA.Encounters.count} · synthetic teaching data</div><h2>${esc(enc.title)}</h2><p>${esc(D.brief)}</p><label>1. Make a prediction before collecting evidence<select id="lab-prediction">${options([['', 'Choose a prediction…'], ['different', 'I expect the comparison to change the result.'], ['same', 'I expect a similar result.'], ['uncertain', 'I am uncertain; I will compare the evidence.']], st.prediction)}</select></label><div class="lab-work"><section class="lab-board" aria-label="Interactive experiment"></section><section class="lab-controls" aria-label="Experiment commands"></section></div><div class="lab-result" role="status" aria-live="polite"></div><div class="lab-topline"><button type="button" id="lab-hint">Show a hint</button><span class="lab-progress"></span></div><p id="lab-hint-text" class="note"></p><section class="lab-finish"><p><strong>Test the boundary.</strong> ${esc(D.limit)}</p><label class="lab-check"><input type="checkbox" id="lab-limit" ${st.limit ? 'checked' : ''}><span>I can distinguish this result from a claim about every real-world case.</span></label><label>3. Transfer the method: what is a useful next step in Bellwether?<select id="lab-transfer">${options([['', 'Choose a follow-up…'], ...order], st.transfer)}</select></label><label>Optional field note<textarea id="lab-note" placeholder="What did you revise, and what remains unknown?">${esc(st.note || '')}</textarea></label><button type="button" id="lab-submit">Connect evidence to the Atlas</button><div class="lab-feedback" aria-live="polite"></div></section></article>`;
    const q = (sel) => container.querySelector(sel), board = q('.lab-board'), controls = q('.lab-controls');
    let condition = () => false, evidence = () => '', result = '', interacted = false, over = false, sessionFailed = false;
    const save = () => api.save && api.save(), failed = () => sessionFailed || (typeof api.isFailed === 'function' ? !!api.isFailed() : !!attempts.failed);
    const interact = () => { if (interacted || st.completed || failed()) return; interacted = true; if (api.interact) api.interact(); };
    const lock = () => { container.querySelectorAll('button,input,select,textarea').forEach((el) => { if (el.id !== 'lab-hint') el.disabled = true; }); };
    const blocked = () => { if (!failed()) return false; q('.lab-feedback').textContent = 'This attempt has ended after five incorrect answers. Retry from the panel below or return to campus.'; lock(); return true; };
    const autoHint = (errors) => { if (errors < 2) return; st.autoHint = errors >= 3 ? `Automatic help (${errors}/5): ${D.hints[2]} The experiment establishes a limited result, so the follow-up should test it with new observations: ${D.transfer}` : `Automatic hint (2/5): ${D.hints[1]} For Bellwether, choose the follow-up that gathers evidence able to challenge the first explanation.`; q('#lab-hint-text').textContent = st.autoHint; };
    const submit = (correct, reason) => { if (st.completed) return { replay: true, errors: attempts.errors || 0, failed: false }; if (failed()) return { failed: true, errors: attempts.errors }; const res = (api.submit && api.submit({ correct, reason, encounterId: id, answer: st.transfer })) || {}; if (Number.isFinite(res.errors)) attempts.errors = res.errors; else if (!correct) attempts.errors = (attempts.errors || 0) + 1; attempts.failed = !!res.failed || attempts.errors >= 5; if (!correct) autoHint(attempts.errors); save(); if (attempts.failed) { sessionFailed = true; q('.lab-feedback').textContent = 'Five incorrect answers. This attempt is over; your completed research stays in the notebook.'; lock(); if (!over) { over = true; if (api.gameOver) api.gameOver({ encounterId: id, errors: attempts.errors, reason }); } } return { ...res, errors: attempts.errors, failed: attempts.failed }; };
    const L = { s, board, controls, st, save, bind: (bid, fn, event = 'click') => { const el = q('#' + bid); if (el) el.addEventListener(event, (ev) => { if (blocked()) return; interact(); fn(ev); }); }, val: (vid) => (q('#' + vid) || {}).value, result: (text) => { result = text; q('.lab-result').textContent = text; }, ready: (fn, ev) => { condition = fn; evidence = ev; }, change: () => { save(); draw(); },
      started: () => { if (blocked()) return false; if (!st.prediction) { q('.lab-feedback').textContent = 'Record a prediction first. It is not scored as right or wrong.'; q('#lab-prediction').focus(); return false; } q('.lab-feedback').textContent = ''; return true; } };
    function draw() { board.innerHTML = ''; controls.innerHTML = ''; labs[id](L); q('.lab-progress').textContent = condition() ? 'Experiment evidence ready · record your boundary and transfer.' : 'Experiment in progress · make the comparison described above.'; if (!result) q('.lab-result').textContent = 'Your observations will appear here. Every figure is computed from the rules shown or is labelled synthetic.'; if (st.autoHint) q('#lab-hint-text').textContent = st.autoHint; if (failed()) lock(); }
    q('#lab-prediction').addEventListener('change', (ev) => { if (blocked()) return; if (ev.target.value) interact(); st.prediction = ev.target.value; save(); });
    q('#lab-limit').addEventListener('change', (ev) => { if (blocked()) return; interact(); st.limit = ev.target.checked; save(); });
    q('#lab-transfer').addEventListener('change', (ev) => { if (blocked()) return; if (ev.target.value) interact(); st.transfer = ev.target.value; save(); });
    q('#lab-note').addEventListener('input', (ev) => { if (blocked()) return; st.note = ev.target.value; save(); });
    q('#lab-hint').addEventListener('click', () => { st.hint = Math.min((st.hint || 0) + 1, 3); q('#lab-hint-text').textContent = D.hints[st.hint - 1]; save(); });
    q('#lab-submit').addEventListener('click', () => {
      const out = q('.lab-feedback');
      if (st.completed) { out.textContent = 'This encounter is already recorded. Replays do not award another completion or speed reward.'; return; }
      if (blocked()) return; if (!st.prediction) { out.textContent = 'Make a prediction before submitting.'; return; }
      if (!condition()) { out.textContent = 'Make the comparison first. The hints explain what remains.'; return; }
      if (!st.limit) { out.textContent = 'Read the boundary of this experiment and acknowledge it.'; return; }
      if (!st.transfer) { out.textContent = 'Choose a follow-up before submitting. An empty answer does not use an attempt.'; return; }
      if (st.transfer !== 'evidence') { const g = submit(false, 'transfer'); if (!g.failed) out.textContent = `That follow-up overstates the evidence. ${g.errors}/5 incorrect answers. Choose a study that can test the result.`; return; }
      const g = submit(true, 'bounded-transfer'); if (g.failed || g.correct === false) return; st.completed = true; save(); if (api.sound) api.sound('complete');
      api.complete(`${enc.title}: ${evidence()} Limitation: ${D.limit} Follow-up: ${D.transfer}${st.note ? ' Field note: ' + st.note : ''}`); out.textContent = 'Evidence connected. Your finding and its limitation are in the field notebook.';
    });
    draw();
  }
  SA.Labs2 = { mount, defs: DEF, labs, kit: { esc, rng, avg, fmt, pct, options, select, button, bars, table, dots }, _test: { count, diffuse, panel, agree, letters, workers, tournament, campaign, exposure } };
})();
