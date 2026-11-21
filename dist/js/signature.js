/* The Society Atlas V2 — signature buildings.
   A small architecture kit (walls, roofs, domes, drums, spires, colonnades, arcades,
   clocks, battlements) and one hand-written recipe per famous building. Proportions
   are caricatured in the manner of a strategy game: towers taller, domes rounder,
   doors bigger. Materials and silhouettes follow the real buildings; nothing is
   surveyed and no seal, crest or logo is drawn. Original Canvas code. */
(function () {
  'use strict';
  const SA = window.SA, TAU = Math.PI * 2, VS = 1.3, ZT = 36 / VS, RX = 42.43, RY = 21.21;
  const sh = (c, n) => SA.shade(c, n), mx = (a, b, t) => SA.mix(a, b, t);

  function Kit(c, b, world) {
    const winter = world && world.season === 'winter', K = {}, seed0 = (b.x || 0) * 37 + (b.y || 0) * 91;
    const P = (u, v, z = 0) => { const p = SA.iso(b.x + u, b.y + v); return [p.x, p.y - z * VS]; };
    const path = (pts) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
    const fill = (pts, col, line) => { path(pts); c.fillStyle = col; c.fill(); if (line) { c.strokeStyle = line; c.lineWidth = 0.7; c.stroke(); } };
    const lerp = (a, q, t) => [a[0] + (q[0] - a[0]) * t, a[1] + (q[1] - a[1]) * t];
    const seg = (a, q, col, w = 0.7) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(q[0], q[1]); c.stroke(); };
    K.P = P; K.fill = fill; K.seg = seg;
    // surface texture, clipped to a wall quad [bl, br, tr, tl]
    function texture(q, mat, lit, seed) {
      const clip = q; if (q.length === 3) { const H = Math.max(q[0][1], q[1][1]) - q[2][1] + 2; q = [q[0], q[1], [q[1][0], q[1][1] - H], [q[0][0], q[0][1] - H]]; }
      const hgt = Math.max(1, q[0][1] - q[3][1]), len = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]); c.save(); path(clip); c.clip();
      const step = mat === 'brick' ? 2.6 : mat === 'rubble' ? 4.6 : mat === 'stucco' || mat === 'glass' ? 0 : 5.6;
      if (step) {
        const n = Math.ceil(hgt / step); c.lineWidth = 0.5;
        for (let i = 1; i < n; i++) { const t = i / n; c.strokeStyle = mat === 'brick' ? 'rgba(240,220,200,.13)' : 'rgba(40,32,22,.12)'; const a = lerp(q[0], q[3], t), e = lerp(q[1], q[2], t); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(e[0], e[1]); c.stroke();
          if (mat !== 'brick') { const m = Math.max(2, Math.round(len / (mat === 'rubble' ? 7 : 11))); for (let k = 0; k < m; k++) { const s = (k + (i % 2 ? 0.5 : 0)) / m, p = lerp(a, e, s), r = SA.hash(i * 13 + k, seed, 5); c.strokeStyle = 'rgba(40,32,22,.1)'; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0], p[1] + hgt / n); c.stroke(); if (r > (mat === 'rubble' ? 0.45 : 0.78)) { c.fillStyle = r > 0.9 ? 'rgba(255,240,205,.13)' : mat === 'rubble' && r > 0.7 ? 'rgba(120,80,50,.13)' : 'rgba(30,26,20,.1)'; const p2 = lerp(a, e, s + 1 / m); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p2[0], p2[1]); c.lineTo(p2[0], p2[1] + hgt / n); c.lineTo(p[0], p[1] + hgt / n); c.fill(); } } }
          else if (i % 2) for (let k = 0; k < len / 9; k++) { const r = SA.hash(i * 7 + k, seed, 9); if (r > 0.7) { const p = lerp(a, e, (k + r) / (len / 9)); c.fillStyle = r > 0.88 ? 'rgba(255,225,200,.12)' : 'rgba(40,14,8,.13)'; c.fillRect(p[0], p[1], 3.2, hgt / n); } } }
      }
      // grounded: darker at the foot, a soft shade under the eave, light from the upper left
      const g = c.createLinearGradient(0, q[3][1], 0, q[0][1] + (q[1][1] - q[0][1]) * 0.5); g.addColorStop(0, 'rgba(20,16,10,.16)'); g.addColorStop(0.08, 'rgba(20,16,10,0)'); g.addColorStop(0.8, 'rgba(20,16,10,0)'); g.addColorStop(1, 'rgba(20,16,10,.22)'); c.fillStyle = g; c.fillRect(-9999, -9999, 19998, 19998);
      if (lit) { const g2 = c.createLinearGradient(q[0][0], 0, q[1][0], 0); g2.addColorStop(0, 'rgba(255,244,214,.09)'); g2.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = g2; c.fillRect(-9999, -9999, 19998, 19998); }
      c.restore();
    }
    const wallq = (q, col, mat, lit, seed) => { fill(q, col, 'rgba(40,32,24,.28)'); texture(q, mat || 'stone', lit, seed || seed0); };
    // a box: front wall (faces lower left), side wall (faces lower right) and a flat top
    K.vol = (u0, v0, u1, v1, z0, z1, col, o = {}) => {
      const f = [P(u0, v1, z0), P(u1, v1, z0), P(u1, v1, z1), P(u0, v1, z1)], s = [P(u1, v1, z0), P(u1, v0, z0), P(u1, v0, z1), P(u1, v1, z1)];
      if (!o.noTop) fill([P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1)], winter && !o.dry ? mx(o.top || sh(col, 10), '#ffffff', 0.7) : o.top || sh(col, 10), 'rgba(40,32,24,.2)');
      wallq(f, col, o.mat, true, seed0 + u0 * 7 + z0); wallq(s, sh(col, -26), o.mat, false, seed0 + v0 * 5 + z0 + 3);
      return { u0, v0, u1, v1, z0, z1, col, mat: o.mat, F: (a, z) => P(a, v1, z), S: (a, z) => P(u1, a, z) };
    };
    // a roof plane with rows running parallel to the eave
    function slope(pts, col, lit, tile) {
      const cc = winter ? mx(col, '#ffffff', lit ? 0.72 : 0.5) : col; fill(pts, cc, 'rgba(30,26,22,.3)'); c.save(); path(pts); c.clip();
      const a0 = pts[0], a1 = pts[1], r1 = pts[2], r0 = pts.length > 3 ? pts[3] : pts[2], rise = Math.max(4, Math.hypot(r0[0] - a0[0], r0[1] - a0[1])), n = Math.ceil(rise / (tile ? 2.6 : 3.4));
      c.lineWidth = 0.5; c.strokeStyle = winter ? 'rgba(120,140,160,.14)' : tile ? 'rgba(60,20,8,.2)' : 'rgba(18,18,22,.16)';
      for (let i = 1; i < n; i++) { const t = i / n, p = lerp(a0, r0, t), q = lerp(a1, r1, t); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
      if (lit && !winter) { const g = c.createLinearGradient(a0[0], a0[1], r0[0], r0[1]); g.addColorStop(0, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(255,240,210,.12)'); c.fillStyle = g; c.fillRect(-9999, -9999, 19998, 19998); }
      c.restore();
    }
    K.hip = (V, rise, col, o = {}) => {
      const ov = o.over ?? 0.14, z = V.z1, a0 = V.u0 - ov, a1 = V.u1 + ov, b0 = V.v0 - ov, b1 = V.v1 + ov, t = o.tile;
      if (a1 - a0 >= b1 - b0) { const d = (b1 - b0) / 2, vm = (b0 + b1) / 2, R0 = P(a0 + d, vm, z + rise), R1 = P(a1 - d, vm, z + rise); slope([P(a0, b0, z), P(a1, b0, z), R1, R0], sh(col, -30), false, t); slope([P(a0, b1, z), P(a0, b0, z), R0], sh(col, -34), false, t); slope([P(a0, b1, z), P(a1, b1, z), R1, R0], col, true, t); slope([P(a1, b1, z), P(a1, b0, z), R1], sh(col, -20), false, t); }
      else { const d = (a1 - a0) / 2, um = (a0 + a1) / 2, R0 = P(um, b0 + d, z + rise), R1 = P(um, b1 - d, z + rise); slope([P(a0, b0, z), P(a1, b0, z), R0], sh(col, -30), false, t); slope([P(a0, b1, z), P(a0, b0, z), R0, R1], sh(col, -34), false, t); slope([P(a1, b1, z), P(a1, b0, z), R0, R1], sh(col, -20), false, t); slope([P(a0, b1, z), P(a1, b1, z), R1], col, true, t); }
    };
    // ridge along u: gable end shows on the side wall. ridge along v: gable end faces the viewer.
    K.gable = (V, rise, axis, col, o = {}) => {
      const ov = o.over ?? 0.12, z = V.z1, t = o.tile, wc = o.wall || V.col, drop = ov * 9;
      if (axis === 'u') { const vm = (V.v0 + V.v1) / 2, a0 = V.u0 - ov * 0.5, a1 = V.u1 + ov * 0.5; slope([P(a0, V.v0 - ov, z - drop), P(a1, V.v0 - ov, z - drop), P(a1, vm, z + rise), P(a0, vm, z + rise)], sh(col, -30), false, t); wallq([P(V.u1, V.v1, z), P(V.u1, V.v0, z), P(V.u1, vm, z + rise)], sh(wc, -26), V.mat, false); slope([P(a0, V.v1 + ov, z - drop), P(a1, V.v1 + ov, z - drop), P(a1, vm, z + rise), P(a0, vm, z + rise)], col, true, t); seg(P(a1, V.v1 + ov, z - drop), P(a1, vm, z + rise), 'rgba(255,240,210,.35)', 1.2); }
      else { const um = (V.u0 + V.u1) / 2, b0 = V.v0 - ov * 0.5, b1 = V.v1 + ov * 0.5; slope([P(V.u0 - ov, b1, z - drop), P(V.u0 - ov, b0, z - drop), P(um, b0, z + rise), P(um, b1, z + rise)], sh(col, -34), false, t); wallq([P(V.u0, V.v1, z), P(V.u1, V.v1, z), P(um, V.v1, z + rise)], wc, V.mat, true); slope([P(V.u1 + ov, b1, z - drop), P(V.u1 + ov, b0, z - drop), P(um, b0, z + rise), P(um, b1, z + rise)], sh(col, -18), false, t); seg(P(V.u0 - ov, b1, z - drop), P(um, b1, z + rise), 'rgba(30,26,22,.5)', 1.6); seg(P(um, b1, z + rise), P(V.u1 + ov, b1, z - drop), 'rgba(30,26,22,.5)', 1.6); }
    };
    K.pyr = (V, rise, col, o = {}) => { const ov = o.over ?? 0.08, z = V.z1, t = o.tile, A = P((V.u0 + V.u1) / 2, (V.v0 + V.v1) / 2, z + rise), q = [P(V.u0 - ov, V.v0 - ov, z), P(V.u1 + ov, V.v0 - ov, z), P(V.u1 + ov, V.v1 + ov, z), P(V.u0 - ov, V.v1 + ov, z)]; slope([q[0], q[1], A], sh(col, -30), false, t); slope([q[3], q[0], A], sh(col, -34), false, t); slope([q[3], q[2], A], col, true, t); slope([q[2], q[1], A], sh(col, -22), false, t); return { u: (V.u0 + V.u1) / 2, v: (V.v0 + V.v1) / 2, z: z + rise }; };
    // round forms
    K.drum = (uc, vc, r, z0, z1, col, o = {}) => {
      const C = P(uc, vc, z0), rx = r * RX, ry = r * RY, h = (z1 - z0) * VS, g = c.createLinearGradient(C[0] - rx, 0, C[0] + rx, 0); g.addColorStop(0, sh(col, -8)); g.addColorStop(0.32, sh(col, 16)); g.addColorStop(1, sh(col, -40));
      c.beginPath(); c.moveTo(C[0] - rx, C[1] - h); c.lineTo(C[0] - rx, C[1]); c.ellipse(C[0], C[1], rx, ry, 0, Math.PI, 0, true); c.lineTo(C[0] + rx, C[1] - h); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(40,32,24,.3)'; c.lineWidth = 0.7; c.stroke();
      const at = (th, z) => [C[0] + rx * Math.cos(th), C[1] + ry * Math.sin(th) - (z - z0) * VS];
      if (o.bands) for (const zb of o.bands) { c.strokeStyle = 'rgba(40,32,24,.3)'; c.beginPath(); c.ellipse(C[0], C[1] - (zb - z0) * VS, rx, ry, 0, 0, Math.PI); c.stroke(); c.strokeStyle = 'rgba(255,244,214,.25)'; c.beginPath(); c.ellipse(C[0], C[1] - (zb - z0) * VS - 1, rx, ry, 0, 0, Math.PI); c.stroke(); }
      if (o.slots) for (let i = 0; i < o.slots; i++) { const th = Math.PI * (0.1 + (0.8 * (i + 0.5)) / o.slots), w = (Math.PI * 0.8 / o.slots) * 0.3, zb = z0 + (z1 - z0) * (o.slotLo ?? 0.22), zt = z0 + (z1 - z0) * (o.slotHi ?? 0.8), a = at(th - w, zb), e = at(th + w, zb), f = at(th + w, zt), d = at(th - w, zt), m = at(th, zt + (o.slotArch ?? 4)); fill([a, e, f, m, d], o.open ? 'rgba(22,22,26,.82)' : '#2c3a44'); }
      if (o.cols) for (let i = 0; i <= o.cols; i++) { const th = Math.PI * (0.02 + (0.96 * i) / o.cols), a = at(th, z0 + 1), e = at(th, z1 - 2), k = 1 - Math.abs(Math.cos(th)) * 0.3; c.strokeStyle = sh(o.colCol || '#efe8d6', th < Math.PI * 0.6 ? -30 : 4); c.lineWidth = (o.colW || 2.3) * k; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(e[0], e[1]); c.stroke(); }
      c.beginPath(); c.ellipse(C[0], C[1] - h, rx, ry, 0, 0, TAU); c.fillStyle = winter ? mx(sh(col, 12), '#ffffff', 0.7) : o.top || sh(col, 12); c.fill(); c.stroke();
      return { uc, vc, r, z: z1 };
    };
    K.dome = (uc, vc, r, z, rise0, col, o = {}) => {
      const rise = rise0 * VS, C = P(uc, vc, z), rx = r * RX, ry = r * RY, cc = winter ? mx(col, '#ffffff', 0.45) : col;
      c.beginPath(); c.ellipse(C[0], C[1], rx, ry, 0, 0, Math.PI); c.ellipse(C[0], C[1], rx, rise, 0, Math.PI, TAU); c.closePath();
      const g = c.createRadialGradient(C[0] - rx * 0.38, C[1] - rise * 0.62, 1, C[0] - rx * 0.1, C[1] - rise * 0.2, rx * 1.35); g.addColorStop(0, sh(cc, 46)); g.addColorStop(0.35, cc); g.addColorStop(1, sh(cc, -52)); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(30,26,22,.4)'; c.lineWidth = 0.8; c.stroke();
      if (o.ribs) { c.lineWidth = 0.8; for (let i = 0; i <= o.ribs; i++) { const th = Math.PI * (i / o.ribs), ex = C[0] + rx * Math.cos(th), ey = C[1] + ry * Math.sin(th); c.strokeStyle = th < Math.PI / 2 ? 'rgba(20,16,10,.28)' : 'rgba(255,244,214,.3)'; c.beginPath(); c.moveTo(C[0], C[1] - rise); c.quadraticCurveTo(C[0] + rx * Math.cos(th) * 1.04, C[1] - rise * 0.62 + ry * Math.sin(th) * 0.4, ex, ey); c.stroke(); } }
      c.strokeStyle = 'rgba(255,250,230,.35)'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(C[0] - rx * 0.3, C[1] - rise * 0.58, rx * 0.2, rise * 0.14, -0.5, 0, TAU); c.stroke();
      return { u: uc, v: vc, z: z + rise0 };
    };
    K.cone = (uc, vc, r, z, rise0, col, o = {}) => { const rise = rise0 * VS, C = P(uc, vc, z), rx = r * RX, ry = r * RY, cc = winter ? mx(col, '#ffffff', 0.55) : col, g = c.createLinearGradient(C[0] - rx, 0, C[0] + rx, 0); g.addColorStop(0, sh(cc, -4)); g.addColorStop(0.3, sh(cc, 22)); g.addColorStop(1, sh(cc, -44)); c.beginPath(); c.moveTo(C[0] - rx, C[1]); c.ellipse(C[0], C[1], rx, ry, 0, Math.PI, 0, true); c.lineTo(C[0], C[1] - rise); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(30,26,22,.35)'; c.lineWidth = 0.7; c.stroke(); if (o.rings) for (let i = 1; i < o.rings; i++) { const t = i / o.rings; c.strokeStyle = 'rgba(20,16,10,.18)'; c.beginPath(); c.ellipse(C[0], C[1] - rise * t, rx * (1 - t), ry * (1 - t), 0, 0, Math.PI); c.stroke(); } return { u: uc, v: vc, z: z + rise0 }; };
    // openings: Q maps (position along the wall, height) to the screen
    const shape = (Q, a, z, w, h, kind) => { const r = w / 2, pts = [Q(a, z), Q(a + w, z), Q(a + w, z + h)]; if (kind === 'gothic') pts.push(Q(a + w * 0.86, z + h + r * ZT * 0.75), Q(a + r, z + h + r * ZT * 1.45), Q(a + w * 0.14, z + h + r * ZT * 0.75)); else if (kind === 'arch') for (let k = 1; k < 7; k++) { const th = (Math.PI * k) / 7; pts.push(Q(a + r + r * Math.cos(th), z + h + r * ZT * Math.sin(th))); } pts.push(Q(a, z + h)); return pts; };
    K.win = (Q, a, z, w, h, kind = 'rect', o = {}) => {
      const pts = shape(Q, a, z, w, h, kind), glass = o.glass || '#2b3944'; fill(pts, o.dark ? '#1c1a1a' : glass, o.frame || 'rgba(245,236,214,.85)');
      if (!o.dark) { c.save(); path(pts); c.clip(); fill([Q(a, z + h * 0.55), Q(a + w * 0.6, z + h * 1.6), Q(a + w * 0.25, z + h * 1.6), Q(a, z + h * 0.95)], 'rgba(190,220,235,.22)'); if (o.stained) { const cols = ['#b8483a', '#3a6fa8', '#d9a441', '#4f8a5f']; for (let i = 0; i < 4; i++) fill([Q(a + (w * i) / 4, z), Q(a + (w * (i + 1)) / 4, z), Q(a + (w * (i + 1)) / 4, z + h * 2), Q(a + (w * i) / 4, z + h * 2)], SA.alpha(cols[(i + (o.stained | 0)) % 4], 0.5)); } c.restore(); if (w > 0.2 && !o.plain) { seg(Q(a + w / 2, z), Q(a + w / 2, z + h + (kind === 'rect' ? 0 : w * ZT * 0.3)), 'rgba(245,236,214,.6)', 0.6); if (h > 9) seg(Q(a, z + h * 0.5), Q(a + w, z + h * 0.5), 'rgba(245,236,214,.5)', 0.5); } }
      if (o.sill !== false) seg(Q(a - 0.03, z), Q(a + w + 0.03, z), 'rgba(250,244,226,.7)', 1.1);
    };
    K.row = (Q, a0, a1, z, n, w, h, kind, o) => { const gap = (a1 - a0 - n * w) / (n + 1); for (let i = 0; i < n; i++) K.win(Q, a0 + gap + i * (w + gap), z, w, h, kind, o); };
    K.grid = (Q, a0, a1, z0, floors, fh, n, w, h, kind, o) => { for (let f = 0; f < floors; f++) K.row(Q, a0, a1, z0 + f * fh, n, w, h, kind, o); };
    K.door = (Q, a, w, h, kind = 'arch', col = '#4a2f1e') => { fill(shape(Q, a - 0.05, 0, w + 0.1, h + 1.5, kind), 'rgba(245,236,214,.9)'); fill(shape(Q, a, 0, w, h, kind), col, 'rgba(20,14,8,.6)'); seg(Q(a + w / 2, 0), Q(a + w / 2, h), 'rgba(20,14,8,.5)', 0.7); };
    K.round = (Q, a, z, r, o = {}) => { const pts = []; for (let k = 0; k < 18; k++) { const th = (TAU * k) / 18; pts.push(Q(a + r * Math.cos(th), z + r * ZT * Math.sin(th))); } fill(pts, o.clock ? '#f3ecd8' : '#2f3f55', o.clock ? '#3a2e1e' : 'rgba(245,236,214,.9)'); if (o.clock) { c.lineWidth = 1.1; seg(Q(a, z), Q(a, z + r * ZT * 0.7), '#2a2014', 1.2); seg(Q(a, z), Q(a + r * 0.5, z + r * ZT * 0.25), '#2a2014', 1.2); } else { for (let k = 0; k < 8; k++) { const th = (TAU * k) / 8; seg(Q(a, z), Q(a + r * Math.cos(th), z + r * ZT * Math.sin(th)), 'rgba(245,236,214,.7)', 0.6); } if (o.stained) { const pt2 = []; for (let k = 0; k < 18; k++) { const th = (TAU * k) / 18; pt2.push(Q(a + r * 0.55 * Math.cos(th), z + r * 0.55 * ZT * Math.sin(th))); } fill(pt2, 'rgba(217,164,65,.55)'); } } };
    // a row of columns standing in front of the front wall, with entablature and optional pediment
    K.cols = (V, a0, a1, z0, z1, n, o = {}) => {
      const out = o.out ?? 0.34, col = o.col || '#ece5d2', r = o.r ?? 0.085, v = V.v1 + out, ent = o.ent ?? 7;
      fill([P(a0, V.v1, z0), P(a1, V.v1, z0), P(a1, V.v1, z1), P(a0, V.v1, z1)], 'rgba(24,20,16,.42)');
      if (o.doors) for (let i = 0; i < o.doors; i++) { const a = a0 + ((i + 0.5) * (a1 - a0)) / o.doors; K.win((q, z) => P(q, V.v1, z), a - 0.16, z0, 0.32, (z1 - z0) * 0.45, 'arch', { dark: true, sill: false }); }
      for (let i = 0; i < n; i++) { const a = a0 + ((i + 0.5) * (a1 - a0)) / n, g = c.createLinearGradient(P(a - r, v, 0)[0], 0, P(a + r, v, 0)[0] + 2, 0); g.addColorStop(0, sh(col, 10)); g.addColorStop(0.5, col); g.addColorStop(1, sh(col, -46)); path([P(a - r, v, z0), P(a + r, v, z0), P(a + r, v, z1), P(a - r, v, z1)]); c.fillStyle = g; c.fill(); fill([P(a + r, v, z0), P(a + r, v - r * 1.3, z0), P(a + r, v - r * 1.3, z1), P(a + r, v, z1)], sh(col, -52)); fill([P(a - r * 1.5, v, z1 - 2.6), P(a + r * 1.5, v, z1 - 2.6), P(a + r * 1.5, v, z1), P(a - r * 1.5, v, z1)], sh(col, 6)); fill([P(a - r * 1.4, v, z0), P(a + r * 1.4, v, z0), P(a + r * 1.4, v, z0 + 1.8), P(a - r * 1.4, v, z0 + 1.8)], sh(col, -8)); }
      const E = K.vol(a0 - 0.1, V.v1, a1 + 0.1, v + 0.12, z1, z1 + ent, col, { mat: 'stucco', dry: true });
      if (o.ped) { const am = (a0 + a1) / 2, zt = z1 + ent, fv = v + 0.12; fill([P(a1 + 0.1, fv, zt), P(a1 + 0.1, V.v1, zt), P(am, V.v1, zt + o.ped), P(am, fv, zt + o.ped)], winter ? '#e9eef0' : sh(o.roof || '#6a6f76', -16), 'rgba(30,26,22,.3)'); fill([P(a0 - 0.1, fv, zt), P(a1 + 0.1, fv, zt), P(am, fv, zt + o.ped)], sh(col, 4), 'rgba(60,50,36,.5)'); fill([P(a0 + 0.35, fv, zt + 1.6), P(a1 - 0.35, fv, zt + 1.6), P(am, fv, zt + o.ped - 3)], sh(col, -14)); }
      return E;
    };
    K.steps = (V, a0, a1, depth, n, col = '#d9d2c0') => { for (let i = 0; i < n; i++) { const d = (depth * (n - i)) / n, e = (n - i) * 0.035; K.vol(a0 - e, V.v1, a1 + e, V.v1 + d, i * 2.4, (i + 1) * 2.4, col, { mat: 'stucco', dry: true }); } };
    K.arcade = (Q, a0, a1, z0, h, n, o = {}) => { const bay = (a1 - a0) / n; for (let i = 0; i < n; i++) { const a = a0 + i * bay + bay * 0.17, w = bay * 0.66, pts = shape(Q, a, z0, w, h, o.kind || 'arch'); path(pts); const g = c.createLinearGradient(0, Q(a, z0 + h + 10)[1], 0, Q(a, z0)[1]); g.addColorStop(0, '#16130f'); g.addColorStop(1, o.floor || '#4a4034'); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(250,240,215,.55)'; c.lineWidth = 0.8; c.stroke(); } };
    K.cren = (V, o = {}) => { const s = o.size || 0.22, hh = o.h || 4.5, lit = V.col, dk = sh(V.col, -26); for (let a = V.u0; a < V.u1 - 0.01; a += s * 2) fill([V.F(a, V.z1), V.F(Math.min(V.u1, a + s), V.z1), V.F(Math.min(V.u1, a + s), V.z1 + hh), V.F(a, V.z1 + hh)], lit, 'rgba(40,32,24,.3)'); for (let a = V.v1; a > V.v0 + 0.01; a -= s * 2) fill([V.S(a, V.z1), V.S(Math.max(V.v0, a - s), V.z1), V.S(Math.max(V.v0, a - s), V.z1 + hh), V.S(a, V.z1 + hh)], dk, 'rgba(40,32,24,.3)'); };
    K.pin = (u, v, z, hgt, col) => { const V = K.vol(u - 0.09, v - 0.09, u + 0.09, v + 0.09, z, z + hgt * 0.4, col, { mat: 'stucco', dry: true }); return K.pyr(V, hgt * 0.6, sh(col, -6), { over: 0.02 }); };
    K.pins = (V, hgt, col) => { for (const [u, v] of [[V.u0 + 0.1, V.v0 + 0.1], [V.u1 - 0.1, V.v0 + 0.1], [V.u0 + 0.1, V.v1 - 0.1], [V.u1 - 0.1, V.v1 - 0.1]]) K.pin(u, v, V.z1, hgt, col || V.col); };
    K.finial = (t, kind = 'ball', col = '#d9b24a') => { const p = P(t.u, t.v, t.z); c.strokeStyle = '#3a342c'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(p[0], p[1] + 1); c.lineTo(p[0], p[1] - (kind === 'flag' ? 20 : 8)); c.stroke(); if (kind === 'cross') { c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(p[0], p[1] - 3); c.lineTo(p[0], p[1] - 15); c.moveTo(p[0] - 3.6, p[1] - 11); c.lineTo(p[0] + 3.6, p[1] - 11); c.stroke(); } else if (kind === 'flag') { fill([[p[0], p[1] - 20], [p[0] + 12, p[1] - 17], [p[0], p[1] - 13]], col, 'rgba(30,20,10,.4)'); } else if (kind === 'figure') { c.fillStyle = col; c.beginPath(); c.ellipse(p[0], p[1] - 9, 2.2, 5.5, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(p[0], p[1] - 16, 1.9, 0, TAU); c.fill(); } else { c.fillStyle = col; c.beginPath(); c.arc(p[0], p[1] - 9, 2.4, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(p[0] - 0.8, p[1] - 9.8, 0.8, 0, TAU); c.fill(); } };
    K.butt = (V, n, z1, col) => { for (let i = 0; i <= n; i++) { const a = V.u0 + ((V.u1 - V.u0) * i) / n; K.vol(a - 0.09, V.v1, a + 0.09, V.v1 + 0.2, 0, z1, col || sh(V.col, 6), { mat: V.mat, dry: true }); } };
    K.chim = (u, v, z, hgt, col) => K.vol(u - 0.13, v - 0.13, u + 0.13, v + 0.13, z, z + hgt, col, { mat: 'brick', dry: true, top: '#2a2622' });
    K.ivy = (V, a0, a1, zt) => { c.save(); path([V.F(a0, 0), V.F(a1, 0), V.F(a1, zt), V.F(a0, zt)]); c.clip(); for (let i = 0; i < (a1 - a0) * 60; i++) { const r = SA.hash(i, seed0, 21), r2 = SA.hash(i, seed0, 22), p = V.F(a0 + r * (a1 - a0), r2 * r2 * zt); c.fillStyle = winter ? 'rgba(96,80,60,.5)' : ['rgba(62,104,58,.85)', 'rgba(84,128,66,.8)', 'rgba(48,86,52,.85)'][i % 3]; c.beginPath(); c.arc(p[0], p[1], 1.5 + r * 1.4, 0, TAU); c.fill(); } c.restore(); };
    // tiers of an East Asian pagoda or gate roof: a flared, upturned eave
    K.eave = (u0, v0, u1, v1, z, rise, col, o = {}) => { const ov = o.over ?? 0.32, V = { u0, v0, u1, v1, z1: z }; K.hip(V, rise, col, { over: ov, tile: true }); for (const [u, v] of [[u0 - ov, v1 + ov], [u1 + ov, v1 + ov], [u1 + ov, v0 - ov]]) { const p = P(u, v, z); c.strokeStyle = sh(col, -30); c.lineWidth = 1.6; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + (u > (u0 + u1) / 2 ? 3 : -3), p[1] - 4); c.stroke(); } };
    return K;
  }

  // ---------- palettes ----------
  const C = { brick: '#a15a44', brickDk: '#8c4a3a', lime: '#d9d0ba', limeDk: '#c4baa2', sand: '#d6ba88', grey: '#aaa594', duke: '#978c78', slate: '#565c64', slateB: '#4a5560', tile: '#b25a3c', copper: '#6fa58c', lead: '#8b9290', gold: '#e2b23a', white: '#eee9dc', wood: '#4a2f1e', serp: '#6f8570', ybrick: '#ccb37f', red: '#a8322a' };

  // ---------- recipes: (K, w, h, b) with the footprint w × h in tiles ----------
  const RX_ = {};
  // a helper for long collegiate ranges
  const range = (K, u0, v0, u1, v1, z, col, mat, o = {}) => { const V = K.vol(u0, v0, u1, v1, 0, z, col, { mat }); const fl = o.floors || Math.max(1, Math.floor((z - 14) / 17)); K.grid(V.F, u0 + 0.2, u1 - 0.2, 9, fl, 17, o.n || Math.max(2, Math.round((u1 - u0) * 1.25)), 0.28, 9.5, o.kind || 'rect'); K.grid(V.S, v0 + 0.2, v1 - 0.2, 9, fl, 17, Math.max(1, Math.round((v1 - v0) * 1.2)), 0.28, 9.5, o.kind || 'rect'); return V; };

  RX_['College Hall'] = (K, w, h) => { // Penn: green serpentine, steep slate roofs, two unequal end towers
    const B = range(K, 1.6, 0.6, w - 1.6, h, 60, C.serp, 'stone', { kind: 'gothic', n: 9 }); K.gable(B, 26, 'u', C.slate);
    for (let i = 0; i < 5; i++) { const a = 2.6 + i * 1.45; K.fill([K.P(a, h + 0.14, 60), K.P(a + 0.5, h + 0.14, 60), K.P(a + 0.25, h + 0.14, 74)], C.serp, 'rgba(30,26,22,.4)'); }
    const Cn = K.vol(w / 2 - 1.1, h - 1, w / 2 + 1.1, h + 0.5, 0, 72, sh(C.serp, 6), { mat: 'stone' }); K.gable(Cn, 22, 'v', C.slate); K.door(Cn.F, w / 2 - 0.3, 0.6, 15, 'gothic'); K.win(Cn.F, w / 2 - 0.3, 34, 0.6, 16, 'gothic'); K.round(Cn.F, w / 2, 76, 0.2);
    const T1 = K.vol(0, 1, 2.1, h + 0.3, 0, 108, C.serp, { mat: 'stone' }); K.grid(T1.F, 0.3, 1.8, 12, 5, 18, 2, 0.34, 10, 'gothic'); K.grid(T1.S, 1.5, h, 12, 5, 18, 3, 0.34, 10, 'gothic'); K.finial(K.pyr(T1, 54, C.slate), 'ball');
    const T2 = K.vol(w - 2.1, 1.4, w, h + 0.3, 0, 86, C.serp, { mat: 'stone' }); K.grid(T2.F, w - 1.8, w - 0.3, 12, 4, 18, 2, 0.34, 10, 'gothic'); K.grid(T2.S, 1.8, h, 12, 4, 18, 3, 0.34, 10, 'gothic'); K.finial(K.pyr(T2, 38, C.slate), 'flag', C.red);
  };
  RX_['Widener Library'] = (K, w, h) => { // Harvard: a brick mass behind a great flight of steps and twelve columns
    const B = K.vol(0, 0, w, h, 0, 66, C.brick, { mat: 'brick', top: '#5c5d60' }); K.grid(B.F, 0.2, 2.5, 12, 3, 17, 3, 0.36, 10); K.grid(B.F, w - 2.5, w - 0.2, 12, 3, 17, 3, 0.36, 10); K.grid(B.S, 0.3, h - 0.3, 12, 3, 17, 6, 0.36, 10);
    K.vol(-0.06, -0.06, w + 0.06, h + 0.06, 66, 71, C.lime, { mat: 'stucco', top: '#5c5d60' }); K.vol(2.2, 0.8, w - 2.2, h - 0.6, 71, 84, C.brick, { mat: 'brick', top: '#55575b' });
    K.steps(B, 2.6, w - 2.6, 1.15, 7, '#d6cfbd'); K.cols(B, 2.8, w - 2.8, 17, 58, 12, { out: 0.42, doors: 3, ent: 9 });
  };
  RX_['Memorial Church'] = (K, w, h, b) => { // Harvard: brick meeting house, white portico and a tall white spire
    if (b.wall && b.wall.toLowerCase() === '#d2b98a') return RX_.StanfordChurch(K, w, h);
    const B = K.vol(1.6, 0, w, h, 0, 50, C.brick, { mat: 'brick' }); K.row(B.F, 2, w - 0.3, 14, 5, 0.42, 22, 'arch'); K.row(B.S, 0.4, h - 0.4, 14, 3, 0.42, 22, 'arch'); K.gable(B, 22, 'u', C.slate);
    K.steps(B, 3.2, 6.4, 0.7, 4); K.cols(B, 3.3, 6.3, 10, 46, 4, { out: 0.36, ped: 13, doors: 1, r: 0.1 });
    const T = K.vol(0, 0.9, 2, h - 0.5, 0, 74, C.brick, { mat: 'brick' }); K.win(T.F, 0.7, 20, 0.6, 26, 'arch'); K.round(T.F, 1, 62, 0.22, { clock: true });
    const S1 = K.vol(0.25, 1.15, 1.75, h - 0.75, 74, 100, C.white, { mat: 'stucco' }); K.win(S1.F, 0.72, 78, 0.56, 12, 'arch', { dark: true }); K.win(S1.S, 1.7, 78, 0.5, 12, 'arch', { dark: true });
    const S2 = K.vol(0.5, 1.4, 1.5, h - 1, 100, 120, C.white, { mat: 'stucco' }); K.win(S2.F, 0.8, 103, 0.4, 9, 'arch', { dark: true }); K.finial(K.pyr(S2, 74, C.white, { over: 0.02 }), 'ball');
  };
  RX_['Memorial Hall'] = (K, w, h) => { // Harvard: polychrome High Victorian Gothic with a great tower
    const B = K.vol(0, 0.8, w, h, 0, 50, C.brickDk, { mat: 'brick' }); K.row(B.F, 0.3, 3, 12, 3, 0.4, 20, 'gothic', { stained: 1 }); K.row(B.F, 5.2, w - 0.3, 12, 3, 0.4, 20, 'gothic', { stained: 2 }); K.row(B.S, 1.1, h - 0.3, 12, 4, 0.4, 20, 'gothic', { stained: 3 }); K.gable(B, 34, 'u', '#4f4a55');
    for (let i = 0; i < 3; i++) K.seg(K.P(-0.06, h + 0.12, 50 + i * 3 - 1), K.P(w + 0.06, h + 0.12, 50 + i * 3 - 1), 'rgba(196,96,70,.0)');
    const T = K.vol(3, 0.4, 5.2, h + 0.3, 0, 104, C.brickDk, { mat: 'brick' }); K.door(T.F, 3.7, 0.8, 18, 'gothic'); K.win(T.F, 3.75, 44, 0.7, 22, 'gothic', { stained: 0 }); K.round(T.F, 4.1, 90, 0.3, { clock: true }); K.win(T.S, 2, 44, 0.7, 22, 'gothic', { stained: 1 });
    K.vol(2.9, 0.3, 5.3, h + 0.4, 104, 109, C.lime, { mat: 'stucco' }); const R = K.vol(3.1, 0.6, 5.1, h + 0.1, 109, 112, C.brickDk, { mat: 'brick' }); K.finial(K.pyr(R, 62, '#4f4a55'), 'flag', C.red); K.pins(K.vol(2.9, 0.3, 5.3, h + 0.4, 109, 109.5, C.lime, { noTop: true }), 22, C.brickDk);
  };
  RX_['Sample Gates'] = (K, w, h) => { // Indiana: limestone gate pavilions either side of the walk
    for (const [u0, u1] of [[0.3, 3.3], [w - 3.3, w - 0.3]]) { const G = K.vol(u0, 0.2, u1, h, 0, 46, '#d3c8ab', { mat: 'stone' }); K.arcade(G.F, u0 + 0.5, u1 - 0.5, 0, 22, 1, { kind: 'gothic' }); K.cren(G); K.pins(G, 20, '#d3c8ab'); K.butt(G, 1, 40); }
    K.vol(3.3, 0.9, 3.9, h - 0.3, 0, 16, '#d3c8ab', { mat: 'stone' }); K.vol(w - 3.9, 0.9, w - 3.3, h - 0.3, 0, 16, '#d3c8ab', { mat: 'stone' });
  };
  const clockHall = (K, w, h, o) => { // a hall with a central clock tower: Indiana, Penn State, Bellwether
    const B = range(K, 0, 0, w, h, o.z || 56, o.wall, o.mat || 'stone', { kind: o.kind, n: Math.round(w * 1.1) }); K.hip(B, o.rise || 22, o.roof, { tile: o.tile });
    if (o.cols) { K.steps(B, w / 2 - 2.4, w / 2 + 2.4, 0.8, 4); K.cols(B, w / 2 - 2.2, w / 2 + 2.2, 10, 50, o.cols, { ped: o.ped ?? 12, doors: 1, roof: o.roof }); }
    const T = K.vol(w / 2 - 0.95, h / 2 - 1.2, w / 2 + 0.95, h / 2 + 0.7, (o.z || 56) + 4, o.tz || 112, o.twall || o.wall, { mat: o.mat || 'stone' }); K.round(T.F, w / 2, (o.tz || 112) - 16, 0.42, { clock: true }); K.round(T.S, h / 2 - 0.25, (o.tz || 112) - 16, 0.42, { clock: true });
    if (!o.cols) { K.door(B.F, w / 2 - 0.35, 0.7, 16, o.kind === 'gothic' ? 'gothic' : 'arch'); }
    if (o.belfry) { const Bf = K.vol(w / 2 - 0.75, h / 2 - 1, w / 2 + 0.75, h / 2 + 0.5, o.tz, o.tz + 22, o.white || C.white, { mat: 'stucco' }); K.win(Bf.F, w / 2 - 0.3, o.tz + 3, 0.6, 9, 'arch', { dark: true }); K.win(Bf.S, h / 2 - 0.55, o.tz + 3, 0.6, 9, 'arch', { dark: true }); K.finial(K.dome(w / 2, h / 2 - 0.25, 0.62, o.tz + 22, 16, o.cap || C.copper), o.fin || 'ball'); }
    else K.finial(K.pyr(T, o.spire || 40, o.cap || o.roof), o.fin || 'flag', o.flag || C.red);
    return B;
  };
  RX_['Student Building'] = (K, w, h) => clockHall(K, w, h, { wall: '#cfc5a9', roof: '#8a4a36', tile: true, tz: 118, cap: C.copper, spire: 46 });
  RX_['Old Main'] = (K, w, h) => clockHall(K, w, h, { wall: '#d6ccb2', roof: C.slate, cols: 8, tz: 104, belfry: true });
  RX_['Bellwether Town Hall'] = (K, w, h) => { const B = clockHall(K, w, h, { wall: '#cdbf9f', roof: '#7a4634', tile: true, tz: 124, cap: C.copper, spire: 44, flag: '#3f6a52', kind: 'arch' }); K.arcade(B.F, 0.6, w / 2 - 0.8, 0, 13, 4); K.arcade(B.F, w / 2 + 0.8, w - 0.6, 0, 13, 4); };
  RX_['Royce Hall'] = (K, w, h) => { // UCLA: Lombard Romanesque brick, twin towers, arcaded porch
    const L = K.vol(0, 1, 2.6, h, 0, 46, C.brick, { mat: 'brick' }); K.row(L.F, 0.2, 2.4, 10, 3, 0.36, 16, 'arch'); K.hip(L, 14, C.tile, { tile: true });
    const N = K.vol(3.6, 0, w - 3.6, h, 0, 70, C.brick, { mat: 'brick' }); K.gable(N, 24, 'v', C.tile, { tile: true }); K.arcade(N.F, 3.9, w - 3.9, 0, 18, 3); K.row(N.F, 4, w - 4, 42, 5, 0.3, 12, 'arch'); K.round(N.F, w / 2, 78, 0.34, { stained: true });
    for (const [u0, tz] of [[2.4, 122], [w - 4.2, 112]]) { const T = K.vol(u0, 2.6, u0 + 1.8, h + 0.2, 0, tz, C.brick, { mat: 'brick' }); for (let k = 0; k < 4; k++) K.seg(K.P(u0, h + 0.2, 26 + k * 20), K.P(u0 + 1.8, h + 0.2, 26 + k * 20), 'rgba(236,222,190,.55)', 1.4); K.win(T.F, u0 + 0.6, 30, 0.6, 14, 'arch'); K.arcade(T.F, u0 + 0.2, u0 + 1.6, tz - 24, 12, 3, { floor: '#2a2420' }); K.arcade(T.S, 2.8, h, tz - 24, 12, 3, { floor: '#2a2420' }); K.pyr(T, 20, C.tile, { tile: true, over: 0.16 }); }
    const Rr = K.vol(w - 2.6, 1, w, h, 0, 46, C.brick, { mat: 'brick' }); K.row(Rr.F, w - 2.4, w - 0.2, 10, 3, 0.36, 16, 'arch'); K.row(Rr.S, 1.3, h - 0.3, 10, 4, 0.36, 16, 'arch'); K.hip(Rr, 14, C.tile, { tile: true });
  };
  RX_['Powell Library'] = (K, w, h) => { const B = range(K, 0, 0, w, h, 50, C.brick, 'brick', { kind: 'arch', n: 8 }); K.hip(B, 16, C.tile, { tile: true }); K.door(B.F, w / 2 - 0.4, 0.8, 18, 'arch'); K.drum(w / 2, h / 2, 1.25, 60, 92, C.brick, { slots: 5, bands: [64, 88] }); K.finial(K.cone(w / 2, h / 2, 1.4, 92, 20, C.tile, { rings: 5 }), 'ball'); };
  RX_['Main Building'] = (K, w, h) => { // Notre Dame: yellow brick, mansard roofs and the gold dome
    const B = range(K, 0, 0.5, w, h, 62, C.ybrick, 'brick', { floors: 3, n: 12, kind: 'arch' }); K.hip(B, 20, '#5a5c62');
    const Cn = K.vol(w / 2 - 1.7, 0.2, w / 2 + 1.7, h + 0.45, 0, 78, sh(C.ybrick, 5), { mat: 'brick' }); K.grid(Cn.F, w / 2 - 1.5, w / 2 + 1.5, 26, 3, 17, 3, 0.4, 11, 'arch'); K.steps(Cn, w / 2 - 1.3, w / 2 + 1.3, 0.9, 6); K.cols(Cn, w / 2 - 1.2, w / 2 + 1.2, 15, 30, 4, { out: 0.5, ent: 4, doors: 1 }); K.gable(Cn, 16, 'v', '#5a5c62');
    K.drum(w / 2, h / 2, 1.45, 84, 122, '#e4d7b0', { slots: 7, cols: 14, bands: [88, 118] }); K.finial(K.dome(w / 2, h / 2, 1.55, 122, 46, C.gold, { ribs: 8 }), 'figure', C.gold);
  };
  RX_.Basilica = (K, w, h) => { // Notre Dame: Gothic Revival in yellow brick with one tall spire
    const N = K.vol(0.6, 0, w - 0.6, h - 1.2, 0, 60, C.ybrick, { mat: 'brick' }); K.row(N.S, 0.4, h - 1.6, 14, 4, 0.5, 22, 'gothic', { stained: 1 }); K.gable(N, 30, 'v', '#5a5c62'); K.butt(N, 2, 46);
    const T = K.vol(w / 2 - 1.1, h - 2.4, w / 2 + 1.1, h, 0, 110, C.ybrick, { mat: 'brick' }); K.door(T.F, w / 2 - 0.45, 0.9, 20, 'gothic'); K.round(T.F, w / 2, 54, 0.4, { stained: true }); K.win(T.F, w / 2 - 0.3, 78, 0.6, 16, 'gothic', { dark: true }); K.win(T.S, h - 1.5, 78, 0.6, 16, 'gothic', { dark: true }); K.pins(T, 24, C.ybrick); K.finial(K.pyr(K.vol(w / 2 - 0.8, h - 2.1, w / 2 + 0.8, h - 0.3, 110, 112, C.ybrick, { mat: 'brick' }), 96, '#6a6d74', { over: 0.02 }), 'cross', C.gold);
  };
  const domed = (K, w, h, o) => { // steps, columns, attic, drum and dome: MIT, Columbia, and others
    const B = K.vol(0, 0, w, h, 0, o.z, o.wall, { mat: o.mat || 'stone', top: '#8a8d86' }); K.grid(B.F, 0.2, o.c0 - 0.3, 10, o.floors || 3, 16, o.side || 3, 0.34, 10); K.grid(B.F, o.c1 + 0.3, w - 0.2, 10, o.floors || 3, 16, o.side || 3, 0.34, 10); K.grid(B.S, 0.3, h - 0.3, 10, o.floors || 3, 16, Math.round(h * 1.1), 0.34, 10);
    K.vol(-0.05, -0.05, w + 0.05, h + 0.05, o.z, o.z + 4, sh(o.wall, 8), { mat: 'stucco', top: '#8a8d86' });
    const A = K.vol(o.c0 - 0.3, 0.5, o.c1 + 0.3, h, o.z + 4, o.z + 18, o.wall, { mat: o.mat || 'stone', top: '#8a8d86' });
    K.steps(B, o.c0 - 0.2, o.c1 + 0.2, o.steps || 1.1, o.nsteps || 7, '#d8d1bf'); K.cols(B, o.c0, o.c1, (o.nsteps || 7) * 2.4, o.z - 2, o.n, { out: 0.42, doors: 3, ent: 8, ped: o.ped });
    K.drum(w / 2, h / 2 + 0.2, o.r, o.z + 18, o.z + 18 + (o.drum || 12), sh(o.wall, 4), { bands: [o.z + 20], slots: o.slots || 0 }); const top = K.dome(w / 2, h / 2 + 0.2, o.r * 0.98, o.z + 18 + (o.drum || 12), o.rise, o.dome, { ribs: o.ribs || 0 });
    if (o.oculus) { const p = K.P(w / 2, h / 2 + 0.2, top.z); K.fill([[p[0] - 7, p[1] + 2], [p[0], p[1] + 5], [p[0] + 7, p[1] + 2], [p[0], p[1] - 1]], '#3a4650', 'rgba(250,244,226,.6)'); } else K.finial(top, 'ball');
    return B;
  };
  RX_['Great Dome'] = (K, w, h) => domed(K, w, h, { wall: '#d6cfbb', z: 58, c0: 3.4, c1: w - 3.4, n: 10, r: 2.45, rise: 54, dome: '#b9bdb2', oculus: true, drum: 14 });
  RX_['Low Memorial Library'] = (K, w, h) => domed(K, w, h, { wall: '#d2c9b3', z: 56, c0: 3, c1: w - 3, n: 10, r: 2.9, rise: 50, dome: '#9aa59a', steps: 1.3, nsteps: 8, drum: 16, slots: 6, ribs: 10 });
  RX_['Butler Library'] = (K, w, h) => { const B = K.vol(0, 0, w, h, 0, 62, '#d2c9b3', { mat: 'stone', top: '#7c8078' }); K.grid(B.S, 0.3, h - 0.3, 10, 3, 17, 5, 0.34, 10); K.vol(-0.05, -0.05, w + 0.05, h + 0.05, 62, 67, '#dcd3bd', { mat: 'stucco', top: '#7c8078' }); K.steps(B, 0.8, w - 0.8, 0.6, 3); K.cols(B, 1, w - 1, 12, 52, 12, { out: 0.2, ent: 9, r: 0.08 }); K.row(B.F, 1.1, w - 1.1, 14, 6, 0.5, 26, 'arch'); };
  RX_.StanfordChurch = (K, w, h) => { // Stanford: sandstone arcades, red tile, a mosaic gable
    const tile = { tile: true };
    for (const [u0, u1] of [[0, 4.2], [w - 4.2, w]]) { const A = K.vol(u0, 2.2, u1, h, 0, 30, C.sand, { mat: 'stone' }); K.arcade(A.F, u0 + 0.2, u1 - 0.2, 0, 13, 5); if (u1 === w) K.arcade(A.S, 2.5, h - 0.2, 0, 13, 4); K.hip(A, 13, C.tile, tile); }
    const X = K.vol(w / 2 - 2.2, 0.4, w / 2 + 2.2, 3.4, 0, 84, C.sand, { mat: 'stone' }); K.row(X.F, w / 2 - 2, w / 2 + 2, 62, 4, 0.36, 10, 'arch'); K.row(X.S, 0.8, 3.1, 62, 2, 0.36, 10, 'arch'); K.pyr(X, 26, C.tile, { tile: true, over: 0.18 });
    const N = K.vol(w / 2 - 2.6, 2.4, w / 2 + 2.6, h + 0.2, 0, 62, C.sand, { mat: 'stone' }); K.arcade(N.F, w / 2 - 2.3, w / 2 + 2.3, 0, 17, 3); K.row(N.F, w / 2 - 2.2, w / 2 + 2.2, 34, 5, 0.34, 10, 'arch'); K.gable(N, 34, 'v', C.tile, tile);
    const Q = N.F, um = w / 2, pts = [Q(um - 2.1, 64), Q(um + 2.1, 64), Q(um, 92)]; K.fill(pts, '#2f5f8f', 'rgba(250,240,210,.8)'); K.fill([Q(um - 1.5, 65.5), Q(um + 1.5, 65.5), Q(um, 86)], '#c9a03c'); K.fill([Q(um - 0.5, 66), Q(um + 0.5, 66), Q(um, 80)], '#a8443a'); K.round(Q, um, 52, 0.3, { stained: true }); K.finial({ u: um, v: h + 0.2, z: 96 }, 'cross', C.gold);
  };
  RX_['Hoover Tower'] = (K, w, h) => { // Stanford: a tall sandstone shaft with an arcaded belfry and a red tile cap
    const Bs = K.vol(0.4, 0.4, w - 0.4, h - 0.2, 0, 22, C.sand, { mat: 'stone' }); K.door(Bs.F, w / 2 - 0.4, 0.8, 14, 'arch'); const T = K.vol(0.8, 0.8, w - 0.8, h - 0.6, 22, 196, '#dcc699', { mat: 'stone' });
    for (let k = 0; k < 7; k++) { K.win(T.F, w / 2 - 0.7, 34 + k * 20, 0.24, 11, 'rect', { plain: true }); K.win(T.F, w / 2 + 0.46, 34 + k * 20, 0.24, 11, 'rect', { plain: true }); K.win(T.S, h / 2 - 0.12, 34 + k * 20, 0.24, 11, 'rect', { plain: true }); }
    const Bf = K.vol(0.66, 0.66, w - 0.66, h - 0.46, 196, 226, '#dcc699', { mat: 'stone' }); K.arcade(Bf.F, 0.7, w - 0.7, 199, 13, 3, { floor: '#2a2420' }); K.arcade(Bf.S, 0.7, h - 0.7, 199, 13, 3, { floor: '#2a2420' });
    K.drum(w / 2, h / 2, 1.0, 226, 238, '#dcc699', { slots: 5 }); K.finial(K.dome(w / 2, h / 2, 1.0, 238, 24, C.tile, { ribs: 8 }), 'ball');
  };
  RX_['Brookings Hall'] = (K, w, h) => { // WashU: red granite Collegiate Gothic, twin crenellated towers over an archway
    const g = '#b07a66';
    for (const [u0, u1] of [[0, w / 2 - 1.5], [w / 2 + 1.5, w]]) { const V = range(K, u0, 0.4, u1, h, 54, g, 'rubble', { n: 5 }); K.cren(V); }
    const G = K.vol(w / 2 - 0.9, 0.2, w / 2 + 0.9, h + 0.1, 0, 66, g, { mat: 'rubble' }); K.arcade(G.F, w / 2 - 0.75, w / 2 + 0.75, 0, 26, 1, { kind: 'gothic', floor: '#7a6a58' }); K.win(G.F, w / 2 - 0.35, 44, 0.7, 10, 'gothic'); K.cren(G);
    for (const u of [w / 2 - 1.5, w / 2 + 1.5]) { K.drum(u, h - 0.15, 0.62, 0, 104, g, { slots: 3, slotLo: 0.2, slotHi: 0.3, bands: [36, 70, 98] }); K.drum(u, h - 0.15, 0.7, 104, 110, '#d8cfb8', {}); for (let k = 0; k < 6; k++) { const th = Math.PI * (k / 5), p = K.P(u, h - 0.15, 110); K.fill([[p[0] + 29 * Math.cos(th) - 2.4, p[1] + 14.5 * Math.sin(th)], [p[0] + 29 * Math.cos(th) + 2.4, p[1] + 14.5 * Math.sin(th)], [p[0] + 29 * Math.cos(th) + 2.4, p[1] + 14.5 * Math.sin(th) - 6], [p[0] + 29 * Math.cos(th) - 2.4, p[1] + 14.5 * Math.sin(th) - 6]], '#d8cfb8', 'rgba(40,32,24,.4)'); } }
    K.finial({ u: w / 2 - 1.5, v: h - 0.15, z: 112 }, 'flag', '#a8322a'); K.finial({ u: w / 2 + 1.5, v: h - 0.15, z: 112 }, 'flag', '#2f5a3a');
  };
  RX_['Hamerschlag Hall'] = (K, w, h) => { // CMU: cream brick with green roofs and a round, colonnaded tower
    const B = range(K, 0, 0, w - 2.2, h, 58, '#d8c79a', 'brick', { n: 8 }); K.hip(B, 18, C.copper); K.steps(B, 2.4, 5.4, 0.6, 3); K.cols(B, 2.6, 5.2, 8, 48, 4, { ped: 11, doors: 1, roof: C.copper });
    const S = K.vol(w - 3, 0.6, w, h - 0.4, 0, 70, '#d8c79a', { mat: 'brick' }); K.grid(S.F, w - 2.8, w - 0.2, 12, 3, 17, 3, 0.34, 10); K.grid(S.S, 0.9, h - 0.7, 12, 3, 17, 4, 0.34, 10);
    K.drum(w - 1.5, h / 2, 1.2, 70, 86, '#d8c79a', { bands: [84] }); K.drum(w - 1.5, h / 2, 1.05, 86, 124, '#3a3632', { cols: 12, colCol: '#efe8d2', colW: 2.8 }); K.drum(w - 1.5, h / 2, 1.2, 124, 131, '#e6ddc4', {}); K.finial(K.cone(w - 1.5, h / 2, 1.0, 131, 30, C.copper, { rings: 5 }), 'ball');
  };
  RX_['Nassau Hall'] = (K, w, h) => { // Princeton: a long sandstone hall, ivy, and a white cupola
    const st = '#bfae8c', B = range(K, 0, 0.4, w, h, 52, st, 'rubble', { floors: 3, n: 13 }); K.ivy(B, 0.3, 4.4, 34); K.ivy(B, w - 4.2, w - 0.3, 40); K.hip(B, 20, C.slate);
    for (const u of [1.4, 3.6, w - 3.6, w - 1.4]) K.chim(u, h / 2 - 0.2, 64, 14, '#8a5a48');
    const Cn = K.vol(w / 2 - 1.5, 0.4, w / 2 + 1.5, h + 0.3, 0, 56, sh(st, 5), { mat: 'rubble' }); K.steps(Cn, w / 2 - 0.9, w / 2 + 0.9, 0.5, 3); K.door(Cn.F, w / 2 - 0.4, 0.8, 16, 'arch'); K.row(Cn.F, w / 2 - 1.3, w / 2 + 1.3, 26, 3, 0.3, 10); K.row(Cn.F, w / 2 - 1.3, w / 2 + 1.3, 42, 3, 0.3, 9); K.gable(Cn, 14, 'v', C.slate); K.round(Cn.F, w / 2, 60, 0.18);
    const Q = K.vol(w / 2 - 0.7, h / 2 - 0.6, w / 2 + 0.7, h / 2 + 0.8, 68, 82, C.white, { mat: 'stucco' }); K.round(Q.F, w / 2, 75, 0.26, { clock: true }); K.drum(w / 2, h / 2 + 0.1, 0.58, 82, 106, C.white, { slots: 4, open: true, cols: 8 }); K.finial(K.dome(w / 2, h / 2 + 0.1, 0.64, 106, 18, C.copper, { ribs: 6 }), 'flag', '#e07a1f');
  };
  const gateTower = (K, w, h, o) => { // an arch tower with four turrets: Princeton, Yale, and gate towers elsewhere
    const st = o.wall, zb = o.base || 0; if (zb) { const Bs = range(K, 0, 0, w, h, zb, st, o.mat || 'rubble', { kind: 'gothic' }); K.cren(Bs); }
    const m = o.inset ?? 0.6, T = K.vol(m, m, w - m, h - (zb ? m : 0), 0, o.tz, st, { mat: o.mat || 'rubble' }); if (o.arch) K.arcade(T.F, m + 0.5, w - m - 0.5, 0, o.arch, 1, { kind: 'gothic', floor: '#6f6454' });
    K.grid(T.F, m + 0.3, w - m - 0.3, (o.arch || 0) + 26, o.fl || 2, 24, 2, 0.4, 13, 'gothic'); K.grid(T.S, m + 0.3, h - m - 0.3, (o.arch || 0) + 26, o.fl || 2, 24, 2, 0.4, 13, 'gothic');
    if (o.clock) { K.round(T.F, w / 2, o.tz - 16, 0.4, { clock: true }); K.round(T.S, h / 2, o.tz - 16, 0.4, { clock: true }); } K.cren(T);
    for (const [u, v] of [[m, m], [w - m, m], [m, h - (zb ? m : 0)], [w - m, h - (zb ? m : 0)]]) { K.drum(u, v, 0.3, o.tz - 30, o.tz + 14, sh(st, 4), { bands: [o.tz + 10] }); K.cone(u, v, 0.32, o.tz + 14, o.cone || 16, o.cap || C.slate); }
    return T;
  };
  RX_['Blair Arch'] = (K, w, h) => { const st = '#b3a487'; range(K, 0, 0, w, 2.6, 46, st, 'rubble', { kind: 'gothic' }); const T = gateTower(K, w, h, { wall: st, tz: 92, arch: 30, inset: 0.9, fl: 1 }); K.steps(T, 1.4, w - 1.4, 0.9, 6, '#cfc6b0'); };
  RX_['Harkness Tower'] = (K, w, h) => { // Yale: a slender Gothic tower with an openwork crown
    const st = '#b4a585', Bs = range(K, 0, 0, w, h, 34, st, 'rubble', { kind: 'gothic' }); K.cren(Bs); const T = K.vol(1.3, 1.3, w - 1.3, h - 1.3, 34, 150, st, { mat: 'rubble' });
    for (let k = 0; k < 3; k++) { K.win(T.F, w / 2 - 0.3, 50 + k * 30, 0.6, 16, 'gothic', { dark: k === 2 }); K.win(T.S, h / 2 - 0.3, 50 + k * 30, 0.6, 16, 'gothic', { dark: k === 2 }); } K.round(T.F, w / 2, 134, 0.4, { clock: true }); K.round(T.S, h / 2, 134, 0.4, { clock: true }); K.pins(T, 40, st);
    K.drum(w / 2, h / 2, 0.82, 150, 184, st, { slots: 5, open: true, slotLo: 0.1, slotHi: 0.75, cols: 10, colCol: st }); K.drum(w / 2, h / 2, 0.6, 184, 204, st, { slots: 4, open: true }); for (let k = 0; k < 5; k++) { const th = Math.PI * (k / 4); K.pin(w / 2 + 0.5 * Math.cos(th), h / 2 + 0.5 * Math.sin(th), 204, 22, st); }
  };
  RX_['Sterling Memorial Library'] = (K, w, h) => { // Yale: a cathedral front before a great book tower
    const st = '#b6a98c'; const Tw = K.vol(2.6, 0, w - 2.6, 3.2, 0, 132, st, { mat: 'rubble' }); K.grid(Tw.F, 2.9, w - 2.9, 64, 5, 13, 8, 0.2, 8, 'rect', { plain: true }); K.grid(Tw.S, 0.3, 2.9, 20, 8, 13, 4, 0.2, 8, 'rect', { plain: true }); K.cren(Tw); K.pins(Tw, 26, st);
    for (const [u0, u1] of [[0, 4], [w - 4, w]]) { const V = range(K, u0, 2.4, u1, h, 46, st, 'rubble', { kind: 'gothic', n: 4 }); K.cren(V); }
    const N = K.vol(4, 2.6, w - 4, h + 0.3, 0, 70, st, { mat: 'rubble' }); K.door(N.F, w / 2 - 0.6, 1.2, 20, 'gothic'); K.win(N.F, w / 2 - 1.1, 30, 2.2, 22, 'gothic', { stained: 1 }); K.gable(N, 30, 'v', C.slate); K.butt(N, 1, 64); K.pin(4.1, h + 0.3, 70, 26, st); K.pin(w - 4.1, h + 0.3, 70, 26, st);
  };
  RX_['Rockefeller Chapel'] = (K, w, h) => { // Chicago: limestone Gothic with one massive tower
    const st = '#bdb8a6'; const T = K.vol(w - 2.6, 0, w, 2.6, 0, 150, st, { mat: 'stone' }); K.win(T.F, w - 1.7, 86, 0.8, 30, 'gothic', { dark: true }); K.win(T.S, 0.9, 86, 0.8, 30, 'gothic', { dark: true }); K.grid(T.S, 0.4, 2.2, 24, 2, 26, 2, 0.4, 14, 'gothic'); K.cren(T); K.pins(T, 30, st);
    const N = K.vol(0.4, 1.2, w - 0.4, h, 0, 72, st, { mat: 'stone' }); K.row(N.S, 2.8, h - 0.4, 16, 2, 0.6, 30, 'gothic', { stained: 2 }); K.door(N.F, w / 2 - 0.55, 1.1, 20, 'gothic'); K.win(N.F, w / 2 - 1.5, 30, 3, 20, 'gothic', { stained: 0 }); K.gable(N, 36, 'v', '#6b5a4e'); K.butt(N, 2, 62); K.pin(0.5, h, 72, 26, st); K.pin(w - 0.5, h, 72, 26, st);
  };
  RX_['Hatcher Graduate Library'] = (K, w, h) => { const st = '#cdbf9f'; const B = K.vol(0, 0, w, h, 0, 64, st, { mat: 'brick', top: '#77786f' }); K.row(B.F, 0.5, w - 0.5, 6, 9, 0.5, 9); K.row(B.F, 1, w - 1, 24, 7, 0.9, 20, 'arch'); K.row(B.S, 0.4, h - 0.4, 24, 3, 0.9, 20, 'arch'); K.vol(-0.06, -0.06, w + 0.06, h + 0.06, 64, 69, '#ddd3ba', { mat: 'stucco', top: '#77786f' }); K.hip(K.vol(0.6, 0.6, w - 0.6, h - 0.6, 69, 70, st, { noTop: true }), 12, '#6a6f68'); K.steps(B, w / 2 - 1.6, w / 2 + 1.6, 0.7, 4); K.door(B.F, w / 2 - 0.45, 0.9, 15, 'arch'); };
  RX_['Burton Tower'] = (K, w, h) => { // Michigan: a pale limestone tower with setbacks and a clock
    const st = '#d6cfba', Bs = K.vol(0.4, 0.4, w - 0.4, h, 0, 30, st, { mat: 'stone' }); K.door(Bs.F, w / 2 - 0.45, 0.9, 16, 'arch'); const T = K.vol(1, 1, w - 1, h - 0.6, 30, 164, st, { mat: 'stone' });
    for (const a of [-0.8, -0.15, 0.5]) { K.fill([T.F(w / 2 + a, 40), T.F(w / 2 + a + 0.3, 40), T.F(w / 2 + a + 0.3, 138), T.F(w / 2 + a, 138)], '#34424c', 'rgba(250,244,226,.6)'); K.fill([T.S(h / 2 + a + 0.2, 40), T.S(h / 2 + a + 0.5, 40), T.S(h / 2 + a + 0.5, 138), T.S(h / 2 + a + 0.2, 138)], '#263038', 'rgba(250,244,226,.5)'); }
    K.round(T.F, w / 2, 150, 0.46, { clock: true }); K.round(T.S, h / 2 + 0.2, 150, 0.46, { clock: true }); const S = K.vol(1.25, 1.25, w - 1.25, h - 0.85, 164, 190, st, { mat: 'stone' }); K.arcade(S.F, 1.4, w - 1.4, 167, 12, 3, { floor: '#2a2622' }); K.arcade(S.S, 1.4, h - 1, 167, 12, 3, { floor: '#2a2622' }); K.finial(K.pyr(S, 22, C.copper, { over: 0.1 }), 'ball');
  };
  RX_['Rush Rhees Library'] = (K, w, h) => { // Rochester: brick and limestone, a portico, and a two-tier colonnaded tower
    const B = K.vol(0, 0, w, h, 0, 60, C.brick, { mat: 'brick', top: '#6a6c6a' }); K.grid(B.F, 0.2, 3.6, 12, 3, 16, 4, 0.36, 10); K.grid(B.F, w - 3.6, w - 0.2, 12, 3, 16, 4, 0.36, 10); K.grid(B.S, 0.3, h - 0.3, 12, 3, 16, 6, 0.36, 10); K.vol(-0.05, -0.05, w + 0.05, h + 0.05, 60, 65, C.lime, { mat: 'stucco', top: '#6a6c6a' });
    K.steps(B, 3.8, w - 3.8, 1.1, 7); K.cols(B, 4, w - 4, 17, 54, 6, { out: 0.42, doors: 3, ent: 8, ped: 15 });
    const Q = K.vol(w / 2 - 1.5, h / 2 - 1.5, w / 2 + 1.5, h / 2 + 1.5, 65, 92, C.lime, { mat: 'stone' }); K.row(Q.F, w / 2 - 1.3, w / 2 + 1.3, 72, 3, 0.4, 12, 'arch'); K.row(Q.S, h / 2 - 1.3, h / 2 + 1.3, 72, 3, 0.4, 12, 'arch');
    K.drum(w / 2, h / 2, 1.42, 92, 98, C.lime, {}); K.drum(w / 2, h / 2, 1.12, 98, 134, '#3b3834', { cols: 14, colCol: '#efe9d8', colW: 3 }); K.drum(w / 2, h / 2, 1.34, 134, 141, C.lime, {});
    K.drum(w / 2, h / 2, 0.84, 141, 168, '#3b3834', { cols: 10, colCol: '#efe9d8', colW: 2.6 }); K.drum(w / 2, h / 2, 1.0, 168, 174, C.lime, {}); K.dome(w / 2, h / 2, 0.92, 174, 22, '#b9beb4', { ribs: 8 }); K.drum(w / 2, h / 2, 0.3, 192, 206, C.lime, { slots: 3, open: true }); K.finial(K.dome(w / 2, h / 2, 0.34, 206, 9, C.copper), 'ball');
  };
  RX_['Duke Chapel'] = (K, w, h) => { // Duke: multi-coloured stone and a 210-foot tower over the door
    const st = C.duke, N = K.vol(1.4, 0, w - 1.4, h - 2.2, 0, 76, st, { mat: 'rubble' }); K.row(N.S, 0.4, h - 2.6, 18, 3, 0.6, 30, 'gothic', { stained: 1 }); K.gable(N, 34, 'v', C.slateB); K.butt(N, 2, 60);
    for (const [u0, u1] of [[0, 3], [w - 3, w]]) { const X = K.vol(u0, 1.4, u1, 3.8, 0, 60, st, { mat: 'rubble' }); K.win(X.F, (u0 + u1) / 2 - 0.5, 16, 1, 22, 'gothic', { stained: 2 }); if (u1 === w) K.win(X.S, 2, 16, 1, 22, 'gothic', { stained: 3 }); K.gable(X, 22, u1 === w ? 'u' : 'u', C.slateB); }
    const T = K.vol(w / 2 - 1.7, h - 3.2, w / 2 + 1.7, h, 0, 176, st, { mat: 'rubble' }); K.door(T.F, w / 2 - 0.7, 1.4, 24, 'gothic'); K.win(T.F, w / 2 - 0.9, 46, 1.8, 26, 'gothic', { stained: 0 }); for (const a of [-1.1, 0.3]) { K.win(T.F, w / 2 + a, 112, 0.8, 34, 'gothic', { dark: true }); K.win(T.S, h - 1.6 + a, 112, 0.8, 34, 'gothic', { dark: true }); } K.win(T.S, h - 2.4, 46, 1.6, 26, 'gothic', { stained: 1 }); K.cren(T, { h: 6 });
    for (const [u, v] of [[w / 2 - 1.7, h - 3.2], [w / 2 + 1.7, h - 3.2], [w / 2 - 1.7, h], [w / 2 + 1.7, h]]) { K.vol(u - 0.24, v - 0.24, u + 0.24, v + 0.24, 0, 190, sh(st, 6), { mat: 'rubble' }); K.pin(u, v, 190, 30, sh(st, 8)); }
  };
  RX_['University Main Building'] = (K, w, h) => { // Lund: white classical palace with sphinxes on the roof
    const wh = '#ebe5d6', B = K.vol(0, 0, w, h, 0, 58, wh, { mat: 'stucco', top: '#8c9096' }); K.fill([B.F(0, 0), B.F(w, 0), B.F(w, 16), B.F(0, 16)], 'rgba(120,110,90,.16)'); K.grid(B.F, 0.3, w - 0.3, 5, 1, 16, 11, 0.34, 9, 'arch'); K.grid(B.F, 0.3, w - 0.3, 22, 2, 17, 11, 0.34, 11, 'rect'); K.grid(B.S, 0.3, h - 0.3, 22, 2, 17, 5, 0.34, 11); K.vol(-0.06, -0.06, w + 0.06, h + 0.06, 58, 63, '#f3eee2', { mat: 'stucco', top: '#8c9096' });
    const Cn = K.vol(w / 2 - 2.3, 0.4, w / 2 + 2.3, h + 0.5, 0, 66, '#f1ecdf', { mat: 'stucco', top: '#8c9096' }); K.arcade(Cn.F, w / 2 - 2, w / 2 + 2, 0, 12, 3, { floor: '#5a5048' }); K.cols(Cn, w / 2 - 2.1, w / 2 + 2.1, 20, 56, 6, { out: 0.26, ent: 7, ped: 14, roof: '#7b8088' });
    for (const u of [w / 2 - 2.2, w / 2 + 2.2, 0.3, w - 0.3]) { const p = K.P(u, h + (Math.abs(u - w / 2) < 3 ? 0.5 : 0), Math.abs(u - w / 2) < 3 ? 74 : 63); K.fill([[p[0] - 5, p[1]], [p[0] + 5, p[1]], [p[0] + 4, p[1] - 5], [p[0] + 1, p[1] - 6], [p[0] + 1.5, p[1] - 10], [p[0] - 2, p[1] - 10], [p[0] - 3, p[1] - 5]], '#c9c2ae', 'rgba(50,44,36,.6)'); }
  };
  RX_.Cathedral = (K, w, h) => { // Lund: grey Romanesque sandstone, twin towers and a round apse
    const st = '#a7a091', N = K.vol(2.4, 1.2, w - 1.2, h - 1.2, 0, 62, st, { mat: 'stone' }); K.row(N.F, 2.8, w - 1.5, 34, 5, 0.34, 12, 'arch'); K.arcade(N.F, 2.8, w - 1.5, 0, 12, 5, { floor: '#55504a' }); K.gable(N, 26, 'u', '#70767c');
    K.drum(w - 1.2, h / 2, 1.5, 0, 46, st, { slots: 5, slotLo: 0.3, slotHi: 0.6, bands: [14, 42] }); K.cone(w - 1.2, h / 2, 1.6, 46, 20, '#70767c', { rings: 4 });
    for (const [v0, v1] of [[0, 2.5], [h - 2.5, h]]) { const T = K.vol(0, v0, 2.6, v1, 0, 138, st, { mat: 'stone' }); for (let k = 0; k < 4; k++) { K.row(T.F, 0.2, 2.4, 30 + k * 26, 2, 0.4, 12, 'arch', { dark: k > 1 }); K.row(T.S, v0 + 0.2, v1 - 0.2, 30 + k * 26, 2, 0.4, 12, 'arch', { dark: k > 1 }); } K.pyr(T, 34, '#70767c', { over: 0.12 }); }
    K.door(K.vol(0, 2.5, 2.6, h - 2.5, 0, 70, st, { mat: 'stone' }).S, 2.9, 1.2, 24, 'arch');
  };
  RX_.Kungshuset = (K, w, h) => { const B = range(K, 0, 0, w, h, 56, '#a95c44', 'brick', { n: 5 }); K.gable(B, 26, 'u', '#5a5f66'); K.drum(w / 2, h + 0.1, 0.8, 0, 88, '#a95c44', { slots: 3, slotLo: 0.2, slotHi: 0.34, bands: [30, 58, 84] }); K.finial(K.cone(w / 2, h + 0.1, 0.9, 88, 30, C.copper, { rings: 4 }), 'ball'); };
  // ---------- campuses beyond the United States ----------
  RX_['Radcliffe Camera'] = (K, w, h) => { // Oxford: a honey-coloured rotunda with a lead dome
    const st = '#dcc48c', uc = w / 2, vc = h / 2; K.drum(uc, vc, 2.75, 0, 26, sh(st, -8), { slots: 7, slotLo: 0.12, slotHi: 0.62, slotArch: 6, bands: [24], open: true }); K.drum(uc, vc, 2.5, 26, 70, st, { cols: 16, colCol: '#efe0b0', colW: 3, slots: 8, slotLo: 0.16, slotHi: 0.6 }); K.drum(uc, vc, 2.62, 70, 78, sh(st, 8), {});
    for (let k = 0; k <= 8; k++) { const th = Math.PI * (k / 8), p = K.P(uc, vc, 78); K.fill([[p[0] + 108 * Math.cos(th) - 1.5, p[1] + 54 * Math.sin(th)], [p[0] + 108 * Math.cos(th) + 1.5, p[1] + 54 * Math.sin(th)], [p[0] + 108 * Math.cos(th), p[1] + 54 * Math.sin(th) - 9]], sh(st, 10), 'rgba(60,50,30,.5)'); }
    K.drum(uc, vc, 1.95, 78, 98, st, { slots: 8, slotLo: 0.2, slotHi: 0.7, bands: [96] }); const t = K.dome(uc, vc, 1.95, 98, 50, '#8f9698', { ribs: 12 }); K.drum(uc, vc, 0.4, t.z - 4, t.z + 14, st, { slots: 3, open: true }); K.finial(K.dome(uc, vc, 0.44, t.z + 14, 9, '#8f9698'), 'ball');
  };
  RX_['Nuffield College'] = (K, w, h) => { const st = '#d8c391'; const B = range(K, 0, 0, w, h, 44, st, 'stone', { n: 6 }); K.gable(B, 22, 'u', '#8a7a5a'); const T = K.vol(w - 2.2, 0.4, w - 0.2, 2.4, 0, 118, st, { mat: 'stone' }); K.grid(T.F, w - 2, w - 0.4, 54, 5, 12, 2, 0.26, 7, 'rect', { plain: true }); K.grid(T.S, 0.6, 2.2, 20, 8, 12, 2, 0.26, 7, 'rect', { plain: true }); K.finial(K.pyr(K.vol(w - 1.7, 0.9, w - 0.7, 1.9, 118, 122, st, {}), 56, C.copper, { over: 0.02 }), 'ball'); };
  RX_['Bodleian Library'] = (K, w, h) => { const st = '#d9c594'; const B = range(K, 0, 0, w, h, 54, st, 'stone', { kind: 'gothic', n: 7 }); K.cren(B); K.pins(B, 18, st); const T = K.vol(w / 2 - 1, h - 1.6, w / 2 + 1, h + 0.2, 0, 96, st, { mat: 'stone' }); K.arcade(T.F, w / 2 - 0.7, w / 2 + 0.7, 0, 20, 1, { kind: 'gothic' }); for (let k = 0; k < 3; k++) K.cols(T, w / 2 - 0.8, w / 2 + 0.8, 32 + k * 20, 48 + k * 20, 2, { out: 0.12, ent: 3, r: 0.06, col: '#efe0b0' }); K.cren(T); K.pins(T, 22, st); };
  RX_["King's College Chapel"] = (K, w, h) => { // Cambridge: a great stone lantern with four corner turrets
    const st = '#d7cfb8', N = K.vol(0.5, 0.5, w - 0.5, h - 0.5, 0, 92, st, { mat: 'stone' }); const n = Math.round((w - 1.8) / 1.25);
    for (let i = 0; i < n; i++) { const a = 1 + i * ((w - 2) / n); K.win(N.F, a + 0.14, 20, (w - 2) / n - 0.5, 44, 'gothic', { stained: i }); }
    K.win(N.S, 1.05, 22, h - 2.1, 40, 'gothic', { stained: 2 }); K.door(N.S, h / 2 - 0.5, 1, 16, 'gothic'); K.butt(N, n, 84, sh(st, 4)); K.cren(N, { h: 6, size: 0.16 });
    for (let i = 0; i <= n; i++) K.pin(1 + i * ((w - 2) / n), h - 0.42, 92, 22, st);
    K.gable(K.vol(0.9, 0.9, w - 0.9, h - 0.9, 92, 94, st, { noTop: true }), 12, 'u', '#8f9698');
    for (const [u, v] of [[0.5, 0.5], [w - 0.5, 0.5], [0.5, h - 0.5], [w - 0.5, h - 0.5]]) { K.drum(u, v, 0.46, 0, 124, st, { bands: [30, 62, 92, 118], slots: 2, slotLo: 0.8, slotHi: 0.93, open: true }); K.finial(K.dome(u, v, 0.5, 124, 22, sh(st, 6), { ribs: 6 }), 'ball'); }
  };
  RX_['Gibbs Building'] = (K, w, h) => { const wh = '#e6dfcb', B = range(K, 0, 0, w, h, 58, wh, 'stone', { floors: 3, n: 11 }); K.vol(-0.05, -0.05, w + 0.05, h + 0.05, 58, 62, '#eee8d8', { mat: 'stucco', top: '#8a8d86' }); const Cn = K.vol(w / 2 - 1.4, 0.2, w / 2 + 1.4, h + 0.2, 0, 62, '#ebe5d4', { mat: 'stone' }); K.arcade(Cn.F, w / 2 - 0.6, w / 2 + 0.6, 0, 24, 1, { floor: '#6a6050' }); K.win(Cn.F, w / 2 - 0.5, 40, 1, 8, 'arch'); K.fill([Cn.F(w / 2 - 1.5, 62), Cn.F(w / 2 + 1.5, 62), Cn.F(w / 2, 76)], '#ebe5d4', 'rgba(60,50,36,.5)'); };
  RX_['University of Zurich'] = (K, w, h) => { // Zurich: Karl Moser's main building and its domed tower
    const st = '#d9d2bf', B = range(K, 0, 0, w, h, 60, st, 'stone', { floors: 3, n: 12, kind: 'arch' }); K.hip(B, 20, '#7d5a48', { tile: true });
    const T = K.vol(w - 3.6, 0.6, w - 0.6, 3.6, 0, 150, st, { mat: 'stone' }); K.grid(T.F, w - 3.4, w - 0.8, 70, 4, 18, 3, 0.4, 11, 'rect'); K.grid(T.S, 0.8, 3.4, 16, 7, 18, 3, 0.4, 11, 'rect'); K.vol(w - 3.7, 0.5, w - 0.5, 3.7, 150, 156, sh(st, 8), { mat: 'stucco' });
    const t = K.dome(w - 2.1, 2.1, 1.75, 156, 34, C.copper, { ribs: 8 }); K.drum(w - 2.1, 2.1, 0.5, t.z - 5, t.z + 12, st, { slots: 3, open: true }); K.finial(K.cone(w - 2.1, 2.1, 0.55, t.z + 12, 16, C.copper), 'ball');
    K.steps(B, 2, 5.4, 0.7, 4); K.arcade(B.F, 2.2, 5.2, 0, 20, 3, { floor: '#5a5048' });
  };
  RX_['ETH Main Building'] = (K, w, h) => { const o = { wall: '#dcd6c6', z: 56, c0: 2.8, c1: w - 2.8, n: 8, r: 2.1, rise: 48, dome: '#8f9a96', drum: 18, slots: 6, ribs: 10, steps: 0.8, nsteps: 5 }; domed(K, w, h, o); };
  RX_['Clock Tower Centennial Hall'] = (K, w, h) => { // Kyoto: brown tile and stone bands, a square clock tower
    const br = '#a8765a', B = range(K, 0, 0.4, w, h, 48, br, 'brick', { floors: 2, n: 10, kind: 'arch' }); for (const z of [16, 33, 47]) K.seg(K.P(0, h, z), K.P(w, h, z), 'rgba(236,224,198,.75)', 1.6); K.hip(B, 16, '#5d5a58');
    const T = K.vol(w / 2 - 1.3, 0.8, w / 2 + 1.3, h + 0.3, 0, 112, br, { mat: 'brick' }); K.arcade(T.F, w / 2 - 0.9, w / 2 + 0.9, 0, 18, 1, { floor: '#5a4a3c' }); K.grid(T.F, w / 2 - 1, w / 2 + 1, 40, 2, 18, 3, 0.3, 11, 'arch'); for (const z of [34, 76, 110]) K.seg(K.P(w / 2 - 1.3, h + 0.3, z), K.P(w / 2 + 1.3, h + 0.3, z), 'rgba(236,224,198,.8)', 1.8);
    K.round(T.F, w / 2, 92, 0.5, { clock: true }); K.round(T.S, h / 2 + 0.5, 92, 0.5, { clock: true }); K.vol(w / 2 - 1.4, 0.7, w / 2 + 1.4, h + 0.4, 112, 117, '#e6dcc4', { mat: 'stucco' }); K.finial(K.pyr(K.vol(w / 2 - 1, 1.1, w / 2 + 1, h, 117, 119, br, {}), 16, '#5d5a58'), 'flag', '#274a8a');
  };
  RX_['Boya Pagoda'] = (K, w, h) => { // Peking University: thirteen tiers of grey brick beside the lake
    const uc = w / 2, vc = h / 2; K.vol(uc - 1.5, vc - 1.5, uc + 1.5, vc + 1.5, 0, 12, '#b9b4a6', { mat: 'stone' }); let z = 12; K.drum(uc, vc, 1.12, z, z + 34, '#9a958a', { slots: 3, slotLo: 0.2, slotHi: 0.7, bands: [z + 30] }); z += 34;
    for (let i = 0; i < 13; i++) { const r = 1.3 - i * 0.07; K.cone(uc, vc, r, z, 7, '#6f6c68', {}); K.drum(uc, vc, r * 0.72, z + 4, z + 10, '#9a958a', {}); z += 10; }
    K.finial(K.cone(uc, vc, 0.36, z, 22, '#7a776f'), 'ball');
  };
  RX_['West Gate'] = (K, w, h) => { // Peking University: a painted timber gate under a tiled roof
    const red = '#a23a2c'; K.vol(0, 0.6, w, h - 0.2, 0, 6, '#c9c2b0', { mat: 'stone' });
    const B = K.vol(0.4, 1, w - 0.4, h - 0.6, 6, 40, red, { mat: 'stucco' }); K.arcade(B.F, 0.9, w - 0.9, 6, 24, 3, { kind: 'rect', floor: '#5a4a3c' }); for (let i = 0; i <= 3; i++) { const a = 0.9 + (i * (w - 1.8)) / 3; K.vol(a - 0.13, h - 0.7, a + 0.13, h - 0.45, 6, 40, '#8a2c22', { mat: 'stucco', dry: true }); }
    K.fill([B.F(0.4, 40), B.F(w - 0.4, 40), B.F(w - 0.4, 49), B.F(0.4, 49)], '#2f5f8f', 'rgba(230,200,90,.9)'); for (let i = 0; i < 9; i++) K.fill([B.F(0.7 + i * ((w - 1.4) / 9), 42), B.F(0.7 + i * ((w - 1.4) / 9) + 0.3, 42), B.F(0.7 + i * ((w - 1.4) / 9) + 0.3, 47), B.F(0.7 + i * ((w - 1.4) / 9), 47)], i % 2 ? '#3f8a6a' : '#d9a441');
    K.eave(0.4, 1, w - 0.4, h - 0.6, 49, 26, '#5f6468', { over: 0.6 }); K.seg(K.P(1.6, h / 2 + 0.2, 75), K.P(w - 1.6, h / 2 + 0.2, 75), '#3a3c40', 3);
  };
  RX_['Sarah Baartman Hall'] = (K, w, h) => { // Cape Town: a temple front at the top of the steps, red roofs, ivy
    const st = '#d8ccb2', B = range(K, 0, 0, w, h, 54, st, 'stucco', { floors: 2, n: 10 }); K.ivy(B, 0.2, 3.2, 40); K.ivy(B, w - 3.2, w - 0.2, 44); K.hip(B, 22, '#a8553c', { tile: true });
    const Cn = K.vol(w / 2 - 2.6, 0.3, w / 2 + 2.6, h + 0.3, 0, 60, st, { mat: 'stucco' }); K.hip(Cn, 14, '#a8553c', { tile: true }); K.steps(Cn, w / 2 - 2.9, w / 2 + 2.9, 1.3, 9, '#d6cfbd'); K.cols(Cn, w / 2 - 2.4, w / 2 + 2.4, 21, 58, 8, { out: 0.44, ent: 8, ped: 18, doors: 3, roof: '#a8553c' });
  };
  RX_['University College'] = (K, w, h) => { // Toronto: Romanesque Revival, a central tower and a round chapter house
    const st = '#bfb49a', B = range(K, 0, 0.6, w - 2.4, h, 50, st, 'rubble', { kind: 'arch', n: 9 }); K.gable(B, 24, 'u', C.slate);
    const T = K.vol((w - 2.4) / 2 - 1.2, 0.2, (w - 2.4) / 2 + 1.2, h + 0.3, 0, 118, st, { mat: 'rubble' }), um = (w - 2.4) / 2; K.door(T.F, um - 0.5, 1, 20, 'arch'); K.row(T.F, um - 1, um + 1, 44, 3, 0.36, 14, 'arch'); K.arcade(T.F, um - 0.9, um + 0.9, 92, 12, 3, { floor: '#2a2622' }); K.arcade(T.S, 0.6, h, 92, 12, 3, { floor: '#2a2622' }); K.cren(T);
    K.pyr(K.vol(um - 0.9, 0.5, um + 0.9, h, 118, 120, st, {}), 30, C.slate); K.drum(um + 1.2, h + 0.3, 0.3, 60, 132, st, { bands: [118] }); K.cone(um + 1.2, h + 0.3, 0.34, 132, 18, C.slate);
    K.drum(w - 1.3, h / 2 + 0.6, 1.25, 0, 46, st, { slots: 6, slotLo: 0.3, slotHi: 0.62, bands: [14, 42] }); K.finial(K.cone(w - 1.3, h / 2 + 0.6, 1.4, 46, 34, C.slate, { rings: 5 }), 'ball');
  };
  RX_['Convocation Hall'] = (K, w, h) => { const st = '#d6ccb2', uc = w / 2, vc = h / 2; K.drum(uc, vc, 2.3, 0, 50, st, { cols: 14, colCol: '#eee6d0', colW: 3, slots: 7, slotLo: 0.15, slotHi: 0.6, bands: [46] }); K.drum(uc, vc, 2.4, 50, 56, sh(st, 8), {}); K.drum(uc, vc, 1.5, 56, 66, st, { slots: 6 }); K.finial(K.dome(uc, vc, 2.2, 56, 44, C.copper, { ribs: 10 }), 'ball'); };
  RX_["Soldiers' Tower"] = (K, w, h) => { gateTower(K, w, h, { wall: '#bdb29a', tz: 128, arch: 30, inset: 0.5, fl: 2, clock: true, cone: 20 }); };

  const NAME = (b) => (b.name === 'Memorial Church' && b.wall && b.wall.toLowerCase() === '#d2b98a' ? 'StanfordChurch' : b.name);
  SA.Signature = {
    has: (b) => !!(b && (b.sig !== false) && RX_[NAME(b)]),
    top: (b) => 300,
    draw: (c, b, world) => { const K = Kit(c, b, world); c.save(); c.lineJoin = 'round'; RX_[NAME(b)](K, b.w, b.h, b); c.restore(); return true; },
    names: () => Object.keys(RX_), alias: (a, b) => { RX_[a] = RX_[b]; }, Kit,
  };
})();
