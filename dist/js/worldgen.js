/* The Society Atlas V2 — world model and site planner.
   A campus plan is a short function that calls planner operations; the planner
   then connects doors, lights paths, plants trees and checks that every
   destination can be reached. Deterministic for a given campus and visit. */
(function () {
  'use strict';
  const host = typeof window !== 'undefined' ? window : globalThis;
  const SA = host.SA;
  const T = {
    GRASS: 0, MEADOW: 1, DIRT: 2, GRAVEL: 3, BRICK: 4, STONE: 5, COBBLE: 6, SAND: 7, WATER: 8, ROAD: 9,
    WALK: 10, FIELD: 12, FOREST: 13, SNOW: 14, BRIDGE: 15, TRACK: 16, SHORE: 17, CROSS: 18,
  };
  const PATHLIKE = new Set([T.DIRT, T.GRAVEL, T.BRICK, T.STONE, T.COBBLE, T.SAND, T.WALK, T.BRIDGE, T.CROSS]);
  const GREEN = new Set([T.GRASS, T.MEADOW, T.FOREST, T.SNOW]);

  class Plan {
    constructor(N, seed, def, snow) {
      this.N = N; this.seed = seed; this.def = def; this.snow = !!snow;
      this.terrain = new Uint8Array(N * N).fill(snow ? T.SNOW : T.GRASS);
      this.block = new Uint8Array(N * N);
      this.keep = new Uint8Array(N * N);       // 1 = planner must not plant here
      this.buildings = []; this.props = []; this.pois = {}; this.interact = []; this.roads = []; this.boats = []; this.walks = [];
      this.rand = SA.rng(seed);
    }
    in(x, y) { return x >= 0 && y >= 0 && x < this.N && y < this.N; }
    i(x, y) { return y * this.N + x; }
    get(x, y) { return this.in(x, y) ? this.terrain[this.i(x, y)] : T.FOREST; }
    set(x, y, t) { if (this.in(x, y)) this.terrain[this.i(x, y)] = t; }
    fill(x, y, w, h, t) { for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) this.set(k, j, t); return this; }
    reserve(x, y, w, h) { for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) if (this.in(k, j)) this.keep[this.i(k, j)] = 1; return this; }
    ellipse(cx, cy, rx, ry, t) {
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (d <= 1 + (SA.hash(x, y, this.seed) - 0.5) * 0.22) this.set(x, y, t);
      }
      return this;
    }
    // straight or diagonal band between two tiles
    line(x0, y0, x1, y1, width, t) {
      if (x0 !== x1 && y0 !== y1) this.walks.push({ x0, y0, x1, y1, width, t });      // drawn as a smooth band later
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1, half = (width - 1) / 2;
      for (let s = 0; s <= steps; s++) {
        const x = x0 + ((x1 - x0) * s) / steps, y = y0 + ((y1 - y0) * s) / steps;
        for (let a = -Math.floor(half); a <= Math.ceil(half); a++) for (let b = -Math.floor(half); b <= Math.ceil(half); b++) {
          const xx = Math.round(x + a), yy = Math.round(y + b);
          if (this.in(xx, yy) && this.get(xx, yy) !== T.WATER && !this.block[this.i(xx, yy)]) this.set(xx, yy, t);
          else if (this.in(xx, yy) && this.get(xx, yy) === T.WATER) this.set(xx, yy, T.BRIDGE);
        }
      }
      return this;
    }
    path(a, b, width = 1, t = this.def.path || T.GRAVEL, elbow = 'x') {
      if (elbow === 'd') return this.line(a[0], a[1], b[0], b[1], width, t);
      const mid = elbow === 'x' ? [b[0], a[1]] : [a[0], b[1]];
      this.line(a[0], a[1], mid[0], mid[1], width, t); return this.line(mid[0], mid[1], b[0], b[1], width, t);
    }
    // meandering water band along an axis
    river(axis, at, width, wobble = 1.5, from = 0, to = this.N) {
      for (let s = from; s < to; s++) {
        const c = at + Math.sin(s * 0.21 + this.seed % 7) * wobble + Math.sin(s * 0.07) * wobble * 0.6;
        for (let d = -1; d <= width; d++) {
          const x = axis === 'y' ? Math.round(c + d) : s, y = axis === 'y' ? s : Math.round(c + d);
          if (this.in(x, y)) this.set(x, y, d < 0 || d >= width ? (this.get(x, y) === T.WATER ? T.WATER : T.SHORE) : T.WATER);
        }
      }
      return this;
    }
    pond(cx, cy, rx, ry) { this.ellipse(cx, cy, rx + 0.9, ry + 0.9, T.SHORE); return this.ellipse(cx, cy, rx, ry, T.WATER); }
    road(axis, at, opts = {}) {
      const w = opts.width || 2, N = this.N;
      for (let s = 0; s < N; s++) for (let d = -1; d <= w; d++) {
        const x = axis === 'y' ? at + d : s, y = axis === 'y' ? s : at + d;
        if (!this.in(x, y)) continue;
        this.set(x, y, d < 0 || d >= w ? T.WALK : opts.track && d === 0 ? T.TRACK : T.ROAD);
        this.keep[this.i(x, y)] = 1;
      }
      this.roads.push({ axis, at, width: w, track: !!opts.track });
      return this;
    }
    build(x, y, w, h, o = {}) {
      const d = this.def, b = {
        x, y, w, h, height: o.height || 58, type: o.type || 'office', style: o.style || d.style || 'hall',
        wall: o.wall || d.wall, roof: o.roof || d.roof, name: o.name || 'Hall', role: o.role || null, year: o.year,
      };
      b.door = { x: Math.floor(x + w / 2), y: y + h };
      for (let j = y; j < y + h; j++) for (let k = x; k < x + w; k++) if (this.in(k, j)) { this.block[this.i(k, j)] = 1; this.keep[this.i(k, j)] = 1; }
      this.reserve(x - 1, y - 1, w + 2, h + 2);
      this.buildings.push(b);
      if (b.role) this.pois[b.role] = { x: b.door.x, y: b.door.y, label: o.label || b.name, b };
      return b;
    }
    prop(k, x, y, o = {}) { const p = { k, x, y, o: { v: Math.floor(SA.hash(x * 7, y * 13, this.seed) * 997), ...o } }; this.props.push(p); if (this.in(Math.round(x), Math.round(y))) this.keep[this.i(Math.round(x), Math.round(y))] = 1; return p; }
    row(k, x0, y0, x1, y1, step, o = {}) {
      const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(len / step));
      for (let s = 0; s <= n; s++) {
        const x = Math.round(x0 + ((x1 - x0) * s) / n), y = Math.round(y0 + ((y1 - y0) * s) / n);
        if (this.in(x, y) && !this.block[this.i(x, y)] && !PATHLIKE.has(this.get(x, y)) && this.get(x, y) !== T.WATER && !this.taken(x, y)) this.prop(Array.isArray(k) ? k[s % k.length] : k, x, y, o);
      }
      return this;
    }
    taken(x, y) { return this.props.some((p) => Math.round(p.x) === x && Math.round(p.y) === y); }
    scatter(k, x, y, w, h, count, o = {}) {
      let tries = count * 14;
      while (count > 0 && tries-- > 0) {
        const xx = x + Math.floor(this.rand() * w), yy = y + Math.floor(this.rand() * h);
        if (!this.in(xx, yy) || this.block[this.i(xx, yy)] || this.keep[this.i(xx, yy)]) continue;
        const t = this.get(xx, yy);
        if (o.on ? !o.on.includes(t) : !GREEN.has(t)) continue;
        this.prop(Array.isArray(k) ? k[Math.floor(this.rand() * k.length)] : k, xx, yy, o.o || {}); count--;
      }
      return this;
    }
    poi(name, x, y, label, extra = {}) { this.pois[name] = { x, y, label, ...extra }; return this; }
    thing(kind, x, y, label, extra = {}) { this.interact.push({ kind, x, y, label, ...extra }); return this; }
    // court of buildings around a lawn: sides is a string of N,E,S,W
    quad(x, y, w, h, o = {}) {
      const d = o.depth || 4, g = o.gap || 3, sides = o.sides || 'NEW', made = [], mk = (bx, by, bw, bh, extra) => made.push(this.build(bx, by, bw, bh, { ...o.b, ...extra }));
      if (sides.includes('N')) mk(x + d + 1, y, w - 2 * d - 2, d, o.north || {});
      if (sides.includes('W')) mk(x, y + d + 1, d, h - 2 * d - 2, o.west || {});
      if (sides.includes('E')) mk(x + w - d, y + d + 1, d, h - 2 * d - 2, o.east || {});
      if (sides.includes('S')) { const half = Math.floor((w - 2 * d - 2 - g) / 2); mk(x + d + 1, y + h - d, half, d, o.south || {}); mk(x + w - d - 1 - half, y + h - d, half, d, o.south || {}); }
      const lx = x + d + 1, ly = y + d + 1, lw = w - 2 * d - 2, lh = h - 2 * d - 2, t = o.path || this.def.path || T.GRAVEL;
      this.fill(lx, ly, lw, 1, t).fill(lx, ly + lh - 1, lw, 1, t).fill(lx, ly, 1, lh, t).fill(lx + lw - 1, ly, 1, lh, t);
      const cx = Math.floor(lx + lw / 2), cy = Math.floor(ly + lh / 2);
      this.fill(cx, ly, 1, lh, t).fill(lx, cy, lw, 1, t);
      if (o.diag) { this.line(lx, ly, lx + lw - 1, ly + lh - 1, 1, t); this.line(lx + lw - 1, ly, lx, ly + lh - 1, 1, t); }
      this.reserve(cx - 1, cy - 1, 3, 3);
      return { made, cx, cy, lx, ly, lw, lh };
    }
  }

  // ---------- pathfinding ----------
  function findPath(world, sx, sy, tx, ty, maxNodes = 9000) {
    const N = world.N, I = (x, y) => y * N + x;
    sx = Math.round(sx); sy = Math.round(sy); tx = Math.round(tx); ty = Math.round(ty);
    if (tx < 0 || ty < 0 || tx >= N || ty >= N) return null;
    if (world.block[I(tx, ty)]) {
      let best = null, bd = 1e9;
      for (let r = 1; r <= 3 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const x = tx + dx, y = ty + dy; if (x < 0 || y < 0 || x >= N || y >= N || world.block[I(x, y)]) continue;
        const d = Math.hypot(x - sx, y - sy) + Math.hypot(dx, dy) * 3; if (d < bd) { bd = d; best = [x, y]; }
      }
      if (!best) return null; [tx, ty] = best;
    }
    const open = [[0, sx, sy]], g = new Map([[I(sx, sy), 0]]), from = new Map();
    const h = (x, y) => { const dx = Math.abs(x - tx), dy = Math.abs(y - ty); return Math.max(dx, dy) + 0.41 * Math.min(dx, dy); };
    let nodes = 0;
    while (open.length && nodes++ < maxNodes) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
      const [, x, y] = open.splice(bi, 1)[0];
      if (x === tx && y === ty) {
        const out = []; let k = I(x, y);
        while (k !== I(sx, sy)) { out.push({ x: k % N, y: Math.floor(k / N) }); k = from.get(k); }
        return out.reverse();
      }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || world.block[I(nx, ny)]) continue;
        if (dx && dy && (world.block[I(x + dx, y)] || world.block[I(x, y + dy)])) continue;
        const t = world.terrain[I(nx, ny)], cost = (dx && dy ? 1.41 : 1) * (PATHLIKE.has(t) ? 1 : t === T.ROAD || t === T.TRACK ? 1.3 : 1.6);
        const ng = g.get(I(x, y)) + cost, k = I(nx, ny);
        if (ng < (g.get(k) ?? 1e9)) { g.set(k, ng); from.set(k, I(x, y)); open.push([ng + h(nx, ny), nx, ny]); }
      }
    }
    return null;
  }

  function reachable(world, sx, sy) {
    const N = world.N, seen = new Uint8Array(N * N), q = [[Math.round(sx), Math.round(sy)]];
    seen[q[0][1] * N + q[0][0]] = 1;
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || seen[ny * N + nx] || world.block[ny * N + nx]) continue;
        seen[ny * N + nx] = 1; q.push([nx, ny]);
      }
    }
    return seen;
  }

  // ---------- finishing passes ----------
  function finish(P, def, visit) {
    const N = P.N, I = (x, y) => y * N + x, pathT = def.path || T.GRAVEL;
    const season = visit.season || def.season || 'autumn';
    // 1. doors get a threshold and a path to the nearest walk
    for (const b of P.buildings) {
      const d = b.door; if (!P.in(d.x, d.y)) continue;
      if (!PATHLIKE.has(P.get(d.x, d.y))) P.set(d.x, d.y, pathT);
      let found = null;
      for (let r = 1; r < 14 && !found; r++) for (let dx = -r; dx <= r && !found; dx++) {
        const x = d.x + dx, y = d.y + r - Math.abs(dx) * 0; const yy = d.y + (r - Math.min(r, Math.abs(dx)));
        void y; if (P.in(x, yy) && PATHLIKE.has(P.get(x, yy)) && !(x === d.x && yy === d.y) && !P.block[I(x, yy)]) found = [x, yy];
      }
      if (found) P.path([d.x, d.y], found, 1, pathT, 'y');
    }
    // 2. water and standing props block walking
    for (let k = 0; k < N * N; k++) if (P.terrain[k] === T.WATER) P.block[k] = 1;
    // 3. plant: forest belt, lawn trees in clusters, hedges and flowers by walls
    const kinds = (def.trees || ['elm', 'oak']).slice(), autumn = season === 'autumn', winter = season === 'winter', spring = season === 'spring';
    const pick = (x, y) => {
      if (winter) return SA.hash(x, y, 5) > 0.45 ? 'pine' : 'baretree';
      let k = kinds[Math.floor(SA.hash(x, y, 3) * kinds.length)];
      if (autumn && /elm|oak|lime/.test(k) && SA.hash(x, y, 4) > 0.45) k = ['maple', 'goldtree', 'redtree'][Math.floor(SA.hash(x, y, 6) * 3)];
      if (spring && /elm|oak|lime/.test(k) && SA.hash(x, y, 4) > 0.7) k = 'cherry';
      return k;
    };
    const near = (x, y, set, r = 1) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (set.has(P.get(x + dx, y + dy))) return true; return false; };
    const BUILT = new Set([T.ROAD, T.TRACK, T.WALK]);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = I(x, y), t = P.terrain[k];
      if (P.block[k] || P.keep[k] || !GREEN.has(t) || P.taken(x, y)) continue;
      const edge = Math.min(x, y, N - 1 - x, N - 1 - y), cl = SA.noise(x / 5.5, y / 5.5, P.seed), r = SA.hash(x, y, P.seed + 9);
      const forest = t === T.FOREST || edge < 4;
      if (forest) { if (r < 0.62) P.prop(winter ? (r < 0.3 ? 'pine' : 'baretree') : def.forest ? def.forest[Math.floor(r * 97) % def.forest.length] : r < 0.2 ? 'pine' : pick(x, y), x, y, { snow: winter }); if (t !== T.FOREST && !winter) P.terrain[k] = T.FOREST; continue; }
      const byWalk = near(x, y, PATHLIKE) || near(x, y, BUILT);
      const dens = (def.treeDensity ?? 0.085) * (cl > 0.6 ? 3.6 : cl > 0.48 ? 1.5 : 0.5) * (byWalk ? 0.35 : 1);
      if (near(x, y, BUILT)) { if (r > 0.97 && !winter) P.prop('tuft', x, y); continue; }
      if (r < dens) { P.prop(pick(x, y), x, y, { snow: winter }); if (autumn && !byWalk) P.prop('leaves', x + 0.3, y + 0.4); }
      else if (winter) { if (r > 0.99) P.prop('rock', x, y); }
      else if (r > 0.965) P.prop('bush', x, y, cl > 0.55 ? {} : { pal: 'lime' });
      else if (r > 0.94) P.prop(def.wild || 'flowers', x, y, { cols: [['#d9624e', '#f1e9d8'], ['#e7c35a', '#f1e9d8', '#d98f7a'], ['#9b6fb5', '#f1e9d8'], ['#f1e9d8', '#e7c35a']][Math.floor(r * 1000) % 4] });
      else if (r > 0.9) P.prop('tuft', x, y);
      else if (r > 0.89) P.prop(autumn ? 'leaves' : 'mushrooms', x, y);
      else if (r > 0.885) P.prop('rock', x, y);
    }
    for (const b of P.buildings) {
      for (let x = b.x; x < b.x + b.w; x++) {
        const fy = b.y + b.h; if (x === b.door.x || Math.abs(x - b.door.x) === 1) continue;
        if (P.in(x, fy) && GREEN.has(P.get(x, fy)) && !P.taken(x, fy)) P.prop(winter ? 'bush' : SA.hash(x, fy, 2) > 0.5 ? 'flowers' : 'bush', x, fy - 0.05, {});
      }
      const sx = b.x + b.w; for (let y = b.y + 1; y < b.y + b.h; y += 2) if (P.in(sx, y) && GREEN.has(P.get(sx, y)) && !P.taken(sx, y)) P.prop('bush', sx, y);
    }
    // 3b. finer dressing: entrances, shores, plaza borders, woodland floor, street furniture, lawn life
    const year = visit.year || 2000, HARDT = new Set([T.BRICK, T.STONE, T.SAND, T.COBBLE]);
    const freeGreen = (x, y) => P.in(x, y) && GREEN.has(P.get(x, y)) && !P.block[I(x, y)] && !P.taken(x, y);
    for (const b of P.buildings) {
      const d = b.door, big = b.type === 'landmark' || b.type === 'secondary';
      for (const dx of [-2, 2]) if (freeGreen(d.x + dx, d.y) || (P.in(d.x + dx, d.y) && PATHLIKE.has(P.get(d.x + dx, d.y)) && !P.taken(d.x + dx, d.y) && big)) P.prop(big ? 'topiary' : 'planter', d.x + dx, d.y - 0.15, { flower: !winter && SA.hash(d.x, d.y, 8) > 0.4 });
      if (autumn && SA.hash(b.x, b.y, 31) > 0.45 && freeGreen(d.x - 1, d.y + 1)) P.prop('pumpkins', d.x - 1, d.y + 1);
      if (winter && freeGreen(d.x + 1, d.y + 1)) P.prop('snowpile', d.x + 1, d.y + 1);
      const rx = b.x - 1, ry = b.y + Math.floor(b.h / 2);
      if (freeGreen(rx, ry) && SA.hash(b.x, b.y, 32) > 0.4) P.prop(year >= 1950 ? 'bikes' : SA.hash(b.x, b.y, 33) > 0.5 ? 'crates' : 'barrel', rx, ry);
      if (b.type === 'rowhouse') { for (let x = b.x + 1; x < b.x + b.w; x += 3) if (P.in(x, d.y) && !P.taken(x, d.y) && !P.block[I(x, d.y)]) P.prop('stoop', x, d.y - 0.42, {}); if (freeGreen(b.x + b.w, b.y + 1) && SA.hash(b.x, b.y, 34) > 0.35) P.prop('laundry', b.x + b.w, b.y + 1); }
    }
    for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) {
      const k = I(x, y), t = P.terrain[k], r = SA.hash(x, y, P.seed + 51);
      if (t === T.SHORE && !P.taken(x, y) && !winter) { if (r < 0.34) P.prop('reeds', x, y); else if (r < 0.42) P.prop('rock', x, y); else if (r < 0.47) P.prop('fern', x, y); }
      else if (t === T.WATER && !winter && r < 0.05 && near(x, y, new Set([T.SHORE]), 1)) P.prop('lily', x, y);
      else if (t === T.FOREST && !P.taken(x, y) && !P.block[k]) { if (r < 0.1) P.prop(winter ? 'snowpile' : 'fern', x, y); else if (r < 0.13) P.prop('log', x, y); else if (r < 0.16) P.prop('stump', x, y); else if (r < 0.2 && !winter) P.prop('mushrooms', x, y); }
      else if (GREEN.has(t) && !P.block[k] && !P.taken(x, y) && !P.keep[k]) {
        const byPlaza = near(x, y, HARDT, 1);
        if (byPlaza && r < 0.16 && !winter) P.prop(r < 0.06 ? 'flowerbush' : 'flowers', x, y, { cols: [['#e58fb0', '#f1e9d8'], ['#e7c35a', '#f1e9d8'], ['#9b6fb5', '#f3c6d1'], ['#d9624e', '#f1e9d8']][Math.floor(r * 400) % 4] });
        else if (!byPlaza && !near(x, y, PATHLIKE, 1) && !near(x, y, BUILT, 2)) {
          if (r > 0.9965 && !winter) P.prop('picnicgroup', x, y, { col: ['#b8483a', '#3b5f8a', '#49683b'][Math.floor(r * 3000) % 3] });
          else if (r > 0.993 && !winter) P.prop('reader', x, y);
          else if (r > 0.9915) P.prop('birdbath', x, y);
          else if (r > 0.99 && !winter) P.prop('easel', x, y);
          else if (r > 0.986 && winter) P.prop('snowpile', x, y);
        }
      } else if (t === T.WALK && !P.taken(x, y)) {
        const nextToRoad = near(x, y, new Set([T.ROAD, T.TRACK]), 1);
        if (nextToRoad && (x * 3 + y * 5) % 9 === 0) { P.prop('lamp', x, y, { modern: year >= 1960 }); }
        else if (nextToRoad && r < 0.03 && year >= 1900) P.prop(r < 0.012 ? 'hydrant' : year >= 1960 && r < 0.022 ? 'bin' : 'mailbox', x, y, { col: year < 1960 ? '#4a5a48' : '#2f4f7a' });
      } else if (HARDT.has(t) && !P.block[k] && !P.taken(x, y) && r < 0.012 && near(x, y, GREEN, 1)) P.prop(year >= 1960 ? 'bin' : 'planter', x, y, { flower: true });
    }
    // 4. lamps and benches along the walks
    for (let y = 3; y < N - 3; y++) for (let x = 3; x < N - 3; x++) {
      const k = I(x, y); if (!PATHLIKE.has(P.terrain[k]) || P.block[k]) continue;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy, nk = I(nx, ny);
        if (!GREEN.has(P.terrain[nk]) || P.block[nk] || P.taken(nx, ny)) continue;
        const r = SA.hash(nx, ny, P.seed + 21);
        if ((x + y * 3) % 7 === 0 && r < 0.55) { P.prop('lamp', nx, ny, { modern: (visit.year || 2000) >= 1960 }); break; }
        if ((x * 5 + y) % 13 === 0 && r > 0.6) { P.prop('bench', nx, ny); break; }
      }
    }
    for (const p of P.props) { const d = SA.Props.defs[p.k]; const x = Math.round(p.x), y = Math.round(p.y); if (d && d.block && P.in(x, y) && p.k !== 'lamp') P.block[I(x, y)] = 1; }
    // 5. spawn and connectivity: carve a walk to anything cut off
    const spawn = P.pois.spawn || { x: Math.floor(N / 2), y: N - 8 };
    P.block[I(spawn.x, spawn.y)] = 0;
    const world = { N, terrain: P.terrain, block: P.block };
    for (const name of Object.keys(P.pois)) {
      const p = P.pois[name]; if (name === 'spawn') continue;
      p.x = Math.round(p.x); p.y = Math.round(p.y);
      if (P.in(p.x, p.y) && P.terrain[I(p.x, p.y)] !== T.WATER) P.block[I(p.x, p.y)] = 0;
      let seen = reachable(world, spawn.x, spawn.y);
      if (seen[I(p.x, p.y)]) continue;
      let x = p.x, y = p.y, guard = 0;
      while (!seen[I(x, y)] && guard++ < 200) {
        if (Math.abs(spawn.y - y) >= Math.abs(spawn.x - x)) y += Math.sign(spawn.y - y); else x += Math.sign(spawn.x - x);
        const k = I(x, y);
        if (P.terrain[k] === T.WATER) P.terrain[k] = T.BRIDGE; else if (GREEN.has(P.terrain[k])) P.terrain[k] = pathT;
        P.block[k] = 0; P.props = P.props.filter((q) => !(Math.round(q.x) === x && Math.round(q.y) === y));
      }
      seen = null;
    }
    // 6. collectible sketches on reachable ground, spread apart
    const seen = reachable(world, spawn.x, spawn.y), sketches = [];
    let tries = 0;
    while (sketches.length < 5 && tries++ < 4000) {
      const x = 4 + Math.floor(SA.hash(tries, 1, P.seed + 77) * (N - 8)), y = 4 + Math.floor(SA.hash(tries, 2, P.seed + 77) * (N - 8));
      if (!seen[I(x, y)] || P.taken(x, y) || P.terrain[I(x, y)] === T.ROAD || P.terrain[I(x, y)] === T.TRACK) continue;
      if (Math.hypot(x - spawn.x, y - spawn.y) < 9 || sketches.some((s) => Math.hypot(s.x - x, s.y - y) < 11)) continue;
      if (Object.values(P.pois).some((p) => Math.hypot(p.x - x, p.y - y) < 3)) continue;
      sketches.push({ x, y, i: sketches.length });
    }
    const lights = [];
    for (const p of P.props) { const d = SA.Props.defs[p.k]; if (d && d.light) lights.push({ x: p.x, y: p.y, z: -d.light[1], r: d.light[2] }); }
    for (const b of P.buildings) lights.push({ x: b.door.x + 0.2, y: b.door.y - 0.3, z: 18, r: 54, window: true }, { x: b.x + b.w * 0.25, y: b.y + b.h - 0.2, z: b.height * 0.55, r: 40, window: true }, { x: b.x + b.w - 0.1, y: b.y + b.h * 0.5, z: b.height * 0.5, r: 40, window: true });
    return {
      key: def.key, def, visit, N, seed: P.seed, terrain: P.terrain, block: P.block, buildings: P.buildings, props: P.props,
      pois: P.pois, interact: P.interact, roads: P.roads, boats: P.boats, walks: P.walks, spawn, sketches, lights, season, T,
    };
  }

  function generate(def, visit = {}) {
    const N = def.N || 56, seed = SA.strSeed(def.key) + (visit.variant || 0) * 131;
    const P = new Plan(N, seed, def, (visit.season || def.season) === 'winter');
    def.plan(P, visit, T);
    const world = finish(P, def, visit);
    world.findPath = (sx, sy, tx, ty) => findPath(world, sx, sy, tx, ty);
    world.reach = (x, y) => reachable(world, x, y);
    world.walkable = (x, y) => x >= 0 && y >= 0 && x < N && y < N && !world.block[Math.round(y) * N + Math.round(x)];
    world.tile = (x, y) => (x >= 0 && y >= 0 && x < N && y < N ? world.terrain[y * N + x] : T.FOREST);
    return world;
  }

  SA.World = { T, PATHLIKE, GREEN, Plan, generate, findPath, reachable };
})();
