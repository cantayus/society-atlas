/* The Society Atlas V2 — sound. Everything is synthesized in the browser with Web Audio:
   no recordings, no samples, no licences. Four channels: music, ambience, effects, voice. */
(function () {
  'use strict';
  const SA = window.SA;
  const A = { ctx: null, ready: false, levels: { music: 0.5, ambience: 0.5, effects: 0.6, voice: 0.6, muted: false } };
  let master, bus = {}, reverb, noiseBuf, amb = {}, ambTimer = null, ambState = null, duckT = 0;

  function ensure() {
    if (A.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    const ctx = (A.ctx = new AC());
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    for (const k of ['music', 'ambience', 'effects', 'voice']) { bus[k] = ctx.createGain(); bus[k].connect(master); }
    // a small hall, generated: decaying filtered noise
    const len = Math.floor(ctx.sampleRate * 2.4), imp = ctx.createBuffer(2, len, ctx.sampleRate), rnd = SA.rng(91);
    for (let ch = 0; ch < 2; ch++) { const d = imp.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { const n = rnd() * 2 - 1; lp += (n - lp) * 0.35; d[i] = lp * Math.pow(1 - i / len, 2.6) * (i < 400 ? i / 400 : 1); } }
    reverb = ctx.createConvolver(); reverb.buffer = imp; const wet = ctx.createGain(); wet.gain.value = 0.34; reverb.connect(wet); wet.connect(bus.music);
    A.reverb = reverb; A.bus = bus;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noiseBuf.getChannelData(0), r2 = SA.rng(5); for (let i = 0; i < nd.length; i++) nd[i] = r2() * 2 - 1;
    A.noiseBuf = noiseBuf; A.setLevels(A.levels); A.ready = true; return true;
  }
  A.unlock = () => { if (!ensure()) return false; if (A.ctx.state === 'suspended') A.ctx.resume(); return true; };
  A.setLevels = (s) => {
    A.levels = { music: s.music, ambience: s.ambience, effects: s.effects, voice: s.voice, muted: s.muted };
    if (!A.ctx) return; const t = A.ctx.currentTime, m = s.muted ? 0 : 1;
    bus.music.gain.setTargetAtTime(m * s.music * 0.55, t, 0.08); bus.ambience.gain.setTargetAtTime(m * s.ambience * 0.5, t, 0.08);
    bus.effects.gain.setTargetAtTime(m * s.effects * 0.7, t, 0.05); bus.voice.gain.setTargetAtTime(m * s.voice * 0.6, t, 0.05);
  };
  A.duck = (seconds = 1.2) => { if (!A.ctx) return; const t = A.ctx.currentTime, g = bus.music.gain, base = (A.levels.muted ? 0 : 1) * A.levels.music * 0.55; duckT = t + seconds; g.cancelScheduledValues(t); g.setTargetAtTime(base * 0.45, t, 0.06); g.setTargetAtTime(base, t + seconds, 0.5); };

  // ---------- small synth helpers ----------
  const env = (g, t, a, d, peak, sustain = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), t + a + d); };
  function tone(freq, dur, o = {}) {
    const ctx = A.ctx, t = (o.at || ctx.currentTime) + (o.delay || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(freq, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    env(g, t, o.attack || 0.005, dur, o.vol || 0.2); osc.connect(g); g.connect(o.bus || bus.effects); osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(dur, o = {}) {
    const ctx = A.ctx, t = (o.at || ctx.currentTime) + (o.delay || 0), src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true; f.type = o.filter || 'bandpass'; f.frequency.setValueAtTime(o.freq || 1200, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur); f.Q.value = o.q || 0.8;
    env(g, t, o.attack || 0.004, dur, o.vol || 0.2); src.connect(f); f.connect(g); g.connect(o.bus || bus.effects); src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.05);
  }
  A.tone = tone; A.noise = noise;

  const SFX = {
    click: () => { tone(520, 0.05, { type: 'triangle', vol: 0.12 }); noise(0.03, { freq: 2600, vol: 0.06 }); },
    hover: () => tone(880, 0.03, { type: 'sine', vol: 0.035 }),
    open: () => { noise(0.22, { freq: 500, to: 1600, vol: 0.09, q: 0.5 }); tone(330, 0.12, { type: 'triangle', vol: 0.06, delay: 0.03 }); },
    close: () => noise(0.16, { freq: 1500, to: 420, vol: 0.08, q: 0.5 }),
    page: () => { noise(0.18, { freq: 3200, to: 900, vol: 0.1, q: 0.6 }); noise(0.07, { freq: 5200, vol: 0.05, delay: 0.1 }); },
    pencil: () => { for (let i = 0; i < 4; i++) noise(0.05, { freq: 3800 + i * 300, vol: 0.06, delay: i * 0.07, q: 2 }); },
    step: (surface) => { const m = { grass: [420, 0.045, 0.6], stone: [1500, 0.06, 1.6], wood: [700, 0.07, 2.4], snow: [900, 0.07, 0.4], gravel: [2400, 0.05, 0.9] }[surface] || [900, 0.05, 1]; noise(0.06, { freq: m[0] * (0.9 + Math.random() * 0.2), vol: m[1], q: m[2], filter: 'bandpass' }); if (surface === 'snow') noise(0.09, { freq: 300, vol: 0.03 }); },
    chime: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.9, { type: 'sine', vol: 0.13, delay: i * 0.09 })),
    success: () => { [392, 493.88, 587.33, 783.99].forEach((f, i) => { tone(f, 1.1, { type: 'triangle', vol: 0.12, delay: i * 0.12 }); tone(f * 2, 0.7, { vol: 0.04, delay: i * 0.12 }); }); },
    error: () => { tone(196, 0.22, { type: 'triangle', vol: 0.16, to: 150 }); noise(0.1, { freq: 300, vol: 0.08 }); },
    quest: () => { tone(440, 0.25, { type: 'triangle', vol: 0.12 }); tone(659.25, 0.5, { type: 'triangle', vol: 0.12, delay: 0.14 }); },
    coin: () => { tone(1568, 0.09, { vol: 0.1 }); tone(2093, 0.3, { vol: 0.1, delay: 0.07 }); },
    collect: () => { tone(880, 0.12, { vol: 0.1 }); tone(1174.66, 0.12, { vol: 0.1, delay: 0.08 }); tone(1760, 0.35, { vol: 0.08, delay: 0.16 }); },
    bell: () => { const f = 196; [[1, 0.24], [2.0, 0.14], [2.76, 0.1], [5.4, 0.05], [8.93, 0.03]].forEach(([m, v]) => tone(f * m, 3.4, { vol: v, attack: 0.004 })); noise(0.05, { freq: 2200, vol: 0.08 }); },
    smallbell: () => [[1, 0.16], [2.76, 0.07], [5.4, 0.03]].forEach(([m, v]) => tone(1320 * m, 1.1, { vol: v })),
    door: () => { noise(0.3, { freq: 240, to: 520, vol: 0.12, q: 3 }); tone(110, 0.12, { type: 'triangle', vol: 0.12, delay: 0.26 }); },
    flutter: () => { for (let i = 0; i < 9; i++) noise(0.04, { freq: 1800 + Math.random() * 1400, vol: 0.07, delay: i * 0.045, q: 1.4 }); },
    splash: () => { noise(0.45, { freq: 900, to: 300, vol: 0.14, q: 0.6 }); noise(0.2, { freq: 3200, vol: 0.05, delay: 0.05 }); },
    purr: () => { for (let i = 0; i < 14; i++) tone(27 + (i % 2) * 2, 0.07, { type: 'sawtooth', vol: 0.11, delay: i * 0.075 }); },
    chitter: () => { for (let i = 0; i < 5; i++) tone(2400 + Math.random() * 900, 0.03, { type: 'square', vol: 0.03, delay: i * 0.05 }); },
    whoosh: () => noise(0.9, { freq: 300, to: 2600, vol: 0.14, q: 0.7, attack: 0.3 }),
    paint: () => noise(0.5, { freq: 1200, to: 2400, vol: 0.08, q: 0.4, attack: 0.1 }),
    tram: () => { SFX.smallbell(); setTimeout(() => A.ctx && SFX.smallbell(), 260); },
    pipes: () => { [293.66, 440].forEach((f) => tone(f, 1.6, { type: 'sawtooth', vol: 0.03, attack: 0.2 })); [587.33, 659.25, 739.99, 659.25].forEach((f, i) => tone(f, 0.3, { type: 'square', vol: 0.035, delay: 0.2 + i * 0.3, attack: 0.02 })); },
    blip: (pitch = 520) => tone(pitch * (0.94 + Math.random() * 0.12), 0.045, { type: 'triangle', vol: 0.085, bus: bus.voice }),
    rank: () => { [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 1.3, { type: 'triangle', vol: 0.11, delay: i * 0.1 })); SFX.smallbell(); },
    stamp: () => { tone(120, 0.1, { type: 'triangle', vol: 0.2 }); noise(0.06, { freq: 700, vol: 0.12 }); },
    drum: () => { tone(95, 0.22, { to: 60, vol: 0.2 }); noise(0.08, { freq: 220, vol: 0.1, filter: 'lowpass' }); },
  };
  A.sfx = (name, arg) => { if (!A.ctx || A.levels.muted || A.ctx.state !== 'running') return; const f = SFX[name]; if (f) try { f(arg); } catch (e) { /* audio is best-effort */ } };

  // ---------- ambience: wind, water, birds, crickets, crowd, rain ----------
  function loop(freq, q, type = 'bandpass') {
    const ctx = A.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; src.connect(f); f.connect(g); g.connect(bus.ambience); src.start();
    return { g, f };
  }
  A.ambience = (s) => {                                       // s: {season, hour, water (0..1), crowd (0..1), rain, city}
    if (!A.ctx) return; ambState = s;
    if (!amb.wind) { amb.wind = loop(420, 0.4); amb.water = loop(1500, 0.5); amb.rain = loop(3400, 0.3, 'highpass'); amb.crowd = loop(520, 1.1); }
    const t = A.ctx.currentTime, night = s.hour < 5.5 || s.hour > 20.5, winter = s.season === 'winter';
    amb.wind.g.gain.setTargetAtTime(winter ? 0.2 : night ? 0.07 : 0.1, t, 1.5); amb.wind.f.frequency.setTargetAtTime(winter ? 620 : 380, t, 2);
    amb.water.g.gain.setTargetAtTime((s.water || 0) * 0.16, t, 0.8); amb.rain.g.gain.setTargetAtTime(s.rain ? 0.13 : 0, t, 1.5); amb.crowd.g.gain.setTargetAtTime((s.crowd || 0) * 0.07, t, 1.2);
    if (!ambTimer) ambTimer = setInterval(() => {
      const st = ambState; if (!st || !A.ctx || A.ctx.state !== 'running' || A.levels.muted) return;
      const nightNow = st.hour < 5.5 || st.hour > 20.5, r = Math.random();
      if (!nightNow && st.season !== 'winter' && r < 0.5) {                 // birdsong
        const base = 2200 + Math.random() * 2400, n = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) tone(base * (1 + (Math.random() - 0.5) * 0.25), 0.07 + Math.random() * 0.06, { vol: 0.03 + Math.random() * 0.03, delay: i * 0.11, to: base * (0.8 + Math.random() * 0.5), bus: bus.ambience });
      } else if (nightNow && st.season !== 'winter' && r < 0.75) {           // crickets
        for (let i = 0; i < 6; i++) tone(4300 + Math.random() * 200, 0.03, { type: 'square', vol: 0.012, delay: i * 0.055, bus: bus.ambience });
      } else if (st.season === 'winter' && r < 0.15) tone(1900, 0.5, { vol: 0.012, to: 1500, bus: bus.ambience });   // a distant crow
      if (st.city && r > 0.93) noise(1.6, { freq: 160, vol: 0.05, attack: 0.6, bus: bus.ambience });                // far traffic
    }, 1400);
  };
  A.ambienceStop = () => { if (!A.ctx) return; const t = A.ctx.currentTime; for (const k of Object.keys(amb)) amb[k].g.gain.setTargetAtTime(0, t, 0.4); ambState = null; };

  SA.Audio = A;
})();
