/* The Society Atlas V2 — core: namespace, maths, events, save.
   Original code. Runs as a plain script; no build step, no dependencies. */
(function () {
  'use strict';
  const host = typeof window !== 'undefined' ? window : globalThis;
  const SA = (host.SA = host.SA || {});

  SA.TW = 60;
  SA.TH = 30;
  SA.VERSION = '2.0.0';

  // ---------- maths ----------
  SA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SA.lerp = (a, b, t) => a + (b - a) * t;
  SA.rng = (seed) => {
    let x = (Number(seed) || 1) >>> 0;
    return () => {
      x += 0x6d2b79f5;
      let t = x;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  SA.hash = (x, y = 0, s = 0) => {
    let n = (Math.imul(Math.round(x) + 1013, 374761393) + Math.imul(Math.round(y) + 71, 668265263) + Math.imul(s + 7, 2246822519)) >>> 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  SA.strSeed = (s) => {
    let h = 2166136261;
    for (let i = 0; i < String(s).length; i++) h = Math.imul(h ^ String(s).charCodeAt(i), 16777619);
    return h >>> 0;
  };
  // smooth value noise in [0,1]
  SA.noise = (x, y, s = 0) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = SA.hash(xi, yi, s), b = SA.hash(xi + 1, yi, s), c = SA.hash(xi, yi + 1, s), d = SA.hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  // ---------- colour ----------
  const hex2 = (v) => Math.round(SA.clamp(v, 0, 255)).toString(16).padStart(2, '0');
  SA.rgb = (hex) => {
    const c = hex.replace('#', '');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  SA.shade = (hex, n) => '#' + SA.rgb(hex).map((v) => hex2(v + n)).join('');
  SA.mix = (a, b, t) => {
    const A = SA.rgb(a), B = SA.rgb(b);
    return '#' + A.map((v, i) => hex2(v + (B[i] - v) * t)).join('');
  };
  SA.alpha = (hex, a) => {
    const [r, g, b] = SA.rgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };

  // ---------- isometric ----------
  SA.iso = (x, y) => ({ x: ((x - y) * SA.TW) / 2, y: ((x + y) * SA.TH) / 2 });
  SA.uniso = (px, py) => ({ x: py / SA.TH + px / SA.TW, y: py / SA.TH - px / SA.TW });

  SA.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // ---------- events ----------
  const listeners = {};
  SA.on = (name, fn) => ((listeners[name] = listeners[name] || []).push(fn), () => SA.off(name, fn));
  SA.off = (name, fn) => {
    const l = listeners[name];
    if (l) listeners[name] = l.filter((f) => f !== fn);
  };
  SA.emit = (name, data) => {
    for (const fn of listeners[name] || []) {
      try { fn(data); } catch (err) { if (host.console) console.error('[atlas] listener ' + name, err); }
    }
  };

  // ---------- save ----------
  const KEY = 'society-atlas-v2';
  const V1_KEY = 'society-atlas-v1';
  const defaults = () => ({
    music: 0.5, ambience: 0.5, effects: 0.6, voice: 0.6, muted: false, reduced: false, large: false,
    speed: 1, follow: true, weather: true, relaxed: false, guidance: 2, speech: false, daynight: true,
    keys: { up: 'w', left: 'a', down: 's', right: 'd', interact: 'e', center: 'c', run: 'shift' },
  });
  SA.blankSave = () => ({
    version: 2, started: false, createdAt: null,
    player: { name: 'You', look: 0 }, mentor: 'ines',
    current: 1, completed: [], found: [], clues: [], evidence: [], puzzles: {}, challenges: {},
    tasks: {}, talked: {}, contacts: [], explored: {},
    collect: { sketches: {}, stamps: [], cards: [], cats: [], pokes: {} },
    achievements: {}, quests: {}, gazette: [], events: [], bonus: 0, spent: 0, owned: [], equipped: {},
    stats: { steps: 0, pokes: 0, lines: 0, travel: 0 }, clock: 9.5, mentorLog: [],
    proposal: null, tutorial: { completed: false }, importedV1: false, settings: defaults(),
  });

  // Copy a V1 journey into a V2 save. The V1 record is read, never written.
  SA.migrateV1 = (v1) => {
    const s = SA.blankSave();
    if (!v1 || v1.version !== 1) return s;
    const ids = (a) => (Array.isArray(a) ? a.filter((n) => Number.isInteger(n) && n >= 1 && n <= 18) : []);
    s.started = !!v1.started;
    s.current = Number.isInteger(v1.current) && v1.current >= 1 && v1.current <= 18 ? v1.current : 1;
    s.completed = [...new Set(ids(v1.completed))];
    s.found = [...new Set([...ids(v1.found), ...s.completed])];
    s.clues = [...new Set(ids(v1.clues))];
    s.evidence = Array.isArray(v1.evidence) ? v1.evidence.filter((e) => e && Number.isInteger(e.id)).map((e) => ({ id: e.id, text: String(e.text || ''), date: e.date || null })) : [];
    s.puzzles = v1.puzzles && typeof v1.puzzles === 'object' ? JSON.parse(JSON.stringify(v1.puzzles)) : {};
    s.challenges = v1.challenges && typeof v1.challenges === 'object' ? JSON.parse(JSON.stringify(v1.challenges)) : {};
    s.proposal = v1.proposal || null;
    s.tutorial = { completed: v1.tutorial?.completed === true };
    s.contacts = s.completed.slice();
    const st = v1.settings || {};
    for (const k of ['muted', 'reduced', 'large', 'speed', 'follow', 'weather']) if (k in st) s.settings[k] = st[k];
    if (st.keys && typeof st.keys === 'object') s.settings.keys = { ...s.settings.keys, ...st.keys };
    s.importedV1 = true;
    return s;
  };

  SA.normalizeSave = (raw) => {
    const base = SA.blankSave();
    if (!raw || typeof raw !== 'object' || raw.version !== 2) return base;
    const out = { ...base, ...raw };
    out.settings = { ...base.settings, ...(raw.settings || {}) };
    out.settings.keys = { ...base.settings.keys, ...((raw.settings || {}).keys || {}) };
    out.collect = { ...base.collect, ...(raw.collect || {}) };
    out.stats = { ...base.stats, ...(raw.stats || {}) };
    out.player = { ...base.player, ...(raw.player || {}) };
    for (const k of ['completed', 'found', 'clues', 'evidence', 'contacts', 'gazette', 'events', 'owned', 'mentorLog']) if (!Array.isArray(out[k])) out[k] = [];
    for (const k of ['puzzles', 'challenges', 'tasks', 'talked', 'explored', 'achievements', 'quests', 'equipped']) if (!out[k] || typeof out[k] !== 'object') out[k] = {};
    return out;
  };

  SA.loadSave = (storage) => {
    let raw = null, v1 = null;
    try { raw = JSON.parse(storage.getItem(KEY)); } catch (e) { raw = null; }
    if (raw && raw.version === 2) return SA.normalizeSave(raw);
    try { v1 = JSON.parse(storage.getItem(V1_KEY)); } catch (e) { v1 = null; }
    return v1 && v1.version === 1 && v1.started ? SA.migrateV1(v1) : SA.blankSave();
  };

  let persistTimer = null;
  SA.persist = (now) => {
    if (typeof localStorage === 'undefined') return;
    const write = () => {
      persistTimer = null;
      try { localStorage.setItem(KEY, JSON.stringify(SA.save)); SA.emit('saved'); } catch (e) { SA.emit('save-failed'); }
    };
    if (now) { clearTimeout(persistTimer); write(); } else if (!persistTimer) persistTimer = setTimeout(write, 700);
  };
  SA.KEY = KEY;
  SA.V1_KEY = V1_KEY;
  SA.defaultSettings = defaults;

  if (typeof module !== 'undefined' && module.exports) module.exports = SA;
})();
