/* The Society Atlas V2 — campus definitions.
   Each university has its own hand-laid plan. Plans are compact reconstructions:
   real landmarks and traditions inform them, but distances, footprints and
   interiors are designed for play. No seals, crests, logos or mascot artwork. */
(function () {
  'use strict';
  const host = typeof window !== 'undefined' ? window : globalThis;
  const SA = host.SA;
  const C = {};

  // ---------- shared building blocks ----------
  function frame(P, T, o = {}) {
    const N = P.N;
    P.fill(0, 0, N, 3, T.FOREST).fill(0, N - 3, N, 3, T.FOREST).fill(0, 0, 3, N, T.FOREST).fill(N - 3, 0, 3, N, T.FOREST);
    if (o.roadS !== false) P.road('x', o.roadS || 50, { track: o.track });
    if (o.roadE) P.road('y', o.roadE, { track: o.trackE });
    if (o.roadW) P.road('y', o.roadW, {});
  }
  const plaza = (P, T, x, y, w, h, t) => { P.fill(x, y, w, h, t || P.def.plaza || T.BRICK); P.reserve(x, y, w, h); };
  // South plaza: directory board, workshop table, flags and the arrival point.
  function entry(P, T, cx, y) {
    plaza(P, T, cx - 4, y, 9, 5);
    P.prop('kiosk', cx - 2, y + 1); P.poi('directory', cx - 2, y + 2, 'South-plaza directory');
    P.prop('table', cx + 2, y + 1); P.poi('workshop', cx + 2, y + 2, 'Campus workshop');
    P.prop('flag', cx - 4, y, { cols: P.def.colors }); P.prop('flag', cx + 4, y, { cols: P.def.colors });
    P.poi('spawn', cx, y + 3);
    P.path([cx, y + 4], [cx, 49], 3, P.def.plaza || T.BRICK, 'y');
  }
  const hall = (P, x, y, w, h, name, o = {}) => P.build(x, y, w, h, { name, ...o });
  const alley = (P, kind, x0, y0, x1, y1, step = 3, o = {}) => P.row(kind, x0, y0, x1, y1, step, o);
  const office = (P, x, y, w, h, visit, o = {}) => P.build(x, y, w, h, { role: 'office', name: visit.office || 'Research rooms', label: visit.office || 'Research rooms', height: 60, ...o });

  function def(key, d) { C[key] = { key, N: 56, style: 'hall', path: 3, plaza: 4, trees: ['elm', 'oak', 'lime'], ...d }; }

  // =====================================================================
  def('penn', {
    name: 'University of Pennsylvania', short: 'Penn', city: 'Philadelphia', colors: ['#2c4564', '#963e43'],
    wall: '#718370', roof: '#555c65', path: 4, plaza: 4, trees: ['elm', 'lime', 'oak'], treeDensity: 0.07,
    landmark: { name: 'College Hall', style: 'endTowers' },
    notes: ['College Hall in green serpentine stone, with both end towers as they stood in the 1890s.', 'A horse tram on Woodland Avenue and the brick rows of the Seventh Ward to the east.'],
    plan(P, v, T) {
      frame(P, T, { track: true, roadE: 36 });
      entry(P, T, 22, 44);
      P.build(15, 7, 11, 6, { type: 'landmark', style: 'endTowers', height: 74, role: 'landmark', name: 'College Hall' });
      P.build(26, 23, 7, 5, { type: 'library', wall: '#a3523c', roof: '#5a3b33', role: 'library', name: 'University Library', height: 60 });
      P.build(7, 34, 6, 4, { type: 'archive', role: 'archive', name: 'Campus archive', height: 50 });
      hall(P, 6, 9, 6, 5, 'Medical Hall', { height: 62 }); hall(P, 7, 21, 6, 5, 'Logan Hall', { height: 58, style: 'gothic' });
      hall(P, 28, 9, 5, 5, 'Hare Laboratory', { height: 54, wall: '#8d7a63' });
      plaza(P, T, 14, 14, 13, 2, T.BRICK);
      P.path([22, 44], [20, 16], 2, T.BRICK, 'y'); P.path([9, 19], [34, 19], 1, T.BRICK); P.path([13, 30], [34, 30], 1, T.BRICK);
      P.line(14, 30, 20, 20, 1, T.BRICK); P.line(27, 30, 21, 20, 1, T.BRICK); P.path([33, 44], [33, 16], 1, T.BRICK, 'y');
      P.prop('statue', 20, 17, { figure: 'scholar' }); P.prop('well', 12, 26); P.prop('cart', 31, 33); P.prop('crates', 30, 21);
      // The Seventh Ward: four rows of brick houses east of the avenue.
      const rows = [['Market Street', 9], ['Pine Street', 17], ['Cedar Street', 25], ['Canal Lane', 35]];
      rows.forEach(([name, y], i) => {
        P.fill(40, y + 3, 13, 2, T.COBBLE);
        P.build(41, y, i === 3 ? 8 : 11, 3, { type: 'rowhouse', wall: ['#a5684e', '#9c5b44', '#ab7354', '#8f5a48'][i], roof: '#4a4c4e', height: 46, name });
        P.poi('street' + i, 46, y + 3, name, { street: i });
      });
      P.fill(39, 6, 1, 36, T.COBBLE); P.fill(52, 12, 1, 22, T.COBBLE);
      P.fill(49, 34, 4, 1, T.DIRT); P.fill(50, 30, 1, 5, T.DIRT);          // the lane hides behind Cedar Street
      office(P, 45, 4, 6, 3, v, { type: 'archive', wall: '#ab7354', roof: '#40515a', height: 46 });
      P.prop('stall', 44, 13, { col: '#a5422f' }); P.prop('stall', 49, 13, { col: '#3f6a52', goods: ['#e7e0c9', '#c9b27a'] });
      P.prop('barrel', 40, 20); P.prop('cart', 47, 29); P.prop('crates', 51, 21); P.prop('well', 44, 22);
      P.pois.task = { x: 40, y: 8, w: 13, h: 32 };
      P.pois.tram = { y: 50 };
    },
  });

  def('harvard', {
    name: 'Harvard University', short: 'Harvard', city: 'Cambridge, Massachusetts', colors: ['#913c46', '#d9c9aa'],
    wall: '#a96a50', roof: '#626268', path: 3, plaza: 4, trees: ['elm', 'elm', 'oak', 'lime'], treeDensity: 0.1,
    landmark: { name: 'Widener Library', style: 'columns' },
    notes: ['The Yard, with its web of diagonal paths under tall elms.', 'A seated bronze whose shoe visitors rub for luck, and rowing shells on the river.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.river('y', 47, 5, 1.2); P.line(42, 30, 53, 30, 2, T.STONE);
      entry(P, T, 24, 44);
      P.build(17, 6, 12, 6, { type: 'landmark', style: 'columns', height: 74, role: 'landmark', name: 'Widener Library' });
      hall(P, 20, 21, 8, 4, 'University Hall', { wall: '#c9c5b6', roof: '#5b6067', height: 56 });
      P.build(6, 34, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      P.build(33, 33, 6, 5, { type: 'library', role: 'library', name: 'Lamont Library', height: 56 });
      for (const [x, y, n] of [[6, 8, 'Hollis Hall'], [6, 16, 'Stoughton Hall'], [6, 25, 'Holworthy Hall'], [34, 15, 'Sever Hall'], [34, 24, 'Emerson Hall']]) hall(P, x, y, 5, 5, n, { height: 58 });
      P.build(32, 4, 7, 5, { type: 'secondary', style: 'endTowers', wall: '#9a4f3f', roof: '#4b4a52', height: 66, name: 'Memorial Hall' });
      office(P, 41, 8, 5, 5, v, { style: 'urban', wall: '#c9c2b0', roof: '#7b7d7a', height: 96 });
      plaza(P, T, 20, 14, 8, 2, T.BRICK);
      for (const [a, b] of [[[24, 44], [13, 14]], [[24, 44], [33, 14]], [[12, 30], [33, 20]], [[12, 20], [33, 31]], [[12, 14], [33, 14]], [[24, 44], [24, 26]], [[12, 38], [40, 38]]]) P.line(a[0], a[1], b[0], b[1], 1, T.GRAVEL);
      P.path([40, 38], [43, 14], 1, T.GRAVEL, 'x'); P.path([39, 30], [42, 30], 1, T.GRAVEL);
      P.prop('statue', 24, 26, { figure: 'seated', shoe: true }); P.thing('shoe', 24, 27, 'Rub the bronze shoe');
      P.prop('gatepost', 19, 49); P.prop('gatepost', 29, 49); P.row('fence', 6, 49, 17, 49, 2, { col: '#3b3f3c' }); P.row('fence', 31, 49, 40, 49, 2, { col: '#3b3f3c' });
      P.boats.push({ x: 49, y: 18, len: 20, axis: 'y' }, { x: 50, y: 36, len: 9, axis: 'y' });
      P.prop('bikes', 30, 39); P.prop('bikes', 13, 31);
      P.pois.task = { x: 13, y: 27, w: 9, h: 9 };
    },
  });

  def('indiana', {
    name: 'Indiana University Bloomington', short: 'Indiana', city: 'Bloomington, Indiana', colors: ['#922e3e', '#e0d5ba'],
    wall: '#cdbf9f', roof: '#6a6257', path: 3, plaza: 5, trees: ['oak', 'elm', 'lime', 'oak'], treeDensity: 0.13, wild: 'flowers',
    landmark: { name: 'Sample Gates', style: 'gates' },
    notes: ['Limestone gates opening onto the wooded Old Crescent.', 'A stream wandering through campus and bicycles everywhere.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.river('x', 22, 2, 2.2, 4, 52);
      entry(P, T, 24, 44);
      const g = P.build(20, 40, 9, 2, { type: 'landmark', style: 'gates', height: 60, role: 'landmark', name: 'Sample Gates' });
      for (let x = 23; x <= 25; x++) for (let y = 40; y <= 41; y++) { P.block[P.i(x, y)] = 0; P.set(x, y, T.STONE); }
      g.door = { x: 24, y: 42 }; P.pois.landmark.x = 24; P.pois.landmark.y = 42;
      P.fill(8, 26, 12, 12, T.FOREST);                                    // the woods
      P.build(30, 6, 9, 5, { type: 'secondary', style: 'clocktower', height: 70, name: 'Student Building', wall: '#cbbd9c' });
      hall(P, 9, 8, 7, 5, 'Maxwell Hall', { style: 'gothic', height: 60 }); hall(P, 19, 7, 7, 5, 'Owen Hall', { height: 56 });
      hall(P, 31, 28, 6, 5, 'Kirkwood Hall', { style: 'gothic', height: 58 });
      P.build(6, 40, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      P.build(33, 36, 6, 5, { type: 'library', role: 'library', name: 'Franklin Hall Library', height: 58 });
      office(P, 43, 9, 6, 4, v, { type: 'archive', wall: '#b9a47f', roof: '#5a4f47', height: 48 });
      P.path([24, 40], [24, 14], 2, T.GRAVEL, 'y'); P.path([10, 15], [47, 15], 1, T.GRAVEL); P.path([24, 33], [42, 33], 1, T.GRAVEL);
      P.line(24, 38, 12, 26, 1, T.DIRT); P.line(12, 26, 12, 15, 1, T.DIRT); P.path([42, 33], [45, 14], 1, T.GRAVEL, 'x');
      plaza(P, T, 39, 18, 5, 3, T.STONE); P.prop('fountain', 41, 19);
      P.prop('bikes', 27, 43); P.prop('bikes', 30, 34); P.prop('bikes', 40, 15); P.prop('bench', 13, 31);
      P.pois.task = { x: 14, y: 17, w: 26, h: 9 };
    },
  });

  def('ucla', {
    name: 'University of California, Los Angeles', short: 'UCLA', city: 'Los Angeles', colors: ['#5685a4', '#c8aa5d'],
    wall: '#b9744f', roof: '#a5553a', path: 4, plaza: 4, trees: ['palm', 'olive', 'pine', 'palm', 'cypress'], treeDensity: 0.06, season: 'summer',
    landmark: { name: 'Royce Hall', style: 'twintower' },
    notes: ['Romanesque brick towers over a sunny quad, with broad steps running down the hill.', 'A bronze bear in the plaza and a fountain that drains inward.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 24, 44);
      P.build(17, 6, 11, 6, { type: 'landmark', style: 'twintower', height: 76, role: 'landmark', name: 'Royce Hall' });
      P.build(17, 24, 9, 5, { type: 'library', role: 'library', name: 'Powell Library', height: 62 });
      plaza(P, T, 14, 13, 17, 10, T.SAND); P.fill(16, 15, 13, 6, T.GRASS); P.reserve(16, 15, 13, 6);
      for (let i = 0; i < 9; i++) P.fill(6, 14 + i, 7, 1, i % 2 ? T.STONE : T.SAND);   // the long steps
      P.build(6, 35, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      hall(P, 32, 6, 6, 5, 'Haines Hall', { height: 58 }); hall(P, 32, 16, 6, 5, 'Kinsey Hall', { height: 58 }); hall(P, 6, 6, 6, 5, 'Physics Building', { height: 56 });
      office(P, 42, 8, 7, 5, v, { style: 'urban', wall: '#c6ad8c', roof: '#8a7f73', height: 74 });
      plaza(P, T, 28, 34, 8, 6, T.BRICK); P.prop('statue', 31, 36, { figure: 'bear', col: '#7a5a34' }); P.thing('bear', 31, 37, 'Pat the bronze bear');
      plaza(P, T, 39, 22, 6, 5, T.STONE); P.prop('fountain', 42, 24, { col: '#9c8f7b' }); P.thing('fountain', 42, 26, 'Look into the inward fountain');
      P.path([24, 44], [22, 30], 2, T.BRICK, 'y'); P.path([12, 30], [44, 30], 1, T.BRICK); P.path([44, 30], [45, 14], 1, T.BRICK, 'x'); P.path([9, 23], [9, 34], 1, T.BRICK);
      alley(P, 'palm', 20, 31, 20, 43, 3); alley(P, 'palm', 27, 31, 27, 43, 3); alley(P, 'cypress', 14, 12, 30, 12, 4);
      P.pois.task = { x: 16, y: 15, w: 13, h: 6 };
    },
  });

  def('notreDame', {
    name: 'University of Notre Dame', short: 'Notre Dame', city: 'Notre Dame, Indiana', colors: ['#2d425a', '#c4a25a'],
    wall: '#c8b182', roof: '#5f5a56', path: 3, plaza: 5, trees: ['oak', 'elm', 'lime', 'maple'], treeDensity: 0.1,
    landmark: { name: 'Main Building', style: 'goldDome' },
    notes: ['A golden dome at the head of a tree-lined quad.', 'Two quiet lakes behind it, and a stone grotto lit with candles.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.pond(11, 9, 6, 4); P.pond(11, 20, 4, 3);
      entry(P, T, 26, 44);
      P.build(20, 8, 12, 6, { type: 'landmark', style: 'goldDome', height: 72, role: 'landmark', name: 'Main Building' });
      P.build(34, 8, 6, 7, { type: 'secondary', style: 'endTowers', wall: '#cdb98b', roof: '#5b5a5e', height: 62, name: 'Basilica' });
      hall(P, 15, 22, 5, 6, 'Sorin Hall', { style: 'gothic', height: 58 }); hall(P, 32, 22, 5, 6, 'Washington Hall', { height: 58 });
      hall(P, 15, 32, 5, 6, 'Walsh Hall', { height: 56 });
      P.build(33, 32, 6, 5, { type: 'library', role: 'library', name: 'Lemonnier Library', height: 58 });
      P.build(7, 37, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      office(P, 43, 9, 6, 5, v, { style: 'gothic', height: 62 });
      P.line(26, 44, 22, 16, 1, T.GRAVEL); P.line(26, 44, 30, 16, 1, T.GRAVEL); plaza(P, T, 21, 15, 10, 2, T.STONE);
      P.path([21, 30], [31, 30], 1, T.GRAVEL); P.path([31, 38], [45, 15], 1, T.GRAVEL, 'x'); P.path([20, 16], [8, 15], 1, T.DIRT); P.path([8, 15], [8, 24], 1, T.DIRT, 'y'); P.path([13, 38], [22, 38], 1, T.GRAVEL);
      P.prop('statue', 26, 19, { figure: 'scholar', col: '#8c7a4a' });
      P.prop('rock', 6, 14); P.prop('rock', 7, 15); P.prop('lantern', 8, 14, { col: '#f0c75a' }); P.prop('lantern', 6, 16, { col: '#f0c75a' }); P.thing('grotto', 8, 15, 'Light a candle at the grotto');
      P.boats.push({ x: 11, y: 9, len: 3, axis: 'x' });
      P.pois.task = { x: 22, y: 20, w: 9, h: 9 };
    },
  });

  def('columbia', {
    name: 'Columbia University', short: 'Columbia', city: 'New York', colors: ['#8db4c6', '#e3dcc5'],
    wall: '#a8644c', roof: '#7f9488', path: 4, plaza: 5, trees: ['lime', 'elm', 'oak'], treeDensity: 0.05,
    landmark: { name: 'Low Memorial Library', style: 'lowDome' },
    notes: ['A domed library above a great flight of steps, with a bronze figure seated before it.', 'Somewhere in the folds of her robe hides an owl.'],
    plan(P, v, T) {
      frame(P, T, { roadE: 48 });
      entry(P, T, 24, 44);
      P.build(18, 5, 12, 7, { type: 'landmark', style: 'lowDome', height: 70, role: 'landmark', name: 'Low Memorial Library' });
      for (let i = 0; i < 6; i++) P.fill(14, 12 + i, 20, 1, i % 2 ? T.STONE : T.SAND);   // the steps
      P.reserve(14, 12, 20, 6);
      P.prop('statue', 24, 16, { figure: 'seated', col: '#6f7f6a' }); P.thing('owl', 24, 17, 'Search the statue for the hidden owl');
      P.prop('fountain', 17, 19, { col: '#a9a391' }); P.prop('fountain', 31, 19, { col: '#a9a391' });
      plaza(P, T, 6, 21, 40, 3, T.BRICK);                                               // College Walk
      P.prop('gatepost', 6, 20); P.prop('gatepost', 6, 24); P.prop('gatepost', 45, 20); P.prop('gatepost', 45, 24);
      P.fill(14, 26, 20, 12, T.GRASS); P.fill(23, 24, 2, 20, T.BRICK);
      P.build(6, 33, 6, 5, { type: 'archive', role: 'archive', name: 'University Archives', height: 54 });
      P.build(36, 29, 8, 6, { type: 'secondary', style: 'columns', wall: '#c9bda3', roof: '#6b7a70', height: 66, role: 'library', name: 'Butler Library' });
      for (const [x, y, n, s] of [[6, 6, 'Lewisohn Hall', 'urban'], [6, 13, 'Dodge Hall', 'hall'], [34, 5, 'Philosophy Hall', 'hall'], [6, 26, 'Journalism Hall', 'urban'], [36, 38, 'John Jay Hall', 'urban']]) hall(P, x, y, 6, 5, n, { style: s, height: s === 'urban' ? 78 : 62 });
      office(P, 41, 12, 5, 5, v, { style: 'urban', height: 84 });
      P.path([44, 22], [43, 18], 1, T.BRICK, 'y'); P.path([12, 38], [36, 40], 1, T.BRICK);
      alley(P, 'lime', 7, 20, 44, 20, 5); alley(P, 'lime', 7, 24, 44, 24, 5);
      P.prop('sign', 46, 46, { col: '#3f6a52' }); P.thing('subway', 46, 47, 'Listen at the subway grate');
      P.pois.task = { x: 14, y: 26, w: 9, h: 12 };
    },
  });

  def('mit', {
    name: 'Massachusetts Institute of Technology', short: 'MIT', city: 'Cambridge, Massachusetts', colors: ['#8d3e49', '#b3b5ac'],
    wall: '#cfc8b4', roof: '#8e948a', path: 5, plaza: 5, trees: ['oak', 'lime', 'elm'], treeDensity: 0.05,
    landmark: { name: 'Great Dome', style: 'dome' },
    notes: ['A great dome above a formal court that opens to the river.', 'A bridge measured in an unusual unit, and now and then something odd on the dome.'],
    plan(P, v, T) {
      frame(P, T, { roadS: 44 });
      P.river('x', 48, 6, 0.8); P.fill(8, 46, 3, 10, T.BRIDGE);
      plaza(P, T, 20, 36, 9, 5, T.STONE);
      P.prop('kiosk', 22, 37); P.poi('directory', 22, 38, 'South-plaza directory'); P.prop('table', 26, 37); P.poi('workshop', 26, 38, 'Campus workshop');
      P.prop('flag', 20, 36, { cols: this.colors }); P.prop('flag', 28, 36, { cols: this.colors }); P.poi('spawn', 24, 40); P.path([24, 40], [24, 43], 3, T.STONE, 'y');
      P.build(18, 6, 12, 6, { type: 'landmark', style: 'dome', height: 72, role: 'landmark', name: 'Great Dome' });
      for (const [x, y, h, n] of [[11, 13, 9, 'Building 3'], [11, 24, 9, 'Building 1'], [33, 13, 9, 'Building 4'], [33, 24, 9, 'Building 2']]) hall(P, x, y, 5, h, n, { style: 'urban', height: 58 });
      hall(P, 6, 6, 7, 5, 'Building 7', { style: 'urban', height: 62 }); P.build(4, 34, 6, 4, { type: 'archive', role: 'archive', name: 'Institute Archives', height: 52, style: 'urban' });
      P.build(40, 30, 6, 5, { type: 'library', role: 'library', name: 'Hayden Library', style: 'urban', height: 56 });
      office(P, 42, 8, 7, 5, v, { style: 'urban', wall: '#b9b3a2', roof: '#6f756e', height: 80 });
      P.fill(17, 14, 15, 20, T.GRASS); P.path([24, 36], [24, 13], 2, T.STONE, 'y'); P.path([16, 13], [33, 13], 1, T.STONE); P.path([16, 34], [33, 34], 1, T.STONE); P.fill(16, 13, 1, 22, T.STONE); P.fill(32, 13, 1, 22, T.STONE);
      P.path([32, 20], [45, 14], 1, T.STONE, 'x'); P.path([32, 34], [42, 35], 1, T.STONE); P.path([10, 38], [20, 38], 1, T.STONE);
      P.thing('smoots', 9, 46, 'Read the marks on the bridge'); P.poi('bridge', 9, 45, 'Bridge');
      P.boats.push({ x: 20, y: 51, len: 24, axis: 'x', sail: true }, { x: 34, y: 52, len: 12, axis: 'x', sail: true });
      if (v.variant === 2) P.thing('domecar', 24, 13, 'Look up at the dome');
      P.pois.task = { x: 17, y: 16, w: 15, h: 17 };
    },
  });

  def('northeastern', {
    name: 'Northeastern University', short: 'Northeastern', city: 'Boston', colors: ['#963a3e', '#404c46'],
    wall: '#d2cbb8', roof: '#3f4844', style: 'urban', path: 4, plaza: 4, trees: ['lime', 'oak', 'elm'], treeDensity: 0.05,
    landmark: { name: 'Ell Hall', style: 'urban' },
    notes: ['A city campus on a streetcar avenue, all brick plazas and glass.', 'A bronze dog whose nose has been rubbed bright.'],
    plan(P, v, T) {
      frame(P, T, { track: true, roadE: 47 });
      entry(P, T, 24, 44);
      P.build(17, 8, 12, 6, { type: 'landmark', style: 'urban', height: 72, role: 'landmark', name: 'Ell Hall' });
      for (const [x, y, w, h, n, z] of [[6, 8, 7, 6, 'Richards Hall', 70], [32, 8, 7, 6, 'Dodge Hall', 70], [6, 20, 6, 7, 'Hayden Hall', 66], [35, 31, 7, 6, 'Curry Student Center', 62], [6, 30, 5, 3, 'Forsyth Building', 60]]) hall(P, x, y, w, h, n, { height: z });
      P.build(6, 36, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 54 });
      P.build(33, 20, 7, 6, { type: 'library', role: 'library', name: 'Snell Library', height: 64 });
      office(P, 40, 9, 5, 6, v, { wall: '#9fb3b0', roof: '#4b5a58', height: 98 });
      plaza(P, T, 14, 15, 18, 3, T.BRICK); P.ellipse(23, 28, 8, 6, T.GRASS); P.reserve(15, 22, 17, 13);
      P.line(15, 28, 31, 28, 1, T.BRICK); P.line(23, 22, 23, 34, 1, T.BRICK); P.line(17, 24, 29, 32, 1, T.BRICK); P.line(29, 24, 17, 32, 1, T.BRICK);
      P.path([24, 44], [23, 35], 2, T.BRICK, 'y'); P.path([13, 19], [13, 40], 1, T.BRICK); P.path([32, 18], [43, 16], 1, T.BRICK); P.path([32, 28], [33, 40], 1, T.BRICK, 'y');
      P.prop('statue', 30, 41, { figure: 'dog', col: '#7a6a4a', nose: true }); P.thing('dog', 30, 42, 'Rub the bronze nose');
      for (const [x, y] of [[14, 42], [33, 42], [30, 19], [12, 27]]) P.prop('bikes', x, y);
      P.pois.tram = { y: 50 };
      P.pois.task = { x: 15, y: 22, w: 17, h: 13 };
    },
  });

  def('stanford', {
    name: 'Stanford University', short: 'Stanford', city: 'Stanford, California', colors: ['#913d46', '#d9ccb0'],
    wall: '#d2b98a', roof: '#a5553a', style: 'arcade', path: 7, plaza: 7, trees: ['palm', 'olive', 'oak', 'cypress'], treeDensity: 0.06, season: 'summer',
    landmark: { name: 'Memorial Church', style: 'arcade' },
    notes: ['Sandstone arcades and red tile around a sunlit court, at the end of a long palm drive.', 'Fountains that students have a habit of climbing into.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 26, 44);
      P.build(19, 5, 14, 7, { type: 'landmark', style: 'arcade', height: 80, role: 'landmark', name: 'Memorial Church' });
      plaza(P, T, 14, 12, 24, 14, T.SAND);
      for (const [x, y, w, h, n] of [[9, 12, 5, 6, 'Jordan Hall'], [9, 20, 5, 6, 'Building 60'], [38, 12, 5, 6, 'Building 200'], [38, 20, 5, 6, 'Building 120']]) hall(P, x, y, w, h, n, { height: 38 });
      hall(P, 14, 26, 9, 3, 'Building 10', { height: 36 }); hall(P, 29, 26, 9, 3, 'Building 1', { height: 36 });
      for (const [x, y] of [[18, 15], [33, 15], [18, 22], [33, 22]]) { P.ellipse(x, y, 2, 2, T.GRASS); P.prop('palm', x, y); }
      P.ellipse(26, 35, 7, 4, T.GRASS); P.reserve(19, 31, 15, 9); for (let i = -3; i <= 3; i++) P.prop('flowers', 26 + i, 35, { cols: ['#b23a48', '#f1e9d8'] });
      P.path([26, 44], [26, 40], 3, T.SAND, 'y'); P.path([19, 31], [19, 40], 1, T.SAND); P.path([33, 31], [33, 40], 1, T.SAND); P.path([19, 40], [33, 40], 1, T.SAND); P.path([19, 30], [33, 30], 1, T.SAND);
      P.fill(24, 26, 5, 5, T.SAND);
      alley(P, 'palm', 21, 42, 21, 48, 2); alley(P, 'palm', 31, 42, 31, 48, 2);
      P.build(5, 34, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 40 });
      P.build(38, 32, 7, 5, { type: 'library', role: 'library', name: 'Green Library', height: 56 });
      P.build(45, 20, 4, 4, { type: 'secondary', style: 'cupola', wall: '#d8c39a', roof: '#a5553a', height: 104, name: 'Hoover Tower' });
      office(P, 44, 8, 6, 5, v, { height: 52 });
      plaza(P, T, 11, 30, 5, 4, T.SAND); P.prop('fountain', 13, 31, { col: '#b9a47c' }); P.thing('fountainhop', 13, 33, 'Go fountain hopping');
      P.path([38, 18], [47, 14], 1, T.SAND, 'x'); P.path([11, 36], [19, 38], 1, T.SAND); P.path([34, 36], [41, 38], 1, T.SAND);
      for (const [x, y] of [[23, 31], [36, 29], [43, 30], [15, 28]]) P.prop('bikes', x, y);
      P.pois.task = { x: 15, y: 13, w: 22, h: 12 };
    },
  });

  def('pennState', {
    name: 'Pennsylvania State University', short: 'Penn State', city: 'State College, Pennsylvania', colors: ['#304f6f', '#e5e0ce'],
    wall: '#d0c5a8', roof: '#5d6268', path: 3, plaza: 5, trees: ['elm', 'elm', 'oak', 'maple'], treeDensity: 0.1,
    landmark: { name: 'Old Main', style: 'clocktower' },
    notes: ['A clock tower above a broad lawn, and a long mall of elms.', 'A stone lion in the trees, and the best ice cream on any campus.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 26, 44);
      P.build(20, 8, 12, 6, { type: 'landmark', style: 'clocktower', height: 70, role: 'landmark', name: 'Old Main' });
      P.fill(16, 16, 20, 26, T.GRASS); P.reserve(18, 18, 16, 22); P.line(26, 44, 22, 15, 1, T.GRAVEL); P.line(26, 44, 30, 15, 1, T.GRAVEL); plaza(P, T, 20, 14, 12, 2, T.STONE);
      P.row('fence', 8, 48, 20, 48, 2, { col: '#b5ad98' }); P.row('fence', 32, 48, 46, 48, 2, { col: '#b5ad98' });
      P.fill(8, 12, 2, 28, T.GRAVEL); alley(P, 'elm', 7, 12, 7, 40, 3); alley(P, 'elm', 10, 12, 10, 40, 3);
      P.build(5, 5, 8, 5, { type: 'library', role: 'library', name: 'Pattee Library', height: 62 });
      P.build(11, 40, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      hall(P, 38, 22, 6, 5, 'Sparks Building', { height: 58 }); hall(P, 38, 32, 6, 5, 'Willard Building', { height: 58 }); hall(P, 12, 28, 4, 6, 'Carnegie Building', { height: 54 });
      office(P, 41, 8, 7, 5, v, { style: 'urban', height: 70 });
      P.path([9, 12], [20, 12], 1, T.GRAVEL); P.path([36, 20], [44, 14], 1, T.GRAVEL, 'x'); P.path([36, 30], [38, 28], 1, T.GRAVEL); P.path([10, 40], [10, 44], 1, T.GRAVEL); P.path([13, 45], [22, 46], 1, T.GRAVEL);
      P.prop('rock', 4, 22); P.prop('statue', 5, 23, { figure: 'lion', col: '#b9ad94' }); P.thing('lion', 6, 24, 'Visit the stone lion'); P.path([8, 24], [6, 24], 1, T.DIRT);
      P.prop('icecart', 46, 28); P.thing('icecream', 46, 29, 'Buy an ice cream'); P.path([44, 28], [46, 29], 1, T.GRAVEL);
      P.prop('solar', 47, 17); P.prop('solar', 48, 19); P.prop('scooter', 28, 46); P.prop('scooter', 37, 21); P.prop('bikes', 18, 45);
      P.pois.task = { x: 18, y: 18, w: 16, h: 20 };
    },
  });

  def('washu', {
    name: 'Washington University in St. Louis', short: 'WashU', city: 'St. Louis', colors: ['#a3433d', '#627b59'],
    wall: '#af816c', roof: '#56635c', style: 'gothic', path: 3, plaza: 5, trees: ['oak', 'elm', 'lime'], treeDensity: 0.08,
    landmark: { name: 'Brookings Hall', style: 'gatewayTower' },
    notes: ['A gateway tower in pink granite, opening onto an ivy-hung quadrangle.', 'A painted underpass that changes overnight.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 24, 44);
      const g = P.build(18, 30, 12, 4, { type: 'landmark', style: 'gatewayTower', height: 66, role: 'landmark', name: 'Brookings Hall' });
      for (let y = 30; y <= 33; y++) for (let x = 23; x <= 24; x++) { P.block[P.i(x, y)] = 0; P.set(x, y, T.STONE); }
      g.door = { x: 24, y: 34 }; P.pois.landmark.x = 24; P.pois.landmark.y = 34;
      for (let i = 0; i < 4; i++) P.fill(18, 35 + i, 12, 1, i % 2 ? T.STONE : T.SAND);
      const q = P.quad(13, 12, 22, 18, { sides: 'NEW', depth: 4, b: { style: 'gothic', height: 58 }, north: { name: 'Ridgley Hall' }, west: { name: 'Busch Hall' }, east: { name: 'Cupples Hall' }, diag: true });
      P.prop('sundial', q.cx, q.cy);
      P.build(5, 36, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 52 });
      P.build(36, 34, 7, 5, { type: 'library', role: 'library', name: 'Olin Library', style: 'urban', wall: '#c9c0aa', height: 60 });
      hall(P, 5, 8, 6, 6, 'Graham Chapel', { style: 'gothic', height: 70 }); hall(P, 6, 22, 5, 6, 'Eads Hall', { height: 56 });
      office(P, 41, 8, 6, 5, v, { style: 'gothic', height: 62 });
      P.path([24, 30], [24, 26], 2, T.STONE, 'y'); P.path([35, 20], [44, 14], 1, T.GRAVEL, 'x'); P.path([35, 26], [39, 33], 1, T.GRAVEL, 'y'); P.path([12, 20], [8, 15], 1, T.GRAVEL); P.path([11, 38], [18, 39], 1, T.GRAVEL);
      P.row('paintfence', 38, 44, 46, 44, 2, { col: '#3f7fa8' }); P.thing('underpass', 42, 45, 'Read the painted underpass');
      P.pond(44, 26, 3, 2); P.prop('willow', 47, 29);
      P.pois.task = { x: q.lx, y: q.ly, w: q.lw, h: q.lh };
    },
  });

  def('cmu', {
    name: 'Carnegie Mellon University', short: 'Carnegie Mellon', city: 'Pittsburgh', colors: ['#963b3c', '#aaa99a'],
    wall: '#cdb98a', roof: '#617b6c', path: 3, plaza: 5, trees: ['oak', 'maple', 'elm'], treeDensity: 0.08,
    landmark: { name: 'Hamerschlag Hall', style: 'roundtower' },
    notes: ['Buff brick halls with green copper roofs along a sloping mall.', 'A fence students repaint every night, and the sound of bagpipes.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.fill(40, 34, 14, 16, T.FOREST); P.river('y', 46, 2, 1.5, 34, 49); P.line(40, 41, 50, 41, 1, T.BRIDGE);
      entry(P, T, 24, 44);
      P.build(6, 16, 10, 6, { type: 'landmark', style: 'roundtower', height: 72, role: 'landmark', name: 'Hamerschlag Hall' });
      P.fill(17, 14, 22, 10, T.GRASS); P.reserve(18, 15, 20, 8);                         // the Mall
      for (const [x, y, n] of [[18, 6, 'Doherty Hall'], [28, 6, 'Wean Hall'], [18, 26, 'Baker Hall'], [28, 26, 'Porter Hall']]) hall(P, x, y, 8, 5, n, { height: 58 });
      P.build(6, 36, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      P.build(31, 35, 7, 5, { type: 'secondary', style: 'columns', wall: '#d3c39a', roof: '#617b6c', height: 62, role: 'library', name: 'College of Fine Arts' });
      office(P, 41, 8, 6, 5, v, { style: 'urban', wall: '#c2b490', height: 72 });
      P.path([24, 44], [24, 32], 2, T.GRAVEL, 'y'); P.path([16, 32], [38, 32], 1, T.GRAVEL); P.path([16, 13], [40, 13], 1, T.GRAVEL); P.path([16, 24], [39, 24], 1, T.GRAVEL); P.fill(39, 13, 1, 12, T.GRAVEL); P.path([39, 14], [44, 14], 1, T.GRAVEL);
      P.fill(16, 23, 1, 10, T.GRAVEL); P.path([12, 36], [16, 32], 1, T.GRAVEL);
      P.row('paintfence', 22, 19, 30, 19, 2, { col: '#c7483a' }); P.thing('fence', 26, 20, 'Repaint the Fence');
      P.poi('piper', 33, 17, 'Piper'); P.prop('phonebox', 21, 43); P.prop('bikes', 28, 33);
      P.pois.task = { x: 18, y: 15, w: 20, h: 8 };
    },
  });

  def('princeton', {
    name: 'Princeton University', short: 'Princeton', city: 'Princeton, New Jersey', colors: ['#c17b42', '#39423b'],
    wall: '#b9a98a', roof: '#4d544e', style: 'gothic', path: 3, plaza: 5, trees: ['elm', 'oak', 'lime', 'elm'], treeDensity: 0.1,
    landmark: { name: 'Nassau Hall', style: 'cupola' },
    notes: ['An old stone hall with a cupola, guarded by two bronze tigers.', 'A front gate that undergraduates refuse to walk out of, and black squirrels on the lawns.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.river('y', 49, 3, 1, 4, 44);
      entry(P, T, 24, 44);
      P.prop('gatepost', 22, 49); P.prop('gatepost', 26, 49); P.row('fence', 8, 49, 20, 49, 2, { col: '#3b3f3c' }); P.row('fence', 28, 49, 42, 49, 2, { col: '#3b3f3c' }); P.thing('gate', 24, 49, 'Consider the front gate');
      P.build(18, 26, 12, 5, { type: 'landmark', style: 'cupola', height: 62, role: 'landmark', name: 'Nassau Hall' });
      P.prop('statue', 21, 32, { figure: 'tiger', col: '#5d6f62' }); P.prop('statue', 27, 32, { figure: 'tiger', col: '#5d6f62' }); P.thing('tigers', 24, 33, 'Greet the bronze tigers');
      P.fill(14, 33, 20, 10, T.GRASS); P.line(24, 44, 24, 32, 2, T.GRAVEL); P.line(24, 43, 15, 33, 1, T.GRAVEL); P.line(24, 43, 33, 33, 1, T.GRAVEL);
      const q = P.quad(12, 6, 24, 18, { sides: 'NEW', depth: 4, b: { style: 'gothic', height: 58 }, north: { name: 'East Pyne' }, west: { name: 'Witherspoon Hall' }, east: { name: 'McCosh Hall' } });
      P.prop('cannon', q.cx, q.cy);
      P.build(5, 34, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 52 });
      P.build(37, 28, 7, 6, { type: 'library', role: 'library', name: 'Firestone Library', height: 64 });
      P.build(4, 10, 6, 7, { type: 'secondary', style: 'gatewayTower', wall: '#b3a487', roof: '#4d544e', height: 56, name: 'Blair Arch' });
      office(P, 40, 8, 6, 5, v, { style: 'gothic', height: 62 });
      P.path([36, 16], [43, 14], 1, T.GRAVEL, 'x'); P.path([36, 22], [40, 27], 1, T.GRAVEL, 'y'); P.path([11, 36], [14, 36], 1, T.GRAVEL); P.path([24, 26], [24, 24], 1, T.GRAVEL); P.path([30, 30], [37, 31], 1, T.GRAVEL);
      P.boats.push({ x: 50, y: 14, len: 22, axis: 'y' });
      P.pois.task = { x: 14, y: 34, w: 20, h: 9 }; P.pois.blackSquirrels = { x: 0, y: 0 };
    },
  });

  // ---------- new campuses for the expanded atlas ----------
  def('chicago', {
    name: 'University of Chicago', short: 'Chicago', city: 'Chicago', colors: ['#7a2b2b', '#b9b3a2'],
    wall: '#a9a696', roof: '#6b5a4e', style: 'gothic', path: 5, plaza: 5, trees: ['elm', 'oak', 'lime'], treeDensity: 0.08, season: 'winter',
    landmark: { name: 'Rockefeller Chapel', style: 'endTowers' },
    notes: ['Grey Gothic quadrangles with gargoyles on every corner.', 'A frozen pond, a long sunken green, and a famously serious sense of fun.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.fill(5, 46, 46, 3, T.FIELD);                                                    // the Midway
      plaza(P, T, 20, 39, 9, 5); P.prop('kiosk', 22, 40); P.poi('directory', 22, 41, 'South-plaza directory'); P.prop('table', 26, 40); P.poi('workshop', 26, 41, 'Campus workshop');
      P.prop('flag', 20, 39, { cols: this.colors }); P.prop('flag', 28, 39, { cols: this.colors }); P.poi('spawn', 24, 43); P.path([24, 43], [24, 49], 3, T.STONE, 'y');
      const q1 = P.quad(6, 8, 20, 16, { sides: 'NEW', depth: 4, b: { height: 58 }, north: { name: 'Eckhart Hall' }, west: { name: 'Ryerson Laboratory' }, east: { name: 'Kent Laboratory' } });
      const q2 = P.quad(6, 24, 20, 14, { sides: 'WS', depth: 4, b: { height: 58 }, west: { name: 'Classics Building' }, south: { name: 'Harper Library' } });
      P.build(36, 26, 8, 6, { type: 'landmark', style: 'endTowers', height: 76, role: 'landmark', name: 'Rockefeller Chapel', wall: '#b3b0a0' });
      P.build(28, 30, 6, 5, { type: 'library', role: 'library', name: 'Harper Reading Room', height: 62 });
      P.build(5, 40, 6, 4, { type: 'archive', role: 'archive', name: 'Special Collections', height: 52 });
      hall(P, 28, 6, 8, 6, 'Regenstein Library', { style: 'urban', wall: '#b8b3a5', height: 70 });
      office(P, 41, 9, 6, 5, v, { height: 62 });
      P.pond(31, 20, 3, 2); P.prop('reeds', 34, 22); P.thing('pond', 31, 23, 'Watch the pond');
      P.path([24, 39], [27, 22], 1, T.STONE, 'y'); P.path([27, 15], [44, 15], 1, T.STONE); P.path([27, 15], [27, 38], 1, T.STONE, 'y'); P.path([27, 38], [40, 33], 1, T.STONE); P.path([11, 42], [20, 42], 1, T.STONE);
      P.prop('gatepost', 26, 13); P.prop('gatepost', 28, 13); P.thing('gargoyle', 27, 14, 'Look up at the gargoyles');
      P.prop('snowman', 15, 17); P.prop('snowman', 38, 47);
      void q2; P.pois.task = { x: q1.lx, y: q1.ly, w: q1.lw, h: q1.lh };
    },
  });

  def('michigan', {
    name: 'University of Michigan', short: 'Michigan', city: 'Ann Arbor, Michigan', colors: ['#27405e', '#e3c04a'],
    wall: '#b7785a', roof: '#5f5f5a', path: 4, plaza: 4, trees: ['oak', 'elm', 'maple', 'lime'], treeDensity: 0.1,
    landmark: { name: 'Hatcher Graduate Library', style: 'columns' },
    notes: ['A green crossed by diagonal walks, under a carillon tower.', 'A great cube that turns at a push, and very bold squirrels.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 24, 44);
      P.build(18, 30, 12, 6, { type: 'landmark', style: 'columns', height: 70, role: 'landmark', name: 'Hatcher Graduate Library', wall: '#c9bfa6' });
      P.fill(12, 10, 24, 20, T.GRASS); for (const [a, b] of [[[12, 10], [35, 29]], [[35, 10], [12, 29]], [[24, 10], [24, 29]], [[12, 20], [35, 20]]]) P.line(a[0], a[1], b[0], b[1], 1, T.BRICK);
      plaza(P, T, 22, 18, 5, 5, T.BRICK); P.fill(12, 9, 24, 1, T.BRICK); P.fill(12, 29, 24, 1, T.BRICK); P.fill(11, 9, 1, 21, T.BRICK); P.fill(36, 9, 1, 21, T.BRICK);
      P.build(21, 3, 5, 5, { type: 'secondary', style: 'cupola', wall: '#cfc7b2', roof: '#6b6f66', height: 100, name: 'Burton Tower' });
      for (const [x, y, n] of [[5, 10, 'Angell Hall'], [5, 20, 'Mason Hall'], [38, 20, 'Chemistry Building']]) hall(P, x, y, 5, 7, n, { height: 60 });
      hall(P, 10, 3, 8, 5, 'Natural Science Building', { height: 58 }); hall(P, 29, 3, 8, 5, 'Rackham Building', { height: 56, wall: '#cfc7b2' });
      P.build(5, 34, 6, 4, { type: 'archive', role: 'archive', name: 'Bentley Archives', height: 50 });
      P.build(34, 34, 8, 6, { type: 'library', role: 'library', name: 'Law Library', style: 'gothic', wall: '#b3a98f', height: 66 });
      office(P, 41, 8, 6, 5, v, { style: 'urban', wall: '#bfb7a2', height: 78 });
      P.path([24, 44], [16, 37], 2, T.BRICK, 'y'); P.path([16, 37], [16, 30], 1, T.BRICK); P.path([32, 37], [32, 30], 1, T.BRICK, 'y'); P.path([24, 40], [32, 37], 1, T.BRICK); P.path([37, 14], [44, 14], 1, T.BRICK); P.path([24, 9], [24, 8], 1, T.BRICK);
      P.prop('cube', 31, 42); P.thing('cube', 31, 43, 'Give the Cube a push');
      P.pois.task = { x: 13, y: 11, w: 22, h: 18 };
    },
  });

  def('yale', {
    name: 'Yale University', short: 'Yale', city: 'New Haven, Connecticut', colors: ['#2a4a73', '#e8e2d0'],
    wall: '#b0a48a', roof: '#565a54', style: 'gothic', path: 5, plaza: 5, trees: ['elm', 'oak', 'lime', 'elm'], treeDensity: 0.09,
    landmark: { name: 'Sterling Memorial Library', style: 'endTowers' },
    notes: ['A Gothic tower with a carillon above stone courtyards.', 'A marble cube of a library, and a statue whose toe is rubbed gold.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 24, 44);
      P.build(17, 5, 12, 6, { type: 'landmark', style: 'endTowers', height: 78, role: 'landmark', name: 'Sterling Memorial Library' });
      plaza(P, T, 16, 12, 14, 4, T.STONE); P.prop('fountain', 23, 13, { col: '#a7a08b' });
      const q = P.quad(8, 18, 22, 20, { sides: 'NEWS', depth: 4, gap: 3, b: { height: 58 }, north: { name: 'Berkeley College' }, west: { name: 'Durfee Hall' }, east: { name: 'Vanderbilt Hall' }, south: { name: 'Phelps Hall' }, diag: true });
      P.prop('statue', q.cx, q.cy, { figure: 'seated', shoe: true }); P.thing('toe', q.cx, q.cy + 1, 'Rub the statue\'s golden toe');
      P.build(33, 16, 5, 5, { type: 'secondary', style: 'gatewayTower', wall: '#a99d84', roof: '#565a54', height: 84, name: 'Harkness Tower' });
      hall(P, 33, 6, 7, 6, 'Beinecke Library', { style: 'urban', wall: '#e2ded2', roof: '#b9b7ad', height: 58 });
      P.build(5, 40, 6, 4, { type: 'archive', role: 'archive', name: 'Manuscripts and Archives', height: 52 });
      P.build(34, 30, 7, 6, { type: 'library', role: 'library', name: 'Bass Library', height: 60 });
      office(P, 43, 8, 6, 4, v, { type: 'archive', wall: '#c9b79a', roof: '#5a4f47', style: 'hall', height: 50 });
      P.path([24, 44], [19, 38], 2, T.STONE, 'y'); P.path([19, 18], [23, 16], 1, T.STONE, 'y'); P.path([30, 14], [46, 13], 1, T.STONE); P.path([31, 26], [37, 29], 1, T.STONE); P.path([11, 42], [20, 42], 1, T.STONE); P.path([36, 22], [36, 13], 1, T.STONE, 'y');
      P.fill(34, 40, 12, 7, T.GRASS); P.prop('bell', 40, 43); P.thing('carillon', 40, 44, 'Ring the practice bell');
      P.pois.task = { x: q.lx, y: q.ly, w: q.lw, h: q.lh };
    },
  });

  def('rochester', {
    name: 'University of Rochester', short: 'Rochester', city: 'Rochester, New York', colors: ['#2a3f66', '#e7c53f'],
    wall: '#a8664c', roof: '#5b5f5c', path: 4, plaza: 4, trees: ['elm', 'oak', 'lilac', 'lime', 'lilac'], treeDensity: 0.1, season: 'spring', wild: 'dandelions',
    landmark: { name: 'Rush Rhees Library', style: 'clocktower' },
    notes: ['A library tower at the head of a long quadrangle beside the river.', 'Lilacs in bloom, dandelions on every lawn, and painted tunnels underfoot.'],
    plan(P, v, T) {
      frame(P, T, {});
      P.river('y', 5, 5, 1.4); P.line(4, 30, 13, 30, 2, T.BRIDGE);
      entry(P, T, 28, 44);
      P.build(22, 6, 12, 6, { type: 'landmark', style: 'clocktower', height: 74, role: 'landmark', name: 'Rush Rhees Library', wall: '#a8664c' });
      P.fill(22, 14, 12, 26, T.GRASS); P.reserve(23, 15, 10, 24); P.fill(21, 13, 14, 1, T.BRICK); P.fill(21, 13, 1, 28, T.BRICK); P.fill(34, 13, 1, 28, T.BRICK); P.fill(21, 40, 14, 1, T.BRICK); P.fill(27, 14, 2, 26, T.BRICK);
      for (const [x, y, n] of [[14, 14, 'Morey Hall'], [14, 24, 'Lattimore Hall'], [36, 14, 'Bausch & Lomb Hall'], [36, 24, 'Dewey Hall']]) hall(P, x, y, 6, 7, n, { height: 60 });
      for (let i = 0; i < 14; i++) for (const x of [24, 31]) P.prop('dandelions', x + (i % 2), 16 + i * 1.6);
      P.build(13, 36, 6, 4, { type: 'archive', role: 'archive', name: 'Rare Books and Special Collections', height: 50 });
      P.build(37, 34, 6, 5, { type: 'library', role: 'library', name: 'Carlson Library', style: 'urban', height: 58 });
      hall(P, 12, 44, 5, 3, 'Interfaith Chapel', { wall: '#c9c0aa', height: 46 });
      office(P, 43, 9, 6, 5, v, { height: 60 });
      P.path([28, 44], [28, 41], 2, T.BRICK, 'y'); P.path([35, 20], [46, 15], 1, T.BRICK, 'x'); P.path([13, 30], [21, 30], 1, T.BRICK); P.path([16, 41], [21, 41], 1, T.BRICK);
      P.row('paintfence', 36, 42, 44, 42, 2, { col: '#d9a441' }); P.thing('tunnel', 40, 43, 'Read the painted tunnel');
      alley(P, 'lilac', 9, 12, 9, 28, 3); P.thing('lilacs', 10, 20, 'Smell the lilacs'); P.boats.push({ x: 7, y: 14, len: 12, axis: 'y' });
      P.pois.task = { x: 23, y: 15, w: 10, h: 24 };
    },
  });

  def('duke', {
    name: 'Duke University', short: 'Duke', city: 'Durham, North Carolina', colors: ['#1f3f8a', '#e9e6dc'],
    wall: '#9a8f7c', roof: '#5a5f5c', style: 'gothic', path: 5, plaza: 5, trees: ['oak', 'pine', 'elm', 'cherry'], treeDensity: 0.1, forest: ['pine', 'pine', 'oak'], season: 'spring',
    landmark: { name: 'Duke Chapel', style: 'endTowers' },
    notes: ['A Gothic chapel tower at the head of a long stone quadrangle.', 'Terraced gardens with a koi pond, and a village of tents by the arena.'],
    plan(P, v, T) {
      frame(P, T, {});
      entry(P, T, 26, 44);
      P.build(21, 4, 10, 7, { type: 'landmark', style: 'endTowers', height: 92, role: 'landmark', name: 'Duke Chapel' });
      P.fill(21, 13, 10, 26, T.GRASS); P.reserve(22, 14, 8, 24); P.fill(20, 12, 12, 1, T.STONE); P.fill(20, 12, 1, 28, T.STONE); P.fill(31, 12, 1, 28, T.STONE); P.fill(20, 39, 12, 1, T.STONE);
      for (const [x, y, n] of [[13, 13, 'Divinity School'], [13, 22, 'Perkins Library'], [13, 31, 'Languages Building'], [33, 13, 'Page Auditorium'], [33, 22, 'Union Building'], [33, 31, 'Kilgo Quad']]) {
        if (n === 'Perkins Library') P.build(x, y, 6, 7, { type: 'library', role: 'library', name: n, height: 62 }); else hall(P, x, y, 6, 7, n, { height: 58 });
      }
      P.build(5, 14, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50 });
      office(P, 42, 8, 6, 5, v, { style: 'urban', wall: '#b9b3a2', height: 66 });
      // the gardens
      P.fill(4, 28, 8, 3, T.STONE); for (let i = 0; i < 4; i++) for (let x = 4; x < 12; x++) P.prop('flowers', x, 31 + i * 2, { cols: [['#d9624e', '#f1e9d8'], ['#e7c35a', '#f1e9d8'], ['#9b6fb5', '#f3c6d1'], ['#d68aa2', '#f1e9d8']][i] });
      P.pond(8, 42, 4, 2); P.prop('lily', 7, 42); P.prop('lily', 9, 43); P.prop('willow', 12, 40); P.thing('koi', 8, 39, 'Feed the koi'); P.fill(5, 39, 7, 1, T.GRAVEL);
      for (let i = 0; i < 6; i++) P.prop('tent', 41 + (i % 3) * 3, 36 + Math.floor(i / 3) * 3, { col: ['#1f3f8a', '#3b5f8a', '#e9e6dc'][i % 3] });
      P.thing('tents', 44, 42, 'Visit the tent village'); P.fill(40, 42, 9, 1, T.GRAVEL);
      P.path([26, 44], [26, 40], 2, T.STONE, 'y'); P.path([32, 18], [45, 14], 1, T.STONE, 'x'); P.path([11, 19], [20, 19], 1, T.STONE); P.path([11, 30], [20, 36], 1, T.GRAVEL, 'y'); P.path([32, 36], [40, 42], 1, T.GRAVEL, 'y');
      P.pois.task = { x: 22, y: 14, w: 8, h: 24 };
    },
  });

  def('lund', {
    name: 'Lund University', short: 'Lund', city: 'Lund, Sweden', colors: ['#2b4a7a', '#e3c04a'],
    wall: '#e4dccb', roof: '#6b7078', path: 6, plaza: 6, trees: ['lime', 'elm', 'cherry', 'birch', 'cherry'], treeDensity: 0.09, season: 'spring',
    landmark: { name: 'University Main Building', style: 'columns' },
    notes: ['A white main building over a park of magnolias and a round fountain.', 'A twin-towered cathedral, a brick king\'s house, and cobbled lanes of bicycles.'],
    plan(P, v, T) {
      frame(P, T, { roadS: false });
      P.fill(4, 48, 48, 2, T.COBBLE);
      plaza(P, T, 20, 42, 9, 5, T.COBBLE); P.prop('kiosk', 22, 43); P.poi('directory', 22, 44, 'South-plaza directory'); P.prop('table', 26, 43); P.poi('workshop', 26, 44, 'Campus workshop');
      P.prop('flag', 20, 42, { cols: this.colors }); P.prop('flag', 28, 42, { cols: this.colors }); P.poi('spawn', 24, 46);
      P.build(18, 6, 12, 6, { type: 'landmark', style: 'columns', height: 70, role: 'landmark', name: 'University Main Building' });
      plaza(P, T, 19, 13, 10, 5, T.GRAVEL); P.prop('fountain', 24, 15, { col: '#b9b3a2' });
      P.build(32, 30, 9, 7, { type: 'secondary', style: 'twintower', wall: '#9d978a', roof: '#5a5f66', height: 72, name: 'Cathedral' });
      P.build(11, 20, 6, 5, { type: 'secondary', style: 'roundtower', wall: '#a5563f', roof: '#5a5f66', height: 60, name: 'Kungshuset' });
      P.build(5, 34, 6, 4, { type: 'archive', role: 'archive', name: 'University Archives', height: 50, wall: '#d9c48a' });
      P.build(33, 16, 7, 6, { type: 'library', role: 'library', name: 'University Library', wall: '#a5563f', roof: '#55595e', height: 62 });
      for (const [x, y, c, n] of [[5, 8, '#d9a96a', 'Old Lodgings'], [5, 44, '#c98a6a', 'Lane houses'], [36, 44, '#d9c48a', 'Market houses']]) P.build(x, y, 10, 3, { type: 'rowhouse', wall: c, roof: '#7a4a3a', height: 44, name: n });
      office(P, 42, 7, 6, 5, v, { wall: '#d9c48a', roof: '#7a4a3a', height: 56 });
      P.path([24, 42], [24, 18], 2, T.GRAVEL, 'y'); P.path([17, 26], [32, 26], 1, T.GRAVEL); P.path([30, 14], [45, 13], 1, T.COBBLE); P.path([40, 22], [40, 29], 1, T.COBBLE, 'y'); P.path([11, 38], [20, 40], 1, T.COBBLE); P.fill(4, 12, 12, 1, T.COBBLE); P.fill(31, 38, 12, 1, T.COBBLE);
      alley(P, 'cherry', 17, 13, 17, 19, 3); alley(P, 'cherry', 31, 13, 31, 14, 2); P.thing('magnolia', 18, 16, 'Stand under the magnolias');
      for (const [x, y] of [[27, 41], [30, 27], [12, 27], [41, 14], [18, 40]]) P.prop('bikes', x, y);
      P.pois.task = { x: 18, y: 27, w: 13, h: 12 };
    },
  });

  def('paris', {
    name: 'Paris School of Economics', short: 'Paris', city: 'Paris', colors: ['#2a4a8a', '#c7483a'],
    wall: '#d8ccb0', roof: '#6f7780', style: 'hall', path: 6, plaza: 5, trees: ['lime', 'lime', 'elm', 'cherry'], treeDensity: 0.06,
    landmark: { name: 'Campus Jourdan', style: 'urban' },
    notes: ['Cream stone and grey zinc roofs along a boulevard with a tramway.', 'Café tables on the pavement and a park with a lake across the street.'],
    plan(P, v, T) {
      frame(P, T, { roadS: 34, track: true });
      plaza(P, T, 20, 27, 9, 5, T.STONE); P.prop('kiosk', 22, 28); P.poi('directory', 22, 29, 'South-plaza directory'); P.prop('table', 26, 28); P.poi('workshop', 26, 29, 'Campus workshop');
      P.prop('flag', 20, 27, { cols: this.colors }); P.prop('flag', 28, 27, { cols: this.colors }); P.poi('spawn', 24, 31); P.path([24, 31], [24, 33], 3, T.STONE, 'y');
      P.build(17, 8, 13, 6, { type: 'landmark', style: 'urban', height: 70, role: 'landmark', name: 'Campus Jourdan', wall: '#d2d6d2', roof: '#59646b' });
      for (const [x, y, w, h, n] of [[5, 6, 8, 5, 'Maison des étudiants'], [33, 6, 7, 5, 'Pavillon'], [5, 14, 5, 8, 'Bibliothèque annexe'], [33, 22, 8, 6, 'Résidence']]) hall(P, x, y, w, h, n, { height: 66 });
      P.build(5, 26, 6, 4, { type: 'archive', role: 'archive', name: 'Archives', height: 56 });
      P.build(33, 13, 7, 6, { type: 'library', role: 'library', name: 'Bibliothèque', height: 62 });
      office(P, 42, 7, 6, 5, v, { height: 64 });
      plaza(P, T, 12, 15, 20, 11, T.GRAVEL); P.fill(15, 17, 14, 7, T.GRASS); P.reserve(15, 17, 14, 7); P.path([24, 27], [24, 15], 2, T.GRAVEL, 'y'); P.path([32, 20], [45, 13], 1, T.GRAVEL, 'x'); P.path([11, 28], [20, 29], 1, T.STONE);
      for (const [x, y] of [[14, 31], [17, 31], [31, 31], [34, 31]]) { P.prop('picnic', x, y, { col: '#c7483a' }); P.prop('stump', x + 1, y); }
      P.thing('cafe', 16, 32, 'Order a coffee'); P.fill(12, 31, 26, 2, T.STONE);
      // the park across the boulevard
      P.fill(4, 38, 48, 14, T.GRASS); P.pond(30, 45, 7, 3); P.line(6, 40, 46, 40, 1, T.GRAVEL); P.line(24, 37, 24, 40, 2, T.STONE); P.line(10, 40, 18, 50, 1, T.GRAVEL); P.prop('willow', 21, 46); P.prop('willow', 39, 47);
      P.boats.push({ x: 30, y: 45, len: 4, axis: 'x' }); P.thing('ducks', 26, 42, 'Watch the ducks');
      P.pois.tram = { y: 34 }; P.pois.task = { x: 15, y: 17, w: 14, h: 7 };
    },
  });

  // ---------- Bellwether: the fictional city at the heart of the story ----------
  def('bellwether', {
    name: 'Bellwether', short: 'Bellwether', city: 'the fictional city of Bellwether', colors: ['#3f6a52', '#e2a544'], fictional: true,
    wall: '#b98a62', roof: '#5b4f4a', path: 6, plaza: 6, trees: ['lime', 'elm', 'oak'], treeDensity: 0.07,
    landmark: { name: 'Bellwether Town Hall', style: 'clocktower' },
    notes: ['A market square, a canal, and a festival ground strung with lanterns.', 'Across the water lies Eastbank. The map says it is connected.'],
    plan(P, v, T) {
      frame(P, T, { roadS: false });
      P.river('y', 35, 3, 0.9);
      P.fill(34, 18, 6, 2, T.BRIDGE); P.fill(34, 40, 6, 2, T.BRIDGE);
      plaza(P, T, 14, 20, 14, 12, T.COBBLE); P.prop('fountain', 20, 25); P.poi('spawn', 21, 30);
      P.prop('kiosk', 16, 22); P.poi('directory', 16, 23, 'Town notice board');
      P.build(15, 10, 12, 6, { type: 'landmark', style: 'clocktower', height: 68, role: 'landmark', name: 'Bellwether Town Hall', wall: '#c9bfa6' });
      P.build(5, 20, 7, 5, { type: 'library', role: 'library', name: 'Public Library', height: 56 });
      P.build(5, 30, 6, 4, { type: 'archive', role: 'archive', name: 'City Archive', height: 50 });
      P.build(24, 36, 7, 5, { type: 'office', role: 'office', name: 'Fellowship House', label: 'Fellowship House', height: 54, wall: '#a56a4e' });
      for (const [x, y, w, c] of [[5, 10, 8, '#b5785a'], [28, 10, 5, '#a8664c'], [6, 38, 9, '#c0916a'], [16, 44, 12, '#ab7354']]) P.build(x, y, w, 3, { type: 'rowhouse', wall: c, roof: '#4f4a48', height: 44, name: 'Town houses' });
      // festival ground
      P.fill(5, 46, 9, 5, T.DIRT); for (const [x, y, c] of [[6, 46, '#a5422f'], [9, 46, '#3f6a52'], [12, 46, '#d9a441']]) P.prop('stall', x, y, { col: c });
      for (let i = 0; i < 6; i++) P.prop('lantern', 5 + i * 1.6, 50, { col: ['#e2a544', '#d9624e', '#7fb08a'][i % 3] });
      P.poi('festival', 9, 49, 'Festival ground');
      // Eastbank
      for (const [x, y, w, c] of [[41, 8, 10, '#8f6a55'], [41, 16, 10, '#876350'], [41, 24, 10, '#93705a'], [41, 32, 10, '#8a6652'], [41, 44, 10, '#8f6a55']]) P.build(x, y, w, 3, { type: 'rowhouse', wall: c, roof: '#454243', height: 42, name: 'Eastbank houses' });
      P.fill(40, 6, 1, 44, T.COBBLE); P.fill(40, 12, 12, 1, T.DIRT); P.fill(40, 20, 12, 1, T.DIRT); P.fill(40, 28, 12, 1, T.DIRT); P.fill(40, 36, 12, 1, T.DIRT); P.fill(40, 48, 12, 1, T.DIRT);
      P.prop('gatepost', 33, 39); P.prop('gatepost', 33, 42); P.poi('gate', 33, 41, 'The evening gate'); P.thing('gate', 33, 40, 'Inspect the evening gate');
      P.poi('eastbank', 44, 21, 'Eastbank');
      P.path([21, 32], [27, 36], 1, T.COBBLE, 'y'); P.path([27, 19], [34, 19], 2, T.COBBLE); P.path([28, 41], [34, 41], 2, T.COBBLE); P.path([12, 25], [14, 25], 1, T.COBBLE); P.path([11, 32], [14, 30], 1, T.COBBLE); P.path([9, 42], [9, 46], 1, T.DIRT); P.path([14, 32], [9, 42], 1, T.COBBLE, 'y');
      P.prop('well', 46, 22); P.prop('cart', 45, 30); P.prop('crates', 48, 14); P.prop('barrel', 43, 37);
      P.boats.push({ x: 36, y: 28, len: 8, axis: 'y' });
      P.pois.task = { x: 14, y: 20, w: 14, h: 12 };
    },
  });

  // ---------- which university each encounter visits ----------
  const VISITS = {
    1: { uni: 'penn' }, 2: { uni: 'harvard' }, 3: { uni: 'harvard', variant: 1, hour: 16.5 }, 4: { uni: 'indiana' }, 5: { uni: 'ucla' },
    6: { uni: 'notreDame' }, 7: { uni: 'columbia' }, 8: { uni: 'mit', season: 'winter', variant: 1 }, 9: { uni: 'harvard', variant: 2, season: 'spring' },
    10: { uni: 'northeastern' }, 11: { uni: 'stanford' }, 12: { uni: 'pennState' }, 13: { uni: 'washu' }, 14: { uni: 'cmu' }, 15: { uni: 'princeton' },
    16: { uni: 'stanford', variant: 1, hour: 17 }, 17: { uni: 'mit', variant: 2, season: 'summer' }, 18: { uni: 'mit', variant: 3, hour: 16.5 },
    19: { uni: 'columbia', variant: 1 }, 20: { uni: 'stanford', variant: 2 }, 21: { uni: 'lund' }, 22: { uni: 'rochester' }, 23: { uni: 'michigan' },
    24: { uni: 'harvard', variant: 3, hour: 11 }, 25: { uni: 'chicago' }, 26: { uni: 'michigan', variant: 1, season: 'winter' }, 27: { uni: 'princeton', variant: 1, season: 'spring' },
    28: { uni: 'yale' }, 29: { uni: 'paris' }, 30: { uni: 'duke' }, 0: { uni: 'bellwether', hour: 18 },
  };
  SA.Campuses = C;
  SA.VISITS = VISITS;
  SA.visitFor = (enc) => {
    const v = VISITS[enc.id] || { uni: 'harvard' };
    return { ...v, id: enc.id, year: enc.year, office: enc.office, season: v.season || C[v.uni].season || 'autumn' };
  };
})();
