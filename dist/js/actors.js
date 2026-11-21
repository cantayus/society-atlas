/* The Society Atlas V2 — people, animals, vehicles and boats. Original Canvas figures.
   Everyone here is fictional scenery; none represents a real resident or student. */
(function () {
  'use strict';
  const SA = window.SA, { hash } = SA, TAU = Math.PI * 2, T = SA.World.T;
  const SKIN = ['#f0c9a4', '#e0ac7e', '#c68a5c', '#a56a43', '#7d4f33', '#f3d5b5'];
  const HAIR = ['#2a211b', '#4a3423', '#7a5230', '#b88a4a', '#8b8b86', '#1b1b1f', '#a5422f'];
  const TOPS = ['#7c2f2f', '#2f5a7c', '#49683b', '#8a6b22', '#5b4a7a', '#b0563c', '#3f6a6a', '#c9b98a', '#6a6f78', '#a94f68'];
  const BOTS = ['#3b3f52', '#4a3f35', '#2f3a33', '#5a5248', '#3c4a5c'];
  const ell = (c, x, y, rx, ry, f) => { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); };

  // A small standing or walking figure. o: {skin,hair,top,bot,era,hat,bag,scarf,long,front,flip,walk,scale,ring}
  function person(c, o, t) {
    const k = o.scale || 1, ph = o.walk ? Math.sin(t * (o.run ? 12.5 : o.stroll ? 6.2 : 8.4) + (o.seed || 0)) : 0, bob = o.walk ? Math.abs(ph) * 1.1 : Math.sin(t * 1.6 + (o.seed || 0)) * 0.25;
    c.save(); c.scale(k * (o.flip ? -1 : 1), k);
    if (o.ring) { c.strokeStyle = o.ring; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 1, 11, 5, 0, 0, TAU); c.stroke(); }
    ell(c, 2, 1.5, 7, 2.8, 'rgba(20,30,18,.3)');
    if (o.sit) c.translate(0, 4);
    // legs
    const leg = (x, sw) => { c.fillStyle = o.bot; c.fillRect(x - 1.5, -9 + (o.sit ? 3 : 0), 3, 9 - Math.max(0, sw) * 2 - (o.sit ? 3 : 0)); c.fillStyle = '#2a2520'; c.fillRect(x - 1.7 + sw * 1.2, -1.2 - Math.max(0, sw) * 2, 3.6, 1.6); };
    if (o.long) { c.fillStyle = o.bot; c.beginPath(); c.moveTo(-4.4, -10); c.lineTo(4.4, -10); c.lineTo(5.6 + ph * 0.6, -0.5); c.lineTo(-5.6 + ph * 0.6, -0.5); c.closePath(); c.fill(); } else { leg(-1.9, ph); leg(1.9, -ph); }
    c.translate(0, -bob);
    // torso
    c.fillStyle = o.top; c.beginPath(); c.roundRect(-4.6, -19, 9.2, 10.5, 2.6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(-4.6, -18.4, 3, 9);
    if (o.bag && !o.front) { c.fillStyle = o.bag; c.beginPath(); c.roundRect(-3.6, -18, 7.2, 8, 2); c.fill(); }
    // arms
    c.strokeStyle = o.top; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-4.6, -17); c.lineTo(-5.8 - ph * 1.8, -10.5); c.moveTo(4.6, -17); c.lineTo(5.8 + ph * 1.8, o.hold ? -15 : -10.5); c.stroke();
    ell(c, -5.8 - ph * 1.8, -10, 1.3, 1.3, o.skin); ell(c, 5.8 + ph * 1.8, o.hold ? -15 : -10, 1.3, 1.3, o.skin);
    if (o.hold === 'book') { c.fillStyle = '#e8dfc6'; c.fillRect(4.6, -17.5, 4.4, 3.2); c.fillStyle = '#7c2f2f'; c.fillRect(4.6, -17.5, 4.4, 0.9); }
    if (o.hold === 'pipes') { c.strokeStyle = '#3a3a3a'; c.lineWidth = 1.1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(1 + i * 1.6, -16); c.lineTo(3 + i * 2.2, -30); c.stroke(); } ell(c, 3, -15, 3.4, 2.6, '#5a7a4a'); }
    if (o.scarf) { c.fillStyle = o.scarf; c.fillRect(-4.2, -20.4, 8.4, 2.4); c.fillRect(o.front ? 1.4 : -3.6, -19, 2.2, 6 + ph); }
    if (o.bag && o.front) { c.strokeStyle = o.bag; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4, -18.6); c.lineTo(3.6, -10.6); c.stroke(); c.fillStyle = o.bag; c.fillRect(2.4, -12, 4.6, 4.2); }
    // head
    ell(c, 0, -23.4, 4.1, 4.3, o.skin);
    c.fillStyle = o.hair;
    if (o.front) { c.beginPath(); c.ellipse(0, -25, 4.3, 3.2, 0, Math.PI, TAU); c.fill(); if (o.longHair) c.fillRect(-4.4, -25, 1.8, 6.4), c.fillRect(2.6, -25, 1.8, 6.4); c.fillStyle = '#2a2520'; c.fillRect(-2, -23.6, 1, 1.2); c.fillRect(1, -23.6, 1, 1.2); if (o.glasses) { c.strokeStyle = '#2a2520'; c.lineWidth = 0.6; c.strokeRect(-2.8, -24.3, 2.4, 2.2); c.strokeRect(0.4, -24.3, 2.4, 2.2); } }
    else { c.beginPath(); c.ellipse(0, -23.8, 4.3, 4.4, 0, 0, TAU); c.fill(); if (o.longHair) c.fillRect(-4.2, -24, 8.4, 6); }
    if (o.hat === 'cap') { c.fillStyle = o.hatCol || '#3b3f52'; c.beginPath(); c.ellipse(0, -26.6, 4.6, 2.2, 0, Math.PI, TAU); c.fill(); c.fillRect(o.front ? -1 : -4.6, -27, 5.6, 1.2); }
    else if (o.hat === 'bowler' || o.hat === 'top') { c.fillStyle = '#26221f'; c.fillRect(-5.6, -27.4, 11.2, 1.3); c.beginPath(); c.roundRect(-3.6, o.hat === 'top' ? -33 : -31, 7.2, o.hat === 'top' ? 6 : 4, 1.6); c.fill(); }
    else if (o.hat === 'bonnet') { c.fillStyle = o.hatCol || '#e6dcc6'; c.beginPath(); c.ellipse(0, -26, 5.2, 3, 0, Math.PI, TAU); c.fill(); }
    else if (o.hat === 'beanie') { c.fillStyle = o.hatCol || '#a5422f'; c.beginPath(); c.ellipse(0, -25.6, 4.5, 3.8, 0, Math.PI, TAU); c.fill(); ell(c, 0, -29.6, 1.3, 1.3, '#f1ead8'); }
    c.restore();
    if (o.emote) emote(c, o.emote, t, -34 * k);
    if (o.talk) { const b = Math.sin(t * 3 + (o.seed || 0)) * 1.2; c.fillStyle = '#fff6d8'; c.strokeStyle = '#3c3229'; c.lineWidth = 0.8; c.beginPath(); c.roundRect(-6, -43 * k + b, 12, 9, 3); c.fill(); c.stroke(); c.fillStyle = '#3c3229'; for (let i = 0; i < 3; i++) c.fillRect(-3.4 + i * 2.8, -39.4 * k + b, 1.4, 1.4); }
  }
  function emote(c, kind, t, y) {
    const b = Math.sin(t * 5) * 1.4; c.save(); c.translate(0, y + b); c.font = 'bold 13px Georgia'; c.textAlign = 'center';
    const map = { '!': '#e7c35a', '?': '#8fc0c8', heart: '#d9624e', note: '#b9a1d9', zzz: '#cfd8d3', star: '#ffe08a' };
    c.fillStyle = '#231b14'; c.beginPath(); c.arc(0, -4, 8, 0, TAU); c.fill(); c.fillStyle = map[kind] || '#fff';
    c.fillText({ heart: '♥', note: '♪', zzz: 'z', star: '★' }[kind] || kind, 0, 0.5); c.restore();
  }

  function lookFor(seed, year, role) {
    const h = (n) => hash(seed, n, 77), old = year < 1925, mid = year < 1965, woman = h(1) > 0.5;
    const o = { seed, skin: SKIN[Math.floor(h(2) * SKIN.length)], hair: HAIR[Math.floor(h(3) * HAIR.length)], top: TOPS[Math.floor(h(4) * TOPS.length)], bot: BOTS[Math.floor(h(5) * BOTS.length)], longHair: woman && h(6) > 0.3, glasses: h(7) > 0.75 };
    if (old) { o.top = ['#3d3a36', '#4a3f35', '#5b5348', '#6a5d4a', '#2f3a33'][Math.floor(h(8) * 5)]; if (woman) { o.long = true; o.bot = ['#5a4a52', '#3f4a52', '#6a5a4a', '#4a3a3a'][Math.floor(h(9) * 4)]; o.hat = h(10) > 0.4 ? 'bonnet' : null; } else o.hat = h(10) > 0.3 ? (h(11) > 0.7 ? 'top' : 'bowler') : 'cap'; }
    else if (mid) { if (woman && h(9) > 0.5) o.long = true; o.hat = !woman && h(10) > 0.7 ? 'bowler' : null; }
    else { o.bag = h(12) > 0.35 ? ['#3b3f52', '#7a5230', '#49683b', '#2a2a2a'][Math.floor(h(13) * 4)] : null; o.hat = h(10) > 0.86 ? 'cap' : null; o.hold = h(14) > 0.88 ? 'book' : null; }
    if (role === 'winter') { o.hat = 'beanie'; o.hatCol = TOPS[Math.floor(h(15) * TOPS.length)]; o.scarf = TOPS[Math.floor(h(16) * TOPS.length)]; }
    return o;
  }

  // ---------- animals ----------
  function squirrel(c, o, t) { const hop = o.moving ? Math.abs(Math.sin(t * 14)) * 3 : 0, col = o.col || '#8a5a34'; c.save(); if (o.flip) c.scale(-1, 1); c.translate(0, -hop); ell(c, 1, 1.5 + hop, 4.5, 1.6, 'rgba(20,30,18,.25)'); ell(c, 0, -3, 3.6, 2.6, col); ell(c, 3.4, -5, 2, 1.8, col); c.strokeStyle = SA.shade(col, 14); c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3, -3); c.quadraticCurveTo(-7, -6, -5, -10); c.stroke(); c.fillStyle = '#1b1b1b'; c.fillRect(4, -5.6, 0.9, 0.9); c.restore(); }
  function bird(c, o, t) { if (o.fly > 0) { const f = Math.sin(t * 22 + o.seed) * 3.5; c.strokeStyle = o.col || '#4a4640'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-4, -o.fly - f); c.lineTo(0, -o.fly); c.lineTo(4, -o.fly - f); c.stroke(); ell(c, 2, 1, 2.2, 0.9, 'rgba(20,30,18,.12)'); } else { const peck = Math.sin(t * 6 + o.seed) > 0.7 ? 1.4 : 0; ell(c, 0, -1.8, 2.4, 1.7, o.col || '#5b564d'); ell(c, 1.8, -3 + peck, 1.2, 1.1, o.col || '#5b564d'); c.fillStyle = '#d9952e'; c.fillRect(2.8, -3 + peck, 1.3, 0.7); } }
  function cat(c, o, t) { const col = o.col || '#d98f3e', tail = Math.sin(t * 2) * 2; c.save(); if (o.flip) c.scale(-1, 1); ell(c, 1, 1.5, 6, 2, 'rgba(20,30,18,.25)'); ell(c, 0, -3.4, 4.6, 3.4, col); ell(c, 3.6, -7.4, 2.8, 2.5, col); c.fillStyle = col; c.beginPath(); c.moveTo(1.8, -9); c.lineTo(2.6, -11.6); c.lineTo(3.6, -9.4); c.moveTo(4, -9.4); c.lineTo(5.2, -11.6); c.lineTo(5.8, -8.8); c.fill(); c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-4, -3); c.quadraticCurveTo(-8, -5, -7 + tail, -10); c.stroke(); c.fillStyle = '#1b1b1b'; c.fillRect(3, -7.8, 0.8, 0.9); c.fillRect(4.8, -7.8, 0.8, 0.9); c.fillStyle = '#f4ede0'; c.fillRect(-1.5, -2, 3, 2); c.restore(); if (o.emote) emote(c, o.emote, t, -18); }
  function dog(c, o, t) { const col = o.col || '#2b2b2b', wag = Math.sin(t * 9) * 2; c.save(); if (o.flip) c.scale(-1, 1); ell(c, 1, 1.5, 7, 2.2, 'rgba(20,30,18,.25)'); c.fillStyle = col; c.fillRect(-5, -7, 10, 5); c.fillRect(-5, -3, 1.8, 3.6); c.fillRect(3.2, -3, 1.8, 3.6); c.fillRect(4, -10.5, 4.6, 4.6); c.fillRect(8, -8.2, 2, 1.8); c.fillRect(4.4, -12, 1.4, 2); c.fillRect(7, -12, 1.4, 2); c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-5, -6); c.lineTo(-7.5, -9 + wag); c.stroke(); c.restore(); }

  // ---------- the cast of one visit ----------
  class Cast {
    constructor(world, opts = {}) {
      this.world = world; this.list = []; this.year = world.visit.year || 2000; this.rand = SA.rng(world.seed + 5); this.bell = 0; this.opts = opts;
      const N = world.N, seen = world.reach(world.spawn.x, world.spawn.y), free = [];
      for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) if (seen[y * N + x] && SA.World.PATHLIKE.has(world.terrain[y * N + x])) free.push([x, y]);
      this.free = free; this.anchors = world.buildings.map((b) => [b.door.x, b.door.y]).filter(([x, y]) => seen[Math.min(N - 1, y) * N + x]);
      const winter = world.season === 'winter', count = opts.people ?? 22;
      for (let i = 0; i < count && free.length; i++) {
        const [x, y] = free[Math.floor(this.rand() * free.length)];
        const look = lookFor(world.seed + i * 17, this.year, winter ? 'winter' : null);
        this.list.push({ kind: 'npc', id: 'n' + i, x, y, look, path: [], wait: this.rand() * 6, speed: 0.7 + this.rand() * 0.4, line: i % 4 === 0 ? i : null, front: true, flip: false });
      }
      // squirrels and birds on the lawns
      const lawn = []; for (let y = 5; y < N - 5; y++) for (let x = 5; x < N - 5; x++) if (seen[y * N + x] && SA.World.GREEN.has(world.terrain[y * N + x])) lawn.push([x, y]);
      this.lawn = lawn;
      for (let i = 0; i < (winter ? 3 : 7) && lawn.length; i++) { const [x, y] = lawn[Math.floor(this.rand() * lawn.length)]; this.list.push({ kind: 'squirrel', id: 's' + i, x, y, tx: x, ty: y, wait: this.rand() * 4, col: world.pois.blackSquirrels ? '#26221f' : winter ? '#6f6a62' : '#8a5a34', flip: false }); }
      for (let f = 0; f < 3 && lawn.length; f++) { const [bx, by] = lawn[Math.floor(this.rand() * lawn.length)]; for (let i = 0; i < 5; i++) this.list.push({ kind: 'bird', id: 'b' + f + i, x: bx + (this.rand() - 0.5) * 2.4, y: by + (this.rand() - 0.5) * 2.4, hx: bx, hy: by, fly: 0, seed: i * 3 + f, col: ['#5b564d', '#3d3a36', '#7a6a52'][f] }); }
      if (lawn.length) { const [x, y] = lawn[Math.floor(hash(world.seed, 9, 1) * lawn.length)]; this.cat = { kind: 'cat', id: 'cat', x, y, col: '#d98f3e', flip: hash(world.seed, 3) > 0.5 }; this.list.push(this.cat); }
      if (world.pois.piper) this.list.push({ kind: 'npc', id: 'piper', x: world.pois.piper.x, y: world.pois.piper.y, look: { ...lookFor(4, 1978), top: '#3f6a52', bot: '#7c2f2f', long: true, hold: 'pipes', hat: 'cap', hatCol: '#26221f' }, path: [], wait: 1e9, speed: 0, fixed: true, piper: true, front: true });
      if (world.key === 'cmu') this.list.push({ kind: 'dog', id: 'scottie', x: world.pois.piper.x + 1, y: world.pois.piper.y + 1, col: '#26221f', wait: 2, tx: 0, ty: 0 });
      // traffic
      for (const r of world.roads) {
        const n = this.year < 1925 ? 1 : 3;
        for (let i = 0; i < n; i++) { const dir = i % 2 ? -1 : 1; this.list.push({ kind: 'car', id: 'c' + r.at + i, axis: r.axis, lane: r.at + (dir > 0 ? 0 : r.width - 1), pos: this.rand() * N, dir, speed: (this.year < 1925 ? 1.0 : 1.9) + this.rand() * 0.7, col: ['#6b7f8c', '#8c4a3f', '#4f6a52', '#c9c0aa', '#3f4a5c', '#a88a4a'][Math.floor(this.rand() * 6)], x: 0, y: 0, always: false }); }
        if (r.track) this.list.push({ kind: 'tram', id: 't' + r.at, axis: r.axis, lane: r.at, pos: -6, dir: 1, speed: 1.6, x: 0, y: 0, stop: 0 });
      }
      for (const b of world.boats || []) this.list.push({ kind: 'boat', id: 'bt' + b.x + b.y, ...b, x0: b.x, y0: b.y, ph: this.rand() * TAU, x: b.x, y: b.y });
      // ducks on the water
      const water = []; for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) if (world.terrain[y * N + x] === T.WATER) water.push([x, y]);
      if (!winter) for (let i = 0; i < Math.min(5, Math.floor(water.length / 12)); i++) { const [x, y] = water[Math.floor(this.rand() * water.length)]; this.list.push({ kind: 'duck', id: 'd' + i, x, y, x0: x, y0: y, ph: this.rand() * TAU, v: i }); }
      for (const a of this.list) this.bind(a);
    }
    bind(a) {
      const self = this;
      if (a.kind === 'npc') a.draw = (c, t) => person(c, { ...a.look, front: a.front, flip: a.flip, walk: a.path.length > 0, stroll: true, talk: a.line !== null && a.line !== undefined && !a.path.length && !a.piper, emote: a.emote || (a.piper ? 'note' : null) }, t);
      else if (a.kind === 'squirrel') a.draw = (c, t) => squirrel(c, a, t);
      else if (a.kind === 'bird') a.draw = (c, t) => bird(c, a, t);
      else if (a.kind === 'cat') a.draw = (c, t) => cat(c, a, t);
      else if (a.kind === 'dog') a.draw = (c, t) => dog(c, a, t);
      else if (a.kind === 'duck') a.draw = (c, t) => SA.Props.defs.duck.draw(c, a, t);
      else if (a.kind === 'boat') a.draw = (c, t) => SA.Props.defs.boat.draw(c, { sail: a.sail, v: a.ph }, t);
      else if (a.kind === 'car') a.draw = (c) => SA.Props.defs.car.draw(c, { col: a.col, era: self.year, flip: (a.axis === 'x') === (a.dir > 0) ? false : true });
      else if (a.kind === 'tram') a.draw = (c) => { c.save(); if (a.axis === 'y') c.scale(-1, 1); SA.Props.defs.tram.draw(c, { col: self.year < 1925 ? '#7a5234' : '#5d7a55' }); c.restore(); };
    }
    nearest(x, y, kinds, r = 1.6) { let best = null, bd = r; for (const a of this.list) { if (!kinds.includes(a.kind)) continue; const d = Math.hypot(a.x - x, a.y - y); if (d < bd) { bd = d; best = a; } } return best; }
    update(dt, player, t) {
      const w = this.world, N = w.N;
      for (const a of this.list) {
        if (a.kind === 'npc') {
          if (a.fixed || a.held) continue;
          if (a.path.length) { const p = a.path[0], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy), st = dt * a.speed; a.front = dx + dy > 0; a.flip = dx - dy < 0; if (d <= st) { a.x = p.x; a.y = p.y; a.path.shift(); } else { a.x += (dx / d) * st; a.y += (dy / d) * st; } }
          else if ((a.wait -= dt) <= 0) {
            const bell = this.bell > 0, pool = bell || this.rand() < 0.6 ? this.anchors : this.free, tgt = pool[Math.floor(this.rand() * pool.length)];
            if (tgt) { const path = w.findPath(a.x, a.y, tgt[0], tgt[1]); if (path && path.length < 70) a.path = path; }
            a.wait = 3 + this.rand() * (bell ? 4 : 12);
          }
        } else if (a.kind === 'squirrel') {
          const near = player && Math.hypot(player.x - a.x, player.y - a.y) < 2.2;
          if (a.moving) { const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), st = dt * 3.2; a.flip = dx - dy < 0; if (d <= st) { a.x = a.tx; a.y = a.ty; a.moving = false; a.wait = 2 + this.rand() * 7; } else { a.x += (dx / d) * st; a.y += (dy / d) * st; } }
          else if ((a.wait -= dt) <= 0 || (near && !a.tame)) { const [x, y] = this.lawn[Math.floor(this.rand() * this.lawn.length)]; if (Math.hypot(x - a.x, y - a.y) < 9) { a.tx = x; a.ty = y; a.moving = true; } else a.wait = 0.2; }
        } else if (a.kind === 'bird') {
          const near = player && Math.hypot(player.x - a.x, player.y - a.y) < 2.4;
          if (near && a.fly === 0) { a.fly = 0.01; a.vx = (this.rand() - 0.5) * 5; a.vy = (this.rand() - 0.5) * 5 - 1; if (!this.scattered) { this.scattered = t; SA.emit('birds'); } }
          if (a.fly > 0) { a.fly += dt * 26; a.x += a.vx * dt; a.y += a.vy * dt; if (a.fly > 90) { a.fly = 0; a.x = a.hx + (this.rand() - 0.5) * 2.4; a.y = a.hy + (this.rand() - 0.5) * 2.4; this.scattered = 0; } }
        } else if (a.kind === 'car' || a.kind === 'tram') {
          if (a.stop > 0) { a.stop -= dt; } else a.pos += a.dir * a.speed * dt;
          if (a.pos > N + 4) a.pos = -4; if (a.pos < -4) a.pos = N + 4;
          if (a.kind === 'tram' && Math.abs(a.pos - N / 2) < 0.05 + a.speed * dt && !a.stopped) { a.stop = 4; a.stopped = true; SA.emit('tram-stop', a); } if (a.kind === 'tram' && a.pos < 2) a.stopped = false;
          a.x = a.axis === 'x' ? a.pos : a.lane; a.y = a.axis === 'x' ? a.lane : a.pos;
        } else if (a.kind === 'boat') { const s = Math.sin(t * 0.12 + a.ph) * a.len / 2; a.x = a.x0 + (a.axis === 'x' ? s : 0); a.y = a.y0 + (a.axis === 'y' ? s : 0); }
        else if (a.kind === 'duck') { a.x = a.x0 + Math.sin(t * 0.3 + a.ph) * 0.8; a.y = a.y0 + Math.cos(t * 0.23 + a.ph) * 0.8; }
        else if (a.kind === 'dog') { if ((a.wait -= dt) <= 0) { a.wait = 1.5 + this.rand() * 3; a.flip = this.rand() > 0.5; } }
      }
      if (this.bell > 0) this.bell -= dt;
    }
    ringBell() { this.bell = 14; for (const a of this.list) if (a.kind === 'npc' && !a.fixed) a.wait = Math.min(a.wait, this.rand() * 8); }
  }

  SA.Actors = { person, emote, lookFor, squirrel, bird, cat, dog, Cast, SKIN, HAIR, TOPS };
})();
