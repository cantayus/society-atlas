/* The Society Atlas V2 — world renderer.
   Ground is painted once into cached chunks; buildings and props are cached
   sprites; people, water glints, light and weather are drawn every frame. */
(function () {
  'use strict';
  const SA = window.SA, { TW, TH, iso, hash, shade, mix, noise } = SA;
  const T = SA.World.T, TAU = Math.PI * 2;
  const CH = 512;
  const R = { zoom: 1, cam: { x: 0, y: 0 }, world: null, t: 0, hour: 12, stats: { sprites: 0, chunks: 0 } };
  let canvas, ctx, W = 0, H = 0, dpr = 1, S = 1;
  let chunks = new Map(), sprites = new Map(), order = [], fog = null, fogCtx = null, explored = null, fogDirty = true, grid = null;

  const C = (x, y) => iso(x + 0.5, y + 0.5);          // centre of a tile

  // ---------- palettes ----------
  function groundColours(world) {
    const s = world.season, lawn = world.def.lawn;
    const grass = lawn || { summer: '#73934a', autumn: '#7d8c4f', spring: '#74994d', winter: '#e8edea' }[s] || '#7d8c4f';
    return {
      [T.GRASS]: grass, [T.MEADOW]: mix(grass, '#b6b06a', 0.35), [T.FOREST]: s === 'winter' ? '#dfe6e3' : mix(grass, '#3c4a2c', 0.42),
      [T.DIRT]: '#a48d66', [T.GRAVEL]: '#b9af95', [T.BRICK]: '#a8674f', [T.STONE]: '#bfb8a4', [T.COBBLE]: '#958f80', [T.SAND]: '#d8c69c',
      [T.WATER]: '#4c8496', [T.ROAD]: (world.visit.year || 2000) < 1925 ? '#8d826c' : '#716d66', [T.TRACK]: (world.visit.year || 2000) < 1925 ? '#8d826c' : '#716d66',
      [T.WALK]: '#b5af9d', [T.FIELD]: s === 'winter' ? '#e3e9e6' : '#6e9a4c', [T.SNOW]: '#e8edea', [T.BRIDGE]: '#a58b62', [T.SHORE]: s === 'winter' ? '#d5dcd8' : '#b9aa82',
    };
  }
  const PRI = { [T.WATER]: 0, [T.SHORE]: 1, [T.ROAD]: 2, [T.TRACK]: 2, [T.WALK]: 2.5, [T.BRIDGE]: 2.6, [T.BRICK]: 3, [T.STONE]: 3, [T.COBBLE]: 3, [T.SAND]: 3.2, [T.DIRT]: 4, [T.GRAVEL]: 4, [T.FIELD]: 5, [T.GRASS]: 5, [T.MEADOW]: 5, [T.SNOW]: 5, [T.FOREST]: 6 };

  // ---------- ground painting ----------
  function paintTile(c, world, col, x, y) {
    const t = world.tile(x, y), p = iso(x, y), base = col[t] || col[T.GRASS];
    const big = noise(x / 6, y / 6, world.seed) - 0.5, r = hash(x, y, world.seed);
    const soft = t === T.GRASS || t === T.MEADOW || t === T.FOREST || t === T.FIELD || t === T.SNOW;
    let fill = shade(base, Math.round((soft ? big * 26 : big * 8) + (r - 0.5) * (soft ? 8 : 6)));
    if (t === T.FIELD && world.season !== 'winter') fill = shade(base, (x + y) % 2 ? 7 : -5);
    c.fillStyle = fill; c.strokeStyle = fill; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + TW / 2, p.y + TH / 2); c.lineTo(p.x, p.y + TH); c.lineTo(p.x - TW / 2, p.y + TH / 2); c.closePath(); c.fill(); c.stroke();
    const cx = p.x, cy = p.y + TH / 2;
    const dot = (n, cols, w, h) => { for (let i = 0; i < n; i++) { const u = hash(x * 13 + i, y * 7, 3) - 0.5, v = hash(x * 5, y * 11 + i, 4) - 0.5, a = (u + v) * 0.5, b = (v - u) * 0.5; c.fillStyle = cols[i % cols.length]; c.fillRect(cx + a * TW * 0.92, cy + b * TH * 0.92 * 2 * 0.5 + (u - v) * 0, w, h); void b; } };
    const at = (u, v) => [cx + (u - v) * TW / 2, cy + (u + v) * TH / 2];     // u,v in [-.5,.5]
    const sprinkle = (n, cols, w, h, seed = 0) => { for (let i = 0; i < n; i++) { const [px, py] = at(hash(x * 13 + i, y * 7, 3 + seed) - 0.5, hash(x * 5, y * 11 + i, 4 + seed) - 0.5); c.fillStyle = cols[i % cols.length]; c.fillRect(px, py, w, h); } };
    void dot;
    if (t === T.GRASS || t === T.MEADOW || t === T.FOREST) {
      if (world.season === 'winter') sprinkle(4, ['#ffffff', '#cdd8d8'], 2.2, 1);
      else {
        sprinkle(9, [shade(fill, 16), shade(fill, -16), shade(fill, 9)], 1.5, 2.3);
        if (t === T.MEADOW || (r > 0.8 && world.season !== 'autumn')) sprinkle(3, ['#f1e9c8', '#e7c35a', '#d98f7a'], 1.6, 1.4, 9);
        if (world.season === 'autumn' && r > 0.45) sprinkle(4, ['#c0672c', '#e2a544', '#a5422f'], 2, 1.2, 5);
        if (t === T.FOREST) sprinkle(5, ['#4a3f2a', '#2f3d24'], 2.4, 1.3, 7);
      }
    } else if (t === T.SNOW) sprinkle(5, ['#ffffff', '#cfdadb', '#dbe4e3'], 2.4, 1.1);
    else if (t === T.DIRT) sprinkle(7, [shade(fill, 14), shade(fill, -18), '#8a7a5c'], 2, 1.2);
    else if (t === T.GRAVEL) sprinkle(12, [shade(fill, 16), shade(fill, -20), shade(fill, 6)], 1.4, 1);
    else if (t === T.SAND) { sprinkle(6, [shade(fill, 10), shade(fill, -12)], 1.8, 1); c.strokeStyle = shade(fill, -14); c.lineWidth = 0.5; c.beginPath(); c.moveTo(...at(-0.5, 0)); c.lineTo(...at(0.5, 0)); c.moveTo(...at(0, -0.5)); c.lineTo(...at(0, 0.5)); c.stroke(); }
    else if (t === T.BRICK) {
      c.strokeStyle = shade(fill, -24); c.lineWidth = 0.55; c.beginPath();
      for (let i = 0; i < 5; i++) { const v = -0.5 + i / 5; c.moveTo(...at(-0.5, v)); c.lineTo(...at(0.5, v)); }
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const v = -0.5 + i / 5, u = -0.5 + (j + (i % 2 ? 0.5 : 0)) / 3; c.moveTo(...at(u, v)); c.lineTo(...at(u, v + 0.2)); }
      c.stroke(); sprinkle(4, [shade(fill, 18), shade(fill, -14)], 3, 1.3);
    } else if (t === T.STONE || t === T.WALK) {
      c.strokeStyle = shade(fill, -22); c.lineWidth = 0.6; c.beginPath(); const n = t === T.WALK ? 1 : 2;
      for (let i = 0; i <= n; i++) { const v = -0.5 + i / n; c.moveTo(...at(-0.5, v)); c.lineTo(...at(0.5, v)); c.moveTo(...at(v, -0.5)); c.lineTo(...at(v, 0.5)); }
      c.stroke(); sprinkle(3, [shade(fill, 12), shade(fill, -10)], 2.6, 1.2);
    } else if (t === T.COBBLE) { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const [px, py] = at(-0.5 + (i + 0.5 + (j % 2) * 0.3) / 4.3, -0.5 + (j + 0.5) / 4); c.fillStyle = shade(fill, Math.round(hash(x * 4 + i, y * 4 + j, 2) * 34 - 14)); c.beginPath(); c.ellipse(px, py, 4.6, 2.5, 0, 0, TAU); c.fill(); } }
    else if (t === T.ROAD || t === T.TRACK) {
      sprinkle(6, [shade(fill, 12), shade(fill, -12)], 1.6, 1);
      if (t === T.TRACK) { const along = world.roads.find((q) => q.track); c.strokeStyle = '#4c4a47'; c.lineWidth = 1.5; c.beginPath(); for (const o of [-0.22, 0.22]) { if (along && along.axis === 'x') { c.moveTo(...at(-0.5, o)); c.lineTo(...at(0.5, o)); } else { c.moveTo(...at(o, -0.5)); c.lineTo(...at(o, 0.5)); } } c.stroke(); }
    } else if (t === T.WATER) {
      const deep = [1, 0, -1, 0].every((dx, i) => world.tile(x + dx, y + [0, 1, 0, -1][i]) === T.WATER);
      if (!deep) { c.fillStyle = 'rgba(150,205,205,.28)'; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + TW / 2, p.y + TH / 2); c.lineTo(p.x, p.y + TH); c.lineTo(p.x - TW / 2, p.y + TH / 2); c.fill(); }
      sprinkle(3, ['rgba(255,255,255,.16)', 'rgba(20,50,70,.18)'], 5, 1);
    } else if (t === T.BRIDGE) {
      c.strokeStyle = shade(fill, -30); c.lineWidth = 0.7; c.beginPath(); for (let i = 0; i < 5; i++) { const v = -0.5 + i / 5; c.moveTo(...at(v, -0.5)); c.lineTo(...at(v, 0.5)); } c.stroke();
    } else if (t === T.SHORE) sprinkle(6, [shade(fill, 12), shade(fill, -14), '#8d8a6a'], 2, 1.1);
  }

  function paintFringe(c, world, col, x, y) {
    const t = world.tile(x, y), p = iso(x, y), cx = p.x, cy = p.y + TH / 2, pr = PRI[t] ?? 5;
    const at = (u, v) => [cx + (u - v) * TW / 2, cy + (u + v) * TH / 2];
    const N4 = [[1, 0, 0.5, 0], [-1, 0, -0.5, 0], [0, 1, 0, 0.5], [0, -1, 0, -0.5]];
    for (const [dx, dy, eu, ev] of N4) {
      const nt = world.tile(x + dx, y + dy); if (nt === t || (PRI[nt] ?? 5) <= pr) continue;
      const hard = (nt === T.BRICK || nt === T.STONE || nt === T.COBBLE || nt === T.WALK || nt === T.SAND || nt === T.BRIDGE || nt === T.ROAD || nt === T.TRACK);
      if (hard) continue;
      const base = shade(col[nt], Math.round((noise((x + dx) / 6, (y + dy) / 6, world.seed) - 0.5) * (nt === T.DIRT || nt === T.GRAVEL || nt === T.SHORE ? 8 : 26)));
      for (let i = 0; i < 7; i++) {
        const along = -0.5 + (i + hash(x * 3 + i, y * 5 + dx, 11)) / 7, inset = 0.03 + hash(x + i, y * 9 + dy, 12) * 0.16;
        const u = eu ? eu - Math.sign(eu) * inset : along, v = ev ? ev - Math.sign(ev) * inset : along, [px, py] = at(u, v);
        c.fillStyle = shade(base, Math.round(hash(i, x + y, 13) * 10 - 5));
        c.beginPath(); c.ellipse(px, py, 5.5 + hash(i, x, 14) * 4, 2.6 + hash(i, y, 15) * 2, 0, 0, TAU); c.fill();
      }
    }
    if (t === T.BRIDGE) {                                     // railings where the deck meets water
      c.strokeStyle = '#6b5438'; c.lineWidth = 1.4;
      for (const [dx, dy, eu, ev] of N4) if (world.tile(x + dx, y + dy) === T.WATER) { const a = eu ? at(eu, -0.5) : at(-0.5, ev), b = eu ? at(eu, 0.5) : at(0.5, ev); c.beginPath(); c.moveTo(a[0], a[1] - 7); c.lineTo(b[0], b[1] - 7); c.moveTo(a[0], a[1]); c.lineTo(a[0], a[1] - 7); c.moveTo(b[0], b[1]); c.lineTo(b[0], b[1] - 7); c.stroke(); }
    }
  }

  function hull(points) {
    const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.slice().reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }

  function paintChunk(world, cxi, cyi) {
    const cv = document.createElement('canvas'); cv.width = cv.height = Math.ceil(CH * S);
    const c = cv.getContext('2d'); c.setTransform(S, 0, 0, S, -cxi * CH * S, -cyi * CH * S);
    const col = world._col || (world._col = groundColours(world)), N = world.N;
    const x0 = cxi * CH - TW, x1 = (cxi + 1) * CH + TW, y0 = cyi * CH - TH * 2, y1 = (cyi + 1) * CH + TH;
    const tiles = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const p = iso(x, y); if (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1) tiles.push([x, y]); }
    for (const [x, y] of tiles) paintTile(c, world, col, x, y);
    for (const [x, y] of tiles) paintFringe(c, world, col, x, y);
    // long building shadows, one sun for the whole world
    c.fillStyle = world.season === 'winter' ? 'rgba(60,80,110,.22)' : 'rgba(20,32,18,.24)';
    for (const b of world.buildings) {
      const z = b.height || 60, q = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => { const p = iso(x, y); return [p.x, p.y]; });
      const sh = hull([...q, ...q.map(([x, y]) => [x + z * 0.62, y + z * 0.24])]);
      if (sh.every((p) => p[0] < x0 - 200 || p[0] > x1 + 200)) continue;
      c.beginPath(); sh.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fill();
    }
    R.stats.chunks++;
    return cv;
  }

  // ---------- sprites ----------
  function spriteFor(key, bbox, paint) {
    let s = sprites.get(key);
    if (!s) {
      const cv = document.createElement('canvas'); cv.width = Math.ceil((bbox.x1 - bbox.x0) * S); cv.height = Math.ceil((bbox.y1 - bbox.y0) * S);
      const c = cv.getContext('2d'); c.setTransform(S, 0, 0, S, -bbox.x0 * S, -bbox.y0 * S); paint(c);
      s = { cv, bbox }; sprites.set(key, s); R.stats.sprites++;
    }
    return s;
  }
  function archEnv(c) {
    const poly = (points, fill, stroke) => { c.beginPath(); points.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 0.6; c.stroke(); } };
    const box = (x, y, w, h, z, wall, roof) => { const a = iso(x, y), b = iso(x + w, y), cc = iso(x + w, y + h), d = iso(x, y + h); poly([[d.x, d.y], [cc.x, cc.y], [cc.x, cc.y - z], [d.x, d.y - z]], wall, '#635f4830'); poly([[b.x, b.y], [cc.x, cc.y], [cc.x, cc.y - z], [b.x, b.y - z]], shade(wall, -24), '#635f4830'); poly([[a.x, a.y - z], [b.x, b.y - z], [cc.x, cc.y - z], [d.x, d.y - z]], roof, '#686c4b'); return { a, b, c: cc, d }; };
    return { iso, box, poly, shade };
  }
  function buildingSprite(b, i) {
    const left = iso(b.x, b.y + b.h).x, right = iso(b.x + b.w, b.y).x, top = iso(b.x, b.y).y, bottom = iso(b.x + b.w, b.y + b.h).y;
    const bbox = { x0: left - 24, x1: right + 60, y0: top - (b.height || 60) - 150, y1: bottom + 26 };
    return spriteFor('b' + i, bbox, (c) => {
      const env = archEnv(c);
      if (!(window.CampusArchitecture && window.CampusArchitecture.draw(c, b, env))) env.box(b.x, b.y, b.w, b.h, b.height || 60, b.wall, b.roof);
      if (R.world.season === 'winter') snowCap(c, b);
    });
  }
  function snowCap(c, b) {                                   // a light dusting along roof ridges
    c.save(); c.globalCompositeOperation = 'source-atop'; const z = b.height || 60, a = iso(b.x, b.y), d = iso(b.x + b.w, b.y + b.h);
    const g = c.createLinearGradient(0, a.y - z - 60, 0, d.y - z + 10); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.55, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(a.x - 400, a.y - z - 160, 900, 400); c.restore();
  }
  function propSprite(p) {
    const d = SA.Props.defs[p.k]; if (!d) return null;
    const variant = d.anim ? 0 : (p.o.v || 0) % 6, key = 'p' + p.k + ':' + variant + ':' + (p.o.col || '') + (p.o.figure || '') + (p.o.snow ? 's' : '') + (p.o.modern ? 'm' : '') + (p.o.cols ? p.o.cols.join('') : '') + (p.o.shoe ? 'h' : '') + (p.o.nose ? 'n' : '') + (p.o.goods ? 'g' : '');
    const bbox = { x0: -d.w - 30, x1: d.w + 34, y0: -d.h - 14, y1: d.below + 10 };
    return spriteFor(key, bbox, (c) => d.draw(c, { ...p.o, v: variant + 1 }, 0));
  }

  // ---------- draw order ----------
  const rel = (a, b) => {                                    // -1: a behind b, 1: b behind a, 0: unrelated
    const ab = a.x1 <= b.x0 || a.y1 <= b.y0, ba = b.x1 <= a.x0 || b.y1 <= a.y0;
    return ab && !ba ? -1 : ba && !ab ? 1 : 0;
  };
  function buildOrder(world) {
    const items = [];
    world.buildings.forEach((b, i) => items.push({ kind: 'b', b, i, x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h, key: b.x + b.w / 2 + b.y + b.h / 2, big: true }));
    world.props.forEach((p, i) => items.push({ kind: 'p', p, i, x0: p.x + 0.5, y0: p.y + 0.5, x1: p.x + 0.5, y1: p.y + 0.5, key: p.x + p.y + 1 }));
    const bigs = items.filter((it) => it.big), after = new Map(items.map((it) => [it, []])), indeg = new Map(items.map((it) => [it, 0]));
    for (const g of bigs) for (const it of items) {
      if (it === g || (it.big && items.indexOf(it) < items.indexOf(g))) continue;
      const r = rel(g, it); if (r === -1) { after.get(g).push(it); indeg.set(it, indeg.get(it) + 1); } else if (r === 1) { after.get(it).push(g); indeg.set(g, indeg.get(g) + 1); }
    }
    const ready = items.filter((it) => !indeg.get(it)).sort((a, b) => b.key - a.key), out = [];
    while (ready.length) {
      const it = ready.pop(); out.push(it);
      let changed = false;
      for (const n of after.get(it)) { indeg.set(n, indeg.get(n) - 1); if (!indeg.get(n)) { ready.push(n); changed = true; } }
      if (changed) ready.sort((a, b) => b.key - a.key);
    }
    for (const it of items) if (!out.includes(it)) out.push(it);          // any cycle: append
    out.forEach((it, i) => (it.order = i));
    grid = new Map();
    for (const it of out) if (!it.big) { const k = Math.floor(it.x0 / 3) + ',' + Math.floor(it.y0 / 3); (grid.get(k) || grid.set(k, []).get(k)).push(it); }
    return out;
  }
  function slotFor(x, y) {                                   // where a moving figure belongs among the statics
    let lo = -1, hi = order.length;
    const a = { x0: x + 0.5, y0: y + 0.5, x1: x + 0.5, y1: y + 0.5 };
    const test = (it) => { const r = it.big ? rel(it, a) : Math.sign(it.key - (x + y + 1)) || -1; if (r === -1 && it.order > lo) lo = it.order; else if (r === 1 && it.order < hi) hi = it.order; };
    for (const it of order) if (it.big) test(it);
    const gx = Math.floor((x + 0.5) / 3), gy = Math.floor((y + 0.5) / 3);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) for (const it of grid.get(gx + dx + ',' + (gy + dy)) || []) if (Math.abs(it.x0 - a.x0) < 2.6 && Math.abs(it.y0 - a.y0) < 2.6) test(it);
    return lo < hi ? lo : hi - 1;
  }

  // ---------- light ----------
  function ambient(hour) {
    const k = [[0, '#3a4672', 0.92], [5, '#3f4b78', 0.9], [6.5, '#c98f86', 0.45], [8, '#fff1d6', 0.08], [12, '#ffffff', 0], [16, '#fff0d2', 0.05], [18, '#f1b98a', 0.3], [19.5, '#b07a8c', 0.55], [21, '#46507c', 0.85], [24, '#3a4672', 0.92]];
    let i = 0; while (i < k.length - 2 && hour >= k[i + 1][0]) i++;
    const a = k[i], b = k[i + 1], f = SA.clamp((hour - a[0]) / (b[0] - a[0]), 0, 1);
    return { col: mix(a[1], b[1], f), dark: SA.lerp(a[2], b[2], f) };
  }

  // ---------- public ----------
  R.init = (cv) => { canvas = cv; ctx = cv.getContext('2d'); R.resize(); };
  R.resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1); W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const want = Math.min(2, Math.max(1, dpr * 1.25)); if (want !== S) { S = want; chunks.clear(); sprites.clear(); }
  };
  R.setWorld = (world, exploredBits) => {
    R.world = world; chunks = new Map(); sprites = new Map(); order = buildOrder(world);
    explored = exploredBits || new Uint8Array(world.N * world.N);
    fog = document.createElement('canvas'); fog.width = fog.height = world.N; fogCtx = fog.getContext('2d'); fogDirty = true;
    R.explored = explored;
  };
  R.reveal = (x, y, r = 7) => {
    const w = R.world, N = w.N; let changed = false;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = Math.round(x) + dx, yy = Math.round(y) + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N || dx * dx + dy * dy > r * r + 2) continue; if (!explored[yy * N + xx]) { explored[yy * N + xx] = 1; changed = true; } }
    if (changed) fogDirty = true; return changed;
  };
  R.revealAll = () => { explored.fill(1); fogDirty = true; };
  R.isExplored = (x, y) => { const N = R.world.N; x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < N && y < N && !!explored[y * N + x]; };
  R.screenToTile = (sx, sy) => { const wx = (sx - W / 2) / R.zoom + R.cam.x, wy = (sy - H / 2) / R.zoom + R.cam.y, u = SA.uniso(wx, wy); return { x: Math.floor(u.x), y: Math.floor(u.y), fx: u.x - 0.5, fy: u.y - 0.5 }; };
  R.tileToScreen = (x, y, z = 0) => { const p = C(x, y); return { x: (p.x - R.cam.x) * R.zoom + W / 2, y: (p.y - z - R.cam.y) * R.zoom + H / 2 }; };
  R.centre = (x, y) => { const p = C(x, y); R.cam.x = p.x; R.cam.y = p.y; };
  R.size = () => ({ W, H });

  R.draw = (state) => {
    const world = R.world; if (!world || !ctx) return;
    const t = state.t, z = R.zoom, N = world.N, light = state.daynight === false ? { col: '#ffffff', dark: 0 } : ambient(state.hour ?? 12);
    R.t = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#12161a'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-R.cam.x, -R.cam.y);
    const vx0 = R.cam.x - W / 2 / z, vx1 = R.cam.x + W / 2 / z, vy0 = R.cam.y - H / 2 / z, vy1 = R.cam.y + H / 2 / z;
    // ground
    for (let cy = Math.floor(vy0 / CH); cy <= Math.floor(vy1 / CH); cy++) for (let cx = Math.floor(vx0 / CH); cx <= Math.floor(vx1 / CH); cx++) {
      if (cy < -1 || cy * CH > N * TH + 60 || Math.abs(cx * CH) > N * TW) continue;
      const k = cx + ',' + cy; let cv = chunks.get(k); if (!cv) { cv = paintChunk(world, cx, cy); chunks.set(k, cv); }
      ctx.drawImage(cv, cx * CH, cy * CH, CH, CH);
    }
    // water glints
    if (!state.reduced) {
      ctx.strokeStyle = 'rgba(235,248,250,.5)'; ctx.lineWidth = 1;
      const a = SA.uniso(vx0, vy0), b = SA.uniso(vx1, vy1), c0 = SA.uniso(vx1, vy0), c1 = SA.uniso(vx0, vy1);
      const tx0 = Math.max(0, Math.floor(Math.min(a.x, c1.x))), tx1 = Math.min(N - 1, Math.ceil(Math.max(b.x, c0.x))), ty0 = Math.max(0, Math.floor(Math.min(a.y, c0.y))), ty1 = Math.min(N - 1, Math.ceil(Math.max(b.y, c1.y)));
      for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
        if (world.terrain[y * N + x] !== T.WATER || !explored[y * N + x]) continue;
        const ph = (t * 0.35 + hash(x, y, 31)) % 1, p = C(x, y), w = 5 + hash(x, y, 32) * 7;
        ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8; ctx.beginPath(); ctx.moveTo(p.x - w + ph * 8 - 4, p.y + (hash(x, y, 33) - 0.5) * 10); ctx.lineTo(p.x + w + ph * 8 - 4, p.y + (hash(x, y, 33) - 0.5) * 10 + 1.5); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (state.underlay) state.underlay(ctx);
    // statics and moving figures, back to front
    const dyn = (state.actors || []).map((a) => ({ a, slot: slotFor(a.x, a.y), key: a.x + a.y })).sort((p, q) => p.slot - q.slot || p.key - q.key);
    let di = 0; const pl = state.player;
    const drawDyn = (upTo) => { while (di < dyn.length && dyn[di].slot <= upTo) { const a = dyn[di++].a, p = C(a.x, a.y); if (p.x < vx0 - 60 || p.x > vx1 + 60 || p.y < vy0 - 80 || p.y > vy1 + 60) continue; if (!a.always && !R.isExplored(a.x, a.y)) continue; ctx.save(); ctx.translate(p.x, p.y); a.draw(ctx, t); ctx.restore(); } };
    drawDyn(-1);
    for (let i = 0; i < order.length; i++) {
      const it = order[i];
      if (it.kind === 'b') {
        const b = it.b; if (explored[Math.min(N - 1, b.door.y) * N + b.door.x] || explored[b.y * N + b.x] || explored[(b.y + b.h - 1) * N + b.x + b.w - 1]) {
          const s = buildingSprite(b, it.i), bb = s.bbox;
          if (!(bb.x1 < vx0 || bb.x0 > vx1 || bb.y1 < vy0 || bb.y0 > vy1)) {
            const hide = pl && pl.x > b.x - 2.5 && pl.x < b.x + b.w && pl.y > b.y - 2.5 && pl.y < b.y + b.h && (pl.x < b.x || pl.y < b.y);
            if (hide) ctx.globalAlpha = 0.45; ctx.drawImage(s.cv, bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0); ctx.globalAlpha = 1;
          }
        }
      } else {
        const p = it.p, d = SA.Props.defs[p.k];
        if (d && explored[SA.clamp(Math.round(p.y), 0, N - 1) * N + SA.clamp(Math.round(p.x), 0, N - 1)] && !p.hidden) {
          const q = C(p.x, p.y);
          if (!(q.x < vx0 - 70 || q.x > vx1 + 70 || q.y < vy0 - 20 || q.y > vy1 + 110)) {
            if (d.anim && !state.reduced) { ctx.save(); ctx.translate(q.x, q.y); d.draw(ctx, p.o, t); ctx.restore(); }
            else { const s = propSprite(p), bb = s.bbox; const fade = pl && d.h > 60 && pl.x < p.x && pl.y < p.y && p.x - pl.x < 2.2 && p.y - pl.y < 2.2 && Math.abs((p.x - pl.x) - (p.y - pl.y)) < 1.6; if (fade) ctx.globalAlpha = 0.5; ctx.drawImage(s.cv, q.x + bb.x0, q.y + bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0); ctx.globalAlpha = 1; }
          }
        }
      }
      drawDyn(i);
    }
    drawDyn(1e9);
    if (state.overlay) state.overlay(ctx);
    // unexplored ground
    if (fogDirty) { const img = fogCtx.createImageData(N, N); for (let i = 0; i < N * N; i++) { img.data[i * 4] = 16; img.data[i * 4 + 1] = 20; img.data[i * 4 + 2] = 26; img.data[i * 4 + 3] = explored[i] ? 0 : 255; } fogCtx.putImageData(img, 0, 0); fogDirty = false; }
    ctx.save(); ctx.transform(TW / 2, TH / 2, -TW / 2, TH / 2, 0, 0); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 0.9; ctx.drawImage(fog, 0, 0, N, N);
    ctx.globalAlpha = 1; ctx.fillStyle = '#10141a'; ctx.fillRect(-40, -40, N + 80, 40); ctx.fillRect(-40, N, N + 80, 40); ctx.fillRect(-40, 0, 40, N); ctx.fillRect(N, 0, 40, N); ctx.restore();
    ctx.restore();
    // day and night
    if (light.dark > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mix('#ffffff', light.col, Math.min(1, light.dark * 1.15 + 0.1)); ctx.fillRect(0, 0, W, H); ctx.restore();
      if (light.dark > 0.25) {
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        const k = Math.min(1, (light.dark - 0.25) / 0.5);
        for (const L of world.lights) {
          if (!R.isExplored(L.x, L.y)) continue;
          const s = R.tileToScreen(L.x, L.y, L.z); if (s.x < -90 || s.x > W + 90 || s.y < -90 || s.y > H + 90) continue;
          const r = L.r * z * (L.window ? 0.8 : 1.25), g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
          g.addColorStop(0, `rgba(255,214,140,${(L.window ? 0.42 : 0.62) * k})`); g.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = g; ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
        }
        ctx.restore();
      }
    } else if (light.col !== '#ffffff') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = light.col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (state.screen) state.screen(ctx, W, H);
  };

  // ---------- minimap ----------
  const MINI = { [T.GRASS]: '#6f8a4c', [T.MEADOW]: '#8c9a5a', [T.FOREST]: '#46603a', [T.DIRT]: '#a48d66', [T.GRAVEL]: '#bdb39a', [T.BRICK]: '#a8674f', [T.STONE]: '#c2bba7', [T.COBBLE]: '#958f80', [T.SAND]: '#d8c69c', [T.WATER]: '#4c8496', [T.ROAD]: '#6b6760', [T.TRACK]: '#6b6760', [T.WALK]: '#b5af9d', [T.FIELD]: '#7da456', [T.SNOW]: '#e8edea', [T.BRIDGE]: '#a58b62', [T.SHORE]: '#b9aa82' };
  let miniBase = null, miniFor = null;
  R.minimap = (cv, state) => {
    const world = R.world; if (!world || !cv) return; const N = world.N, m = cv.getContext('2d'), w = cv.width, h = cv.height;
    if (miniFor !== world) {
      miniBase = document.createElement('canvas'); miniBase.width = miniBase.height = N; const b = miniBase.getContext('2d'), img = b.createImageData(N, N);
      for (let i = 0; i < N * N; i++) { const [r, g, bl] = SA.rgb(world.season === 'winter' && SA.World.GREEN.has(world.terrain[i]) ? '#e8edea' : MINI[world.terrain[i]] || '#6f8a4c'); img.data.set([r, g, bl, 255], i * 4); }
      b.putImageData(img, 0, 0); b.fillStyle = '#5a4a3c'; for (const bd of world.buildings) b.fillRect(bd.x, bd.y, bd.w, bd.h); miniFor = world;
    }
    m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, w, h);
    const k = w / (N * 2); m.save(); m.translate(w / 2, 0); m.transform(k, k * (h / w), -k, k * (h / w), 0, 0); m.imageSmoothingEnabled = false;
    m.drawImage(miniBase, 0, 0); m.globalAlpha = 0.96; m.imageSmoothingEnabled = true; m.drawImage(fog, 0, 0); m.globalAlpha = 1;
    const dot = (x, y, col, r = 1.3) => { m.fillStyle = col; m.beginPath(); m.arc(x + 0.5, y + 0.5, r, 0, TAU); m.fill(); };
    for (const mk of state.marks || []) if (mk.always || R.isExplored(mk.x, mk.y)) dot(mk.x, mk.y, mk.col || '#f3ead1', mk.r || 1.3);
    if (state.player) { dot(state.player.x, state.player.y, '#1b1b1b', 2.4); dot(state.player.x, state.player.y, '#ffd75e', 1.6); }
    const a = SA.uniso(R.cam.x - W / 2 / R.zoom, R.cam.y - H / 2 / R.zoom), b2 = SA.uniso(R.cam.x + W / 2 / R.zoom, R.cam.y - H / 2 / R.zoom), c2 = SA.uniso(R.cam.x + W / 2 / R.zoom, R.cam.y + H / 2 / R.zoom), d2 = SA.uniso(R.cam.x - W / 2 / R.zoom, R.cam.y + H / 2 / R.zoom);
    m.strokeStyle = '#fff6d8'; m.lineWidth = 0.7; m.beginPath(); m.moveTo(a.x, a.y); m.lineTo(b2.x, b2.y); m.lineTo(c2.x, c2.y); m.lineTo(d2.x, d2.y); m.closePath(); m.stroke();
    m.restore();
  };
  R.miniToTile = (cv, px, py) => { const N = R.world.N, w = cv.clientWidth, h = cv.clientHeight, k = w / (N * 2), X = (px - w / 2) / k, Y = py / (k * (h / w)); return { x: (X + Y) / 2, y: (Y - X) / 2 }; };
  R.C = C;
  SA.Render = R;
})();
