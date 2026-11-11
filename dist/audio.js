/* Local playback of a public-domain orchestral recording; see assets/music-credits.json.
   Two HTMLAudioElement decks make a gentle five-second wrap, not a seamless loop.
   No generated music, cloned voices, synthesis, or remote playback services. */
(function () {
  'use strict';
  const MUSIC_SRC='assets/music/morning-mood.ogg';
  const WRAP_SECONDS = 5;
  const sceneGain = { menu: 0.65, travel: 0.75, research: 0.40 };
  const levels = { music: 0.32, ambience: 0.22, effects: 0.42, voice: 0.70, muted: false, reduced: false };
  let decks = [], current = 0, scene = 'menu', running = false, started = false;
  let timer = null, transition = null, pendingWrap = false, serial = 0;
  let smoothGain = 0, lastTick = 0, hidden = false, lastError = null, status = 'not-started';
  const now = () => typeof performance !== 'undefined' && performance.now ? performance.now() / 1000 : Date.now() / 1000;
  const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
  function wantedGain() {
    return running && !levels.muted && !hidden ? levels.music * sceneGain[scene] * (levels.reduced ? 0.45 : 1) : 0;
  }
  function safePause(deck) { try { deck.pause(); } catch (_) {} }
  function setVolume(deck, volume) { try { deck.volume = clamp(volume); } catch (_) {} }
  function volumes() {
    if (!decks.length) return;
    if (transition) {
      const t = Math.max(0, Math.min(1, (now() - transition.began) / transition.length));
      // Equal-power fades soften the wrap without claiming matching musical phrases.
      setVolume(decks[transition.from], smoothGain * Math.cos(t * Math.PI / 2));
      setVolume(decks[transition.to], smoothGain * Math.sin(t * Math.PI / 2));
      if (t >= 1) finishWrap();
    } else {
      decks.forEach((deck, i) => setVolume(deck, i === current ? smoothGain : 0));
    }
  }
  function finishWrap() {
    if (!transition) return;
    const { from, to } = transition;
    current = to; transition = null; pendingWrap = false;
    safePause(decks[from]); setVolume(decks[from], 0);
    setVolume(decks[to], smoothGain);
    status = running ? 'playing' : 'stopped';
  }
  async function beginWrap(length) {
    if (!running || pendingWrap || transition || !decks.length) return;
    pendingWrap = true;
    const token = serial, from = current, to = 1 - from;
    const incoming = decks[to];
    try {
      incoming.currentTime = 0; setVolume(incoming, 0);
      await Promise.resolve(incoming.play());
      if (!running || token !== serial) { safePause(incoming); pendingWrap = false; return; }
      transition = { from, to, began: now(), length: Math.max(0.3, length) };
      pendingWrap = false; status = 'crossfading';
    } catch (error) {
      pendingWrap = false;
      lastError = error && error.name ? error.name : 'Recording restart unavailable';
      status = 'playing';
      // The outgoing recording may finish normally; end handling retries quietly.
    }
  }
  function tick() {
    const t = now(), elapsed = lastTick ? Math.max(0.001, Math.min(0.5, t - lastTick)) : 0.08;
    lastTick = t;
    smoothGain += (wantedGain() - smoothGain) * (1 - Math.exp(-elapsed / 0.20));
    volumes();
    if (!running || !decks.length || transition || pendingWrap) return;
    const deck = decks[current], duration = deck.duration;
    if (Number.isFinite(duration) && duration > 1 && !deck.paused) {
      const wrap = Math.min(WRAP_SECONDS, duration / 3), left = duration - deck.currentTime;
      if (left > 0 && left <= wrap) beginWrap(Math.min(wrap, left));
    }
  }
  async function ended(index) {
    if (!running || index !== current) return;
    if (transition) { finishWrap(); return; }
    if (pendingWrap) return;
    // Graceful fallback if duration metadata or the second deck was unavailable.
    smoothGain = 0;
    try { decks[current].currentTime = 0; await Promise.resolve(decks[current].play()); status = 'playing'; }
    catch (error) { status = 'playback-blocked'; lastError = error && error.name ? error.name : 'Playback unavailable'; }
  }
  function initialize() {
    if (decks.length) return true;
    const AudioElement = window.Audio;
    if (!AudioElement) { status = 'unsupported'; return false; }
    try {
      decks = [0, 1].map(index => {
        const deck = new AudioElement();
        deck.src = MUSIC_SRC; deck.preload = 'auto'; deck.loop = false; deck.volume = 0;
        deck.addEventListener('ended', () => ended(index));
        deck.addEventListener('loadedmetadata', () => { if (!running) status = 'ready'; });
        deck.addEventListener('error', () => {
          lastError = 'The local orchestral recording could not be loaded.';
          if (transition && index === transition.to) { safePause(deck); setVolume(deck, 0); transition = null; pendingWrap = false; status = 'playing'; return; }
          if (index === current) { running = false; serial++; status = 'unavailable'; smoothGain = 0; decks.forEach(d => { safePause(d); setVolume(d, 0); }); clearInterval(timer); timer = null; }
        });
        return deck;
      });
      return true;
    } catch (error) { status = 'unsupported'; lastError = error && error.name ? error.name : 'Audio initialization unavailable'; return false; }
  }
  async function start() {
    if (!initialize()) return false;
    started = true; running = true; serial++; lastError = null;
    if (!timer) { lastTick = now(); timer = setInterval(tick, 80); }
    try {
      await Promise.resolve(decks[current].play());
      status = transition ? 'crossfading' : 'playing'; tick(); return true;
    } catch (error) {
      running = false; status = 'playback-blocked';
      lastError = error && error.name ? error.name : 'Playback needs a user gesture';
      decks.forEach(d => { safePause(d); setVolume(d, 0); });
      clearInterval(timer); timer = null; return false;
    }
  }
  function setLevels(values) {
    if (!values || typeof values !== 'object') return;
    for (const key of ['music', 'ambience', 'effects', 'voice']) if (key in values) levels[key] = clamp(values[key]);
    for (const key of ['muted', 'reduced']) if (key in values) levels[key] = !!values[key];
    if ('reducedAudio' in values) levels.reduced = !!values.reducedAudio;
    tick();
  }
  function setScene(value) { if (Object.prototype.hasOwnProperty.call(sceneGain, value)) { scene = value; tick(); } }
  function cue() { return false; } // Progress and reconsideration feedback are visual.
  function stop() {
    running = false; serial++; pendingWrap = false;
    const token = serial;
    // Existing interval ramps down for 200 ms before pausing both decks.
    tick();
    setTimeout(() => {
      if (running || token !== serial) return;
      if (transition) { current = transition.to; transition = null; }
      decks.forEach(d => { safePause(d); setVolume(d, 0); });
      smoothGain = 0; clearInterval(timer); timer = null; status = 'stopped';
    }, 450);
  }
  function getStatus() {
    const deck = decks[current];
    return {
      status, started, running, scene, source: MUSIC_SRC, crossfading: !!transition,
      currentTime: deck && Number.isFinite(deck.currentTime) ? deck.currentTime : 0,
      duration: deck && Number.isFinite(deck.duration) ? deck.duration : null,
      gain: smoothGain, levels: { ...levels }, error: lastError,
      channels: { music: 'Local orchestral recording', ambience: 'Silent; no ambience track supplied', effects: 'Silent; visual feedback only', voice: 'Silent; no voice recordings' }
    };
  }
  document.addEventListener('visibilitychange', () => { hidden = !!document.hidden; tick(); });
  window.AtlasAudio = { start, setScene, setLevels, cue, stop, getStatus, getState: getStatus };
})();
