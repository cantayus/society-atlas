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
      [T.WALK]: '#b5af9d', [T.CROSS]: (world.visit.year || 2000) < 1925 ? '#a39a86' : '#716d66', [T.FIELD]: s === 'winter' ? '#e3e9e6' : '#6e9a4c', [T.SNOW]: '#e8edea', [T.BRIDGE]: '#a58b62', [T.SHORE]: s === 'winter' ? '#d5dcd8' : '#b9aa82',
    };
  }
  const PRI = { [T.WATER]: 0, [T.SHORE]: 1, [T.ROAD]: 2, [T.TRACK]: 2, [T.CROSS]: 2, [T.WALK]: 2.5, [T.BRIDGE]: 2.6, [T.BRICK]: 3, [T.STONE]: 3, [T.COBBLE]: 3, [T.SAND]: 3.2, [T.DIRT]: 4, [T.GRAVEL]: 4, [T.FIELD]: 5, [T.GRASS]: 5, [T.MEADOW]: 5, [T.SNOW]: 5, [T.FOREST]: 6 };

  // ---------- ground painting ----------
  function paintTile(c, world, col, x, y) {
    const t = world.tile(x, y), p = iso(x, y), base = col[t] || col[T.GRASS];
    const big = noise(x / 6, y / 6, world.seed) - 0.5, r = hash(x, y, world.seed);
    const soft = t === T.GRASS || t === T.MEADOW || t === T.FOREST || t === T.FIELD || t === T.SNOW;
    let fill = shade(base, Math.round((soft ? big * 20 : big * 6) + (r - 0.5) * (soft ? 2 : 5)));
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
      const modern = (world.visit.year || 2000) >= 1930, rd = world.roads.find((q) => (q.axis === 'x' ? y >= q.at && y < q.at + q.width : x >= q.at && x < q.at + q.width));
      if (modern && rd && rd.width === 2 && t === T.ROAD && (rd.axis === 'x' ? y === rd.at : x === rd.at)) { c.strokeStyle = 'rgba(232,216,150,.75)'; c.lineWidth = 1.6; c.beginPath(); if (rd.axis === 'x') { c.moveTo(...at(-0.22, 0.5)); c.lineTo(...at(0.22, 0.5)); } else { c.moveTo(...at(0.5, -0.22)); c.lineTo(...at(0.5, 0.22)); } c.stroke(); }
    } else if (t === T.CROSS) {
      sprinkle(5, [shade(fill, 12), shade(fill, -12)], 1.6, 1);
      const rd = world.roads.find((q) => (q.axis === 'x' ? y >= q.at && y < q.at + q.width : x >= q.at && x < q.at + q.width)), alongX = !rd || rd.axis === 'x';
      c.fillStyle = (world.visit.year || 2000) < 1925 ? 'rgba(210,200,176,.75)' : 'rgba(240,238,228,.82)';
      for (const o of [-0.27, 0.23]) { const q = alongX ? [at(-0.46, o), at(0.46, o), at(0.46, o + 0.17), at(-0.46, o + 0.17)] : [at(o, -0.46), at(o, 0.46), at(o + 0.17, 0.46), at(o + 0.17, -0.46)]; c.beginPath(); q.forEach((pt, i) => (i ? c.lineTo(pt[0], pt[1]) : c.moveTo(pt[0], pt[1]))); c.closePath(); c.fill(); }
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
      const hard = (nt === T.BRICK || nt === T.STONE || nt === T.COBBLE || nt === T.WALK || nt === T.SAND || nt === T.BRIDGE || nt === T.ROAD || nt === T.TRACK || nt === T.CROSS);
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

  const HARD = new Set([T.BRICK, T.STONE, T.COBBLE, T.SAND, T.WALK]);
  const SOFT = new Set([T.GRASS, T.MEADOW, T.FOREST, T.FIELD, T.SNOW]);
  // Soft-edged shape: draw far off-canvas and let only its blurred shadow land in place.
  function softShape(c, pts, colour, blur) {
    const OFF = 6000; c.save(); c.shadowColor = colour; c.shadowBlur = blur * S; c.shadowOffsetX = OFF; c.shadowOffsetY = 0; c.fillStyle = '#000';
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0] - OFF / S, p[1]) : c.moveTo(p[0] - OFF / S, p[1]))); c.closePath(); c.fill(); c.restore();
  }
  function paintChunk(world, cxi, cyi) {
    const cv = document.createElement('canvas'); cv.width = cv.height = Math.ceil(CH * S);
    const c = cv.getContext('2d'); c.setTransform(S, 0, 0, S, -cxi * CH * S, -cyi * CH * S);
    const col = world._col || (world._col = groundColours(world)), N = world.N, winter = world.season === 'winter';
    const x0 = cxi * CH - TW, x1 = (cxi + 1) * CH + TW, y0 = cyi * CH - TH * 2, y1 = (cyi + 1) * CH + TH;
    const tiles = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const p = iso(x, y); if (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1) tiles.push([x, y]); }
    for (const [x, y] of tiles) paintTile(c, world, col, x, y);
    for (const [x, y] of tiles) paintFringe(c, world, col, x, y);
    // lawns: large soft mottling and loose blades that ignore the tile grid
    c.save(); c.beginPath();
    for (const [x, y] of tiles) if (SOFT.has(world.tile(x, y))) { const p = iso(x, y); c.moveTo(p.x, p.y - 0.5); c.lineTo(p.x + TW / 2 + 0.5, p.y + TH / 2); c.lineTo(p.x, p.y + TH + 0.5); c.lineTo(p.x - TW / 2 - 0.5, p.y + TH / 2); c.closePath(); }
    c.clip();
    for (const [x, y] of tiles) {
      const t = world.tile(x, y); if (!SOFT.has(t)) continue; const p = iso(x, y), base = col[t];
      for (let i = 0; i < 2; i++) {
        const lighter = hash(x, y, 40 + i) > 0.5, px = p.x + (hash(x, y, 41 + i) - 0.5) * TW * 1.7, py = p.y + TH / 2 + (hash(x, y, 43 + i) - 0.5) * TH * 1.7;
        c.fillStyle = SA.alpha(shade(base, lighter ? 24 : -26), winter ? 0.10 : 0.085); c.beginPath(); c.ellipse(px, py, 22 + hash(x, y, 45 + i) * 30, 9 + hash(x, y, 46 + i) * 12, 0, 0, TAU); c.fill();
      }
      if (!winter && t !== T.FIELD) { c.lineWidth = 1; for (let i = 0; i < 7; i++) { const px = p.x + (hash(x, y, 50 + i) - 0.5) * TW, py = p.y + TH / 2 + (hash(x, y, 60 + i) - 0.5) * TH; c.strokeStyle = SA.alpha(shade(base, i % 2 ? 30 : -30), 0.5); c.beginPath(); c.moveTo(px, py); c.lineTo(px + (hash(x, y, 70 + i) - 0.5) * 3, py - 2.5 - hash(x, y, 80 + i) * 3); c.stroke(); } }
      else if (winter) for (let i = 0; i < 2; i++) { const px = p.x + (hash(x, y, 50 + i) - 0.5) * TW, py = p.y + TH / 2 + (hash(x, y, 60 + i) - 0.5) * TH; c.fillStyle = 'rgba(150,175,200,.22)'; c.beginPath(); c.ellipse(px, py, 9, 2.6, 0, 0, TAU); c.fill(); }
    }
    c.restore();
    // kerbs where paving meets soft ground
    const edge = (x, y, dx, dy) => { const p = iso(x, y), cx = p.x, cy = p.y + TH / 2, at = (u, v) => [cx + (u - v) * TW / 2, cy + (u + v) * TH / 2]; return dx ? [at(dx * 0.5, -0.5), at(dx * 0.5, 0.5)] : [at(-0.5, dy * 0.5), at(0.5, dy * 0.5)]; };
    for (const [x, y] of tiles) {
      const t = world.tile(x, y); if (!HARD.has(t)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nt = world.tile(x + dx, y + dy); if (HARD.has(nt) || nt === T.BRIDGE || nt === T.ROAD || nt === T.TRACK || nt === T.CROSS) continue;
        const [a, b] = edge(x, y, dx, dy);
        c.strokeStyle = SA.alpha(shade(col[t], -52), 0.55); c.lineWidth = 1.5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
        c.strokeStyle = 'rgba(255,246,222,.22)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(a[0], a[1] - 1.3); c.lineTo(b[0], b[1] - 1.3); c.stroke();
      }
    }
    // diagonal walks as smooth bands, so they do not look like staircases
    for (const w of world.walks || []) {
      const len = Math.hypot(w.x1 - w.x0, w.y1 - w.y0), dx = (w.x1 - w.x0) / len, dy = (w.y1 - w.y0) / len, half = 0.5 * w.width + 0.36, nx = -dy * half, ny = dx * half;
      const Q = (x, y) => { const p = iso(x + 0.5, y + 0.5); return [p.x, p.y]; };
      const pts = [Q(w.x0 - dx * 0.3 + nx, w.y0 - dy * 0.3 + ny), Q(w.x1 + dx * 0.3 + nx, w.y1 + dy * 0.3 + ny), Q(w.x1 + dx * 0.3 - nx, w.y1 + dy * 0.3 - ny), Q(w.x0 - dx * 0.3 - nx, w.y0 - dy * 0.3 - ny)];
      if (pts.every((p) => p[0] < x0) || pts.every((p) => p[0] > x1) || pts.every((p) => p[1] < y0) || pts.every((p) => p[1] > y1)) continue;
      const base = col[w.t] || col[T.GRAVEL];
      c.save(); c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fillStyle = base; c.fill(); c.clip();
      const n = Math.ceil(len * 26);
      for (let i = 0; i < n; i++) { const f = hash(i, w.x0 + w.y1, 90), g = hash(i, w.x1 + w.y0, 91) * 2 - 1, q = Q(w.x0 + (w.x1 - w.x0) * f + nx * g, w.y0 + (w.y1 - w.y0) * f + ny * g); c.fillStyle = shade(base, Math.round(hash(i, 3, 92) * 36 - 18)); c.fillRect(q[0], q[1], w.t === T.BRICK ? 3.2 : 1.8, 1.3); }
      if (w.t === T.BRICK || w.t === T.STONE) { c.strokeStyle = SA.alpha(shade(base, -30), 0.55); c.lineWidth = 0.6; for (let k = 0; k < len * 4; k++) { const f = k / (len * 4), a = Q(w.x0 + (w.x1 - w.x0) * f + nx, w.y0 + (w.y1 - w.y0) * f + ny), b = Q(w.x0 + (w.x1 - w.x0) * f - nx, w.y0 + (w.y1 - w.y0) * f - ny); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }
      c.restore();
      for (const [a, b] of [[pts[0], pts[1]], [pts[3], pts[2]]]) { c.strokeStyle = SA.alpha(shade(base, -50), 0.5); c.lineWidth = 1.4; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    }
    // soft building shadows from one sun, plus a contact shadow at each wall foot
    for (const b of world.buildings) {
      const z = b.height || 60, q = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => { const p = iso(x, y); return [p.x, p.y]; });
      const sh = hull([...q, ...q.map(([x, y]) => [x + z * 0.66, y + z * 0.26])]);
      if (sh.every((p) => p[0] < x0 - 80) || sh.every((p) => p[0] > x1 + 80) || sh.every((p) => p[1] < y0 - 80) || sh.every((p) => p[1] > y1 + 80)) continue;
      softShape(c, sh, winter ? 'rgba(52,74,112,.34)' : 'rgba(16,28,14,.36)', 9);
      softShape(c, q.map(([x, y], i) => [x + (i === 1 || i === 2 ? 5 : -5), y + (i >= 2 ? 4 : -2)]), winter ? 'rgba(40,60,96,.4)' : 'rgba(12,22,10,.46)', 7);
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
    const sig = SA.Signature && SA.Signature.has(b);
    const bbox = { x0: left - (sig ? 70 : 24), x1: right + (sig ? 70 : 60), y0: top - (sig ? 430 : (b.height || 60) + 150), y1: bottom + (sig ? 60 : 26) };
    return spriteFor('b' + i, bbox, (c) => {
      if (sig) { SA.Signature.draw(c, b, R.world); return; }
      const env = archEnv(c);
      if (!(window.CampusArchitecture && window.CampusArchitecture.draw(c, b, env))) env.box(b.x, b.y, b.w, b.h, b.height || 60, b.wall, b.roof);
      detail(c, b, env);
      if (R.world.season === 'winter') snowCap(c, b);
    });
  }
  // Extra architectural detail laid over each cached building: plinths, quoins, ivy,
  // downpipes, door lanterns, steps, banners, weathervanes and rooftop fittings.
  function detail(c, b, env) {
    const world = R.world, z = b.height || 60, w = b.w, h = b.h, seed = b.x * 37 + b.y * 91, season = world.season, year = world.visit.year || 2000;
    const F = (u, v) => { const p = iso(b.x + u, b.y + h); return [p.x, p.y - v]; };              // front wall
    const Sd = (a, v) => { const p = iso(b.x + w, b.y + a); return [p.x, p.y - v]; };             // side wall
    const Rf = (u, a, v) => { const p = iso(b.x + u, b.y + a); return [p.x, p.y - v]; };          // any point
    const quad = (pts, fill) => env.poly(pts, fill);
    const simple = b.type === 'office' || b.type === 'archive' || b.type === 'library', flat = b.style === 'urban', big = b.type === 'landmark' || b.type === 'secondary';
    if (simple) {
      // stone plinth and a darker damp line where wall meets ground
      quad([F(0, 0), F(w, 0), F(w, 4.5), F(0, 4.5)], 'rgba(46,40,32,.26)'); quad([Sd(0, 0), Sd(h, 0), Sd(h, 4.5), Sd(0, 4.5)], 'rgba(30,26,22,.34)');
      quad([F(0, 4.5), F(w, 4.5), F(w, 5.6), F(0, 5.6)], 'rgba(255,244,214,.2)');
      if (!flat && b.style !== 'arcade') {                                                           // quoins at the corners
        for (let v = 7; v < z - 12; v += 9) { const long = (v / 9) % 2 < 1 ? 0.2 : 0.13; quad([F(0, v), F(long, v), F(long, v + 5.4), F(0, v + 5.4)], 'rgba(244,232,204,.34)'); quad([F(w - long, v), F(w, v), F(w, v + 5.4), F(w - long, v + 5.4)], 'rgba(244,232,204,.3)'); quad([Sd(h - long, v), Sd(h, v), Sd(h, v + 5.4), Sd(h - long, v + 5.4)], 'rgba(244,232,204,.2)'); quad([Sd(0, v), Sd(long, v), Sd(long, v + 5.4), Sd(0, v + 5.4)], 'rgba(244,232,204,.18)'); }
        for (let i = 0; i < 7; i++) { const u = 0.3 + hash(seed, i, 71) * (w - 0.6), len = 8 + hash(seed, i, 72) * 16; c.strokeStyle = 'rgba(28,30,24,.075)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(...F(u, z - 3)); c.lineTo(...F(u, z - 3 - len)); c.stroke(); }
      }
      // downpipe
      c.strokeStyle = 'rgba(38,44,40,.62)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(...F(w - 0.34, z - 3)); c.lineTo(...F(w - 0.34, 1)); c.stroke(); c.fillStyle = 'rgba(38,44,40,.7)'; const hp = F(w - 0.34, z - 4); c.fillRect(hp[0] - 2.4, hp[1] - 2, 4.8, 3.4);
      // ivy, bare vines in winter
      if (!flat && hash(seed, 1, 73) > 0.36) {
        const span = Math.min(w * 0.42, 2.6), leafs = season === 'autumn' ? ['#3f5d39', '#55783e', '#a5422f', '#c0672c', '#6f9150'] : ['#3a5a36', '#4f7a40', '#6f9a55', '#86a862'];
        if (season === 'winter') { c.strokeStyle = 'rgba(70,56,40,.6)'; c.lineWidth = 0.9; for (let i = 0; i < 7; i++) { const u = 0.12 + hash(seed, i, 74) * span; c.beginPath(); c.moveTo(...F(u, 2)); c.quadraticCurveTo(...F(u + 0.2, z * 0.3), ...F(u - 0.1 + hash(seed, i, 75) * 0.4, z * (0.35 + hash(seed, i, 76) * 0.3))); c.stroke(); } }
        else for (let i = 0; i < 90; i++) { const f = hash(seed, i, 74), u = 0.06 + f * span, top = z * 0.8 * (1 - f * 0.72), v = 3 + Math.pow(hash(seed, i, 75), 0.8) * top, q = F(u, v); c.fillStyle = leafs[i % leafs.length]; c.beginPath(); c.ellipse(q[0], q[1], 2.6 + hash(seed, i, 76) * 1.6, 2 + hash(seed, i, 77) * 1.2, 0, 0, TAU); c.fill(); }
        if (season !== 'winter' && hash(seed, 2, 73) > 0.5) for (let i = 0; i < 50; i++) { const f = hash(seed, i, 78), a = h - 0.08 - f * Math.min(h * 0.5, 2), top = z * 0.66 * (1 - f * 0.7), q = Sd(a, 3 + hash(seed, i, 79) * top); c.fillStyle = shade(leafs[i % leafs.length], -16); c.beginPath(); c.ellipse(q[0], q[1], 2.6, 2, 0, 0, TAU); c.fill(); }
      }
      // lanterns either side of the door, and two stone steps
      for (const du of [-0.74, 0.74]) { const q = F(w / 2 + du, 21); c.fillStyle = '#2c312e'; c.fillRect(q[0] - 2.4, q[1] - 7.4, 4.8, 1.6); c.fillStyle = '#f3dd98'; c.fillRect(q[0] - 1.9, q[1] - 5.8, 3.8, 5.2); c.fillStyle = '#fff5cf'; c.fillRect(q[0] - 1.9, q[1] - 5.8, 1.3, 5.2); c.fillStyle = '#2c312e'; c.fillRect(q[0] - 2.4, q[1] - 0.8, 4.8, 1.3); }
      quad([Rf(w / 2 - 0.62, h, 0), Rf(w / 2 + 0.62, h, 0), Rf(w / 2 + 0.62, h + 0.2, 0), Rf(w / 2 - 0.62, h + 0.2, 0)], '#cfc8b3'); quad([Rf(w / 2 - 0.74, h + 0.2, 0), Rf(w / 2 + 0.74, h + 0.2, 0), Rf(w / 2 + 0.74, h + 0.42, 0), Rf(w / 2 - 0.74, h + 0.42, 0)], '#b9b29d');
      if (flat) {                                                                                    // rooftop fittings on flat roofs
        const prism = (x, y, ww, hh, z0, z1, col) => { const a = Rf(x, y + hh, z0), d = Rf(x + ww, y + hh, z0), e = Rf(x + ww, y, z0); quad([a, d, Rf(x + ww, y + hh, z1), Rf(x, y + hh, z1)], shade(col, 6)); quad([e, d, Rf(x + ww, y + hh, z1), Rf(x + ww, y, z1)], shade(col, -20)); quad([Rf(x, y, z1), Rf(x + ww, y, z1), Rf(x + ww, y + hh, z1), Rf(x, y + hh, z1)], shade(col, 20)); };
        c.strokeStyle = 'rgba(255,248,226,.32)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(...Rf(0, h, z)); c.lineTo(...Rf(w, h, z)); c.lineTo(...Rf(w, 0, z)); c.stroke();
        if (year >= 1975) { prism(w * 0.2, h * 0.25, 0.7, 0.5, z, z + 7, '#9aa09c'); prism(w * 0.55, h * 0.5, 0.9, 0.6, z, z + 6, '#8d948f'); quad([Rf(w * 0.34, h * 0.62, z + 0.6), Rf(w * 0.34 + 0.9, h * 0.62, z + 0.6), Rf(w * 0.34 + 0.9, h * 0.62 + 0.5, z + 0.6), Rf(w * 0.34, h * 0.62 + 0.5, z + 0.6)], 'rgba(150,200,214,.75)'); }
        else { const q = Rf(w * 0.3, h * 0.4, z); c.fillStyle = '#6a5a48'; c.fillRect(q[0] - 7, q[1] - 15, 14, 13); c.beginPath(); c.ellipse(q[0], q[1] - 15, 7, 3, 0, 0, TAU); c.fillStyle = '#8a745a'; c.fill(); c.fillStyle = '#5a4b3c'; c.beginPath(); c.ellipse(q[0], q[1] - 2, 7, 3, 0, 0, Math.PI); c.fill(); for (const dx of [-5, 5]) c.fillRect(q[0] + dx - 0.8, q[1] - 2, 1.6, 6); }
        const an = Rf(w * 0.78, h * 0.3, z); c.strokeStyle = '#4a4f4c'; c.lineWidth = 1; c.beginPath(); c.moveTo(an[0], an[1]); c.lineTo(an[0], an[1] - 20); c.moveTo(an[0] - 4, an[1] - 15); c.lineTo(an[0] + 4, an[1] - 15); c.moveTo(an[0] - 3, an[1] - 11); c.lineTo(an[0] + 3, an[1] - 11); c.stroke();
      } else if (b.type !== 'office' || hash(seed, 3, 73) > 0.5) {                                   // weathervane and a few birds on the ridge
        const q = Rf(w / 2, h / 2, z + (b.type === 'library' ? 30 : 24)); c.strokeStyle = '#3a3f3c'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(q[0], q[1] + 4); c.lineTo(q[0], q[1] - 11); c.moveTo(q[0] - 6, q[1] - 8); c.lineTo(q[0] + 6, q[1] - 8); c.stroke(); c.fillStyle = '#c9a54e'; c.beginPath(); c.moveTo(q[0] + 6, q[1] - 8); c.lineTo(q[0] + 2, q[1] - 10.4); c.lineTo(q[0] + 2, q[1] - 5.6); c.fill(); c.beginPath(); c.arc(q[0], q[1] - 12, 1.6, 0, TAU); c.fill();
        c.fillStyle = '#2b2b29'; for (let i = 0; i < 3; i++) { const r = Rf(w * (0.22 + i * 0.09), h / 2, z + 16); c.beginPath(); c.ellipse(r[0], r[1], 1.8, 1.3, 0, 0, TAU); c.fill(); c.fillRect(r[0] + 1, r[1] - 1.6, 1.4, 1); }
      }
    }
    if (big && b.style !== 'gates' && world.def.colors) {                                            // hanging banners in the house colours
      const [c1, c2] = world.def.colors;
      for (const f of [0.13, 0.87]) { const u = w * f, top = z * 0.66, bot = z * 0.24, hw = 0.19; quad([F(u - hw, top), F(u + hw, top), F(u + hw, bot), F(u, bot - 5), F(u - hw, bot)], c1); quad([F(u - hw, bot + 9), F(u + hw, bot + 9), F(u + hw, bot), F(u, bot - 5), F(u - hw, bot)], c2); c.strokeStyle = 'rgba(255,250,230,.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(...F(u - hw, top)); c.lineTo(...F(u + hw, top)); c.stroke(); c.fillStyle = '#3a3f3c'; const q = F(u, top); c.fillRect(q[0] - 7, q[1] - 2.4, 14, 1.6); }
      quad([Rf(w / 2 - 1.1, h, 0), Rf(w / 2 + 1.1, h, 0), Rf(w / 2 + 1.1, h + 0.24, 0), Rf(w / 2 - 1.1, h + 0.24, 0)], '#d2cbb6'); quad([Rf(w / 2 - 1.3, h + 0.24, 0), Rf(w / 2 + 1.3, h + 0.24, 0), Rf(w / 2 + 1.3, h + 0.5, 0), Rf(w / 2 - 1.3, h + 0.5, 0)], '#bcb5a0');
    }
    if (b.type === 'rowhouse') { for (let u = 0.5; u < w; u += 1.6) { const q = F(u, 18); c.fillStyle = hash(seed, u * 10, 81) > 0.5 ? '#b8483a' : '#e7c35a'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(q[0] - 4 + i * 2.6, q[1] + i * 1.3, 1.5, 0, TAU); c.fill(); } c.fillStyle = '#5a4630'; c.beginPath(); c.moveTo(q[0] - 6, q[1] + 0.8); c.lineTo(q[0] + 6, q[1] + 6.8); c.lineTo(q[0] + 6, q[1] + 9); c.lineTo(q[0] - 6, q[1] + 3); c.fill(); } }
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

  // ---------- atmosphere: cloud shadows, smoke, drifting leaves and snow, sun shafts ----------
  const FX = { clouds: [], motes: [], flies: [], smoke: [], chim: [], last: 0, kind: 'mote' };
  function initFx(world) {
    const rnd = SA.rng(world.seed + 3), N = world.N, span = N * TW;
    FX.clouds = Array.from({ length: 7 }, () => ({ x: (rnd() - 0.5) * span * 1.6, y: rnd() * N * TH, rx: 280 + rnd() * 340, ry: 120 + rnd() * 130, v: 6 + rnd() * 8 }));
    FX.smoke = []; FX.last = 0;
    FX.chim = world.buildings.filter((b, i) => (b.type === 'office' || b.type === 'archive' || b.type === 'library' || b.type === 'rowhouse') && b.style !== 'urban' && i % 2 === 0).map((b) => ({ x: b.x + b.w * 0.3, y: b.y + b.h * 0.42, z: (b.height || 60) + 24, acc: rnd() }));
    FX.kind = { autumn: 'leaf', winter: 'snow', spring: 'petal', summer: 'mote' }[world.season] || 'mote';
    FX.motes = Array.from({ length: { leaf: 28, snow: 120, petal: 26, mote: 22 }[FX.kind] }, (_, i) => ({ x: rnd(), y: rnd(), s: 0.55 + rnd() * 0.9, ph: rnd() * TAU, c: i }));
    FX.flies = Array.from({ length: 18 }, () => ({ x: rnd(), y: rnd(), ph: rnd() * TAU, s: 0.5 + rnd() }));
  }
  function drawSmoke(t, reduced) {
    const dt = Math.min(0.1, Math.max(0, t - FX.last)); FX.last = t; if (reduced) return;
    for (const ch of FX.chim) { ch.acc += dt * 1.5; if (ch.acc > 1) { ch.acc = 0; if (R.isExplored(ch.x, ch.y) && FX.smoke.length < 70) { const p = iso(ch.x, ch.y); FX.smoke.push({ x: p.x, y: p.y - ch.z, age: 0, life: 4.5 + Math.random() * 2, dx: 7 + Math.random() * 6, r: 3 }); } } }
    for (const s of FX.smoke) { s.age += dt; s.x += s.dx * dt; s.y -= 11 * dt; s.r += 3.2 * dt; }
    FX.smoke = FX.smoke.filter((s) => s.age < s.life);
    const cold = R.world.season === 'winter';
    for (const s of FX.smoke) { const a = Math.sin((s.age / s.life) * Math.PI) * (cold ? 0.36 : 0.24); ctx.fillStyle = `rgba(236,232,222,${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill(); }
  }
  function drawClouds(t, dark, reduced) {
    if (dark > 0.6) return; const span = R.world.N * TW;
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    for (const c of FX.clouds) {
      const x = ((c.x + (reduced ? 0 : t * c.v) + span * 1.6) % (span * 3.2)) - span * 1.6;
      ctx.save(); ctx.translate(x, c.y); ctx.scale(c.rx, c.ry); const g = ctx.createRadialGradient(0, 0, 0.1, 0, 0, 1);
      g.addColorStop(0, `rgba(110,124,146,${0.36 * (1 - dark)})`); g.addColorStop(0.6, `rgba(110,124,146,${0.2 * (1 - dark)})`); g.addColorStop(1, 'rgba(110,124,146,0)');
      ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
    ctx.restore();
  }
  function drawPools(k, z) {                                 // warm pools of lamplight on the ground
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const L of R.world.lights) {
      if (L.window || !R.isExplored(L.x, L.y)) continue; const p = C(L.x, L.y);
      ctx.save(); ctx.translate(p.x, p.y + 2); ctx.scale(1, 0.5); const r = L.r * 1.5, g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(255,206,128,${0.5 * k})`); g.addColorStop(0.5, `rgba(255,190,110,${0.2 * k})`); g.addColorStop(1, 'rgba(255,180,100,0)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
    }
    ctx.restore(); void z;
  }
  function drawSky(t, hour, dark, reduced) {
    // low sun shafts at the ends of the day
    const k = hour > 15.4 && hour < 19.2 ? 1 - Math.abs(hour - 17.3) / 1.9 : hour > 6.2 && hour < 8.8 ? 1 - Math.abs(hour - 7.5) / 1.3 : 0;
    if (k > 0.03) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.transform(1, 0, -0.55, 1, 0, 0);
      for (let i = 0; i < 6; i++) {
        const x = (i * 0.21 + Math.sin(t * 0.04 + i * 1.7) * 0.03) * W * 1.5 + H * 0.3, w = 50 + (i * 53 % 110), g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgba(255,224,160,${0.13 * k})`); g.addColorStop(0.75, `rgba(255,214,150,${0.04 * k})`); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(x, 0, w, H);
      }
      ctx.restore();
    }
    if (!reduced) {
      const kind = FX.kind, night = dark > 0.6;
      if (kind === 'snow') { ctx.fillStyle = 'rgba(255,255,255,.85)'; for (const m of FX.motes) { const x = ((m.x + Math.sin(t * 0.6 + m.ph) * 0.012 + t * 0.006 * m.s) % 1) * W, y = ((m.y + t * 0.045 * m.s) % 1) * H; ctx.beginPath(); ctx.arc(x, y, 0.8 + m.s * 1.1, 0, TAU); ctx.fill(); } }
      else if (kind === 'leaf' || kind === 'petal') {
        const cols = kind === 'leaf' ? ['#c9722f', '#e0a544', '#a84a2f', '#d9a441'] : ['#f6cfd9', '#f1b8c8', '#fbe6ec'];
        for (const m of FX.motes) { const x = ((m.x + t * 0.022 * m.s + Math.sin(t * 0.8 + m.ph) * 0.02) % 1) * (W + 40) - 20, y = ((m.y + t * 0.03 * m.s) % 1) * (H + 40) - 20; ctx.save(); ctx.translate(x, y); ctx.rotate(t * (1.2 + m.s) + m.ph); ctx.fillStyle = cols[m.c % cols.length]; ctx.globalAlpha = night ? 0.35 : 0.9; ctx.beginPath(); ctx.ellipse(0, 0, 3.4 * m.s + 1, 1.6 * m.s + 0.6, 0, 0, TAU); ctx.fill(); ctx.restore(); }
      } else if (!night) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const m of FX.motes) { const x = ((m.x + Math.sin(t * 0.2 + m.ph) * 0.03) % 1) * W, y = ((m.y - t * 0.006 * m.s + 10) % 1) * H, a = 0.25 + 0.25 * Math.sin(t * 1.3 + m.ph); ctx.fillStyle = `rgba(255,240,190,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + m.s, 0, TAU); ctx.fill(); } ctx.restore(); }
      if (night && R.world.season !== 'winter') { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const f of FX.flies) { const x = ((f.x + Math.sin(t * 0.23 * f.s + f.ph) * 0.05) % 1) * W, y = ((f.y + Math.cos(t * 0.19 * f.s + f.ph) * 0.05) % 1) * H, a = Math.max(0, Math.sin(t * 1.7 * f.s + f.ph)); const g = ctx.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, `rgba(214,255,150,${0.75 * a})`); g.addColorStop(1, 'rgba(214,255,150,0)'); ctx.fillStyle = g; ctx.fillRect(x - 9, y - 9, 18, 18); } ctx.restore(); }
    }
    // a soft vignette frames the scene
    const v = ctx.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.42, W / 2, H * 0.48, Math.max(W, H) * 0.78);
    v.addColorStop(0, 'rgba(8,10,14,0)'); v.addColorStop(1, 'rgba(8,10,14,.42)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  // ---------- public ----------
  R.init = (cv) => { canvas = cv; ctx = cv.getContext('2d'); R.resize(); };
  R.resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1); W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const want = Math.min(2, Math.max(1.3, dpr * 1.3)); if (want !== S) { S = want; chunks.clear(); sprites.clear(); }
  };
  R.setWorld = (world, exploredBits) => {
    R.world = world; chunks = new Map(); sprites = new Map(); order = buildOrder(world);
    explored = exploredBits || new Uint8Array(world.N * world.N);
    fog = document.createElement('canvas'); fog.width = fog.height = world.N; fogCtx = fog.getContext('2d'); fogDirty = true; initFx(world);
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
        const sp = Math.sin(t * 2.3 + hash(x, y, 34) * 40); if (sp > 0.93) { ctx.globalAlpha = (sp - 0.93) * 12; ctx.fillStyle = '#ffffff'; const sx = p.x + (hash(x, y, 35) - 0.5) * 30, sy = p.y + (hash(x, y, 36) - 0.5) * 12; ctx.fillRect(sx - 2.5, sy - 0.4, 5, 0.8); ctx.fillRect(sx - 0.4, sy - 2.5, 0.8, 5); }
      }
      ctx.globalAlpha = 1;
    }
    if (light.dark > 0.25) drawPools(Math.min(1, (light.dark - 0.25) / 0.5), z);
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
            else {
              const s = propSprite(p), bb = s.bbox, tall = d.h > 60;
              const fade = pl && tall && pl.x < p.x && pl.y < p.y && p.x - pl.x < 2.2 && p.y - pl.y < 2.2 && Math.abs((p.x - pl.x) - (p.y - pl.y)) < 1.6; if (fade) ctx.globalAlpha = 0.5;
              if (tall && !state.reduced) { const sw = (Math.sin(t * 0.9 + p.x * 0.7 + p.y * 0.4) + 0.5 * Math.sin(t * 2.1 + p.x)) * 0.011 * (world.season === 'winter' ? 1.5 : 1); ctx.save(); ctx.translate(q.x, q.y); ctx.transform(1, 0, sw, 1, 0, 0); ctx.drawImage(s.cv, bb.x0, bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0); ctx.restore(); }
              else ctx.drawImage(s.cv, q.x + bb.x0, q.y + bb.y0, bb.x1 - bb.x0, bb.y1 - bb.y0);
              ctx.globalAlpha = 1;
            }
          }
        }
      }
      drawDyn(i);
    }
    drawDyn(1e9);
    drawSmoke(t, state.reduced);
    if (state.overlay) state.overlay(ctx);
    drawClouds(t, light.dark, state.reduced);
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
    drawSky(t, state.hour ?? 12, light.dark, state.reduced);
    if (state.screen) state.screen(ctx, W, H);
  };

  // ---------- minimap ----------
  const MINI = { [T.GRASS]: '#6f8a4c', [T.MEADOW]: '#8c9a5a', [T.FOREST]: '#46603a', [T.DIRT]: '#a48d66', [T.GRAVEL]: '#bdb39a', [T.BRICK]: '#a8674f', [T.STONE]: '#c2bba7', [T.COBBLE]: '#958f80', [T.SAND]: '#d8c69c', [T.WATER]: '#4c8496', [T.ROAD]: '#6b6760', [T.TRACK]: '#6b6760', [T.WALK]: '#b5af9d', [T.CROSS]: '#8a857c', [T.FIELD]: '#7da456', [T.SNOW]: '#e8edea', [T.BRIDGE]: '#a58b62', [T.SHORE]: '#b9aa82' };
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
  // A stand-alone picture of one building, for the title screen and the atlas.
  R.thumb = (b, scale = 1, colors) => {
    const keep = R.world, keepS = S; R.world = { season: 'summer', visit: { year: 2000 }, def: { colors: colors || ['#7a2f2f', '#e0bd6c'] } }; S = scale;
    const d = { x: 0, y: 0, height: 60, type: 'office', style: 'hall', wall: '#a96a50', roof: '#626268', ...b }, left = iso(0, d.h).x, right = iso(d.w, 0).x, bottom = iso(d.w, d.h).y;
    const sig = SA.Signature && SA.Signature.has(d), bbox = { x0: left - (sig ? 70 : 10), x1: right + (sig ? 70 : 10), y0: sig ? -430 : -(d.height) - 150, y1: bottom + (sig ? 60 : 8) }, cv = document.createElement('canvas'); cv.width = Math.ceil((bbox.x1 - bbox.x0) * S); cv.height = Math.ceil((bbox.y1 - bbox.y0) * S);
    const c = cv.getContext('2d'); c.setTransform(S, 0, 0, S, -bbox.x0 * S, -bbox.y0 * S); const env = archEnv(c);
    if (sig) SA.Signature.draw(c, d, R.world); else { if (!(window.CampusArchitecture && window.CampusArchitecture.draw(c, d, env))) env.box(0, 0, d.w, d.h, d.height, d.wall, d.roof); detail(c, d, env); }
    R.world = keep; S = keepS;
    // trim empty rows at the top
    const img = c.getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, x1 = 0, y0 = cv.height, y1 = 0;
    for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x += 2) if (img[(y * cv.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0 || y1 <= y0) return cv; const out = document.createElement('canvas'); out.width = x1 - x0 + 4; out.height = y1 - y0 + 4; out.getContext('2d').drawImage(cv, -x0 + 2, -y0 + 2); return out;
  };
  R.C = C;
  SA.Render = R;
})();
