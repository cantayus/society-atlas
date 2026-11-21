/* The Society Atlas V2 — original music in a medieval idiom, one piece per university.
   Every melody below was written for this game (modal tunes with open and closed
   cadences, in the manner of estampies, cantigas and plainsong). Nothing is sampled:
   plucked strings use Karplus–Strong synthesis, winds and organ are additive, and
   the mix runs through a generated hall reverb, a tempo echo and a compressor. */
(function () {
  'use strict';
  const SA = window.SA;
  const MODES = { dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], ionian: [0, 2, 4, 5, 7, 9, 11], phrygian: [0, 1, 4, 5, 7, 8, 10] };
  // Each phrase is four bars. Notes are degree.length, lengths in eighth notes; 0 is the note below the final, r is a rest.
  const SCORES = {
    menu: { title: 'The Atlas Opens', mode: 'dorian', final: 62, bar: 6, bpm: 66, lead: 'recorder', comp: 'harp', drone: 'vielle', perc: null, voice2: 'sixth',
      A: '1.2 2.2 3.2 5.4 4.2 3.2 2.2 1.2 2.6', A2: '1.2 2.2 3.2 5.4 6.2 5.2 3.2 2.2 1.6', B: '8.4 7.2 6.2 5.4 6.2 5.2 4.2 5.6', B2: '8.4 7.2 6.2 5.2 3.2 4.2 3.2 2.2 1.6' },
    penn: { title: 'Seventh Ward Morning', mode: 'dorian', final: 62, bar: 6, bpm: 72, lead: 'psaltery', comp: 'lute', drone: null, perc: null, voice2: null, mood: 'Plain and gentle, for a Quaker city',
      A: '1.2 3.2 4.2 5.4 4.2 3.2 4.2 2.2 5.6', A2: '1.2 3.2 4.2 5.4 4.2 3.2 2.2 0.2 1.6', B: '5.2 6.2 8.2 7.4 5.2 6.2 5.2 4.2 5.6', B2: '5.2 6.2 8.2 7.4 5.2 4.2 3.2 2.2 1.6' },
    harvard: { title: 'Pavane for the Yard', mode: 'dorian', final: 55, bar: 8, bpm: 76, lead: 'recorder', comp: 'lute', drone: 'vielle', perc: null, voice2: 'sixth', mood: 'A stately pavane under old elms',
      A: '1.4 2.2 3.2 4.4 3.2 2.2 3.2 4.2 5.4 4.2 3.2 2.4', A2: '1.4 2.2 3.2 4.4 3.2 2.2 3.2 1.2 2.3 0.1 1.8', B: '5.4 5.2 6.2 7.4 6.2 5.2 6.2 5.2 4.2 3.2 4.4 5.4', B2: '8.4 7.2 6.2 5.4 4.2 3.2 4.2 3.2 2.3 0.1 1.8' },
    indiana: { title: 'Limestone and Woods', mode: 'ionian', final: 53, bar: 6, bpm: 84, lead: 'recorder', comp: 'harp', drone: null, perc: 'frame', voice2: null, mood: 'A pastoral round for a wooded campus',
      A: '1.2 1.1 2.2 3.1 5.3 3.3 4.2 4.1 3.2 2.1 2.6', A2: '1.2 1.1 2.2 3.1 5.3 6.3 5.2 4.1 3.2 2.1 1.6', B: '5.2 5.1 6.2 5.1 8.3 6.3 5.2 5.1 6.2 5.1 3.3 2.3', B2: '5.2 5.1 6.2 5.1 8.3 6.3 5.2 4.1 3.2 2.1 1.6' },
    ucla: { title: 'Cantiga of the Western Sun', mode: 'phrygian', final: 52, bar: 6, bpm: 88, lead: 'lute', comp: 'lute', drone: 'vielle', perc: 'tamb', voice2: null, mood: 'Warm and southern, with a tambourine',
      A: '1.2 2.1 3.2 4.1 5.3 4.2 3.1 4.2 3.1 2.2 1.1 2.3 1.3', A2: '1.2 2.1 3.2 4.1 5.3 6.2 5.1 4.2 3.1 2.2 2.1 1.6', B: '5.2 5.1 6.2 5.1 7.2 6.1 5.3 4.2 5.1 6.2 5.1 4.3 3.3', B2: '8.2 7.1 6.2 5.1 4.2 5.1 3.3 4.2 3.1 2.2 2.1 1.6' },
    notreDame: { title: 'Antiphon by the Lakes', mode: 'dorian', final: 50, bar: 8, bpm: 58, lead: 'organ', comp: 'harp', drone: 'organ', perc: null, voice2: 'fifth', bells: true, mood: 'Chant-like, with organ and bells',
      A: '1.2 2.2 4.2 5.2 5.4 6.2 5.2 4.2 5.2 3.2 2.2 3.4 2.4', A2: '1.2 2.2 4.2 5.2 5.4 6.2 5.2 4.2 3.2 2.2 0.2 1.8', B: '5.2 7.2 8.4 7.2 6.2 5.4 6.2 5.2 4.2 5.2 5.8', B2: '5.2 7.2 8.4 7.2 6.2 5.4 4.2 3.2 2.2 0.2 1.8' },
    columbia: { title: 'Basse Danse on the Steps', mode: 'mixolydian', final: 55, bar: 8, bpm: 80, lead: 'vielle', comp: 'lute', drone: null, perc: 'frame', voice2: 'sixth', mood: 'A courtly city dance',
      A: '1.2 2.2 3.2 1.2 5.4 4.2 3.2 4.2 3.2 2.2 1.2 2.4 5.4', A2: '1.2 2.2 3.2 1.2 5.4 4.2 3.2 4.2 2.2 3.2 2.2 1.8', B: '5.2 6.2 7.2 8.2 7.4 6.2 5.2 6.2 5.2 4.2 3.2 2.4 2.4', B2: '5.2 6.2 7.2 8.2 7.4 6.2 5.2 4.2 3.2 2.2 0.2 1.8' },
    mit: { title: 'Clockwork Estampie', mode: 'mixolydian', final: 62, bar: 6, bpm: 94, lead: 'psaltery', comp: 'lute', drone: 'vielle', perc: 'frame', voice2: null, mood: 'Bright and exact, like a well-made mechanism',
      A: '1.1 2.1 3.1 5.2 3.1 4.1 3.1 2.1 3.3 1.1 2.1 3.1 5.2 6.1 5.3 2.3', A2: '1.1 2.1 3.1 5.2 3.1 4.1 3.1 2.1 3.3 4.1 3.1 2.1 1.2 0.1 1.6', B: '8.2 7.1 6.2 5.1 6.1 5.1 4.1 5.3 8.2 7.1 6.2 5.1 4.3 2.3', B2: '8.2 7.1 6.2 5.1 6.1 5.1 4.1 3.3 4.1 3.1 2.1 1.2 0.1 1.6' },
    northeastern: { title: 'Harbour Air', mode: 'aeolian', final: 57, bar: 6, bpm: 78, lead: 'harp', comp: 'harp', drone: null, perc: null, voice2: null, mood: 'A harp air for a harbour city',
      A: '1.2 3.2 5.2 4.4 3.2 2.2 3.2 1.2 2.6', A2: '1.2 3.2 5.2 4.4 3.2 2.2 1.2 0.2 1.6', B: '5.2 6.2 5.2 8.4 7.2 6.2 5.2 4.2 5.6', B2: '5.2 6.2 5.2 8.4 7.2 5.2 3.2 2.2 1.6' },
    stanford: { title: 'Song of the Arcades', mode: 'mixolydian', final: 60, bar: 6, bpm: 90, lead: 'recorder', comp: 'lute', drone: null, perc: 'tamb', voice2: 'sixth', mood: 'Sunny, with a skip in it',
      A: '5.2 3.1 5.2 6.1 5.3 3.3 4.2 3.1 2.2 3.1 2.6', A2: '5.2 3.1 5.2 6.1 5.3 3.3 4.2 3.1 2.2 0.1 1.6', B: '8.3 7.2 6.1 5.2 6.1 5.3 4.2 5.1 6.2 4.1 5.6', B2: '8.3 7.2 6.1 5.2 4.1 3.3 2.2 3.1 2.2 0.1 1.6' },
    pennState: { title: 'Valley Estampie', mode: 'ionian', final: 55, bar: 6, bpm: 86, lead: 'vielle', comp: 'lute', drone: 'vielle', perc: 'frame', voice2: null, mood: 'A rustic dance from a valley town',
      A: '1.2 2.1 3.2 1.1 3.2 4.1 5.3 6.2 5.1 4.2 3.1 2.6', A2: '1.2 2.1 3.2 1.1 3.2 4.1 5.3 4.2 3.1 2.2 2.1 1.6', B: '5.2 5.1 8.2 7.1 6.2 5.1 6.3 5.2 4.1 3.2 4.1 5.6', B2: '5.2 5.1 8.2 7.1 6.2 5.1 3.3 4.2 3.1 2.2 2.1 1.6' },
    washu: { title: 'Organum for the Quadrangle', mode: 'dorian', final: 52, bar: 8, bpm: 66, lead: 'recorder', comp: 'harp', drone: 'organ', perc: null, voice2: 'fourth', mood: 'Two voices moving together under Gothic arches',
      A: '1.4 3.2 4.2 5.4 4.4 3.2 4.2 5.2 3.2 2.8', A2: '1.4 3.2 4.2 5.4 4.4 3.2 2.2 1.2 0.2 1.8', B: '5.4 7.2 8.2 7.4 5.4 6.2 5.2 4.2 3.2 4.4 5.4', B2: '5.4 7.2 8.2 7.4 5.4 4.2 3.2 2.2 0.2 1.8' },
    cmu: { title: 'The Piper on the Cut', mode: 'mixolydian', final: 57, bar: 8, bpm: 72, lead: 'pipes', comp: 'harp', drone: 'pipes', perc: 'frame', voice2: null, mood: 'A slow march with pipes and drones',
      A: '1.1 3.3 5.2 5.2 6.1 5.3 3.4 4.1 3.3 2.2 1.2 2.4 5.4', A2: '1.1 3.3 5.2 5.2 6.1 5.3 3.4 4.1 3.3 2.2 0.2 1.8', B: '8.1 7.3 5.2 5.2 6.1 5.3 8.4 7.1 5.3 4.2 3.2 2.4 2.4', B2: '8.1 7.3 5.2 5.2 6.1 5.3 3.4 4.1 3.3 2.2 0.2 1.8' },
    princeton: { title: 'Duet at Nassau', mode: 'dorian', final: 62, bar: 6, bpm: 70, lead: 'recorder', comp: 'harp', drone: null, perc: null, voice2: 'sixth', mood: 'A harp and recorder duet',
      A: '5.4 4.2 3.2 2.2 1.2 2.2 3.2 4.2 5.6', A2: '5.4 4.2 3.2 2.2 1.2 2.2 3.2 0.2 1.6', B: '5.2 7.2 8.2 9.4 8.2 7.2 6.2 5.2 6.4 5.2', B2: '5.2 7.2 8.2 7.4 5.2 4.2 3.2 2.2 1.6' },
    chicago: { title: 'Winter Office', mode: 'aeolian', final: 50, bar: 8, bpm: 60, lead: 'organ', comp: 'harp', drone: 'organ', perc: null, voice2: 'fifth', bells: true, mood: 'Austere and wintry, with distant bells',
      A: '1.4 5.4 4.2 3.2 2.4 3.2 4.2 5.2 6.2 5.8', A2: '1.4 5.4 4.2 3.2 2.4 3.2 2.2 1.2 0.2 1.8', B: '8.4 7.2 6.2 5.4 6.4 5.2 4.2 3.2 4.2 2.8', B2: '8.4 7.2 6.2 5.4 3.4 4.2 3.2 2.2 0.2 1.8' },
    michigan: { title: 'Carol of the Diag', mode: 'dorian', final: 55, bar: 6, bpm: 84, lead: 'recorder', comp: 'lute', drone: 'vielle', perc: 'frame', voice2: null, mood: 'A carol tune with a hand drum',
      A: '1.2 1.1 3.2 4.1 5.2 5.1 4.2 3.1 4.2 4.1 3.2 2.1 3.3 2.3', A2: '1.2 1.1 3.2 4.1 5.2 5.1 4.2 3.1 4.2 3.1 2.2 0.1 1.6', B: '5.2 6.1 7.2 8.1 7.2 6.1 5.3 6.2 5.1 4.2 3.1 4.3 5.3', B2: '5.2 6.1 7.2 8.1 7.2 6.1 5.3 4.2 3.1 2.2 0.1 1.6' },
    yale: { title: 'Carillon Round', mode: 'mixolydian', final: 53, bar: 6, bpm: 72, lead: 'bells', comp: 'harp', drone: null, perc: null, voice2: null, mood: 'A tower of bells over quiet courts',
      A: '1.2 3.2 5.2 8.4 5.2 6.2 5.2 3.2 2.6', A2: '1.2 3.2 5.2 8.4 5.2 6.2 4.2 2.2 1.6', B: '5.2 6.2 7.2 8.2 7.2 5.2 6.2 5.2 4.2 5.6', B2: '5.2 6.2 7.2 8.2 5.2 3.2 4.2 3.2 2.2 1.6' },
    rochester: { title: 'Lilac Dance', mode: 'ionian', final: 62, bar: 6, bpm: 88, lead: 'psaltery', comp: 'harp', drone: null, perc: 'tamb', voice2: 'sixth', mood: 'A spring dance for lilac season',
      A: '1.1 2.1 3.1 5.2 3.1 6.2 5.1 3.3 4.1 3.1 2.1 3.2 1.1 2.6', A2: '1.1 2.1 3.1 5.2 3.1 6.2 5.1 3.3 4.1 3.1 2.1 1.2 0.1 1.6', B: '5.2 8.1 7.2 6.1 5.2 6.1 5.3 3.2 5.1 4.2 3.1 2.3 5.3', B2: '5.2 8.1 7.2 6.1 5.2 4.1 3.3 4.1 3.1 2.1 1.2 0.1 1.6' },
    duke: { title: 'Chapel Hours', mode: 'dorian', final: 57, bar: 8, bpm: 66, lead: 'recorder', comp: 'harp', drone: 'organ', perc: null, voice2: 'fifth', mood: 'Quiet, with an organ beneath',
      A: '1.2 2.2 3.4 5.4 4.2 3.2 4.4 2.2 3.2 2.8', A2: '1.2 2.2 3.4 5.4 4.2 3.2 4.2 3.2 2.2 0.2 1.8', B: '5.4 6.2 7.2 8.4 7.4 6.2 5.2 4.2 5.2 5.8', B2: '5.4 6.2 7.2 8.4 5.4 4.2 3.2 2.2 0.2 1.8' },
    lund: { title: 'Lundagård Polska', mode: 'aeolian', final: 52, bar: 6, bpm: 80, lead: 'vielle', comp: 'harp', drone: 'vielle', perc: null, voice2: null, mood: 'A northern polska on a bowed string',
      A: '1.2 2.1 3.1 5.2 4.2 3.1 2.1 3.2 1.2 2.1 3.1 4.2 2.4 5.2', A2: '1.2 2.1 3.1 5.2 4.2 3.1 2.1 3.2 2.2 1.1 0.1 2.2 1.6', B: '5.2 6.1 7.1 8.2 7.2 6.1 5.1 6.2 5.2 4.1 3.1 4.2 5.6', B2: '5.2 6.1 7.1 8.2 7.2 6.1 5.1 3.2 4.2 3.1 2.1 2.2 1.6' },
    paris: { title: 'Chanson du Parc', mode: 'dorian', final: 55, bar: 6, bpm: 82, lead: 'lute', comp: 'lute', drone: null, perc: null, voice2: 'sixth', mood: 'A trouvère song for lute and recorder',
      A: '5.3 4.2 3.1 4.2 5.1 3.3 2.2 3.1 4.2 2.1 3.3 2.3', A2: '5.3 4.2 3.1 4.2 5.1 3.3 2.2 3.1 2.2 0.1 1.6', B: '5.2 6.1 7.2 8.1 9.3 8.3 7.2 6.1 5.2 6.1 5.6', B2: '5.2 6.1 7.2 8.1 7.3 5.3 4.2 3.1 2.2 0.1 1.6' },
    bellwether: { title: 'Festival Estampie', mode: 'mixolydian', final: 62, bar: 6, bpm: 92, lead: 'recorder', comp: 'lute', drone: 'vielle', perc: 'tamb', voice2: 'sixth', mood: 'The whole band, for a lantern-lit evening',
      A: '1.2 3.1 5.2 3.1 4.2 2.1 3.3 1.2 3.1 5.2 6.1 5.3 2.3', A2: '1.2 3.1 5.2 3.1 4.2 2.1 3.3 4.2 3.1 2.2 0.1 1.6', B: '8.2 7.1 8.2 5.1 6.2 5.1 4.3 5.2 6.1 7.2 5.1 6.3 5.3', B2: '8.2 7.1 8.2 5.1 6.2 5.1 3.3 4.2 3.1 2.2 0.1 1.6' },
  };
  const parse = (s) => s.trim().split(/\s+/).map((tok) => { const [d, l] = tok.split('.'); return { d: d === 'r' ? null : Number(d), len: Number(l) }; });
  const phraseLength = (s) => parse(s).reduce((a, n) => a + n.len, 0);
  const midi = (score, d) => { const m = MODES[score.mode], i = d - 1, o = Math.floor(i / 7); return score.final + 12 + m[((i % 7) + 7) % 7] + 12 * o; };
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- instruments ----------
  const M = { playing: null, timer: null, next: 0, events: [], idx: 0, cycle: 0 };
  let ctx, out, echo, comp, pluckCache = new Map();
  function chain() {
    const A = SA.Audio; if (!A.unlock()) return false; if (out) return true; ctx = A.ctx;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.3;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 7800;
    out = ctx.createGain(); out.gain.value = 0.9; out.connect(tone); tone.connect(comp); comp.connect(A.bus.music);
    // tempo echo: a quiet filtered repeat that widens the lead
    echo = ctx.createDelay(1.2); const fb = ctx.createGain(), ef = ctx.createBiquadFilter(), ew = ctx.createGain(); fb.gain.value = 0.26; ef.type = 'lowpass'; ef.frequency.value = 2200; ew.gain.value = 0.2;
    echo.connect(ef); ef.connect(fb); fb.connect(echo); ef.connect(ew); ew.connect(out);
    M.rev = ctx.createGain(); M.rev.gain.value = 1; M.rev.connect(A.reverb);
    return true;
  }
  function route(node, pan, wet, toEcho) {
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; node.connect(p); p.connect(out); const w = ctx.createGain(); w.gain.value = wet; p.connect(w); w.connect(M.rev); if (toEcho) { const e = ctx.createGain(); e.gain.value = toEcho; p.connect(e); e.connect(echo); } }
    else { node.connect(out); const w = ctx.createGain(); w.gain.value = wet; node.connect(w); w.connect(M.rev); }
  }
  function pluckBuffer(freq, bright, decay) {                 // Karplus–Strong string
    const key = Math.round(freq) + ':' + bright + ':' + decay; let b = pluckCache.get(key); if (b) return b;
    const sr = ctx.sampleRate, n = Math.max(2, Math.round(sr / freq)), len = Math.floor(sr * (decay > 0.997 ? 2.6 : 1.7)), data = new Float32Array(len), ring = new Float32Array(n), rnd = SA.rng(Math.round(freq) * 7 + 1);
    let lp = 0; for (let i = 0; i < n; i++) { const v = rnd() * 2 - 1; lp += (v - lp) * bright; ring[i] = lp; }
    let k = 0; for (let i = 0; i < len; i++) { const a = ring[k], bq = ring[(k + 1) % n]; data[i] = a; ring[k] = (a + bq) * 0.5 * decay; k = (k + 1) % n; }
    const fade = Math.floor(sr * 0.05); for (let i = 0; i < fade; i++) data[len - 1 - i] *= i / fade;
    b = ctx.createBuffer(1, len, sr); b.copyToChannel(data, 0); pluckCache.set(key, b); return b;
  }
  const INST = {
    lute: (t, f, d, v, pan = -0.25) => { const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = pluckBuffer(f, 0.55, 0.9955); g.gain.value = v * 0.5; s.connect(g); route(g, pan, 0.28, 0.1); s.start(t); },
    harp: (t, f, d, v, pan = 0.3) => { const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = pluckBuffer(f, 0.32, 0.9975); g.gain.value = v * 0.46; s.connect(g); route(g, pan, 0.45, 0.14); s.start(t); },
    psaltery: (t, f, d, v, pan = 0.1) => { const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = pluckBuffer(f * 2, 0.9, 0.9968); g.gain.value = v * 0.34; s.connect(g); route(g, pan, 0.4, 0.2); s.start(t); },
    recorder: (t, f, d, v, pan = 0.12) => {
      const g = ctx.createGain(), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(), n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
      o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = f * 2; o2.frequency.value = f * 4; g2.gain.value = 0.16; lfo.frequency.value = 5.1; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.5, d * 0.6));
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency); n.buffer = SA.Audio.noiseBuf; n.loop = true; nf.type = 'bandpass'; nf.frequency.value = f * 4; nf.Q.value = 1.2; ng.gain.value = 0.035;
      const peak = v * 0.2; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.045); g.gain.setValueAtTime(peak * 0.9, t + Math.max(0.05, d - 0.07)); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.03);
      o1.connect(g); o2.connect(g2); g2.connect(g); n.connect(nf); nf.connect(ng); ng.connect(g); route(g, pan, 0.5, 0.22);
      for (const x of [o1, o2, lfo]) { x.start(t); x.stop(t + d + 0.1); } n.start(t, Math.random()); n.stop(t + d + 0.1);
    },
    vielle: (t, f, d, v, pan = -0.1) => {
      const g = ctx.createGain(), flt = ctx.createBiquadFilter(), peak = v * 0.11; flt.type = 'lowpass'; flt.frequency.value = 1500 + f * 2; flt.Q.value = 0.8;
      for (const det of [-5, 4]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * 2; o.detune.value = det; o.connect(flt); o.start(t); o.stop(t + d + 0.15); }
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.07); g.gain.setValueAtTime(peak * 0.85, t + Math.max(0.08, d - 0.08)); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.08); flt.connect(g); route(g, pan, 0.42, 0.16);
    },
    organ: (t, f, d, v, pan = 0) => {
      const g = ctx.createGain(), peak = v * 0.085; [[1, 1], [2, 0.5], [3, 0.22], [4, 0.14], [6, 0.05]].forEach(([m, a]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * 2 * m; og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + d + 0.25); });
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.09); g.gain.setValueAtTime(peak, t + Math.max(0.1, d - 0.05)); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.2); route(g, pan, 0.6, 0);
    },
    pipes: (t, f, d, v, pan = 0.05) => {
      const g = ctx.createGain(), flt = ctx.createBiquadFilter(), o = ctx.createOscillator(), o2 = ctx.createOscillator(), peak = v * 0.075; flt.type = 'bandpass'; flt.frequency.value = 1400; flt.Q.value = 0.7; o.type = 'square'; o2.type = 'sawtooth'; o.frequency.value = f * 2; o2.frequency.value = f * 2; o2.detune.value = 6;
      o.connect(flt); o2.connect(flt); flt.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.03); g.gain.setValueAtTime(peak, t + Math.max(0.04, d - 0.02)); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.04); route(g, pan, 0.35, 0.1);
      for (const x of [o, o2]) { x.start(t); x.stop(t + d + 0.1); }
    },
    bells: (t, f, d, v, pan = 0) => { const g = ctx.createGain(); g.gain.value = 1; [[1, 0.3], [2, 0.18], [2.76, 0.12], [5.4, 0.05]].forEach(([m, a]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = f * 2 * m; og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(a * v * 0.42, t + 0.006); og.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / Math.sqrt(m)); o.connect(og); og.connect(g); o.start(t); o.stop(t + 2.8); }); route(g, pan, 0.7, 0.12); },
    frame: (t, f, d, v) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(62, t + 0.16); g.gain.setValueAtTime(v * 0.42, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g); route(g, -0.05, 0.3, 0); o.start(t); o.stop(t + 0.35); },
    tamb: (t, f, d, v) => { const n = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = SA.Audio.noiseBuf; flt.type = 'highpass'; flt.frequency.value = 6200; g.gain.setValueAtTime(v * 0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09); n.connect(flt); flt.connect(g); route(g, 0.35, 0.25, 0); n.start(t, Math.random()); n.stop(t + 0.12); },
  };

  // ---------- arrangement ----------
  function arrange(key, cycle) {
    const s = SCORES[key], bar = s.bar, ev = [], rnd = SA.rng(SA.strSeed(key) + cycle * 31), sixEight = bar === 6 && /\.1/.test(s.A);
    let at = 0;
    const lead = (phrase, inst, second, soft) => {
      let t = at; const notes = parse(phrase);
      notes.forEach((n, i) => {
        if (n.d !== null) {
          const last = i === notes.length - 1, accent = Math.abs((t % bar)) < 0.01 ? 1 : 0.84;
          ev.push({ t, len: n.len * (last ? 0.96 : 0.9), m: midi(s, n.d), inst, v: (soft ? 0.7 : 1) * accent * (0.9 + rnd() * 0.16) });
          if (cycle % 2 === 1 && n.len >= 4 && !last && rnd() < 0.5) ev.push({ t: t + n.len - 1, len: 0.8, m: midi(s, n.d + 1), inst, v: 0.55 });   // a turn on the repeat
          if (second) { const iv = { sixth: -2, fifth: -4, fourth: -3 }[second]; ev.push({ t, len: n.len * 0.9, m: midi(s, n.d + iv), inst: second === 'sixth' ? s.comp : inst, v: 0.5 }); }
        }
        t += n.len;
      });
    };
    const comp = (bars, strong) => {
      for (let b = 0; b < bars; b++) {
        const t0 = at + b * bar, alt = b % 4 === 2 || (b % 4 === 1 && s.mode !== 'ionian'), root = alt ? (s.mode === 'ionian' ? 4 : 0) : 1, r = midi(s, root) - 12;
        const pat = bar === 8 ? [[0, 0], [2, 7], [4, 12], [6, 7]] : sixEight ? [[0, 0], [2, 7], [3, 12], [5, 7]] : [[0, 0], [2, 7], [4, 12]];
        for (const [u, semi] of pat) ev.push({ t: t0 + u, len: 2, m: r + semi, inst: s.comp, v: (u === 0 ? 0.8 : 0.55) * (strong ? 1 : 0.8) });
        if (s.perc) { ev.push({ t: t0, len: 1, inst: s.perc === 'tamb' ? 'frame' : s.perc, v: 0.5, m: 0 }); const off = bar === 8 ? [4] : sixEight ? [3] : [2, 4]; for (const u of off) ev.push({ t: t0 + u, len: 1, inst: s.perc, v: 0.3, m: 0 }); }
        if (s.drone && b % 2 === 0) { ev.push({ t: t0, len: bar * 2, m: s.final - 12, inst: s.drone, v: 0.42 }); ev.push({ t: t0, len: bar * 2, m: s.final - 5, inst: s.drone, v: 0.3 }); }
        if (s.bells && b % 4 === 0) ev.push({ t: t0, len: 4, m: s.final + 12, inst: 'bells', v: 0.3 });
      }
    };
    comp(2, false); at += 2 * bar;                                   // introduction
    const second = cycle % 2 === 1 ? s.voice2 : null;
    for (const [ph, soft] of [[s.A, false], [s.A2, false], [s.B, false], [s.B2, false]]) { comp(4, true); lead(ph, s.lead, second, soft); at += 4 * bar; }
    comp(2, false); ev.push({ t: at, len: bar, m: midi(s, 5), inst: s.comp === 'harp' ? 'harp' : 'psaltery', v: 0.5 }, { t: at + bar, len: bar, m: midi(s, 8), inst: s.comp === 'harp' ? 'harp' : 'psaltery', v: 0.45 }); at += 2 * bar;   // interlude
    const alt = s.lead === 'recorder' ? (s.comp === 'harp' ? 'harp' : 'psaltery') : s.lead === 'organ' || s.lead === 'bells' ? 'recorder' : 'recorder';
    for (const ph of [s.A, s.A2]) { comp(4, false); lead(ph, alt, null, true); at += 4 * bar; }
    ev.sort((a, b) => a.t - b.t);
    return { ev, units: at };
  }

  function schedule() {
    if (!M.playing || !ctx) return; const s = SCORES[M.playing], unit = 60 / s.bpm / 2, now = ctx.currentTime;
    while (true) {
      if (M.idx >= M.events.length) { M.start += M.units * unit; M.cycle++; const a = arrange(M.playing, M.cycle); M.events = a.ev; M.units = a.units; M.idx = 0; }
      const e = M.events[M.idx], t = M.start + e.t * unit; if (t > now + 0.6) break; M.idx++;
      if (t < now - 0.05) continue;
      const f = INST[e.inst]; if (f) f(Math.max(now, t) + (Math.random() - 0.5) * 0.012, hz(e.m - 12), e.len * unit, e.v);
    }
  }
  M.play = (key) => {
    if (!SCORES[key]) key = 'menu'; if (M.playing === key) return; if (!chain()) return;
    M.stop(true); M.playing = key; M.cycle = 0; const a = arrange(key, 0); M.events = a.ev; M.units = a.units; M.idx = 0; M.start = ctx.currentTime + 0.5;
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 2.5);
    M.timer = setInterval(schedule, 120); schedule(); SA.emit('music', SCORES[key]);
  };
  M.stop = (quick) => { if (M.timer) clearInterval(M.timer); M.timer = null; M.playing = null; if (out && ctx) { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0.0001, ctx.currentTime, quick ? 0.15 : 0.8); } };
  M.scores = SCORES; M.phraseLength = phraseLength; M.parse = parse; M.midi = midi; M.arrange = arrange;
  SA.Music = M;
})();
