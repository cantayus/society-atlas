/* The Society Atlas V2 — progression: insight, ranks, achievements, collections,
   easter eggs (two per campus), the Bellwether Gazette and travel events.
   All of it is original fiction layered on the research encounters. */
(function () {
  'use strict';
  const SA = window.SA, esc = SA.esc, P = {};
  const save = () => SA.save;
  P.insight = () => { const s = save(); return ((window.AtlasChallenge && window.AtlasChallenge.total(s.challenges)) || 0) + (s.bonus || 0) - (s.spent || 0); };
  const RANKS = [[0, 'First-year PhD student'], [2, 'Research assistant'], [6, 'PhD candidate'], [12, 'Doctoral fellow'], [18, 'Postdoctoral scholar'], [24, 'Visiting professor'], [30, 'Atlas laureate']];
  P.rank = () => { const n = save().completed.length; let i = 0; while (i < RANKS.length - 1 && n >= RANKS[i + 1][0]) i++; const next = RANKS[i + 1]; return { index: i, name: RANKS[i][1], progress: next ? (n - RANKS[i][0]) / (next[0] - RANKS[i][0]) : 1, next: next ? next[1] : null }; };
  P.bonus = (n, why) => { save().bonus = (save().bonus || 0) + n; if (why) SA.UI.toast(`<b>+${n} insight</b> · ${esc(why)}`); SA.persist(); };
  P.HYP = { information: [3, 6, 7, 8, 19, 21, 24, 30], travel: [1, 11, 14, 21], rules: [4, 16, 18, 20, 22], measurement: [1, 9, 10, 11, 12, 23, 25], preferences: [2, 5, 13, 15, 17, 26, 27, 28, 29] };

  P.ACH = [
    { id: 'first', name: 'The missing street', text: 'Complete your first research encounter.', test: (s) => s.completed.length >= 1 },
    { id: 'six', name: 'Candidate', text: 'Add six methods to your notebook.', test: (s) => s.completed.length >= 6 },
    { id: 'eighteen', name: 'The original eighteen', text: 'Add eighteen methods to your notebook.', test: (s) => s.completed.length >= 18 },
    { id: 'thirty', name: 'The whole Atlas', text: 'Complete every encounter in the Atlas.', test: (s) => s.completed.length >= SA.Encounters.count },
    { id: 'world', name: 'Further afield', text: 'Complete three visits outside the United States.', test: (s) => s.completed.filter((id) => (SA.Campuses[(SA.VISITS[id] || {}).uni] || {}).abroad || id === 21 || id === 29).length >= 3 },
    { id: 'quick', name: 'Quick study', text: 'Earn three Quick Insight awards.', test: (s) => Object.values(s.challenges).filter((c) => c && c.award && c.award.points >= 100).length >= 3 },
    { id: 'field', name: 'Boots on the ground', text: 'Finish ten pieces of fieldwork.', test: (s) => Object.values(s.tasks).filter((t) => t.done).length >= 10 },
    { id: 'sketch5', name: 'A full page', text: 'Find all five field sketches on one campus.', test: (s) => Object.values(s.collect.sketches).some((a) => a.length >= 5) },
    { id: 'sketch25', name: 'Sketchbook', text: 'Find twenty-five field sketches.', test: (s) => Object.values(s.collect.sketches).reduce((a, b) => a + b.length, 0) >= 25 },
    { id: 'stamps', name: 'Stamped', text: 'Collect ten landmark stamps.', test: (s) => s.collect.stamps.length >= 10 },
    { id: 'cards', name: 'From the archives', text: 'Collect eight archive cards.', test: (s) => s.collect.cards.length >= 8 },
    { id: 'cat', name: 'The Atlas cat', text: 'Meet the cat on five campuses.', test: (s) => s.collect.cats.length >= 5 },
    { id: 'eggs10', name: 'Local knowledge', text: 'Find ten campus secrets.', test: (s) => Object.keys(s.collect.pokes).length >= 10 },
    { id: 'eggs30', name: 'Folklorist', text: 'Find thirty campus secrets.', test: (s) => Object.keys(s.collect.pokes).length >= 30 },
    { id: 'talk', name: 'Good listener', text: 'Talk with fifteen people on campus.', test: (s) => Object.keys(s.talked).length >= 15 },
    { id: 'abroad', name: 'Across the water', text: 'Complete a visit in Lund and in Paris.', test: (s) => s.completed.includes(21) && s.completed.includes(29) },
    { id: 'night', name: 'Lamplight', text: 'Still be on a campus when the lamps come on.', test: (s) => !!s.stats.night },
    { id: 'walker', name: 'Shoe leather', text: 'Walk five thousand steps.', test: (s) => s.stats.steps >= 5000 },
    { id: 'colloquium', name: 'A question worth taking seriously', text: 'Present your proposal at the Bellwether colloquium.', test: (s) => !!s.proposal },
  ];
  P.check = () => { const s = save(); for (const a of P.ACH) if (!s.achievements[a.id] && a.test(s)) { s.achievements[a.id] = Date.now(); SA.UI.toast(`<b>Achievement</b> · ${esc(a.name)}`); SA.Audio.sfx('rank'); s.bonus = (s.bonus || 0) + 10; } };

  // ---------- easter eggs: two per campus ----------
  // thing: an interactable placed by the campus plan; prop: the first prop of that kind;
  // spot: behind (the landmark), bridge, shore; event: tram, cat, bell, night.
  P.EGGS = {
    penn: [{ event: 'tram', title: 'The avenue tram', text: 'The conductor tips his cap as the car clatters past. Who lives within a walk of the line is a research question in itself.' }, { spot: 'behind', title: 'Behind College Hall', text: 'Someone has chalked a tally on the back wall: every street, counted twice, and one street more than the map shows.' }],
    harvard: [{ thing: 'shoe', title: 'The lucky shoe', text: 'Polished by a century of hopeful hands. You rub it too. The effect size is unknown.' }, { spot: 'bridge', title: 'On the footbridge', text: 'A coxswain calls the stroke to eight rowers. You find yourself counting: a time series, with oars.' }],
    indiana: [{ prop: 'fountain', title: 'The plaza fountain', text: 'Students insist that part of this fountain goes missing every few years and returns without comment.' }, { spot: 'bridge', title: 'The little stream', text: 'A paper boat spins in an eddy, held by rules nobody wrote down. Somebody in the Workshop would have opinions.' }],
    ucla: [{ thing: 'bear', title: 'The bronze bear', text: 'His paw is worn smooth. Before big games, students box him up so nobody can paint him the rival’s colors.' }, { thing: 'fountain', title: 'The inward fountain', text: 'The water runs toward the middle and vanishes. First-years are told not to touch it until they graduate.' }],
    notreDame: [{ thing: 'grotto', title: 'The grotto', text: 'You light a candle. Hundreds flicker in the rock, each a small private hypothesis.' }, { spot: 'shore', title: 'By the lake', text: 'Two swans patrol the water like co-authors who have stopped speaking.' }],
    columbia: [{ thing: 'owl', title: 'The hidden owl', text: 'There it is, tucked in a fold of the robe. Legend says the first student of each class to find it will finish top.' }, { thing: 'subway', title: 'The grate', text: 'A train rumbles underneath. For a moment the whole campus is a seismograph.' }],
    mit: [{ thing: 'smoots', title: 'A peculiar unit', text: 'The bridge is marked off in a unit of one student’s height, painted here since a fraternity measured it with him.' }, { thing: 'domecar', spot: 'behind', title: 'Look up', text: 'Tradition holds that improbable objects sometimes appear on the dome overnight. Tonight: nothing. Or nothing yet.' }],
    northeastern: [{ thing: 'dog', title: 'The bronze nose', text: 'You rub it for luck, as everyone does. The nose shines like a new coin.' }, { event: 'tram', title: 'Streetcar on the avenue', text: 'The streetcar hisses to a stop. Half the university steps off, eyes on phones, navigating by habit.' }],
    stanford: [{ thing: 'fountainhop', title: 'Fountain hopping', text: 'You climb in. So, apparently, does everyone, eventually. The water is warmer than science would predict.' }, { spot: 'behind', title: 'Behind the church', text: 'The sandstone glows. A cyclist passes with no hands, eating lunch, entirely at peace.' }],
    pennState: [{ thing: 'lion', title: 'The stone lion', text: 'Students guard him through the night before the big game. He has the air of someone used to it.' }, { thing: 'icecream', title: 'The creamery', text: 'One flavour only per cone: house rules. You accept the constraint and optimise within it.' }],
    washu: [{ thing: 'underpass', title: 'The painted underpass', text: 'Tonight’s layer announces a bake sale. Under it lie decades of earlier announcements, a stratigraphy of student life.' }, { spot: 'shore', title: 'The pond', text: 'A turtle regards you from a log with the calm of tenure.' }],
    cmu: [{ thing: 'fence', title: 'The Fence', text: 'You add a coat. Custom says it may only be painted after midnight, with brushes, and must be guarded till dawn.' }, { event: 'piper', title: 'The piper', text: 'The pipes carry across the lawn. This university will teach you to play them, for credit.' }],
    princeton: [{ thing: 'gate', title: 'The front gate', text: 'Undergraduates will not walk out through the middle gate before graduation. You go around. Just in case.' }, { thing: 'tigers', title: 'The bronze tigers', text: 'Generations of children have climbed these two. Their backs are polished to gold.' }],
    chicago: [{ thing: 'gargoyle', title: 'Gargoyles', text: 'One of them appears to be reading. Another appears to be grading.' }, { thing: 'pond', title: 'The frozen pond', text: 'Beneath the ice the ducks’ summer territory waits. A sign reminds you where fun goes, and you smile.' }],
    michigan: [{ thing: 'cube', title: 'The Cube', text: 'It turns at a push, tonnes of steel on a single point. Tradition says the university president starts it spinning each morning.' }, { event: 'cat', title: 'Bold squirrels', text: 'The squirrels here are famous and know it. One inspects your pockets with professional interest.' }],
    yale: [{ thing: 'toe', title: 'The golden toe', text: 'Rubbed for luck before exams. The rest of the statue has weathered; the toe has not been allowed to.' }, { thing: 'carillon', title: 'The practice bell', text: 'You ring it once. Somewhere above, the real carillon answers, or the wind does.' }],
    rochester: [{ thing: 'tunnel', title: 'The painted tunnel', text: 'Every surface is covered in club slogans, layered like tree rings. Winter is long here; the tunnels are how the campus stays connected.' }, { thing: 'lilacs', title: 'Lilac season', text: 'The whole walk smells of lilac, and the lawns are freckled with dandelions. The city holds a festival for the first; the university took the second as its emblem.' }],
    duke: [{ thing: 'tents', title: 'The tent village', text: 'Students camp here for weeks to earn a seat at one game. Demand revealed, in canvas.' }, { thing: 'koi', title: 'The koi pond', text: 'The fish assemble instantly. They have learned the association and do not care about the mechanism.' }],
    lund: [{ thing: 'magnolia', title: 'Under the magnolias', text: 'When these bloom, the town knows spring has arrived and that May Day speeches are near.' }, { prop: 'fountain', title: 'The round fountain', text: 'Students in white caps gather here to sing. Even the pigeons seem to know the tune.' }],
    paris: [{ thing: 'cafe', title: 'Un café', text: 'You order at the counter, where it is cheaper. Price discrimination, served hot.' }, { thing: 'ducks', title: 'The park lake', text: 'An old man feeds the ducks unequally. The top tenth of ducks is doing very well.' }],
    bellwether: [{ thing: 'gate', title: 'The evening gate', text: 'A small brass plate gives the closing hour. It is earlier than the festival program assumes.' }, { prop: 'fountain', title: 'The market fountain', text: 'Coins on the bottom, mostly from the west side of town. You note it and feel slightly ridiculous.' }],
  };
  P.eggFound = (key, i) => { const s = save(), id = key + ':' + i; if (s.collect.pokes[id]) return false; s.collect.pokes[id] = 1; const e = P.EGGS[key][i]; s.bonus = (s.bonus || 0) + 5; SA.Audio.sfx('collect'); SA.UI.modal({ title: e.title, kicker: 'A campus secret · +5 insight', cls: 'narrow', body: `<p style="font-family:var(--serif);font-size:1.15em;line-height:1.55">${esc(e.text)}</p><p class="small muted">${Object.keys(s.collect.pokes).filter((k) => k.startsWith(key + ':')).length} of 2 found here. Campus lore, lightly told; do check it before citing it.</p>`, footer: '<button class="btn primary" data-close>Lovely</button>' }); SA.Mentors.say('egg'); SA.persist(); P.check(); return true; };

  // ---------- collections ----------
  P.collectionsHTML = () => {
    const s = save(), unis = Object.keys(SA.Campuses), sk = Object.values(s.collect.sketches).reduce((a, b) => a + b.length, 0);
    const set = (title, n, of, body) => `<div class="card"><div class="eyebrow">${n} of ${of}</div><h3>${title}</h3>${body}</div>`;
    return `<div class="grid g2">${set('Landmark stamps', s.collect.stamps.length, unis.length, `<div class="row">${unis.map((k) => `<span class="chip" style="${s.collect.stamps.includes(k) ? '' : 'opacity:.3'}">${s.collect.stamps.includes(k) ? '◉' : '○'} ${esc(SA.Campuses[k].landmark.name)}</span>`).join('')}</div>`)}
      ${set('Field sketches', sk, SA.Encounters.count * 5, '<p class="small muted">Five are hidden on every visit. Look for a glint on the ground.</p>')}
      ${set('Archive cards', s.collect.cards.length, SA.Encounters.count, s.collect.cards.map((id) => { const q = window.ATLAS_QUOTES?.chapters?.[id], e = SA.Encounters.get(id); return `<p class="small">${q ? `“${esc(q.text)}” <span class="muted">— ${esc(q.author)}</span>` : `<span class="muted">${esc(e.campus)}:</span> ${esc(SA.Campuses[SA.VISITS[id].uni].notes[0])}`}</p>`; }).join('') || '<p class="small muted">Visit each campus archive.</p>')}
      ${set('Campus secrets', Object.keys(s.collect.pokes).length, unis.length * 2, '<p class="small muted">Two on every campus: traditions, corners and things worth a second look.</p>')}
      ${set('The Atlas cat', s.collect.cats.length, unis.length, '<p class="small muted">The same cat. Every campus. Nobody can explain it.</p>')}</div>`;
  };

  // ---------- the Gazette ----------
  P.gazette = (enc, r) => {
    const s = save(), pts = r.award ? r.award.points : 0, name = s.player.name === 'You' ? 'A visiting fellow' : s.player.name, n = s.completed.length;
    const head = pts >= 100 ? `Fellow Cracks “${enc.title}” Before the Kettle Boils` : r.errors >= 3 ? `After False Starts, Fellow Gets to the Bottom of “${enc.title}”` : pts >= 50 ? `Steady Work Settles “${enc.title}”` : `“${enc.title}”: Patience Rewarded`;
    const briefs = ['The evening gate closed on time again, to nobody’s surprise east of the canal.', 'The festival committee met for three hours and adjourned to meet again.', 'A stallholder reports record takings; another reports the first has moved his pitch.', 'The tram was late. The timetable has issued no comment.', 'Lantern sellers ask residents to return last year’s lanterns. Few have.', 'The canal bridge is to be painted. The color remains in committee.'];
    const letters = ['“They keep asking why we don’t come. Has anyone asked what time we finish work?” — Eastbank', '“My invitation arrived the day after. I have kept it as a souvenir.” — Canal Lane', '“I hear the festival is lovely. I hear it from my cousin, who lives on the other side.” — Eastbank', '“Count us properly before you explain us.” — a resident', '“If the map says we are connected, the map should try walking it after dark.” — Eastbank'];
    const z = { id: enc.id, dateline: `Bellwether · issue ${n} · ${enc.campus}, ${enc.era}`, head, lead: `${name}, the city’s traveling research fellow, returned from ${enc.campus} with a new method: ${enc.method.toLowerCase()}. ${enc.evidence}`,
      sub: 'What it does not show', body: `${enc.limitation} Asked what this means for the festival, the fellow would say only: “${enc.transfer}”`, brief: briefs[n % briefs.length] + (r.task ? ' The fellow was seen doing fieldwork on foot, which several residents called a first.' : ''), letter: letters[n % letters.length] };
    s.gazette = s.gazette.filter((g) => g.id !== enc.id); s.gazette.push(z); return z;
  };

  // ---------- travel events ----------
  P.EVENTS = [
    { id: 'timetable', title: 'Two timetables', text: 'The station board and the printed timetable disagree by forty minutes.', choices: [['Trust the board', 'You make the train with seconds to spare. One observation, of course.', 3], ['Ask three passengers', 'Two say the board, one shrugs. You go with the majority and it works.', 4]], needs: 10, smart: ['Check which one was updated last', 'The printed sheet is last season’s. A measurement drifted while nobody looked. You board calmly.', 10] },
    { id: 'curse', title: 'The cursed festival', text: 'A fellow passenger insists that every town with a festival has more rain.', choices: [['Nod politely', 'He goes on for an hour. It rains.', 2], ['Ask where he heard it', 'From a cousin. The cousin sells umbrellas.', 4]], needs: 5, smart: ['Ask what causes both', 'Festivals are held in late summer; so is the rain. He looks at you as if you had done a magic trick.', 10] },
    { id: 'posters', title: 'The poster hall', text: 'A conference fills the station hotel. Two hundred posters, forty minutes.', choices: [['Read every poster', 'You reach the letter C and miss your connection.', 1], ['Read the nearest three', 'One of them is rather good.', 4]], needs: 14, smart: ['Stop at the first good-enough one', 'You set a threshold, find a fine poster on the sixth try, and still have time for tea.', 10] },
    { id: 'seat', title: 'The seat swap', text: 'Three travelers each want a different seat from the one they hold.', choices: [['Stay out of it', 'They argue as far as the border.', 2], ['Suggest they draw lots', 'Fair, and nobody is happy.', 3]], needs: 16, smart: ['Find the swap that leaves no envious pair', 'Everyone moves once. A stable match, and a round of thanks.', 10] },
    { id: 'rumour', title: 'A rumour on the platform', text: 'Word spreads that the next train is cancelled. Half the platform leaves.', choices: [['Leave too', 'The train arrives two minutes later, half empty.', 1], ['Wait and see', 'The train arrives. You get a window seat.', 5]], needs: 8, smart: ['Ask how many people each person heard it from', 'One loud man, heard many times. You stay, and tell the others why.', 10] },
    { id: 'survey', title: 'A satisfaction survey', text: 'A clerk hands survey cards only to passengers in the first-class lounge.', choices: [['Fill it in', 'You rate the biscuits highly.', 2], ['Decline', 'The clerk ticks a box anyway.', 2]], needs: 1, smart: ['Ask who never gets a card', 'The clerk blinks, then walks the whole train. The answers change by the third carriage.', 10] },
    { id: 'shortcut', title: 'The shortcut', text: 'A porter knows a shortcut across the yards. Everyone who has taken it speaks well of it.', choices: [['Take it', 'It works. You wonder briefly about the people you did not hear from.', 4], ['Keep to the road', 'Longer, duller, certain.', 3]], needs: 24, smart: ['Ask about those who never came back to say', 'The porter admits a few got lost and were not asked. You take the road.', 10] },
    { id: 'lottery', title: 'The upgrade lottery', text: 'The guard offers upgrades to whoever asks first.', choices: [['Ask first', 'You get the upgrade. The same people always do.', 3], ['Let others ask', 'A pleasant second-class journey.', 3]], needs: 17, smart: ['Suggest drawing seat numbers from a hat', 'The guard agrees. For once the quiet carriage wins something, and he can tell whether upgrades improve anyone’s mood.', 10] },
  ];
  P.travelEvent = (done) => {
    const s = save(), pool = P.EVENTS.filter((e) => !s.events.includes(e.id)); if (!pool.length || s.completed.length < 1 || SA.hash(s.stats.travel, 3, 7) > 0.55) return done();
    const ev = pool[Math.floor(SA.hash(s.stats.travel, 5, 9) * pool.length)], smart = s.completed.includes(ev.needs), opts = ev.choices.map((c, i) => `<button class="btn" data-act="pick" data-i="${i}">${esc(c[0])}</button>`).join('') + (smart ? `<button class="btn primary" data-act="pick" data-i="s">${esc(ev.smart[0])} · ${esc(SA.Encounters.get(ev.needs).shortName)}’s method</button>` : '');
    s.events.push(ev.id);
    SA.UI.modal({ title: ev.title, kicker: 'On the way', cls: 'narrow', sticky: true, body: `<p style="font-family:var(--serif);font-size:1.15em">${esc(ev.text)}</p><div class="choices" id="ev-c">${opts}</div><div id="ev-r"></div>`,
      on: { pick: (b) => { const c = b.dataset.i === 's' ? ev.smart : ev.choices[+b.dataset.i]; document.getElementById('ev-c').remove(); document.getElementById('ev-r').innerHTML = `<p>${esc(c[1])}</p><p class="small" style="color:var(--gold)">+${c[2]} insight</p><button class="btn primary" data-act="go">Travel on</button>`; s.bonus = (s.bonus || 0) + c[2]; SA.Audio.sfx('coin'); }, go: () => SA.UI.closeModal(true) }, onClose: done });
  };

  const JOKES = { 19: 'I asked a hundred people who influenced their vote. Ninety said “nobody”. Then they told me who.', 20: 'I designed a perfectly fair voting rule once. It was rejected, two to one.', 21: 'Good ideas travel slowly. Bad ones, I notice, have bicycles.', 22: 'Never invite more allies than you need. They all expect dessert.', 23: 'I asked the same question three times. I am told this is also how one raises children.', 24: 'It is a small world, but I would not want to forward the letters.',
    25: 'My data are excellent. It is only the people who are missing.', 26: 'Be nice, be provokable, be forgiving. It also works at faculty meetings. Sometimes.', 27: 'I compared two towns. Each insists the other is the control group.', 28: 'We knocked on a thousand doors. The dogs were all contacted.', 29: 'I have two centuries of tax records. The parties were not invited to comment.', 30: 'I followed the other side for a month. We agree on one thing: the other side should read more.' };
  P.joke = (id) => JOKES[id] || '';
  SA.Progress = P;
})();
