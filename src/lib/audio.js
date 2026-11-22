// Single audio channel for the whole app: speech never overlaps.
// Priority per line: recorded clip (manifest) -> browser speech synthesis -> caption only.
import { AUDIO_MANIFEST } from '../audio/manifest.js';

const LANG_TAGS = { ar: ['ar-EG', 'ar-SA', 'ar'], fr: ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH', 'fr'] };

class AudioEngine {
  constructor() {
    this.settings = { muted: false, volume: 0.9, rate: 0.85, voiceAr: '', voiceFr: '' };
    this.voices = [];
    this.listeners = new Set();
    this.state = { speaking: false, caption: null, lang: null };
    this.token = 0;
    this.currentAudio = null;
    this.ctx = null;
    this.hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    if (this.hasSynth) {
      const load = () => { this.voices = window.speechSynthesis.getVoices() || []; this.emit(); };
      load();
      try { window.speechSynthesis.addEventListener('voiceschanged', load); } catch { window.speechSynthesis.onvoiceschanged = load; }
    }
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { for (const fn of this.listeners) fn({ ...this.state }); }
  setState(patch) { this.state = { ...this.state, ...patch }; this.emit(); }

  configure(settings) { this.settings = { ...this.settings, ...settings }; if (this.settings.muted) this.stop(); }

  voicesFor(lang) {
    const prefix = lang.toLowerCase();
    return this.voices.filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix));
  }

  pickVoice(lang) {
    const list = this.voicesFor(lang);
    if (!list.length) return null;
    const chosen = lang === 'ar' ? this.settings.voiceAr : this.settings.voiceFr;
    if (chosen) { const v = list.find((x) => x.voiceURI === chosen); if (v) return v; }
    for (const tag of LANG_TAGS[lang]) {
      const v = list.find((x) => x.lang.replace('_', '-').toLowerCase() === tag.toLowerCase());
      if (v) return v;
    }
    return list[0];
  }

  /** Report what the device actually offers — never claims a voice that isn't there. */
  voiceReport() {
    const r = {};
    for (const lang of ['ar', 'fr']) {
      const v = this.pickVoice(lang);
      r[lang] = v ? { name: v.name, lang: v.lang, local: v.localService } : null;
    }
    r.synth = this.hasSynth;
    return r;
  }

  // ---- sound effects (synthesised, gentle; no "wrong" sound exists by design) ----
  ensureCtx() {
    if (this.ctx) return this.ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { this.ctx = new C(); } catch { this.ctx = null; }
    return this.ctx;
  }
  unlock() { const c = this.ensureCtx(); if (c && c.state === 'suspended') c.resume().catch(() => {}); }

  tone(freq, start, dur, type = 'sine', gain = 0.18) {
    const c = this.ctx; if (!c) return;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type; o.frequency.value = freq;
    const t = c.currentTime + start; const peak = gain * this.settings.volume;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }

  sfx(kind) {
    if (this.settings.muted) return;
    if (!this.ensureCtx()) return;
    this.unlock();
    if (kind === 'tap') this.tone(660, 0, 0.12, 'sine', 0.08);
    if (kind === 'correct') { this.tone(784, 0, 0.18); this.tone(988, 0.09, 0.2); this.tone(1319, 0.18, 0.3, 'triangle', 0.12); }
    if (kind === 'star') { this.tone(1568, 0, 0.2, 'triangle', 0.1); this.tone(2093, 0.07, 0.25, 'triangle', 0.08); }
    if (kind === 'celebrate') [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.11, 0.35, 'triangle', 0.12));
    if (kind === 'soft') this.tone(440, 0, 0.18, 'sine', 0.06); // neutral, friendly "hmm" — not a buzzer
  }

  // ---- speech ----
  stop() {
    this.token++;
    if (this.currentAudio) { try { this.currentAudio.pause(); } catch { /* */ } this.currentAudio = null; }
    if (this.hasSynth) { try { window.speechSynthesis.cancel(); } catch { /* */ } }
    if (this.state.speaking) this.setState({ speaking: false });
  }

  /** speak([{text, lang, key}], {onEnd}) — cancels anything already playing. */
  speak(segments, opts = {}) {
    this.stop();
    const my = this.token;
    const list = (Array.isArray(segments) ? segments : [segments]).filter(Boolean);
    const done = () => { if (my !== this.token) return; this.setState({ speaking: false }); opts.onEnd && opts.onEnd(); };
    if (!list.length) return done();

    const playAt = (i) => {
      if (my !== this.token) return;
      if (i >= list.length) return done();
      const seg = list[i];
      this.setState({ speaking: !this.settings.muted, caption: seg.text, lang: seg.lang });
      const next = () => playAt(i + 1);
      if (this.settings.muted) { setTimeout(() => { if (my === this.token) next(); }, Math.min(1800, 300 + seg.text.length * 25)); return; }
      const url = seg.key && AUDIO_MANIFEST[seg.key];
      if (url) return this.playClip(url, my, next, () => this.say(seg, my, next));
      this.say(seg, my, next);
    };
    // tiny delay after cancel() avoids a Chrome bug where the next utterance is dropped
    setTimeout(() => playAt(0), this.hasSynth ? 60 : 0);
  }

  playClip(url, my, next, fallback) {
    try {
      const a = new Audio(url);
      a.volume = this.settings.volume;
      this.currentAudio = a;
      a.onended = () => { if (my === this.token) next(); };
      a.onerror = () => { if (my === this.token) fallback(); };
      a.play().catch(() => { if (my === this.token) fallback(); });
    } catch { fallback(); }
  }

  say(seg, my, next) {
    const est = 1200 + seg.text.length * 110 / this.settings.rate;
    if (!this.hasSynth) { setTimeout(() => { if (my === this.token) next(); }, Math.min(est, 3500)); return; }
    const u = new SpeechSynthesisUtterance(seg.text);
    const tag = LANG_TAGS[seg.lang][0];
    const voice = this.pickVoice(seg.lang);
    u.lang = voice ? voice.lang : tag;
    if (voice) u.voice = voice;
    u.rate = this.settings.rate;
    u.pitch = 1.1;
    u.volume = this.settings.volume;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; clearTimeout(guard); if (my === this.token) next(); };
    // Some browsers occasionally never fire onend — never let the flow hang.
    const guard = setTimeout(finish, est + 4000);
    u.onend = finish;
    u.onerror = finish;
    try { window.speechSynthesis.speak(u); } catch { finish(); }
  }
}

export const audio = new AudioEngine();
