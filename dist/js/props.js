/* The Society Atlas V2 — scenery props. Every prop is original Canvas geometry.
   A prop draws around (0,0) = its ground contact point. Light comes from the upper left. */
(function () {
  'use strict';
  const SA = window.SA, { shade, mix, hash } = SA;
  const TAU = Math.PI * 2;
  const defs = {};
  const def = (kind, meta, draw) => (defs[kind] = { w: 30, h: 40, below: 12, block: true, anim: false, ...meta, draw });

  // ---------- helpers ----------
  const ell = (c, x, y, rx, ry, fill, rot = 0) => { c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill(); };
  const poly = (c, pts, fill, stroke, lw = 0.7) => {
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  };
  const line = (c, pts, stroke, lw = 1) => { c.strokeStyle = stroke; c.lineWidth = lw; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); };
  const rect = (c, x, y, w, h, fill) => { c.fillStyle = fill; c.fillRect(x, y, w, h); };
  const shadow = (c, rx, ry = rx * 0.38, dx = rx * 0.45, dy = 2, a = 0.26) => ell(c, dx, dy, rx, ry, `rgba(22,34,20,${a})`);
  // an isometric box centred on the origin: half-widths a (along x axis) and b (along y axis), height z, lifted by base
  const box = (c, a, b, z, col, base = 0, top) => {
    const ax = a * 0.5, ay = a * 0.25, bx = b * 0.5, by = b * 0.25;   // tile half vectors, in px per unit
    const P = (u, v, h) => [u * ax * 2 - v * bx * 2, u * ay * 2 + v * by * 2 - h - base];
    const A = P(-0.5, -0.5, z), B = P(0.5, -0.5, z), C = P(0.5, 0.5, z), D = P(-0.5, 0.5, z);
    poly(c, [P(-0.5, 0.5, 0), P(0.5, 0.5, 0), C, D], shade(col, 6));
    poly(c, [P(0.5, -0.5, 0), P(0.5, 0.5, 0), C, B], shade(col, -22));
    poly(c, [A, B, C, D], top || shade(col, 22));
    return { A, B, C, D, P };
  };
  SA.draw = { ell, poly, line, rect, box, shadow };

  // ---------- trees ----------
  const PAL = {
    elm: ['#3f5a34', '#5d7b43', '#86a25a'], oak: ['#39502f', '#55723d', '#7c9650'], lime: ['#476a3c', '#6c8f4c', '#9bb868'],
    maple: ['#8a3f24', '#c0672c', '#e2a544'], gold: ['#8d6a22', '#c79a35', '#ead27a'], red: ['#6f2b25', '#a5422f', '#d0774a'],
    birch: ['#627b3a', '#93a84b', '#c9cf74'], cherry: ['#a45c78', '#d68aa2', '#f3c6d1'], olive: ['#4b5d44', '#6d7f5c', '#9aa883'],
    pine: ['#24402f', '#35583d', '#55784f'], cypress: ['#22382c', '#2f4c38', '#4c6b4c'], snow: ['#8fa2a8', '#c9d5d6', '#f4f7f5'],
  };
  function canopy(c, cx, cy, rx, ry, pal, seed, n = 9) {
    const [dark, mid, light] = pal;
    for (let i = 0; i < n; i++) {
      const a = hash(seed, i, 1) * TAU, r = Math.sqrt(hash(seed, i, 2)) * 0.62;
      ell(c, cx + Math.cos(a) * rx * r + rx * 0.10, cy + Math.sin(a) * ry * r + ry * 0.16, rx * (0.42 + hash(seed, i, 3) * 0.22), ry * (0.44 + hash(seed, i, 4) * 0.2), dark);
    }
    for (let i = 0; i < n; i++) {
      const a = hash(seed, i, 5) * TAU, r = Math.sqrt(hash(seed, i, 6)) * 0.56;
      ell(c, cx + Math.cos(a) * rx * r - rx * 0.05, cy + Math.sin(a) * ry * r - ry * 0.06, rx * (0.34 + hash(seed, i, 7) * 0.2), ry * (0.34 + hash(seed, i, 8) * 0.18), mid);
    }
    for (let i = 0; i < Math.ceil(n * 0.7); i++) {
      const a = hash(seed, i, 9) * TAU, r = Math.sqrt(hash(seed, i, 10)) * 0.42;
      ell(c, cx + Math.cos(a) * rx * r - rx * 0.24, cy + Math.sin(a) * ry * r - ry * 0.28, rx * (0.18 + hash(seed, i, 11) * 0.14), ry * (0.16 + hash(seed, i, 12) * 0.12), light);
    }
    // leaf flecks
    for (let i = 0; i < n * 5; i++) {
      const a = hash(seed, i, 13) * TAU, r = Math.sqrt(hash(seed, i, 14)) * 0.92, up = hash(seed, i, 15) > 0.5;
      c.fillStyle = up ? SA.alpha(light, 0.75) : SA.alpha(shade(dark, -14), 0.6);
      c.fillRect(cx + Math.cos(a) * rx * r - (up ? rx * 0.12 : -rx * 0.08), cy + Math.sin(a) * ry * r - (up ? ry * 0.12 : -ry * 0.1), 1.6, 1.2);
    }
  }
  const trunk = (c, h, w, col = '#5a4630') => {
    poly(c, [[-w, 0], [w, 0], [w * 0.6, -h], [-w * 0.6, -h]], col);
    poly(c, [[-w, 0], [-w * 0.2, 0], [-w * 0.15, -h], [-w * 0.6, -h]], shade(col, 22));
    poly(c, [[w * 0.35, 0], [w, 0], [w * 0.6, -h], [w * 0.3, -h]], shade(col, -18));
  };
  function broadleaf(c, o, pal, size = 1) {
    const s = o.v || 1, k = (1.05 + hash(s, 1) * 0.4) * size;
    shadow(c, 24 * k, 9 * k, 13 * k, 3, 0.28);
    trunk(c, 26 * k, 3.6 * k);
    canopy(c, 0, -44 * k, 25 * k, 23 * k, pal, s, 10);
    if (o.leaves) for (let i = 0; i < 9; i++) { c.fillStyle = SA.alpha(pal[i % 3], 0.75); c.fillRect(-24 * k + hash(s, i, 20) * 52 * k, -3 + hash(s, i, 21) * 12, 2.2, 1.3); }
  }
  for (const [kind, pal] of [['elm', 'elm'], ['oak', 'oak'], ['lime', 'lime'], ['maple', 'maple'], ['goldtree', 'gold'], ['redtree', 'red'], ['cherry', 'cherry'], ['olive', 'olive']])
    def(kind, { w: 50, h: 104, below: 18 }, (c, o) => broadleaf(c, { ...o, leaves: /maple|gold|red|cherry/.test(kind) }, PAL[pal], kind === 'olive' ? 0.78 : 1));
  def('bigoak', { w: 70, h: 140, below: 22 }, (c, o) => broadleaf(c, o, PAL.oak, 1.4));
  def('birch', { w: 26, h: 76, below: 12 }, (c, o) => {
    const s = o.v || 1; shadow(c, 15, 6, 9, 2, 0.22); trunk(c, 44, 2.2, '#d9d6c6');
    for (let i = 0; i < 6; i++) rect(c, -2 + hash(s, i) * 2, -6 - i * 6.5, 2.4, 1, '#4a4a40');
    canopy(c, 0, -52, 15, 20, PAL.birch, s, 7);
  });
  def('pine', { w: 36, h: 116, below: 12 }, (c, o) => {
    const s = o.v || 1, k = 1.1 + hash(s, 2) * 0.35, pal = o.snow ? PAL.snow : PAL.pine;
    shadow(c, 17 * k, 6 * k, 10 * k, 2, 0.26); trunk(c, 14 * k, 2.6 * k, '#4f3d2b');
    for (let i = 0; i < 5; i++) {
      const y = -10 * k - i * 14 * k, w = (19 - i * 3.2) * k;
      poly(c, [[-w, y], [w, y], [0, y - 22 * k]], PAL.pine[0]);
      poly(c, [[-w, y], [-w * 0.1, y], [0, y - 22 * k]], PAL.pine[1]);
      poly(c, [[-w * 0.75, y - 2], [-w * 0.3, y - 2], [-1, y - 18 * k]], o.snow ? '#eef3f1' : PAL.pine[2]);
      if (o.snow) poly(c, [[-w * 0.2, y - 12 * k], [w * 0.5, y - 7 * k], [0, y - 22 * k]], '#dfe8e6');
    }
    void pal;
  });
  def('cypress', { w: 18, h: 92, below: 10 }, (c, o) => {
    const s = o.v || 1, k = 0.9 + hash(s, 3) * 0.25; shadow(c, 9, 4, 6, 2, 0.24); trunk(c, 8, 2, '#4a3a2a');
    c.fillStyle = PAL.cypress[0]; c.beginPath(); c.ellipse(1, -44 * k, 8.5, 40 * k, 0, 0, TAU); c.fill();
    c.fillStyle = PAL.cypress[1]; c.beginPath(); c.ellipse(-1.5, -46 * k, 6, 36 * k, 0, 0, TAU); c.fill();
    c.fillStyle = PAL.cypress[2]; c.beginPath(); c.ellipse(-3.2, -52 * k, 2.4, 24 * k, 0, 0, TAU); c.fill();
  });
  def('palm', { w: 34, h: 100, below: 10 }, (c, o) => {
    const s = o.v || 1, h = 66 + hash(s, 4) * 22, lean = (hash(s, 5) - 0.5) * 12;
    shadow(c, 13, 5, 14, 2, 0.2);
    c.strokeStyle = '#7b6648'; c.lineWidth = 4.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(lean * 0.4, -h * 0.5, lean, -h); c.stroke();
    c.strokeStyle = '#a08b63'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(-1.2, 0); c.quadraticCurveTo(lean * 0.4 - 1.2, -h * 0.5, lean - 1, -h); c.stroke();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + hash(s, i, 6) * 0.5, len = 22 + hash(s, i, 7) * 9, ex = lean + Math.cos(a) * len, ey = -h + Math.sin(a) * len * 0.42 + 9;
      c.strokeStyle = i % 3 ? '#4f7a3f' : '#76a052'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(lean, -h); c.quadraticCurveTo(lean + Math.cos(a) * len * 0.6, -h - 9, ex, ey); c.stroke();
    }
    ell(c, lean, -h, 3.5, 3, '#6a5a3a');
  });
  def('willow', { w: 46, h: 80, below: 16 }, (c, o) => {
    const s = o.v || 1; shadow(c, 27, 10, 12, 3, 0.26); trunk(c, 24, 4);
    canopy(c, 0, -44, 26, 20, PAL.lime, s, 9);
    for (let i = 0; i < 16; i++) { const x = -25 + i * 3.3; line(c, [[x, -40 + hash(s, i) * 6], [x + (hash(s, i, 2) - 0.5) * 3, -8 - hash(s, i, 3) * 10]], i % 2 ? '#7fa25699' : '#55783e99', 1.6); }
  });
  def('baretree', { w: 34, h: 70, below: 12 }, (c, o) => {
    const s = o.v || 1; shadow(c, 16, 6, 10, 2, 0.18); trunk(c, 26, 3.2, '#54483a');
    const branch = (x, y, a, len, d) => { if (d > 3) return; const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len; line(c, [[x, y], [ex, ey]], '#5b4e3f', 2.6 - d * 0.6); branch(ex, ey, a - 0.5 - hash(s, d, x) * 0.3, len * 0.7, d + 1); branch(ex, ey, a + 0.45 + hash(s, d, y) * 0.3, len * 0.7, d + 1); };
    branch(0, -24, -Math.PI / 2, 15, 0);
    if (o.snow) for (let i = 0; i < 8; i++) ell(c, -14 + hash(s, i, 9) * 28, -34 - hash(s, i, 10) * 26, 3.2, 1.5, '#f2f5f3');
  });
  def('bush', { w: 16, h: 16, below: 8, block: false }, (c, o) => { shadow(c, 11, 4, 4, 2, 0.2); canopy(c, 0, -6, 11, 8, o.pal ? PAL[o.pal] : PAL.oak, o.v || 1, 5); });
  def('hedge', { w: 30, h: 16, below: 14 }, (c, o) => {
    box(c, 30, 30, 11, '#3f5d39'); const s = o.v || 1;
    for (let i = 0; i < 22; i++) rect(c, -24 + hash(s, i) * 48, -18 + hash(s, i, 2) * 22, 1.6, 1.2, i % 2 ? '#7c9d5a' : '#2c4429');
  });
  def('flowers', { w: 26, h: 8, below: 12, block: false }, (c, o) => {
    const s = o.v || 1, cols = o.cols || ['#d9624e', '#e7c35a', '#f1e9d8', '#9b6fb5'];
    poly(c, [[0, -11], [24, 0], [0, 11], [-24, 0]], '#5b4a36'); poly(c, [[0, -9], [20, 0], [0, 9], [-20, 0]], '#46603a');
    for (let i = 0; i < 26; i++) { const a = hash(s, i) * TAU, r = Math.sqrt(hash(s, i, 2)); ell(c, Math.cos(a) * 17 * r, Math.sin(a) * 7 * r - 2, 1.7, 1.4, cols[i % cols.length]); }
  });
  def('dandelions', { w: 26, h: 6, below: 12, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 16; i++) { const x = -22 + hash(s, i) * 44, y = -8 + hash(s, i, 2) * 16; line(c, [[x, y], [x, y - 4]], '#55773f', 0.8); ell(c, x, y - 4.5, 1.7, 1.5, i % 5 ? '#f2cf3a' : '#f4f1e4'); } });
  def('reeds', { w: 14, h: 22, below: 6, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 9; i++) { const x = -9 + i * 2.3; line(c, [[x, 4], [x + (hash(s, i) - 0.5) * 5, -10 - hash(s, i, 2) * 10]], i % 2 ? '#7d8c4c' : '#55693d', 1.2); if (i % 3 === 0) ell(c, x + (hash(s, i) - 0.5) * 5, -15 - hash(s, i, 2) * 6, 1.3, 3.2, '#6b4a2e'); } });
  def('lily', { w: 12, h: 4, below: 6, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 4; i++) { const x = -8 + hash(s, i) * 16, y = -3 + hash(s, i, 2) * 6; ell(c, x, y, 4, 2, '#5f8a52'); if (i % 2) ell(c, x + 1, y - 1, 1.3, 1, '#f1d7dd'); } });
  def('rock', { w: 14, h: 12, below: 8 }, (c, o) => { const s = o.v || 1; shadow(c, 10, 4, 4, 2, 0.2); poly(c, [[-10, 2], [-7, -7], [1, -10 - hash(s, 1) * 3], [9, -5], [11, 3], [2, 6]], '#8b8a7d'); poly(c, [[-7, -7], [1, -10 - hash(s, 1) * 3], [0, -2], [-8, 1]], '#aaa998'); });
  def('snowman', { w: 12, h: 30, below: 8 }, (c) => { shadow(c, 10, 4, 5, 2, 0.16); ell(c, 0, -6, 8.5, 8, '#eef2f0'); ell(c, 0, -17, 6, 5.6, '#f4f7f5'); ell(c, 0, -25, 4.2, 4, '#f8faf8'); rect(c, -1.6, -26, 1.2, 1.2, '#2a2a2a'); rect(c, 1, -26, 1.2, 1.2, '#2a2a2a'); poly(c, [[0, -24.5], [5, -23.6], [0, -23]], '#d9772e'); line(c, [[-5, -18], [-11, -22]], '#5a4630', 1.2); line(c, [[5, -18], [11, -21]], '#5a4630', 1.2); rect(c, -4.4, -21.5, 8.8, 2, '#a5422f'); });

  // ---------- street furniture ----------
  def('lamp', { w: 8, h: 52, below: 6, light: [0, -44, 70] }, (c, o) => {
    shadow(c, 5, 2, 3, 1, 0.22); const m = o.modern;
    rect(c, -1.4, -44, 2.8, 44, '#2f3632'); rect(c, -1.4, -44, 1, 44, '#566058'); rect(c, -3.2, -3, 6.4, 3, '#39413c');
    if (m) { rect(c, -1.4, -47, 11, 2.4, '#3a423d'); rect(c, 5, -45, 6, 2.6, '#f1e4a6'); } else {
      poly(c, [[-4.5, -44], [4.5, -44], [3.4, -53], [-3.4, -53]], '#f0dc9b'); poly(c, [[-4.5, -44], [-1, -44], [-0.8, -53], [-3.4, -53]], '#fff3c4');
      poly(c, [[-5.5, -53], [5.5, -53], [0, -59]], '#2f3632'); rect(c, -5, -44.6, 10, 1.4, '#2f3632');
    }
  });
  def('bench', { w: 18, h: 16, below: 8 }, (c) => { shadow(c, 15, 5, 3, 3, 0.2); const w = '#7a5a3a'; poly(c, [[-15, -3], [9, 7], [15, 3], [-9, -7]], shade(w, 16)); poly(c, [[-15, -3], [9, 7], [9, 10], [-15, 0]], shade(w, -18)); poly(c, [[-15, -13], [9, -3], [9, 2], [-15, -8]], w); rect(c, -14.5, -1, 2, 6, '#3c3229'); rect(c, 7.5, 8, 2, 5, '#3c3229'); });
  def('kiosk', { w: 20, h: 44, below: 8 }, (c) => { shadow(c, 14, 5, 5, 2, 0.24); rect(c, -15, -30, 3, 32, '#54432f'); rect(c, 12, -30, 3, 32, '#54432f'); rect(c, -19, -41, 38, 26, '#8a7445'); rect(c, -16.5, -38.5, 33, 21, '#3f4a39'); const p = ['#e6dab5', '#c9bf9c', '#d9c8a0', '#efe6c8', '#c4b78f', '#e0d2a8']; for (let i = 0; i < 6; i++) { rect(c, -14 + (i % 3) * 10.4, -36 + Math.floor(i / 3) * 9.6, 8.6, 7.4, p[i]); rect(c, -12.6 + (i % 3) * 10.4, -33.6 + Math.floor(i / 3) * 9.6, 5.4, 0.9, '#7c7059'); } poly(c, [[-21, -41], [21, -41], [0, -49]], '#6a5636'); });
  def('sign', { w: 12, h: 26, below: 6, block: false }, (c, o) => { rect(c, -1, -18, 2, 18, '#54432f'); poly(c, [[-11, -25], [9, -25], [13, -21], [9, -17], [-11, -17]], o.col || '#e2d6b0', '#54432f'); rect(c, -8, -22.5, 12, 1, '#6c614c'); rect(c, -8, -20.2, 8, 1, '#6c614c'); });
  def('statue', { w: 16, h: 58, below: 10 }, (c, o) => {
    shadow(c, 14, 5, 6, 2, 0.26); const st = '#a6a08c', br = o.col || '#5d6f62'; box(c, 20, 20, 16, st); box(c, 15, 15, 5, shade(st, 10), 16);
    const kind = o.figure || 'scholar';
    if (kind === 'scholar' || kind === 'seated') {
      const y0 = -21; if (kind === 'seated') { rect(c, -6, y0 - 12, 12, 12, shade(br, -12)); ell(c, 0, y0 - 16, 6, 6.5, br); ell(c, 0, y0 - 25.5, 3.6, 3.8, shade(br, 12)); rect(c, -6.5, y0 - 5, 13, 5, shade(br, -4)); if (o.shoe) ell(c, -4.5, y0 - 1, 2.4, 1.6, '#e3c56a'); }
      else { poly(c, [[-5, y0], [5, y0], [4, y0 - 22], [-4, y0 - 22]], br); poly(c, [[-5, y0], [-1, y0], [-1, y0 - 22], [-4, y0 - 22]], shade(br, 14)); ell(c, 0, y0 - 26, 3.4, 3.7, shade(br, 10)); line(c, [[4, y0 - 18], [9, y0 - 12]], br, 2.4); rect(c, 7.5, y0 - 13.5, 4, 5, shade(br, 20)); }
    } else {
      const y0 = -21, col = kind === 'owl' ? br : (o.col || '#8a6b3c'); ell(c, 0, y0 - 6, 9, 5.5, col); ell(c, 7.5, y0 - 11, 4.4, 4, shade(col, 8));
      if (kind === 'tiger' || kind === 'lion') { ell(c, 7.5, y0 - 11, 5.6, 5.2, shade(col, -16)); ell(c, 8, y0 - 11, 3.8, 3.6, shade(col, 12)); }
      rect(c, -7, y0 - 3, 2.6, 4, shade(col, -14)); rect(c, 4.5, y0 - 3, 2.6, 4, shade(col, -14)); line(c, [[-9, y0 - 7], [-13, y0 - 12]], col, 2);
      if (kind === 'bear' || kind === 'dog') { ell(c, 5.2, y0 - 14.5, 1.5, 1.6, col); ell(c, 9.6, y0 - 14.6, 1.5, 1.6, col); }
      if (o.nose) ell(c, 11.4, y0 - 10.6, 1.5, 1.3, '#e3c56a');
    }
  });
  def('fountain', { w: 34, h: 40, below: 18, anim: true }, (c, o, t) => {
    shadow(c, 30, 11, 6, 3, 0.2); const st = o.col || '#b3ab93';
    c.fillStyle = shade(st, -18); c.beginPath(); c.ellipse(0, 2, 32, 15, 0, 0, TAU); c.fill();
    c.fillStyle = st; c.beginPath(); c.ellipse(0, -4, 32, 15, 0, 0, TAU); c.fill();
    c.fillStyle = '#5f97a8'; c.beginPath(); c.ellipse(0, -4, 27, 12, 0, 0, TAU); c.fill();
    c.fillStyle = '#8fc0c8'; c.beginPath(); c.ellipse(-5, -6, 15, 5.5, 0, 0, TAU); c.fill();
    rect(c, -3, -24, 6, 20, shade(st, -8)); rect(c, -3, -24, 2, 20, shade(st, 14));
    c.fillStyle = st; c.beginPath(); c.ellipse(0, -24, 11, 4.4, 0, 0, TAU); c.fill(); c.fillStyle = '#74a9b6'; c.beginPath(); c.ellipse(0, -24.6, 8.5, 3.1, 0, 0, TAU); c.fill();
    for (let i = 0; i < 7; i++) { const ph = (t * 1.6 + i / 7) % 1, a = (i / 7) * TAU, r = ph * 13, y = -26 - Math.sin(ph * Math.PI) * 15 + ph * 20; ell(c, Math.cos(a) * r, y + Math.sin(a) * r * 0.4, 1.4, 1.8, 'rgba(226,243,246,.85)'); }
    for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; c.strokeStyle = `rgba(226,243,246,${0.5 * (1 - ph)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -4, 6 + ph * 20, 2.6 + ph * 9, 0, 0, TAU); c.stroke(); }
  });
  def('well', { w: 14, h: 34, below: 8 }, (c) => { shadow(c, 12, 5, 4, 2, 0.22); c.fillStyle = '#8f8a78'; c.beginPath(); c.ellipse(0, -4, 12, 6, 0, 0, TAU); c.fill(); rect(c, -12, -12, 24, 8, '#8f8a78'); c.fillStyle = '#a9a48f'; c.beginPath(); c.ellipse(0, -12, 12, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#2f4a52'; c.beginPath(); c.ellipse(0, -12, 8.5, 4, 0, 0, TAU); c.fill(); rect(c, -11, -32, 2, 22, '#5a4630'); rect(c, 9, -32, 2, 22, '#5a4630'); poly(c, [[-14, -31], [14, -31], [0, -40]], '#7a4a34'); });
  def('sundial', { w: 10, h: 22, below: 6 }, (c) => { shadow(c, 8, 3, 3, 1, 0.2); rect(c, -3, -14, 6, 14, '#9d9884'); rect(c, -3, -14, 2, 14, '#bdb8a2'); c.fillStyle = '#c2bca4'; c.beginPath(); c.ellipse(0, -15, 8.5, 4, 0, 0, TAU); c.fill(); poly(c, [[-1, -15], [5, -15], [-1, -22]], '#8a6b3c'); });
  def('bikes', { w: 20, h: 18, below: 8 }, (c, o) => { shadow(c, 16, 5, 3, 3, 0.16); const s = o.v || 1; for (let i = 0; i < 3; i++) { const x = -12 + i * 10, y = -3 + i * 4, col = ['#7c2f2f', '#2f5a7c', '#49683b', '#8a6b22'][(s + i) % 4]; c.strokeStyle = '#2c2c2c'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x - 5, y - 4, 4.2, 4.6, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(x + 5, y, 4.2, 4.6, 0, 0, TAU); c.stroke(); line(c, [[x - 5, y - 4], [x, y - 9], [x + 5, y], [x - 1, y - 2], [x - 5, y - 4]], col, 1.5); line(c, [[x, y - 9], [x - 1, y - 12]], '#2c2c2c', 1.2); } });
  def('crates', { w: 14, h: 22, below: 8 }, (c, o) => { shadow(c, 13, 5, 4, 2, 0.22); box(c, 18, 18, 12, '#8b6a3f'); c.save(); c.translate(3, -12); box(c, 12, 12, 9, '#9a7748'); c.restore(); void o; });
  def('barrel', { w: 9, h: 18, below: 6 }, (c) => { shadow(c, 8, 3, 3, 1, 0.22); rect(c, -6, -14, 12, 14, '#7b5a36'); c.fillStyle = '#7b5a36'; c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, TAU); c.fill(); c.fillStyle = '#946f45'; c.beginPath(); c.ellipse(0, -14, 6, 3, 0, 0, TAU); c.fill(); rect(c, -6, -11, 12, 1.4, '#3c3229'); rect(c, -6, -4, 12, 1.4, '#3c3229'); });
  def('cart', { w: 20, h: 22, below: 8 }, (c) => { shadow(c, 16, 5, 4, 3, 0.2); poly(c, [[-14, -8], [8, 2], [14, -2], [-8, -12]], '#9a7445'); poly(c, [[-14, -8], [8, 2], [8, 6], [-14, -4]], '#6e4f2c'); c.strokeStyle = '#3c3229'; c.lineWidth = 2; c.beginPath(); c.ellipse(-2, 5, 5.5, 6.5, 0, 0, TAU); c.stroke(); line(c, [[8, 3], [19, 9]], '#5a4630', 1.6); box(c, 8, 8, 6, '#b79a62', 9); });
  def('stall', { w: 24, h: 40, below: 12 }, (c, o) => { shadow(c, 20, 7, 5, 3, 0.22); const col = o.col || '#a5422f'; box(c, 30, 20, 12, '#8b6a3f'); for (const x of [-15, 14]) rect(c, x, -36, 2, 30, '#5a4630'); const stripes = 6; for (let i = 0; i < stripes; i++) poly(c, [[-20 + i * 6.8, -36 + i * 1.2], [-13.2 + i * 6.8, -34.8 + i * 1.2], [-13.2 + i * 6.8, -27 + i * 1.2], [-20 + i * 6.8, -28.2 + i * 1.2]], i % 2 ? '#efe6cf' : col); poly(c, [[-20, -36], [20.8, -28.8], [14, -42], [-13, -47]], shade(col, -14)); const goods = o.goods || ['#d9a441', '#c75b3a', '#7b9c4c']; for (let i = 0; i < 6; i++) ell(c, -9 + i * 3.6, -15 + i * 1.6, 2.2, 1.8, goods[i % goods.length]); });
  def('tent', { w: 20, h: 26, below: 10 }, (c, o) => { shadow(c, 18, 6, 4, 3, 0.2); const col = o.col || '#3b5f8a'; poly(c, [[-18, 2], [0, 10], [0, -18], [-9, -22]], col); poly(c, [[0, 10], [18, 2], [9, -22], [0, -18]], shade(col, -26)); poly(c, [[-9, -22], [0, -18], [9, -22], [0, -26]], shade(col, 20)); poly(c, [[-5, 7.6], [0, 10], [0, -4]], '#22303a'); });
  def('table', { w: 22, h: 26, below: 10 }, (c, o, t) => { shadow(c, 20, 7, 4, 3, 0.22); for (const x of [-15, 13]) rect(c, x, -6, 2.6, 16, '#4b3420'); poly(c, [[-22, -9], [6, 4], [24, -5], [-4, -18]], '#9c6b35', '#4e3925'); poly(c, [[-22, -9], [6, 4], [6, 8], [-22, -5]], '#66401e'); c.save(); c.translate(11, -9); c.rotate(o.still ? 0 : (t || 0) * 0.5); c.strokeStyle = '#bf9d50'; c.lineWidth = 2.2; c.beginPath(); c.arc(0, 0, 6.5, 0, TAU); c.stroke(); for (let n = 0; n < 6; n++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(2, 0); c.lineTo(8, 0); c.stroke(); } c.restore(); rect(c, -10, -17, 6, 6, '#e2cd93'); });
  defs.table.anim = true;
  def('chalkboard', { w: 16, h: 30, below: 8 }, (c) => { shadow(c, 12, 4, 4, 2, 0.2); line(c, [[-10, 2], [-7, -24]], '#5a4630', 2); line(c, [[10, 2], [7, -24]], '#5a4630', 2); rect(c, -13, -29, 26, 19, '#7a5a3a'); rect(c, -11.4, -27.4, 22.8, 15.8, '#2f4a40'); line(c, [[-8, -23], [-2, -17], [3, -21], [8, -15]], '#e8e4d2', 0.9); ell(c, -8, -23, 1.2, 1.2, '#e8e4d2'); ell(c, 8, -15, 1.2, 1.2, '#e8e4d2'); });
  def('bell', { w: 14, h: 40, below: 8 }, (c, o, t) => { shadow(c, 12, 4, 4, 2, 0.22); rect(c, -11, -34, 2.6, 34, '#5a4630'); rect(c, 8.4, -34, 2.6, 34, '#5a4630'); rect(c, -13, -37, 26, 3.4, '#6b5438'); const sw = o.ring ? Math.sin((t || 0) * 9) * 0.35 * Math.max(0, 1 - ((t || 0) - o.ring) / 2.5) : 0; c.save(); c.translate(0, -33); c.rotate(sw); poly(c, [[-3, 0], [3, 0], [7.5, 15], [-7.5, 15]], '#c39a3f'); poly(c, [[-3, 0], [-0.5, 0], [-2.5, 15], [-7.5, 15]], '#e6c56a'); ell(c, 0, 17, 2, 2, '#6a5326'); c.restore(); });
  defs.bell.anim = true;
  def('telescope', { w: 12, h: 30, below: 8 }, (c) => { shadow(c, 9, 3, 3, 1, 0.2); line(c, [[0, -14], [-7, 2]], '#3c3229', 1.6); line(c, [[0, -14], [7, 2]], '#3c3229', 1.6); line(c, [[0, -14], [0, 4]], '#3c3229', 1.6); c.save(); c.translate(0, -16); c.rotate(-0.6); rect(c, -11, -2.6, 22, 5.2, '#b8935a'); rect(c, 8, -3.4, 4, 6.8, '#6b5438'); rect(c, -11, -2.6, 22, 1.6, '#dcc089'); c.restore(); });
  def('flag', { w: 20, h: 60, below: 6, anim: true, block: false }, (c, o, t) => {
    const cols = o.cols || ['#2c4564', '#963e43'], wave = Math.sin((t || 0) * 1.4 + (o.v || 0)) * 1.6;
    rect(c, -0.9, -56, 1.8, 56, '#736d54'); rect(c, -0.9, -56, 0.7, 56, '#c1b393'); ell(c, 0, -57, 1.8, 1.8, '#b0a17a'); poly(c, [[-5, 0], [5, 0], [7, 3], [-3, 3]], '#a69f83');
    const top = -54; c.fillStyle = cols[0]; c.beginPath(); c.moveTo(1, top); c.bezierCurveTo(9, top - 2, 17, top + 3 + wave, 24, top + wave); c.lineTo(24, top + 24 + wave); c.bezierCurveTo(15, top + 27 + wave, 8, top + 22, 1, top + 24); c.closePath(); c.fill();
    c.fillStyle = cols[1]; c.beginPath(); c.moveTo(1, top + 17); c.bezierCurveTo(8, top + 15, 17, top + 20 + wave, 24, top + 17 + wave); c.lineTo(24, top + 24 + wave); c.bezierCurveTo(15, top + 27 + wave, 8, top + 22, 1, top + 24); c.closePath(); c.fill();
  });
  def('lantern', { w: 14, h: 44, below: 6, anim: true, block: false, light: [0, -30, 46] }, (c, o, t) => { rect(c, -1, -40, 2, 40, '#5a4630'); line(c, [[0, -40], [10, -37]], '#5a4630', 1.4); const sway = Math.sin((t || 0) * 1.7 + (o.v || 0)) * 1.2; const col = o.col || '#e2a544'; ell(c, 10 + sway, -30, 4.2, 5.4, col); ell(c, 9 + sway, -31, 1.8, 3, '#fff0b8'); rect(c, 8 + sway, -36.5, 4, 1.6, '#3c3229'); rect(c, 8 + sway, -25, 4, 1.4, '#3c3229'); });
  def('fence', { w: 30, h: 16, below: 12 }, (c, o) => { const col = o.col || '#e9e4d2'; for (let i = 0; i < 6; i++) { const x = -25 + i * 10, y = -12.5 + i * 5; rect(c, x - 1.5, y - 13, 3, 14, col); poly(c, [[x - 1.5, y - 13], [x + 1.5, y - 13], [x, y - 16]], shade(col, 10)); } line(c, [[-25, -22], [25, 3]], shade(col, -8), 2.4); line(c, [[-25, -16], [25, 9]], shade(col, -18), 2.4); });
  def('gatepost', { w: 12, h: 44, below: 8 }, (c, o) => { shadow(c, 9, 4, 4, 1, 0.24); const st = o.col || '#a79f88'; box(c, 14, 14, 34, st); box(c, 18, 18, 4, shade(st, 12), 34); ell(c, 0, -43, 4.4, 4.4, shade(st, 18)); });
  def('picnic', { w: 16, h: 6, below: 10, block: false }, (c, o) => { const col = o.col || '#b8483a'; poly(c, [[0, -8], [16, 0], [0, 8], [-16, 0]], '#efe6cf'); for (let i = -2; i <= 2; i++) line(c, [[i * 5 - 8, i * 2.5 - 4 + 4], [i * 5 + 8, i * 2.5 + 4 - 4]], SA.alpha(col, 0.7), 1.6); ell(c, 4, -1, 2.6, 1.8, '#8b6a3f'); ell(c, -5, 1, 1.8, 1.4, '#d9a441'); });
  def('icecart', { w: 16, h: 30, below: 8 }, (c) => { shadow(c, 14, 5, 4, 2, 0.2); box(c, 20, 14, 14, '#eef0ea'); rect(c, -1, -34, 2, 20, '#8d8d86'); poly(c, [[-16, -30], [16, -30], [11, -38], [-11, -38]], '#d2607a'); for (let i = 0; i < 4; i++) rect(c, -12 + i * 7, -37, 3.5, 7, '#f5ecd8'); c.strokeStyle = '#3c3c3c'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(-8, 3, 3.6, 4.2, 0, 0, TAU); c.stroke(); poly(c, [[3, -18], [7, -18], [5, -12]], '#d9a441'); ell(c, 5, -19.5, 2.6, 2.4, '#f6d7df'); });
  def('boat', { w: 20, h: 14, below: 8, anim: true, block: false }, (c, o, t) => { const bob = Math.sin((t || 0) * 1.3 + (o.v || 0)) * 1.2; c.save(); c.translate(0, bob); poly(c, [[-18, -3], [-10, 4], [12, 5], [20, -2], [10, -5], [-10, -6]], o.col || '#7a5234'); poly(c, [[-14, -3], [-9, 1], [11, 2], [16, -2], [9, -3.6], [-9, -4.4]], '#c9b88d'); if (o.sail) { rect(c, -0.8, -34, 1.6, 31, '#5a4630'); poly(c, [[1, -33], [16, -8], [1, -6]], '#f1ead8'); poly(c, [[-1, -30], [-11, -8], [-1, -7]], '#e2d9c2'); } else { line(c, [[-4, -3], [-14, 6]], '#5a4630', 1.2); line(c, [[4, -2], [14, 7]], '#5a4630', 1.2); ell(c, 0, -6, 2.4, 2.6, '#c98a5a'); rect(c, -2.4, -4, 4.8, 4, '#3f5a7a'); } c.restore(); c.strokeStyle = 'rgba(226,243,246,.35)'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 3, 22, 6, 0, 0, Math.PI); c.stroke(); });
  def('stump', { w: 8, h: 8, below: 6 }, (c) => { rect(c, -5, -6, 10, 6, '#6b5438'); c.fillStyle = '#6b5438'; c.beginPath(); c.ellipse(0, 0, 5, 2.4, 0, 0, TAU); c.fill(); c.fillStyle = '#b89a6a'; c.beginPath(); c.ellipse(0, -6, 5, 2.4, 0, 0, TAU); c.fill(); });
  def('goal', { w: 14, h: 22, below: 6 }, (c) => { line(c, [[-12, -4], [-12, -20], [10, -9], [10, 7]], '#f1efe6', 1.8); for (let i = 0; i < 5; i++) line(c, [[-12 + i * 5.5, -18 + i * 2.7], [-12 + i * 5.5, -3 + i * 2.7]], '#f1efe655', 0.7); });
  def('marker', { w: 10, h: 26, below: 8, anim: true, block: false }, (c, o, t) => { const b = Math.sin((t || 0) * 4) * 2.5, col = o.col || '#e7c35a'; c.strokeStyle = SA.alpha(col, 0.8); c.lineWidth = 2; c.beginPath(); c.ellipse(0, 2, 13, 6, 0, 0, TAU); c.stroke(); poly(c, [[-5, -22 + b], [5, -22 + b], [0, -12 + b]], col, '#3c3229'); if (o.done) { c.strokeStyle = '#6ea05b'; c.lineWidth = 3; c.beginPath(); c.moveTo(-5, -5); c.lineTo(-1, 0); c.lineTo(7, -9); c.stroke(); } });
  def('sparkle', { w: 8, h: 20, below: 6, anim: true, block: false }, (c, o, t) => { for (let i = 0; i < 3; i++) { const ph = ((t || 0) * 0.9 + i / 3 + (o.v || 0) * 0.13) % 1, y = -4 - ph * 16, s = Math.sin(ph * Math.PI) * 3.2, x = Math.sin(i * 2.1 + (o.v || 0)) * 5; c.fillStyle = `rgba(255,236,160,${Math.sin(ph * Math.PI)})`; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.35, y); c.lineTo(x, y + s); c.lineTo(x - s * 0.35, y); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x - s, y); c.lineTo(x, y - s * 0.35); c.lineTo(x + s, y); c.lineTo(x, y + s * 0.35); c.closePath(); c.fill(); } });
  def('paintfence', { w: 30, h: 16, below: 12 }, (c, o) => { defs.fence.draw(c, { col: o.col || '#c7483a' }); });
  def('tram', { w: 44, h: 34, below: 16, block: false }, (c, o) => { const col = o.col || '#5d7a55'; c.save(); c.transform(1, 0.5, 0, 1, 0, 0); rect(c, -38, -30, 76, 24, col); rect(c, -38, -30, 76, 5, shade(col, 26)); for (let i = 0; i < 6; i++) rect(c, -34 + i * 12, -23, 8.5, 9, '#d7e3df'); rect(c, -38, -8, 76, 3, '#2f2f2f'); c.restore(); line(c, [[-10, -34], [-4, -54]], '#3c3c3c', 1.2); ell(c, -28, -8, 4, 4.4, '#2a2a2a'); ell(c, 22, 17, 4, 4.4, '#2a2a2a'); });
  def('car', { w: 26, h: 20, below: 12, block: false }, (c, o) => { const col = o.col || '#6b7f8c', era = o.era || 1990; shadow(c, 22, 7, 2, 4, 0.22); c.save(); if (o.flip) c.scale(-1, 1); c.transform(1, 0.5, 0, 1, 0, 0); if (era < 1930) { rect(c, -14, -15, 24, 8, '#4a3b2b'); rect(c, -6, -24, 13, 10, '#2f2a25'); rect(c, -4, -22, 9, 6, '#cfd8d3'); } else { rect(c, -22, -13, 44, 9, col); rect(c, -22, -13, 44, 2.4, shade(col, 26)); const r = era < 1985 ? [-11, -21, 24, 9] : [-13, -20, 27, 8]; rect(c, r[0], r[1], r[2], r[3], shade(col, -10)); rect(c, r[0] + 2, r[1] + 1.6, r[2] - 4, r[3] - 3, '#cfdcdc'); rect(c, r[0] + r[2] / 2 - 0.8, r[1] + 1.6, 1.6, r[3] - 3, shade(col, -10)); } c.restore(); c.save(); if (o.flip) c.scale(-1, 1); ell(c, -13, -9, 3.6, 4, '#222'); ell(c, 12, 3.5, 3.6, 4, '#222'); c.restore(); });
  def('scooter', { w: 8, h: 18, below: 6, block: false }, (c) => { line(c, [[-6, 0], [6, 4]], '#4a4a4a', 2); line(c, [[5, 4], [3, -13]], '#6fae9a', 1.8); line(c, [[1, -13], [6, -12]], '#333', 1.6); ell(c, -6, 1, 2, 2.2, '#222'); ell(c, 6, 5, 2, 2.2, '#222'); });
  def('solar', { w: 18, h: 16, below: 8 }, (c) => { shadow(c, 14, 5, 4, 2, 0.18); rect(c, -1, -8, 2, 10, '#6c6c66'); poly(c, [[-14, -10], [8, 0], [14, -10], [-8, -20]], '#27405e', '#9fb2c2'); for (let i = 1; i < 4; i++) line(c, [[-14 + i * 5.5, -10 + i * 2.5], [-8 + i * 5.5, -20 + i * 2.5]], '#6d8aa6', 0.6); });
  def('phonebox', { w: 9, h: 34, below: 6 }, (c) => { shadow(c, 8, 3, 3, 1, 0.22); box(c, 11, 11, 30, '#7d8f8a'); rect(c, -4.4, -27, 4.6, 17, '#cfdcdc'); rect(c, -4.4, -32, 8.8, 3, '#2f4a5a'); });
  def('piper', { w: 8, h: 26, below: 6, anim: true, block: false }, () => {});

  PAL.lilac = ['#6a4c86', '#9372b0', '#c9aee0'];
  def('lilac', { w: 44, h: 88, below: 16 }, (c, o) => broadleaf(c, { ...o, leaves: true }, PAL.lilac, 0.8));
  def('cube', { w: 22, h: 44, below: 10, anim: true }, (c, o, t) => { shadow(c, 16, 6, 5, 2, 0.24); const a = (o.spin || 0) + (o.spinning ? (t || 0) * 1.4 : 0), k = Math.cos(a), col = '#2f3336'; c.save(); c.translate(0, -22); poly(c, [[0, -22], [18 * Math.abs(k) + 3, -6], [0, 12], [-18 * Math.abs(Math.sin(a)) - 3, -6]], col); poly(c, [[0, -22], [18 * Math.abs(k) + 3, -6], [0, -2]], shade(col, 26)); poly(c, [[0, -22], [-18 * Math.abs(Math.sin(a)) - 3, -6], [0, -2]], shade(col, 12)); c.restore(); });
  def('cannon', { w: 10, h: 12, below: 6 }, (c) => { shadow(c, 9, 4, 3, 1, 0.22); c.fillStyle = '#6f6c62'; c.beginPath(); c.ellipse(0, -1, 9, 4.5, 0, 0, TAU); c.fill(); rect(c, -3.4, -11, 6.8, 10, '#3a3d3a'); c.fillStyle = '#4b4f4b'; c.beginPath(); c.ellipse(0, -11, 3.4, 1.7, 0, 0, TAU); c.fill(); });
  def('duck', { w: 6, h: 8, below: 4, anim: true, block: false }, (c, o, t) => { const b = Math.sin((t || 0) * 2 + (o.v || 0)) * 0.8; ell(c, 0, b, 4.2, 2.6, o.col || '#e9e4d2'); ell(c, 3.2, -2.6 + b, 1.9, 1.8, o.col || '#e9e4d2'); poly(c, [[4.8, -2.6 + b], [7, -2 + b], [4.8, -1.6 + b]], '#d9952e'); c.strokeStyle = 'rgba(226,243,246,.4)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(0, 1.5, 6.5, 2.4, 0, 0, Math.PI); c.stroke(); });

  def('leaves', { w: 16, h: 4, below: 10, block: false }, (c, o) => { const s = o.v || 1, cols = ['#c0672c', '#e2a544', '#a5422f', '#d9a441']; for (let i = 0; i < 16; i++) { const a = hash(s, i) * TAU, r = Math.sqrt(hash(s, i, 2)); c.fillStyle = cols[i % 4]; c.fillRect(Math.cos(a) * 15 * r, Math.sin(a) * 6.5 * r, 2.4, 1.4); } });
  def('tuft', { w: 12, h: 10, below: 6, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 9; i++) { const x = -9 + hash(s, i) * 18, y = -3 + hash(s, i, 2) * 6; line(c, [[x, y], [x + (hash(s, i, 3) - 0.5) * 4, y - 5 - hash(s, i, 4) * 5]], i % 2 ? '#8fae5a' : '#4f6e3a', 1.1); } });
  def('mushrooms', { w: 8, h: 6, below: 5, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 3; i++) { const x = -5 + i * 5, y = hash(s, i) * 3; rect(c, x - 0.6, y - 3, 1.2, 3, '#e9e2cf'); ell(c, x, y - 3.4, 2.4, 1.5, i % 2 ? '#b8483a' : '#c98a4a'); } });

  // ---------- finer environmental detail ----------
  def('planter', { w: 10, h: 20, below: 6 }, (c, o) => { shadow(c, 8, 3, 3, 1, 0.22); const s = o.v || 1; poly(c, [[-7, -9], [7, -9], [5, 0], [-5, 0]], '#9a6f4e'); poly(c, [[-7, -9], [-2, -9], [-2, 0], [-5, 0]], '#b98a62'); rect(c, -7.6, -10.4, 15.2, 2, '#7d573b'); canopy(c, 0, -15, 8, 6.5, o.flower ? PAL.cherry : PAL.lime, s, 4); if (o.flower) for (let i = 0; i < 5; i++) ell(c, -5 + hash(s, i) * 10, -17 + hash(s, i, 2) * 5, 1.3, 1.1, ['#f1e9d8', '#e7c35a', '#d9624e'][i % 3]); });
  def('topiary', { w: 10, h: 30, below: 6 }, (c, o) => { shadow(c, 8, 3, 3, 1, 0.22); rect(c, -1.2, -10, 2.4, 10, '#5a4630'); canopy(c, 0, -15, 7.5, 6.5, PAL.cypress, o.v || 1, 5); canopy(c, 0, -25, 5, 4.4, PAL.cypress, (o.v || 1) + 3, 4); });
  def('flowerbush', { w: 14, h: 18, below: 8 }, (c, o) => { const s = o.v || 1; shadow(c, 11, 4, 4, 2, 0.2); canopy(c, 0, -8, 11, 9, PAL.oak, s, 6); const cols = o.cols || ['#e58fb0', '#f3c6d1', '#f1e9d8']; for (let i = 0; i < 12; i++) { const a = hash(s, i, 5) * TAU, r = Math.sqrt(hash(s, i, 6)); ell(c, Math.cos(a) * 9 * r - 1, -9 + Math.sin(a) * 7 * r, 1.6, 1.4, cols[i % cols.length]); } });
  def('fern', { w: 10, h: 10, below: 6, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 7; i++) { const a = -Math.PI + (i / 6) * Math.PI, len = 8 + hash(s, i) * 4; c.strokeStyle = i % 2 ? '#4f7a3f' : '#6f9a55'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a) * len * 0.6, Math.sin(a) * len * 0.5 - 4, Math.cos(a) * len, Math.sin(a) * len * 0.45 - 1); c.stroke(); } });
  def('log', { w: 14, h: 8, below: 6 }, (c) => { shadow(c, 12, 3, 3, 2, 0.2); poly(c, [[-12, -5], [8, 3], [10, -1], [-10, -9]], '#6b5438'); poly(c, [[-12, -5], [8, 3], [8, 5], [-12, -3]], '#4d3d29'); ell(c, 9, 1, 2.6, 3.4, '#b89a6a'); ell(c, 9, 1, 1.2, 1.6, '#8a6f48'); });
  def('pumpkins', { w: 10, h: 8, below: 6, block: false }, (c, o) => { const s = o.v || 1; for (let i = 0; i < 3; i++) { const x = -6 + i * 6 + hash(s, i) * 2, y = hash(s, i, 2) * 3, r = 3 + hash(s, i, 3) * 1.4; ell(c, x + 1, y + 1, r, r * 0.4, 'rgba(20,30,18,.25)'); ell(c, x, y - r * 0.6, r, r * 0.78, '#d9772e'); ell(c, x - r * 0.3, y - r * 0.7, r * 0.4, r * 0.6, '#eb9a48'); rect(c, x - 0.5, y - r * 1.5, 1, 1.6, '#4f6e3a'); } });
  def('snowpile', { w: 14, h: 8, below: 6, block: false }, (c) => { ell(c, 2, 1, 13, 4, 'rgba(60,80,110,.2)'); ell(c, 0, -3, 12, 5.5, '#f2f5f3'); ell(c, -3, -5, 6, 3, '#ffffff'); });
  def('puddle', { w: 14, h: 4, below: 6, block: false }, (c) => { ell(c, 0, 0, 13, 5, 'rgba(90,130,150,.42)'); ell(c, -3, -1, 6, 2, 'rgba(210,235,240,.4)'); });
  def('bin', { w: 6, h: 14, below: 5 }, (c, o) => { shadow(c, 6, 2.4, 2, 1, 0.22); rect(c, -4, -11, 8, 11, o.col || '#3f5446'); rect(c, -4, -11, 2.4, 11, '#56705e'); ell(c, 0, -11, 4, 1.8, '#2f4034'); });
  def('bollard', { w: 4, h: 12, below: 4, block: false }, (c) => { shadow(c, 4, 1.6, 1, 1, 0.2); rect(c, -1.8, -10, 3.6, 10, '#4a4f4c'); ell(c, 0, -10, 2.2, 1.3, '#6c726e'); });
  def('hydrant', { w: 5, h: 12, below: 4 }, (c) => { shadow(c, 5, 2, 2, 1, 0.22); rect(c, -2.6, -9, 5.2, 9, '#b8483a'); ell(c, 0, -9.5, 3, 2, '#d0604e'); rect(c, -4.4, -6.4, 8.8, 2, '#9c3b30'); });
  def('mailbox', { w: 6, h: 18, below: 5 }, (c, o) => { shadow(c, 6, 2.4, 2, 1, 0.22); rect(c, -1, -6, 2, 6, '#3c3c3c'); c.fillStyle = o.col || '#2f4f7a'; c.beginPath(); c.roundRect(-4.6, -17, 9.2, 11, [4, 4, 1, 1]); c.fill(); rect(c, -3, -13, 6, 1.2, '#1f3350'); });
  def('birdbath', { w: 8, h: 16, below: 5 }, (c) => { shadow(c, 8, 3, 3, 1, 0.2); rect(c, -1.6, -10, 3.2, 10, '#a9a391'); ell(c, 0, -11, 8, 3.4, '#bdb7a2'); ell(c, 0, -11.6, 6, 2.2, '#6fa3b0'); });
  def('laundry', { w: 30, h: 34, below: 8, anim: true, block: false }, (c, o, t) => { rect(c, -27, -30, 1.6, 30, '#5a4630'); rect(c, 25, -17, 1.6, 30, '#5a4630'); line(c, [[-26, -29], [26, -16]], '#3c3229', 0.8); const cols = ['#e9e4d2', '#9fb4c8', '#d9b8a0', '#f1ead8', '#b98a8a']; for (let i = 0; i < 5; i++) { const x = -21 + i * 9.4, y = -27.6 + i * 2.35, sw = Math.sin((t || 0) * 1.8 + i + (o.v || 0)) * 1.6; poly(c, [[x, y], [x + 7, y + 1.75], [x + 7 + sw, y + 12], [x + sw, y + 10.25]], cols[i % 5]); } });
  def('reader', { w: 10, h: 16, below: 8, block: false }, (c, o) => { const s = o.v || 1, top = ['#7c2f2f', '#2f5a7c', '#49683b', '#8a6b22', '#5b4a7a'][s % 5]; ell(c, 1, 2, 9, 3, 'rgba(20,30,18,.25)'); rect(c, -7, -1, 9, 3, '#3b3f52'); c.fillStyle = top; c.beginPath(); c.roundRect(-1, -9, 7, 9, 2.4); c.fill(); ell(c, 2.6, -12, 3.3, 3.5, ['#f0c9a4', '#c68a5c', '#7d4f33'][s % 3]); ell(c, 2.6, -13.4, 3.5, 2.4, ['#2a211b', '#7a5230', '#b88a4a'][s % 3]); poly(c, [[-5, -6], [0, -4.6], [0, -1], [-5, -2.4]], '#e8dfc6'); });
  def('picnicgroup', { w: 22, h: 18, below: 12, block: false }, (c, o) => { defs.picnic.draw(c, o); c.save(); c.translate(-9, -1); defs.reader.draw(c, { v: (o.v || 1) + 1 }); c.restore(); c.save(); c.translate(11, 3); c.scale(-1, 1); defs.reader.draw(c, { v: (o.v || 1) + 3 }); c.restore(); });
  def('easel', { w: 10, h: 26, below: 6 }, (c, o) => { shadow(c, 8, 3, 3, 1, 0.2); line(c, [[-6, 2], [-2, -22]], '#6b5438', 1.4); line(c, [[6, 2], [2, -22]], '#6b5438', 1.4); line(c, [[0, 3], [0, -20]], '#6b5438', 1.4); rect(c, -7, -21, 14, 11, '#f1ead8'); rect(c, -5.4, -19.4, 10.8, 5, '#9fc0d0'); rect(c, -5.4, -14.4, 10.8, 2.8, '#7c9a55'); void o; });
  def('stoop', { w: 12, h: 8, below: 8, block: false }, (c, o) => { const st = o.col || '#b3ab93'; for (let i = 0; i < 3; i++) { const y = i * 3.2, w = 10 + i * 2.4; poly(c, [[-w, y - 4], [0, y + 1], [w, y - 4], [0, y - 9]], shade(st, 8 - i * 6)); poly(c, [[-w, y - 4], [0, y + 1], [0, y + 3.4], [-w, y - 1.6]], shade(st, -18)); poly(c, [[0, y + 1], [w, y - 4], [w, y - 1.6], [0, y + 3.4]], shade(st, -30)); } });

  SA.Props = { defs, PAL, get: (k) => defs[k] };
})();
