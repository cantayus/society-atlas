/* The Society Atlas V2 — campuses beyond the United States: Oxford, Cambridge, Zurich,
   Kyoto, Peking, Cape Town and Toronto. Each adds a plan, an encounter with its
   sources, fieldwork, a research problem, two campus secrets and a piece of music.
   Research anchors are real; towns, people and every number in play are invented. */
(function () {
  'use strict';
  const SA = window.SA, CK = SA.CampusKit;

  // ---------- campus plans ----------
  if (CK) {
    const { def, frame, plaza, entry, hall, alley, office } = CK;
    def('oxford', {
      name: 'University of Oxford', short: 'Oxford', city: 'Oxford, England', colors: ['#14284b', '#c9a23a'], abroad: true,
      wall: '#d9c594', roof: '#7d7a6e', style: 'gothic', path: 6, plaza: 6, trees: ['lime', 'elm', 'oak'], treeDensity: 0.05,
      landmark: { name: 'Radcliffe Camera', style: 'dome' },
      notes: ['A round library under a lead dome in a cobbled square, walled in by honey-coloured colleges.', 'Bicycles against every railing, and a college tower with a copper spire to the south-east.'],
      plan(P, v, T) {
        frame(P, T, {}); entry(P, T, 28, 44);
        plaza(P, T, 20, 15, 16, 14, T.COBBLE);
        P.build(25, 18, 6, 6, { type: 'landmark', style: 'dome', height: 80, role: 'landmark', name: 'Radcliffe Camera' });
        P.build(22, 6, 12, 6, { type: 'library', style: 'gothic', height: 60, role: 'library', name: 'Bodleian Library' });
        P.build(39, 14, 7, 9, { type: 'secondary', style: 'twintower', height: 70, name: 'All Souls College' });
        hall(P, 10, 15, 7, 8, 'Brasenose College', { style: 'gothic', height: 56 }); hall(P, 8, 5, 9, 5, 'Sheldonian Theatre', { style: 'gothic', height: 58 });
        P.build(24, 32, 8, 5, { type: 'secondary', style: 'cupola', height: 60, name: 'University Church' });
        P.build(8, 32, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 48 });
        office(P, 40, 30, 8, 6, v, { height: 50, style: 'gothic' });
        P.path([28, 44], [28, 38], 2, T.COBBLE, 'y'); P.path([20, 22], [17, 22], 1, T.COBBLE); P.path([36, 20], [39, 20], 1, T.COBBLE); P.path([33, 36], [40, 36], 1, T.COBBLE); P.path([14, 34], [23, 38], 1, T.COBBLE);
        for (const [x, y] of [[21, 16], [34, 16], [21, 27], [34, 27], [19, 12], [37, 26]]) P.prop('bikes', x, y);
        P.prop('statue', 19, 9, { figure: 'scholar' }); P.thing('emperors', 19, 10, 'Look at the stone heads'); P.thing('sighs', 37, 10, 'Look up at the bridge');
        P.pois.task = { x: 20, y: 24, w: 16, h: 6 };
      },
    });
    def('cambridge', {
      name: 'University of Cambridge', short: 'Cambridge', city: 'Cambridge, England', colors: ['#7a2f6a', '#d9d2bf'], abroad: true,
      wall: '#d7cfb8', roof: '#7a7f80', style: 'gothic', path: 3, plaza: 5, trees: ['willow', 'lime', 'elm', 'oak'], treeDensity: 0.06, season: 'summer',
      landmark: { name: "King's College Chapel", style: 'endTowers' },
      notes: ['A great stone chapel with four turrets above a clipped court, and lawns running down to the river.', 'Punts on the Cam, willows on the Backs, and a wooden bridge with a tall story attached.'],
      plan(P, v, T) {
        frame(P, T, {}); P.river('y', 7, 4, 1.1); P.line(4, 28, 14, 28, 2, T.BRIDGE); entry(P, T, 30, 44);
        P.build(20, 7, 15, 5, { type: 'landmark', style: 'endTowers', height: 92, role: 'landmark', name: "King's College Chapel" });
        P.fill(22, 15, 12, 10, T.GRASS); P.reserve(23, 16, 10, 8); P.fill(21, 14, 14, 1, T.STONE); P.fill(21, 25, 14, 1, T.STONE); P.fill(21, 14, 1, 12, T.STONE); P.fill(34, 14, 1, 12, T.STONE); P.prop('fountain', 28, 20);
        P.build(22, 28, 12, 4, { type: 'secondary', style: 'hall', height: 58, name: 'Gibbs Building', wall: '#e6dfcb' });
        hall(P, 37, 14, 4, 11, 'Gatehouse and Screen', { style: 'gothic', height: 50 });
        P.build(38, 30, 7, 5, { type: 'library', role: 'library', name: 'Marshall Library', height: 56 });
        P.build(15, 36, 6, 4, { type: 'archive', role: 'archive', name: 'Archive Centre', height: 48 });
        office(P, 42, 7, 7, 5, v, { height: 56 });
        P.path([30, 44], [30, 33], 2, T.STONE, 'y'); P.path([14, 28], [21, 28], 1, T.GRAVEL); P.path([35, 20], [37, 20], 1, T.STONE); P.path([41, 14], [45, 13], 1, T.STONE, 'y'); P.path([21, 38], [29, 38], 1, T.STONE);
        alley(P, 'willow', 13, 10, 13, 24, 4); P.boats.push({ x: 8, y: 16, len: 14, axis: 'y' }); P.boats.push({ x: 9, y: 38, len: 8, axis: 'y' });
        P.thing('punt', 12, 20, 'Watch the punts'); P.pois.task = { x: 22, y: 33, w: 14, h: 8 };
      },
    });
    def('zurich', {
      name: 'University of Zurich', short: 'Zurich', city: 'Zurich, Switzerland', colors: ['#1f4fa3', '#f1ede2'], abroad: true,
      wall: '#d9d2bf', roof: '#7d5a48', path: 5, plaza: 5, trees: ['lime', 'maple', 'birch', 'pine'], treeDensity: 0.06, season: 'autumn',
      landmark: { name: 'University of Zurich', style: 'clocktower' },
      notes: ['A domed tower on the hillside, with the polytechnic and its own dome next door.', 'A tram on the street below, and a small red funicular that climbs to the terrace.'],
      plan(P, v, T) {
        frame(P, T, { track: true }); entry(P, T, 24, 44);
        P.build(7, 9, 13, 7, { type: 'landmark', style: 'clocktower', height: 70, role: 'landmark', name: 'University of Zurich' });
        P.build(27, 7, 12, 6, { type: 'secondary', style: 'dome', height: 66, name: 'ETH Main Building', wall: '#dcd6c6' });
        plaza(P, T, 22, 16, 18, 5, T.STONE); for (let i = 0; i < 5; i++) P.prop('bench', 24 + i * 3.4, 20);
        P.build(36, 25, 7, 5, { type: 'library', role: 'library', name: 'Zentralbibliothek', height: 58 });
        P.build(6, 30, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 48 });
        hall(P, 9, 21, 8, 5, 'Institute Building', { height: 56 }); hall(P, 22, 25, 8, 5, 'Rämistrasse Hall', { height: 56 });
        office(P, 42, 36, 7, 5, v, { height: 56 });
        P.path([24, 44], [24, 31], 2, T.STONE, 'y'); P.path([24, 31], [24, 21], 1, T.STONE, 'y'); P.path([14, 17], [22, 18], 1, T.STONE); P.path([30, 34], [42, 40], 1, T.STONE, 'x'); P.path([12, 30], [22, 31], 1, T.STONE);
        P.prop('phonebox', 40, 45); P.thing('polybahn', 40, 44, 'Watch the funicular'); P.pois.tram = { x: 28, y: 50 }; P.pois.task = { x: 20, y: 31, w: 14, h: 10 };
      },
    });
    def('kyoto', {
      name: 'Kyoto University', short: 'Kyoto', city: 'Kyoto, Japan', colors: ['#1f3a7a', '#f1ede2'], abroad: true,
      wall: '#a8765a', roof: '#5d5a58', path: 3, plaza: 3, trees: ['cherry', 'maple', 'pine', 'goldtree', 'cherry'], treeDensity: 0.08, season: 'spring',
      landmark: { name: 'Clock Tower Centennial Hall', style: 'clocktower' },
      notes: ['A brown-tiled clock tower behind a great camphor tree, on the east bank of the river.', 'Cherry blossom along the walks and stepping stones across the water.'],
      plan(P, v, T) {
        frame(P, T, {}); P.river('y', 7, 4, 1.0); P.line(4, 26, 13, 26, 1, T.BRIDGE); entry(P, T, 28, 44);
        P.build(22, 10, 12, 5, { type: 'landmark', style: 'clocktower', height: 60, role: 'landmark', name: 'Clock Tower Centennial Hall' });
        plaza(P, T, 23, 17, 10, 7, T.GRAVEL); P.prop('bigoak', 28, 20); P.thing('camphor', 28, 22, 'Stand under the camphor tree'); P.prop('gatepost', 26, 25); P.prop('gatepost', 30, 25);
        P.build(37, 20, 7, 5, { type: 'library', role: 'library', name: 'Main Library', height: 56 });
        P.build(14, 34, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 46 });
        hall(P, 14, 18, 6, 6, 'Faculty of Law and Economics', { height: 54 }); hall(P, 38, 31, 7, 5, 'Faculty of Letters', { height: 54 }); hall(P, 13, 8, 7, 4, 'Yoshida Dormitory', { wall: '#8a6a4e', roof: '#4a4744', height: 42 });
        office(P, 40, 8, 7, 5, v, { height: 54 });
        P.path([28, 44], [28, 25], 2, T.GRAVEL, 'y'); P.path([13, 26], [23, 22], 1, T.GRAVEL); P.path([33, 22], [37, 23], 1, T.GRAVEL); P.path([33, 14], [42, 13], 1, T.GRAVEL, 'x'); P.path([20, 38], [27, 38], 1, T.GRAVEL);
        alley(P, 'cherry', 26, 28, 26, 42, 3); alley(P, 'cherry', 30, 28, 30, 42, 3); alley(P, 'cherry', 12, 8, 12, 24, 3);
        P.pois.task = { x: 18, y: 26, w: 18, h: 10 };
      },
    });
    def('peking', {
      name: 'Peking University', short: 'Peking', city: 'Beijing, China', colors: ['#8c1c13', '#e7c53f'], abroad: true,
      wall: '#8f8a80', roof: '#5f6468', path: 3, plaza: 5, trees: ['willow', 'pine', 'goldtree', 'lime', 'goldtree'], treeDensity: 0.08, season: 'autumn',
      landmark: { name: 'Boya Pagoda', style: 'cupola' },
      notes: ['A thirteen-tier pagoda mirrored in a lake ringed with willows.', 'A painted gate in the west, courtyards under grey tile, and gingko leaves on every path.'],
      plan(P, v, T) {
        frame(P, T, {}); entry(P, T, 28, 44); P.pond(30, 16, 8, 5);
        P.build(41, 10, 4, 4, { type: 'landmark', style: 'cupola', height: 110, role: 'landmark', name: 'Boya Pagoda' });
        P.build(7, 25, 8, 3, { type: 'secondary', style: 'hall', height: 44, name: 'West Gate', wall: '#a23a2c' });
        P.build(34, 27, 9, 6, { type: 'library', role: 'library', name: 'University Library', height: 60 });
        P.build(11, 9, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 46 });
        hall(P, 17, 29, 9, 5, 'Administration Building', { wall: '#a23a2c', height: 52 }); hall(P, 40, 37, 7, 5, 'Jingyuan Courtyard', { height: 44 }); hall(P, 10, 34, 7, 5, 'Democracy Hall', { wall: '#a23a2c', height: 48 });
        office(P, 14, 16, 7, 5, v, { height: 50, wall: '#a23a2c' });
        P.path([28, 44], [28, 22], 2, T.STONE, 'y'); P.path([15, 27], [22, 26], 1, T.STONE); P.path([21, 21], [27, 22], 1, T.STONE); P.path([38, 18], [43, 15], 1, T.STONE, 'y'); P.path([26, 34], [34, 33], 1, T.STONE);
        P.prop('statue', 19, 23, { figure: 'lion' }); P.prop('statue', 23, 23, { figure: 'lion' }); P.thing('huabiao', 21, 23, 'Look at the carved columns'); P.thing('stoneboat', 24, 19, 'Look at the stone boat');
        alley(P, 'willow', 20, 11, 38, 11, 4); alley(P, 'goldtree', 27, 26, 27, 42, 3); P.pois.task = { x: 18, y: 35, w: 16, h: 8 };
      },
    });
    def('capetown', {
      name: 'University of Cape Town', short: 'Cape Town', city: 'Cape Town, South Africa', colors: ['#1c4b8f', '#f1ede2'], abroad: true,
      wall: '#d8ccb2', roof: '#a8553c', path: 5, plaza: 5, trees: ['pine', 'cypress', 'oak', 'olive', 'pine'], treeDensity: 0.07, season: 'summer',
      landmark: { name: 'Sarah Baartman Hall', style: 'columns' },
      notes: ['A columned hall at the head of a great flight of steps, with ivy on the walls and the mountain straight behind.', 'Red roofs stepping down the slope to the playing fields, and the whole city below.'],
      plan(P, v, T) {
        frame(P, T, {}); P.fill(3, 3, 50, 4, T.FOREST); P.scatter('rock', 5, 3, 46, 5, 16); entry(P, T, 28, 44);
        P.build(22, 9, 12, 6, { type: 'landmark', style: 'columns', height: 60, role: 'landmark', name: 'Sarah Baartman Hall' });
        plaza(P, T, 23, 16, 10, 5, T.STONE); P.thing('steps', 28, 18, 'Sit on the steps');
        hall(P, 10, 10, 9, 5, 'Arts Block', { height: 54 }); hall(P, 37, 10, 9, 5, 'Mathematics Building', { height: 54 });
        P.build(11, 19, 8, 5, { type: 'library', role: 'library', name: 'Jagger Library', height: 56 });
        P.build(38, 19, 6, 4, { type: 'archive', role: 'archive', name: 'Manuscripts and Archives', height: 48 });
        hall(P, 11, 28, 8, 4, 'Smuts Hall', { height: 52 }); office(P, 40, 29, 7, 5, v, { height: 54 });
        P.fill(22, 30, 12, 9, T.FIELD); P.reserve(22, 30, 12, 9); P.prop('goal', 23, 34); P.prop('goal', 32, 34);
        P.path([28, 44], [28, 40], 2, T.STONE, 'y'); P.path([28, 21], [28, 29], 2, T.STONE, 'y'); P.path([19, 26], [38, 26], 1, T.STONE); P.path([19, 15], [23, 18], 1, T.STONE); P.path([33, 18], [37, 15], 1, T.STONE); P.path([35, 34], [40, 34], 1, T.STONE); P.path([20, 40], [36, 40], 1, T.STONE);
        alley(P, 'pine', 20, 28, 20, 40, 3); alley(P, 'pine', 36, 28, 36, 40, 3); P.pois.task = { x: 19, y: 22, w: 18, h: 7 };
      },
    });
    def('toronto', {
      name: 'University of Toronto', short: 'Toronto', city: 'Toronto, Canada', colors: ['#1e3765', '#f1ede2'], abroad: true,
      wall: '#bfb49a', roof: '#565c64', style: 'gothic', path: 3, plaza: 4, trees: ['maple', 'redtree', 'oak', 'elm', 'maple'], treeDensity: 0.07, season: 'autumn',
      landmark: { name: 'University College', style: 'clocktower' },
      notes: ['A Romanesque college with a square tower and a round chapter house, facing a great oval lawn.', 'A domed hall to the west, a memorial tower to the east, streetcars on the avenue and black squirrels everywhere.'],
      plan(P, v, T) {
        frame(P, T, { track: true }); entry(P, T, 28, 44);
        P.build(21, 7, 14, 6, { type: 'landmark', style: 'clocktower', height: 60, role: 'landmark', name: 'University College' });
        P.ellipse(28, 26, 10, 7, T.GRAVEL); P.ellipse(28, 26, 8.6, 5.6, T.GRASS); P.reserve(21, 22, 15, 9);
        P.build(8, 24, 6, 6, { type: 'secondary', style: 'dome', height: 60, name: 'Convocation Hall', wall: '#d6ccb2' });
        P.build(43, 13, 4, 4, { type: 'secondary', style: 'gatewayTower', height: 100, name: "Soldiers' Tower" });
        hall(P, 40, 20, 9, 5, 'Hart House', { style: 'gothic', height: 54 });
        P.build(6, 8, 9, 7, { type: 'library', role: 'library', name: 'Robarts Library', style: 'urban', wall: '#b9b3a6', roof: '#6d6f6c', height: 96 });
        P.build(8, 37, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 48 });
        office(P, 41, 32, 7, 5, v, { height: 58 });
        P.path([28, 44], [28, 33], 2, T.GRAVEL, 'y'); P.path([28, 13], [28, 19], 2, T.GRAVEL, 'y'); P.path([14, 27], [18, 27], 1, T.GRAVEL); P.path([38, 26], [44, 25], 1, T.GRAVEL); P.path([38, 30], [44, 37], 1, T.GRAVEL, 'y'); P.path([14, 39], [27, 38], 1, T.GRAVEL);
        P.prop('cannon', 24, 16); P.thing('cannon', 25, 17, 'Inspect the old cannon'); P.pois.blackSquirrels = { x: 28, y: 26 }; P.pois.tram = { x: 28, y: 50 }; P.pois.task = { x: 20, y: 33, w: 16, h: 8 };
      },
    });
    Object.assign(SA.VISITS, { 31: { uni: 'oxford' }, 32: { uni: 'cambridge', hour: 15 }, 33: { uni: 'zurich' }, 34: { uni: 'kyoto' }, 35: { uni: 'peking', hour: 16 }, 36: { uni: 'capetown', hour: 11 }, 37: { uni: 'toronto' } });
  }
  if (SA.Signature && SA.Signature.alias) SA.Signature.alias('University Church', 'Basilica');

  // ---------- encounters ----------
  const E = SA.Encounters;
  if (E) {
    const pal = (wall, roof, grass) => ({ wall, roof, grass });
    const NEW = [
      { id: 31, shortName: 'Atkinson', name: 'Anthony Atkinson', collaborators: 'Colleagues at Nuffield College', campus: 'University of Oxford', era: '2015 · Nuffield College', year: 2015, title: 'How Unequal?', method: 'Measuring inequality', objective: 'Find Nuffield College and rank three towns by how unequal they are.', office: 'Nuffield College', clue: 'The directory lists a college of social science to the south-east.',
        dialogue: ['Two towns can share an average income and feel nothing alike. Before you ask why one is more unequal, decide what you mean by unequal.', 'Here are three towns. Rank them by the share of the richest tenth, then with an index that cares more about the bottom. Watch the ranking move as you turn the dial.', 'Narrator: Atkinson set out his index in a 1970 paper, long before he came to Nuffield College, where he was Warden from 1994 to 2005. This meeting is a dramatization.'],
        limitation: 'Every inequality index builds in a judgement about whose incomes matter most. The three towns are invented, and income is only one part of how people live.', transfer: 'Who gains from the festival, and does the answer survive a different way of measuring?', evidence: 'Three towns with the same average income ranked differently depending on how much weight the index gave to the poorest.', sourceIds: ['atkinson'], theme: 'gothic', palette: pal('#d9c594', '#7d7a6e', '#7b9477') },
      { id: 32, shortName: 'Stone', name: 'Richard Stone', collaborators: 'The Department of Applied Economics', campus: 'University of Cambridge', era: '1948', year: 1948, title: 'Counting an Economy Three Ways', method: 'National accounts', objective: 'Find the Department of Applied Economics and add up a town without counting anything twice.', office: 'Department of Applied Economics', clue: 'The directory lists a new department of applied economics to the north-east.',
        dialogue: ['An economy is too large to see, so we count it. The first discipline of counting is that every sale is somebody’s income and somebody’s spending.', 'This town has a farm, a mill and a bakery. Add up what they sold. Then count again by value added, by incomes and by final spending. If the answers differ, something was counted twice or not at all.', 'Narrator: Stone directed the Department of Applied Economics at Cambridge from 1945 to 1955 and received the 1984 Nobel Memorial Prize for work on national accounts. The firms here are invented.'],
        limitation: 'National accounts count what is bought and sold. Unpaid care, a clean canal and who actually receives the income fall outside the total.', transfer: 'Who is paid by the festival, who spends at it, and whose work is left out of the count?', evidence: 'Adding every sale overstated the town’s output; value added, incomes and final spending all gave the same smaller total.', sourceIds: ['stone'], theme: 'gothic', palette: pal('#d7cfb8', '#7a7f80', '#7fa06a') },
      { id: 33, shortName: 'Fehr', name: 'Ernst Fehr', collaborators: 'Simon Gächter and the laboratory’s volunteers', campus: 'University of Zurich', era: '2000', year: 2000, title: 'Would You Pay to Punish?', method: 'Public goods experiments', objective: 'Find the economics laboratory and watch a common pot rise or fall.', office: 'Department of Economics', clue: 'The directory lists an experimental laboratory down the hill to the south-east.',
        dialogue: ['Give four strangers some money and a common pot that grows whatever goes in. All gain if everyone contributes. Each gains more by keeping their own. Watch ten rounds.', 'Now let them pay a little to fine those who give nothing. Nobody profits by punishing a stranger they will never meet again. See whether they do it anyway.', 'Narrator: Fehr and Gächter reported experiments of this kind in 2000 and 2002. Later studies across many societies found that punishment is sometimes aimed at the generous as well.'],
        limitation: 'Volunteers played for modest stakes with anonymous strangers. In later cross-cultural studies punishment sometimes fell on high contributors, and costly fines can leave everyone poorer.', transfer: 'When someone breaks the festival’s common rules, does anyone respond, and at what cost to themselves?', evidence: 'Without fines, contributions fell round by round; with costly fines they held, though the group paid for the punishing.', sourceIds: ['fehr', 'fehr-aer'], theme: 'classical', palette: pal('#d9d2bf', '#7d5a48', '#7b9477') },
      { id: 34, shortName: 'Fujita', name: 'Masahisa Fujita', collaborators: 'Paul Krugman and Anthony Venables', campus: 'Kyoto University', era: '1999', year: 1999, title: 'Why Is There a City Here?', method: 'Spatial economics', objective: 'Find the Institute of Economic Research and let two towns compete for workers.', office: 'Institute of Economic Research', clue: 'The directory lists an institute of economic research to the north-east.',
        dialogue: ['Two plains, alike in every way. Why should one fill with workshops while the other stays farmland? Firms want to be near customers, and workers are customers.', 'Set the cost of carrying goods between two towns and let workers move toward the better living. Start from an even split, then give one town a single extra workshop.', 'Narrator: Fujita, Krugman and Venables set out models of this kind in The Spatial Economy (1999). The two towns and every number here are a teaching toy.'],
        limitation: 'A two-town toy with identical workers. Land prices, congestion, history and policy are left out, and real cities owe as much to those as to the cost of transport.', transfer: 'Is the festival where it is because of where people already gather, and what would it take to move it?', evidence: 'With costly transport the two towns stayed even; once transport was cheap, a one-workshop head start snowballed into one large city.', sourceIds: ['fujita'], theme: 'brick', palette: pal('#a8765a', '#5d5a58', '#86a070') },
      { id: 35, shortName: 'Fei', name: 'Fei Xiaotong', collaborators: 'Village households and fieldwork companions', campus: 'Peking University', era: '1985', year: 1985, title: 'Ripples in a Pond', method: 'Fieldwork & personal networks', objective: 'Find the Institute of Sociology and Anthropology and map the rings around one household.', office: 'Institute of Sociology and Anthropology', clue: 'The directory lists an institute of sociology and anthropology to the north-west.',
        dialogue: ['Throw a stone into the lake. Each person stands at the centre of rings like those: kin, neighbours, acquaintances, each ring fainter. Whom you may ask for help depends on the ring they stand in.', 'Here is a village at harvest. Map one household’s rings, then trace who actually helped whom. Compare that with a village organised into an association with members and non-members.', 'Narrator: Fei Xiaotong described this pattern in essays published in 1947 as From the Soil, drawing on village fieldwork in the 1930s. He taught at Peking University from 1979. The village here is invented.'],
        limitation: 'An image drawn from essays and fieldwork of the 1930s and 1940s, not a measured law. Villages differ, both patterns exist everywhere to some degree, and much has changed since.', transfer: 'Whom do Eastbank households ask for a favour, ring by ring, and does any ring reach the festival committee?', evidence: 'Help followed each household’s own rings and thinned with every ring; membership of the village association predicted little.', sourceIds: ['fei'], theme: 'brick', palette: pal('#8f8a80', '#5f6468', '#86a070') },
      { id: 36, shortName: 'Wilson', name: 'Francis Wilson', collaborators: 'The SALDRU survey teams', campus: 'University of Cape Town', era: '1993', year: 1993, title: 'Counting a Whole Country', method: 'Household surveys & the Lorenz curve', objective: 'Find the survey unit and draw a sample that leaves nobody off the map.', office: 'SALDRU, School of Economics', clue: 'The directory lists a labour and development research unit down the slope to the south-east.',
        dialogue: ['For years the official figures left some people out. If you want to know how a country lives, you knock on doors in every kind of place, including those the old maps skipped.', 'Draw a sample of this invented country. Line households up from poorest to richest and plot the share of income held by each fifth. Then see what the curve looks like when two districts are missed.', 'Narrator: The 1993 Project for Statistics on Living Standards and Development, led from SALDRU at the University of Cape Town, was the first household survey to cover the whole of South Africa. The country in this exercise is invented.'],
        limitation: 'A survey describes the moment it was taken and the households that answered. Incomes are hard to report, the richest and poorest are hardest to reach, and one curve hides who is where on it.', transfer: 'Does the council’s map of Bellwether cover every district, and who lives in the ones it leaves out?', evidence: 'Leaving two districts out of the sample made the invented country look far more equal than it was.', sourceIds: ['saldru'], theme: 'classical', palette: pal('#d8ccb2', '#a8553c', '#8aa56a') },
      { id: 37, shortName: 'Wellman', name: 'Barry Wellman', collaborators: 'Residents and interviewers of the East York study', campus: 'University of Toronto', era: '1979 · the East York study', year: 1979, title: 'Where Did the Community Go?', method: 'Personal network surveys', objective: 'Find the Centre for Urban and Community Studies and ask a street who they are close to.', office: 'Centre for Urban and Community Studies', clue: 'The directory lists a centre for urban and community studies to the south-east.',
        dialogue: ['People say the city killed community. But they were looking for it in the neighbourhood. Ask each person who they are close to, and then ask where those people live.', 'Interview six residents of one street. Record each one’s close ties and where they are. Then decide: is community lost, saved on the street, or stretched across the city?', 'Narrator: Wellman’s “The Community Question” (1979) drew on a survey of residents of East York, Toronto. The street and its residents here are invented.'],
        limitation: 'One borough at one time, relying on people’s own reports of whom they are close to. Anyone with no ties at all is easy to miss in a survey of those who answer.', transfer: 'Where do Eastbank residents’ close ties live? The festival may be missing a community that is not on the map.', evidence: 'Most close ties lay beyond the street: community had not vanished, it had spread across the city.', sourceIds: ['wellman'], theme: 'gothic', palette: pal('#bfb49a', '#565c64', '#7b9477') },
    ];
    const SRC = [
      { id: 'atkinson', title: 'Atkinson (1970) · On the Measurement of Inequality, Journal of Economic Theory', url: 'https://doi.org/10.1016/0022-0531(70)90039-6', note: 'The paper that set out the index. The towns and incomes in the game are invented.' },
      { id: 'stone', title: 'Richard Stone · Nobel Memorial Prize in Economic Sciences 1984', url: 'https://www.nobelprize.org/prizes/economic-sciences/1984/stone/facts/', note: 'Historical anchor for the development of national accounts. The farm, mill and bakery are invented.' },
      { id: 'fehr', title: 'Fehr & Gächter (2002) · Altruistic punishment in humans, Nature', url: 'https://doi.org/10.1038/415137a', note: 'The experiment with costly punishment among strangers. The players in the game are simulated by stated rules.' },
      { id: 'fehr-aer', title: 'Fehr & Gächter (2000) · Cooperation and Punishment in Public Goods Experiments, American Economic Review', url: 'https://doi.org/10.1257/aer.90.4.980', note: 'The earlier public goods experiments with and without punishment.' },
      { id: 'fujita', title: 'Fujita, Krugman & Venables (1999) · The Spatial Economy · author overview', url: 'https://en.wikipedia.org/wiki/Masahisa_Fujita', note: 'Context for the models of agglomeration. The two-town rule in the game is a stated simplification, not the book’s model.' },
      { id: 'fei', title: 'Fei Xiaotong (1947) · From the Soil · overview', url: 'https://en.wikipedia.org/wiki/From_the_Soil', note: 'Context for the “differential mode of association”. The village and its tallies are invented.' },
      { id: 'saldru', title: 'SALDRU, University of Cape Town · Southern Africa Labour and Development Research Unit', url: 'https://www.saldru.uct.ac.za/', note: 'The unit that led the 1993 living standards survey. The country and households in the game are invented.' },
      { id: 'wellman', title: 'Wellman (1979) · The Community Question, American Journal of Sociology', url: 'https://doi.org/10.1086/226906', note: 'The East York study of personal networks. The street and residents in the game are invented.' },
    ];
    for (const e of NEW) if (!E.byId.has(e.id)) { E.all.push(e); E.byId.set(e.id, e); }
    E.all.sort((a, b) => a.id - b.id); E.sources.push(...SRC); E.count = E.all.length; E.ABROAD = NEW.map((e) => e.id);
    Object.assign(E.GROUPS, { 31: ['Anthony Atkinson'], 32: ['Richard Stone'], 33: ['Ernst Fehr', 'Simon Gächter'], 34: ['Masahisa Fujita'], 35: ['Fei Xiaotong'], 36: ['Francis Wilson'], 37: ['Barry Wellman'] });
    Object.assign(E.SIGN, { 31: ['three columns of incomes and a slide rule', 'ruling a careful line'], 32: ['ledgers tied with tape', 'adding a column twice'], 33: ['four envelopes of coins', 'sealing an envelope'], 34: ['a map with pins and thread', 'moving one pin'], 35: ['a notebook of kinship diagrams', 'sketching circles in the margin'], 36: ['a stack of household questionnaires', 'checking a district map'], 37: ['a box of interview cards', 'sorting cards by street'] });
  }

  // ---------- fieldwork ----------
  if (SA.Tasks) Object.assign(SA.Tasks.all, {
    31: ['survey', 'Four pay packets', 'ask at four doors what the household earned last month, then work out the average.', ['The almshouse', 'A college servant', 'A shopkeeper', 'The big house'], {}, 'Four households, one average. The average described none of them.'],
    32: ['courier', 'The same loaf, three ledgers', 'follow one loaf of bread from the field to a kitchen table, carrying the receipt at each sale.', ['The farm', 'The mill', 'The bakery', 'A kitchen table'], { items: 4, order: true }, 'One loaf, three sales on the way and one final purchase. Add up the sales and you count the wheat three times.'],
    33: ['survey', 'The lantern fund', 'four stallholders may each put a coin in the lantern fund. Call on each and see who gives.', ['The cheese stall', 'The cloth stall', 'The spice stall', 'The knife-grinder'], {}, 'Three gave. The fourth enjoyed the lanterns as much as anyone.'],
    34: ['survey', 'Count the workshops', 'count the workshops on each bank, then ask the ferryman how it began.', ['North bank workshops', 'South bank workshops', 'The ferry landing'], {}, 'Both banks have the same soil and the same river. One has eleven workshops and the other two. The ferryman says it started with one.'],
    35: ['courier', 'Who do you ask?', 'you need to borrow an ox. Each person can only ask the next one out. Follow the chain.', ['Your brother’s house', 'The neighbour', 'The neighbour’s cousin', 'The stranger with an ox'], { items: 4, order: true }, 'Each asked the next on your behalf. The stranger lent the ox to your brother’s neighbour’s cousin, not to you.'],
    36: ['survey', 'Every district', 'visit all four districts on your list and count the households in each.', ['The harbour district', 'The farms', 'The hill suburb', 'Beyond the railway'], {}, 'The fourth district was on no enumerator’s map. A quarter of all the households lived there.'],
    37: ['survey', 'Four doorsteps', 'ask four residents who they feel close to, and where those people live.', ['No. 12', 'No. 14', 'No. 20', 'The corner flat'], {}, 'Each named five people. Hardly any of them lived on the street.'],
  });

  // ---------- campus secrets ----------
  if (SA.Progress) {
    Object.assign(SA.Progress.EGGS, {
      oxford: [{ thing: 'emperors', title: 'The stone heads', text: 'A row of great stone heads stares down from the railings. Nobody is quite sure who they are meant to be, which has not stopped anyone from naming them.' }, { thing: 'sighs', title: 'The bridge over the lane', text: 'It is called the Bridge of Sighs. It looks very little like the one in Venice, and everyone has agreed not to mention it.' }],
      cambridge: [{ spot: 'bridge', title: 'The wooden bridge', text: 'The story goes that Newton built a bridge here without a single bolt. He had been dead for more than twenty years when it went up. A good story is a hypothesis; check the dates.' }, { thing: 'punt', title: 'On the river', text: 'A punt drifts past sideways. The student holding the pole has the look of someone revising a strong prior.' }],
      zurich: [{ thing: 'polybahn', title: 'The little red funicular', text: 'It has hauled students up this hill since the 1880s. It may be the only part of a degree that goes reliably uphill without effort.' }, { event: 'tram', title: 'Exactly on time', text: 'A blue and white tram glides in. You check your watch against it, not the other way round.' }],
      kyoto: [{ thing: 'camphor', title: 'Under the camphor tree', text: 'The great tree is on every letterhead. Students arrange to meet under it and then spend ten minutes finding one another around the trunk.' }, { spot: 'bridge', title: 'Stepping stones', text: 'Some of the stones across the river are carved like turtles. You count them twice and get two different answers, which feels appropriate.' }],
      peking: [{ thing: 'stoneboat', title: 'The stone boat', text: 'A marble boat that has never sailed rests at the edge of the lake. Students use it for reading and, on warm days, for not reading.' }, { thing: 'huabiao', title: 'The carved columns', text: 'Two carved columns stand before the hall. They are older than the university and were brought here from elsewhere. One is said to be very slightly taller. Nobody will say which.' }],
      capetown: [{ thing: 'steps', title: 'The steps', text: 'Half the university is sitting here with its lunch. The whole city lies below, which makes every deadline look smaller.' }, { spot: 'behind', title: 'Behind the hall', text: 'The mountain begins at once. A sign asks walkers to tell someone where they are going. Sound advice for a thesis, too.' }],
      toronto: [{ thing: 'cannon', title: 'The old cannon', text: 'It points across the lawn at nothing in particular. Engineering students are said to own a cannon of their own, and to be vague about where it is kept.' }, { event: 'tram', title: 'The streetcar', text: 'A red streetcar clangs along the avenue. For a century people have been close to others they reach by a ride, not a walk.' }],
    });
    const H = SA.Progress.HYP; if (H) { H.measurement.push(31, 32, 36); H.rules.push(33); H.travel.push(34); H.information.push(35, 37); }
  }

  // ---------- music: one piece for each campus ----------
  if (SA.Music) Object.assign(SA.Music.scores, {
    oxford: { title: 'Bells over the Square', mode: 'mixolydian', final: 55, bar: 6, bpm: 76, lead: 'bells', comp: 'harp', drone: 'organ', perc: null, voice2: 'fifth', mood: 'Change-ringing over a slow harp',
      A: '8.1 7.1 6.1 5.1 4.1 3.1 2.1 1.1 3.1 2.1 4.1 3.1 5.2 4.1 3.1 2.2 1.2 2.1 3.1 1.2', A2: '8.1 7.1 6.1 5.1 4.1 3.1 2.1 1.1 2.1 4.1 3.1 5.1 4.2 3.1 2.1 3.2 2.2 0.2 1.2', B: '5.2 6.1 5.1 4.2 3.2 5.1 4.1 3.2 2.2 3.1 4.1 5.2 5.6', B2: '5.2 6.1 5.1 4.2 3.2 2.1 3.1 4.2 3.2 2.1 0.1 1.2 1.6' },
    cambridge: { title: 'Evensong on the Backs', mode: 'dorian', final: 50, bar: 8, bpm: 60, lead: 'organ', comp: 'harp', drone: 'organ', perc: null, voice2: 'fourth', mood: 'A slow chant with an organ beneath',
      A: '1.4 3.2 4.2 5.4 4.2 3.2 4.4 2.4 3.2 2.2 1.4', A2: '1.4 3.2 4.2 5.4 7.2 6.2 5.4 4.2 3.2 2.2 0.2 1.4', B: '5.4 6.2 7.2 8.4 7.2 6.2 5.4 4.4 5.8', B2: '5.4 6.2 7.2 8.4 5.4 4.2 3.2 2.2 0.2 1.8' },
    zurich: { title: 'Terrace Ländler', mode: 'ionian', final: 57, bar: 6, bpm: 96, lead: 'recorder', comp: 'lute', drone: null, perc: 'frame', voice2: 'sixth', mood: 'A light alpine dance in three',
      A: '1.1 3.1 5.1 8.2 5.1 6.1 5.1 4.1 3.2 1.1 2.1 4.1 3.1 2.2 5.1 1.1 3.1 5.1 3.2 1.1', A2: '1.1 3.1 5.1 8.2 5.1 6.1 5.1 4.1 3.2 1.1 2.1 4.1 3.1 2.2 0.1 1.6', B: '5.2 5.1 6.2 5.1 4.2 4.1 5.2 3.1 2.2 2.1 3.2 4.1 5.6', B2: '5.2 5.1 6.2 5.1 4.2 4.1 3.2 2.1 3.2 2.1 0.2 2.1 1.6' },
    kyoto: { title: 'Camphor Shade', mode: 'aeolian', final: 52, bar: 8, bpm: 66, lead: 'psaltery', comp: 'harp', drone: null, perc: null, voice2: null, mood: 'Plucked strings on five notes, unhurried',
      A: '5.2 4.2 3.4 1.2 3.2 4.4 5.2 7.2 8.4 7.2 5.2 4.4', A2: '5.2 4.2 3.4 1.2 3.2 4.4 5.2 4.2 3.2 1.2 1.8', B: '8.4 7.2 5.2 7.4 5.2 4.2 5.4 4.2 3.2 4.8', B2: '8.4 7.2 5.2 4.4 3.2 1.2 3.2 4.2 3.2 1.2 1.8' },
    peking: { title: 'The Lake at Dusk', mode: 'ionian', final: 50, bar: 8, bpm: 60, lead: 'recorder', comp: 'lute', drone: null, perc: null, voice2: null, mood: 'A flute over plucked strings, on five notes',
      A: '5.4 6.2 5.2 3.4 2.4 1.2 2.2 3.2 5.2 3.8', A2: '5.4 6.2 5.2 3.4 2.4 1.2 2.2 3.2 2.2 1.8', B: '6.4 8.2 6.2 5.4 3.4 5.2 6.2 5.2 3.2 2.8', B2: '6.4 8.2 6.2 5.4 3.4 2.2 3.2 2.2 1.2 1.8' },
    capetown: { title: 'Under the Mountain', mode: 'mixolydian', final: 53, bar: 8, bpm: 92, lead: 'psaltery', comp: 'lute', drone: null, perc: 'frame', voice2: 'sixth', mood: 'Bright plucked figures over a hand drum',
      A: '1.2 3.1 5.3 5.2 6.1 5.1 3.2 4.2 3.2 1.2 3.1 5.3 6.2 5.2 3.2 2.4', A2: '1.2 3.1 5.3 5.2 6.1 5.1 3.2 4.2 3.2 1.2 3.1 5.3 6.2 5.2 3.2 1.4', B: '8.2 7.1 5.3 6.2 5.2 3.2 4.2 5.2 8.2 7.1 5.3 6.2 5.4 5.4', B2: '8.2 7.1 5.3 6.2 5.2 3.2 4.2 5.2 8.2 7.1 5.3 6.2 3.2 2.2 1.4' },
    toronto: { title: 'College Circle Reel', mode: 'dorian', final: 57, bar: 8, bpm: 104, lead: 'vielle', comp: 'lute', drone: 'vielle', perc: 'frame', voice2: null, mood: 'A fiddle reel over a drone',
      A: '1.2 2.1 3.1 4.2 5.2 7.2 5.2 4.2 3.2 1.2 2.1 3.1 4.2 5.2 4.2 3.2 2.4', A2: '1.2 2.1 3.1 4.2 5.2 7.2 5.2 4.2 3.2 1.2 2.1 3.1 4.2 5.2 3.2 2.2 1.4', B: '8.2 7.2 5.2 7.2 8.2 7.1 5.1 4.2 5.2 8.2 7.2 5.2 7.2 5.4 5.4', B2: '8.2 7.2 5.2 7.2 8.2 7.1 5.1 4.2 5.2 8.2 7.2 5.2 7.2 4.2 2.2 1.4' },
  });

  // ---------- research problems 31–37 ----------
  const L2 = SA.Labs2;
  if (L2 && L2.kit) {
    const { fmt, pct, select, button, bars, table, avg } = L2.kit, D = L2.defs, labs = L2.labs;
    Object.assign(D, {
      31: { brief: 'Three invented towns of ten households each. All three have the same average income. Decide which is the most unequal, using more than one yardstick.', hints: ['Compute the share of the richest tenth first.', 'Now try an index that weighs the poorest more heavily.', 'Turn the dial from “mild” to “strong” concern for the poorest and watch which town ranks worst.'], limit: 'An index compresses a whole distribution into one number, and the choice of index is a judgement about whose income matters most. These towns are invented.', transfer: 'Describe who gains from the festival with at least two different measures before calling it fair or unfair.' },
      32: { brief: 'A farm sells wheat to a mill, the mill sells flour to a bakery, and the bakery sells bread to households. Count the town’s output. All figures are invented.', hints: ['Add up every sale and note the total.', 'Now count only what each firm added to what it bought.', 'Count by incomes and by final spending as well. Three of the four totals should agree.'], limit: 'These accounts count market sales only. Unpaid work at home and who receives the income are outside the total, however carefully it is added.', transfer: 'Draw up accounts for the festival that show who is paid, who spends, and what work goes uncounted.' },
      33: { brief: 'Four simulated strangers each receive 20 tokens a round. Tokens put in the common pot are multiplied by 1.6 and shared equally. The rules each player follows are fixed and shown.', hints: ['Run ten rounds with no fines and watch the average contribution.', 'Now allow fines: a player may pay 1 token to take 3 from someone who gave less than the others.', 'Compare contributions and total earnings under both rules, then try a weak fine.'], limit: 'Four scripted players stand in for volunteers who played for modest stakes. In studies across many societies, punishment sometimes fell on those who gave the most.', transfer: 'Observe whether anyone responds when a festival rule is broken, who bears the cost of responding, and whether it works.' },
      34: { brief: 'Two towns share a hundred workshops. Each season, workshops move toward the town where life is better. The rule is simple and shown: nearness to customers pulls together, costly transport pushes apart.', hints: ['Run with costly transport from an even split.', 'Give East Town one extra workshop and run again with costly transport, then with cheap transport.', 'Compare the two outcomes from the same head start.'], limit: 'A stated toy rule for two identical towns. Rents, congestion, history and policy are missing, and the real models are richer than this.', transfer: 'Check whether the festival’s location follows from where people already gather, and test what would shift it.' },
      35: { brief: 'An invented village of twelve households at harvest. Choose a household, map its rings of kin, neighbours and acquaintances, and tally who helped it. Then test a rival idea: that help follows membership of the village association.', hints: ['Tally help by ring for one household.', 'Tally the same help by association membership.', 'Switch to the other household: its rings are different people.'], limit: 'A stylised village built to show one idea from essays of the 1940s. Real villages mix both patterns, and the tallies here are invented.', transfer: 'Map whom Eastbank households ask for favours and check whether any of those rings reaches the people who run the festival.' },
      36: { brief: 'An invented country of four districts and twenty households. Choose which districts your survey reaches, then line the households up from poorest to richest and read the curve.', hints: ['Survey with the old map, which covers two districts.', 'Survey all four districts.', 'Compare the share held by the poorest fifth, and the summary index, under both samples.'], limit: 'Twenty invented households. Real surveys struggle most with the richest and the poorest, and a curve says nothing about who is where on it.', transfer: 'Sample every district of Bellwether, including those missing from the council’s map, before describing who the festival serves.' },
      37: { brief: 'Six invented residents of one street. Interview each about the five people they feel closest to, and where those people live. Then weigh three stories: community lost, saved on the street, or spread across the city.', hints: ['Interview all six residents.', 'Tally where the close ties live.', 'Compare the tally with each of the three stories.'], limit: 'Six invented residents answering about their own ties. People without ties are the least likely to be in any sample.', transfer: 'Ask Eastbank residents where their close ties live before concluding that the district lacks community.' },
    });
    // 31 — the same average, three inequalities
    const TOWNS = { Millbank: [4, 4, 20, 20, 20, 20, 20, 20, 22, 22], Harbour: [8, 10, 12, 14, 16, 18, 20, 22, 24, 28], 'Crown Hill': [13, 13, 13, 13, 13, 13, 13, 13, 13, 55] };
    const gini = (a) => { const n = a.length, m = avg(a); let s = 0; for (const x of a) for (const y of a) s += Math.abs(x - y); return s / (2 * n * n * m); };
    const atk = (a, e) => { const m = avg(a); return e === 1 ? 1 - Math.exp(avg(a.map((x) => Math.log(x)))) / m : 1 - Math.pow(avg(a.map((x) => Math.pow(x, 1 - e))), 1 / (1 - e)) / m; };
    const MEAS = { top: ['Share of the richest tenth', (a) => Math.max(...a) / a.reduce((x, y) => x + y, 0)], gini: ['Gini coefficient', gini], a05: ['Atkinson index, mild concern for the poorest', (a) => atk(a, 0.5)], a2: ['Atkinson index, strong concern for the poorest', (a) => atk(a, 2)] };
    labs[31] = (L) => {
      const { s } = L; s.done = s.done || []; s.m = s.m || 'top'; const worst = (k) => Object.keys(TOWNS).sort((p, q) => MEAS[k][1](TOWNS[q]) - MEAS[k][1](TOWNS[p]))[0];
      L.board.innerHTML = `<h3>Monthly income of ten households</h3>${table(['Town', 'Incomes, poorest to richest', 'Average'], Object.entries(TOWNS).map(([n, a]) => [n, a.join(' · '), fmt(avg(a))]))}${s.last ? `<h3>${MEAS[s.last][0]}</h3>` + bars(Object.entries(TOWNS).map(([n, a]) => [n, MEAS[s.last][1](a) * 100, 60, 1])) : ''}`;
      L.controls.innerHTML = `<h3>Choose a yardstick</h3>${select('m', 'Measure', Object.entries(MEAS).map(([k, v]) => [k, v[0]]), s.m)}${button('go', 'Measure the three towns')}${table(['Measure', 'Most unequal town'], s.done.map((k) => [MEAS[k][0], worst(k)]))}`;
      L.bind('m', () => { s.m = L.val('m'); L.save(); }, 'change');
      L.bind('go', () => { if (!L.started()) return; s.last = s.m; if (!s.done.includes(s.m)) s.done.push(s.m); L.result(`${MEAS[s.m][0]}: ${Object.entries(TOWNS).map(([n, a]) => n + ' ' + fmt(MEAS[s.m][1](a) * 100)).join(', ')}. By this yardstick ${worst(s.m)} is the most unequal.`); L.change(); });
      L.ready(() => s.done.length >= 3 && new Set(s.done.map(worst)).size >= 2, () => `All three towns average ${fmt(avg(TOWNS.Harbour))}. ${s.done.map((k) => `${MEAS[k][0]} named ${worst(k)}`).join('; ')}.`);
    };
    // 32 — sales, value added, incomes, spending
    labs[32] = (L) => {
      const { s } = L; s.done = s.done || []; const firms = [['Farm', 40, 0, 25, 15], ['Mill', 70, 40, 20, 10], ['Bakery', 110, 70, 30, 10]];
      const M = { sales: ['Add up every sale', firms.reduce((a, f) => a + f[1], 0), 'Wheat, flour and bread were each sold once, and the wheat is inside the flour and the flour inside the bread.'], va: ['Value added by each firm', firms.reduce((a, f) => a + f[1] - f[2], 0), 'Each firm’s sales less what it bought from the firm before.'], inc: ['Incomes: wages plus profits', firms.reduce((a, f) => a + f[3] + f[4], 0), 'Everything the three firms paid to people.'], exp: ['Final spending by households', 110, 'Only the bread is bought to be used, not sold on.'] };
      L.board.innerHTML = `<h3>The town’s books for one month</h3>${table(['Firm', 'Sales', 'Bought from others', 'Wages', 'Profit'], firms.map((f) => [f[0], f[1], f[2], f[3], f[4]]))}<p class="note">Households bought all the bread. Nobody bought wheat or flour to eat.</p>${s.unpaid ? '<p><b>Not in any column:</b> the hours spent baking at home, minding children and carrying water. A survey valued them at about 30.</p>' : ''}`;
      L.controls.innerHTML = `<h3>Four ways to count</h3>${Object.entries(M).map(([k, v]) => button('m' + k, (s.done.includes(k) ? '✓ ' : '') + v[0])).join('')}${button('unpaid', s.unpaid ? '✓ Asked about unpaid work' : 'Ask what the books leave out', !!s.unpaid)}${bars(s.done.map((k) => [M[k][0].split(':')[0].slice(0, 22), M[k][1], 240, 0]))}`;
      Object.entries(M).forEach(([k, v]) => L.bind('m' + k, () => { if (!L.started()) return; if (!s.done.includes(k)) s.done.push(k); L.result(`${v[0]}: ${v[1]}. ${v[2]}`); L.change(); }));
      L.bind('unpaid', () => { s.unpaid = true; L.result('The books record sales. Work that is never sold appears nowhere, whichever way the columns are added.'); L.change(); });
      L.ready(() => s.done.includes('sales') && s.done.filter((k) => k !== 'sales').length >= 2, () => `Adding every sale gave ${M.sales[1]}; value added, incomes and final spending each gave ${M.va[1]}.${s.unpaid ? ' Unpaid work, valued at about 30, appeared in none of them.' : ''}`);
    };
    // 33 — a common pot, with and without fines
    function pot(fine) {
      const give = [16, 14, 12, 0], hist = []; let earned = 0, spent = 0;
      for (let r = 0; r < 10; r++) {
        const total = give.reduce((a, b) => a + b, 0), share = (total * 1.6) / 4; hist.push(total / 4); earned += give.reduce((a, g) => a + 20 - g + share, 0);
        const mean = total / 4, next = give.slice();
        for (let i = 0; i < 4; i++) { const others = (total - give[i]) / 3; if (i < 3) next[i] = Math.max(0, Math.round(Math.min(20, others - (fine ? 0 : 1.5)))); }
        if (fine) { const low = give[3] < mean - 1; if (low) { spent += 3 + 3 * fine; next[3] = Math.min(20, give[3] + (fine >= 3 ? 5 : 1)); for (let i = 0; i < 3; i++) next[i] = Math.min(20, Math.max(next[i], give[i])); } else next[3] = give[3]; }
        for (let i = 0; i < 4; i++) give[i] = next[i];
      }
      return { hist, earned: earned - spent, spent };
    }
    labs[33] = (L) => {
      const { s } = L; s.runs = s.runs || []; s.rule = s.rule || '0'; const R = { 0: 'No fines', 3: 'Fines: pay 1 to take 3', 1: 'Weak fines: pay 1 to take 1' }, last = s.last !== undefined ? pot(Number(s.last)) : null;
      L.board.innerHTML = `<h3>Average contribution by round (of 20)</h3>${last ? bars(last.hist.map((v, i) => ['Round ' + (i + 1), v, 20, 1])) : '<p class="muted">No rounds played yet.</p>'}<p class="note">Three players give about what the others gave last round, a little less if nobody is watching. One gives nothing unless it costs to do so.</p>`;
      L.controls.innerHTML = `<h3>Set the rule</h3>${select('rule', 'After each round', Object.entries(R), s.rule)}${button('run', 'Play ten rounds')}${table(['Rule', 'First round', 'Last round', 'Group earnings'], s.runs.map((r) => [R[r.rule], fmt(r.first), fmt(r.lastC), Math.round(r.earned)]))}`;
      L.bind('rule', () => { s.rule = L.val('rule'); L.save(); }, 'change');
      L.bind('run', () => { if (!L.started()) return; const o = pot(Number(s.rule)); s.last = s.rule; if (!s.runs.some((r) => r.rule === s.rule)) s.runs.push({ rule: s.rule, first: o.hist[0], lastC: o.hist[9], earned: o.earned, spent: o.spent }); L.result(`${R[s.rule]}: average contribution went from ${fmt(o.hist[0])} to ${fmt(o.hist[9])} tokens. The group earned ${Math.round(o.earned)} in all${o.spent ? ', after ' + Math.round(o.spent) + ' tokens lost to fining and being fined' : ''}.`); L.change(); });
      const g = (k) => s.runs.find((r) => r.rule === k);
      L.ready(() => !!g('0') && !!g('3'), () => `Without fines the average contribution fell from ${fmt(g('0').first)} to ${fmt(g('0').lastC)}; with fines it ended at ${fmt(g('3').lastC)}, and ${Math.round(g('3').spent)} tokens went on punishment.`);
    };
    // 34 — two towns and a head start
    function towns(cost, head) { let x = head ? 0.52 : 0.5; const path = [x]; for (let i = 0; i < 12; i++) { const pull = (0.5 - cost) * 5 * (x - 0.5); x = Math.max(0.02, Math.min(0.98, x + 1.6 * x * (1 - x) * pull)); path.push(x); } return path; }
    labs[34] = (L) => {
      const { s } = L; s.runs = s.runs || []; s.cost = s.cost || '0.8'; s.head = s.head || '0'; const Cn = { 0.8: 'Costly: goods barely travel', 0.5: 'Middling', 0.2: 'Cheap: goods travel freely' }, last = s.last ? towns(Number(s.last.cost), s.last.head === '1') : null;
      L.board.innerHTML = `<h3>East Town’s share of the workshops</h3>${last ? bars(last.filter((_, i) => i % 2 === 0).map((v, i) => ['Season ' + i * 2, v * 100, 100, 0]), '%') : '<p class="muted">Set the dials and let the seasons run.</p>'}<p class="note">Rule shown: each season workshops drift toward the larger town when transport is cheap, and toward the smaller when it is costly.</p>`;
      L.controls.innerHTML = `<h3>Set the world</h3>${select('cost', 'Cost of carrying goods between towns', Object.entries(Cn), s.cost)}${select('head', 'At the start', [['0', 'An even split, fifty each'], ['1', 'East Town has one extra workshop']], s.head)}${button('run', 'Run twelve seasons')}${table(['Transport', 'Start', 'East Town after 12 seasons'], s.runs.map((r) => [Cn[r.cost].split(':')[0], r.head === '1' ? '+1 East' : 'even', pct(r.end)]))}`;
      L.bind('cost', () => { s.cost = L.val('cost'); L.save(); }, 'change'); L.bind('head', () => { s.head = L.val('head'); L.save(); }, 'change');
      L.bind('run', () => { if (!L.started()) return; const p = towns(Number(s.cost), s.head === '1'); s.last = { cost: s.cost, head: s.head }; if (!s.runs.some((r) => r.cost === s.cost && r.head === s.head)) s.runs.push({ cost: s.cost, head: s.head, end: p[12] }); L.result(`${Cn[s.cost]}; ${s.head === '1' ? 'East Town begins with one extra workshop' : 'an even start'}. After twelve seasons East Town holds ${pct(p[12])} of the workshops.`); L.change(); });
      const g = (c) => s.runs.find((r) => r.cost === c && r.head === '1');
      L.ready(() => !!g('0.8') && !!g('0.2'), () => `From the same one-workshop head start, East Town ended with ${pct(g('0.8').end)} of the workshops when transport was costly and ${pct(g('0.2').end)} when it was cheap.`);
    };
    // 35 — rings of help
    const HELP = { A: { rings: [[3, 3], [4, 2], [4, 1]], assoc: [[6, 3], [5, 3]] }, B: { rings: [[2, 2], [5, 3], [4, 0]], assoc: [[6, 3], [5, 2]] } };
    labs[35] = (L) => {
      const { s } = L; s.done = s.done || []; s.hh = s.hh || 'A'; const H = HELP[s.hh], rn = ['Kin', 'Neighbours', 'Acquaintances'], key = (k) => s.hh + k, has = (k) => s.done.includes(key(k));
      L.board.innerHTML = `<h3>Household ${s.hh} at harvest</h3><div class="lab-rings">${[2, 1, 0].map((i) => `<div class="ring r${i}">`).join('')}<b>${s.hh}</b></div></div></div>${has('ring') ? bars(H.rings.map((r, i) => [rn[i] + ` (${r[1]} of ${r[0]})`, (r[1] / r[0]) * 100, 100, 0]), '%') : ''}${has('assoc') ? bars(H.assoc.map((r, i) => [(i ? 'Non-members' : 'Association members') + ` (${r[1]} of ${r[0]})`, (r[1] / r[0]) * 100, 100, 0]), '%') : ''}<p class="note">Bars show the share of households in each group that came to help. Eleven other households; invented tallies.</p>`;
      L.controls.innerHTML = `<h3>Trace the help</h3>${select('hh', 'Household', [['A', 'Household A, by the well'], ['B', 'Household B, at the lane’s end']], s.hh)}${button('ring', (has('ring') ? '✓ ' : '') + 'Tally help by ring')}${button('assoc', (has('assoc') ? '✓ ' : '') + 'Tally help by association membership')}<p class="note">The two households have different kin and different neighbours. The association has the same members whoever asks.</p>`;
      L.bind('hh', () => { s.hh = L.val('hh'); L.change(); }, 'change');
      L.bind('ring', () => { if (!L.started()) return; if (!has('ring')) s.done.push(key('ring')); L.result(`Household ${s.hh}: ${H.rings.map((r, i) => `${r[1]} of ${r[0]} ${rn[i].toLowerCase()}`).join(', ')} came to help. Help thins with every ring.`); L.change(); });
      L.bind('assoc', () => { if (!L.started()) return; if (!has('assoc')) s.done.push(key('assoc')); L.result(`Household ${s.hh}: ${H.assoc[0][1]} of ${H.assoc[0][0]} association members and ${H.assoc[1][1]} of ${H.assoc[1][0]} non-members came. Membership tells you little.`); L.change(); });
      L.ready(() => (s.done.includes('Aring') || s.done.includes('Bring')) && (s.done.includes('Aassoc') || s.done.includes('Bassoc')) && s.done.some((k) => k[0] === 'A') && s.done.some((k) => k[0] === 'B'), () => 'For both households, kin helped most, neighbours less and acquaintances least, while association members were barely more likely to help than non-members. Each household’s rings were made of different people.');
    };
    // 36 — who is in the sample
    const DIST = { Harbour: [22, 26, 30, 36, 44], 'Hill suburb': [60, 72, 90, 120, 180], Farms: [6, 8, 9, 11, 14], 'Beyond the railway': [2, 3, 3, 4, 6] };
    const lorenz = (keys) => { const a = keys.flatMap((k) => DIST[k]).sort((x, y) => x - y), tot = a.reduce((x, y) => x + y, 0), n = a.length, q = []; for (let i = 1; i <= 5; i++) q.push(a.slice(0, Math.round((n * i) / 5)).reduce((x, y) => x + y, 0) / tot); return { q, gini: gini(a), n, poorest: q[0] }; };
    labs[36] = (L) => {
      const { s } = L; s.runs = s.runs || []; s.frame = s.frame || 'old'; const F = { old: ['The old map: harbour and hill suburb', ['Harbour', 'Hill suburb']], all: ['Every district', Object.keys(DIST)] }, last = s.last ? lorenz(F[s.last][1]) : null;
      L.board.innerHTML = `<h3>Share of all income held by the poorest…</h3>${last ? bars(last.q.map((v, i) => [`${(i + 1) * 20}% of households`, v * 100, 100, 0]), '%') + `<p>${last.n} households surveyed. Gini coefficient <b>${fmt(last.gini, 2)}</b>. The poorest fifth hold ${fmt(last.poorest * 100)}% of the income.</p>` : '<p class="muted">Draw a sample first.</p>'}<p class="note">In a perfectly equal country the bars would read 20, 40, 60, 80, 100.</p>`;
      L.controls.innerHTML = `<h3>Where will the survey go?</h3>${select('frame', 'Sampling frame', Object.entries(F).map(([k, v]) => [k, v[0]]), s.frame)}${button('run', 'Send out the enumerators')}${table(['Frame', 'Households', 'Poorest fifth’s share', 'Gini'], s.runs.map((r) => [F[r.frame][0].split(':')[0], r.n, fmt(r.poorest * 100) + '%', fmt(r.gini, 2)]))}`;
      L.bind('frame', () => { s.frame = L.val('frame'); L.save(); }, 'change');
      L.bind('run', () => { if (!L.started()) return; const o = lorenz(F[s.frame][1]); s.last = s.frame; if (!s.runs.some((r) => r.frame === s.frame)) s.runs.push({ frame: s.frame, n: o.n, poorest: o.poorest, gini: o.gini }); L.result(`${F[s.frame][0]}: ${o.n} households. The poorest fifth hold ${fmt(o.poorest * 100)}% of income; the Gini coefficient is ${fmt(o.gini, 2)}.`); L.change(); });
      const g = (k) => s.runs.find((r) => r.frame === k);
      L.ready(() => !!g('old') && !!g('all'), () => `With the old map the Gini coefficient was ${fmt(g('old').gini, 2)} and the poorest fifth held ${fmt(g('old').poorest * 100)}% of income. With every district surveyed it was ${fmt(g('all').gini, 2)} and ${fmt(g('all').poorest * 100)}%.`);
    };
    // 37 — where close ties live
    const TIES = [['Mrs Adeyemi, No. 12', 1, 3, 1], ['Mr Kowalski, No. 14', 0, 4, 1], ['Ms Tran, No. 18', 1, 2, 2], ['Mr Olsen, No. 20', 2, 3, 0], ['Ms Dubois, No. 23', 0, 3, 2], ['Mr Clarke, corner flat', 1, 4, 0]];
    labs[37] = (L) => {
      const { s } = L; s.seen = s.seen || []; const done = s.seen.length === TIES.length, tot = (i) => s.seen.reduce((a, k) => a + TIES[k][i], 0);
      L.board.innerHTML = `<h3>“Who are the five people you feel closest to?”</h3><div class="lab-row">${TIES.map((t, i) => button('r' + i, (s.seen.includes(i) ? '✓ ' : '') + t[0], false, s.seen.includes(i) ? 'selected' : '')).join('')}</div>${table(['Resident', 'On this street', 'Elsewhere in the city', 'Another city'], s.seen.map((i) => TIES[i]))}`;
      L.controls.innerHTML = `<h3>Three stories about community</h3>${button('tally', (s.tally ? '✓ ' : '') + 'Tally where close ties live', !done)}${s.tally ? bars([['On the street', tot(1), 30, 0], ['Across the city', tot(2), 30, 0], ['Another city', tot(3), 30, 0]]) : ''}<p class="note"><b>Lost:</b> people have few close ties. <b>Saved:</b> ties are close and local. <b>Liberated:</b> ties are close but spread out.</p>`;
      TIES.forEach((t, i) => L.bind('r' + i, () => { if (!L.started()) return; if (!s.seen.includes(i)) s.seen.push(i); L.result(`${t[0]}: ${t[1]} close ${t[1] === 1 ? 'tie' : 'ties'} on the street, ${t[2]} elsewhere in the city, ${t[3]} in another city.`); L.change(); }));
      L.bind('tally', () => { s.tally = true; L.result(`Of 30 close ties, ${tot(1)} live on the street, ${tot(2)} elsewhere in the city and ${tot(3)} in another city. Everyone named five people: community is not lost, and it is not mainly local.`); L.change(); });
      L.ready(() => done && !!s.tally, () => `Six residents named 30 close ties: ${tot(1)} on their own street, ${tot(2)} elsewhere in the city and ${tot(3)} further away.`);
    };
  }
})();
