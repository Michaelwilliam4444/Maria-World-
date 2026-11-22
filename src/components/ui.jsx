import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../lib/audio.js';
import { useAudioState, useStore, useReducedMotion } from '../lib/store.jsx';

/** Big round replay button. Every spoken item gets one. */
export function SpeakButton({ segments, size = 'lg', label = 'اسمعي تاني', auto = false, onEnd, className = '' }) {
  const s = useAudioState();
  const mine = useRef(false);
  const play = () => { audio.sfx('tap'); mine.current = true; audio.speak(segments, { onEnd }); };
  useEffect(() => { if (auto) { mine.current = true; audio.speak(segments, { onEnd }); } /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (!s.speaking) mine.current = false; }, [s.speaking]);
  return (
    <button type="button" className={`speak-btn speak-${size} ${s.speaking && mine.current ? 'is-speaking' : ''} ${className}`} onClick={play} aria-label={label} title={label}>
      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18h8l11-9v30l-11-9H8z" fill="currentColor" /><path className="wave w1" d="M32 17c3 2 4 4.5 4 7s-1 5-4 7" /><path className="wave w2" d="M36 12c5 3.5 7 7.5 7 12s-2 8.5-7 12" /></svg>
    </button>
  );
}

export function MuteToggle({ big = false }) {
  const { state, dispatch } = useStore();
  const muted = state.settings.muted;
  return (
    <button type="button" className={`icon-btn ${big ? 'icon-btn-big' : ''} ${muted ? 'is-off' : ''}`} aria-pressed={muted} aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      onClick={() => { const m = !muted; dispatch({ type: 'SETTINGS', patch: { muted: m } }); audio.configure({ muted: m }); if (!m) { audio.unlock(); audio.sfx('tap'); } }}>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

export function StarCount({ pulse }) {
  const { state } = useStore();
  return <div className={`star-count ${pulse ? 'pulse' : ''}`} aria-label={`${state.stars} نجمة`}><span className="star-ic">⭐</span><b>{state.stars}</b></div>;
}

export function TopBar({ onHome, world, title, right }) {
  return (
    <header className="topbar" style={world ? { '--wa': world.theme.a, '--wb': world.theme.b } : undefined}>
      {onHome ? <button type="button" className="icon-btn home-btn" onClick={() => { audio.sfx('tap'); onHome(); }} aria-label="الرئيسية">🏠</button> : <span className="icon-spacer" />}
      {title ? <div className="topbar-title">{world && <span aria-hidden>{world.icon}</span>}<span>{title}</span></div> : <span />}
      <div className="topbar-right">{right}<StarCount /><MuteToggle /></div>
    </header>
  );
}

/** Current spoken line as a small caption — backup for muted / no-voice devices. */
export function Caption() {
  const s = useAudioState();
  const { state } = useStore();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (s.caption && (s.speaking || state.settings.muted || !audio.hasSynth)) { setVisible(true); }
    if (!s.speaking) { const t = setTimeout(() => setVisible(false), 2200); return () => clearTimeout(t); }
  }, [s.caption, s.speaking, state.settings.muted]);
  if (!state.settings.captions || !visible || !s.caption) return null;
  return <div className="caption" dir={s.lang === 'fr' ? 'ltr' : 'rtl'} lang={s.lang} aria-live="polite">{s.caption}</div>;
}

export function Confetti({ count = 36 }) {
  const reduce = useReducedMotion();
  const [pieces] = useState(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.4, dur: 1.6 + Math.random() * 1.2, rot: Math.random() * 360,
    color: ['#ff7eb0', '#ffd166', '#7aa7ff', '#4fd1a5', '#b9a6ff', '#ff9f6b'][i % 6], shape: i % 3,
  })));
  if (reduce) return <div className="confetti-static" aria-hidden>✨⭐✨</div>;
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => <i key={i} className={`cf cf${p.shape}`} style={{ left: p.left + '%', background: p.color, animationDelay: p.delay + 's', animationDuration: p.dur + 's', transform: `rotate(${p.rot}deg)` }} />)}
    </div>
  );
}

export function StarBurst() {
  return <div className="star-burst" aria-hidden>{Array.from({ length: 6 }, (_, i) => <span key={i} style={{ '--i': i }}>⭐</span>)}</div>;
}

/** Press-and-hold parent gate (children rarely hold still for 3 seconds). */
export function HoldButton({ onDone, ms = 2500, children, className = '' }) {
  const [p, setP] = useState(0);
  const raf = useRef(0); const start = useRef(0);
  const stop = () => { cancelAnimationFrame(raf.current); setP(0); };
  const begin = (e) => {
    e.preventDefault();
    start.current = performance.now();
    const loop = (t) => {
      const v = Math.min(1, (t - start.current) / ms); setP(v);
      if (v >= 1) { setP(0); onDone(); return; }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <button type="button" className={`hold-btn ${className}`} onPointerDown={begin} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.repeat) begin(e); }} onKeyUp={stop} aria-label="للأهل: اضغط مطولاً">
      <svg viewBox="0 0 36 36" className="hold-ring" aria-hidden><circle cx="18" cy="18" r="16" /><circle cx="18" cy="18" r="16" pathLength="100" className="hold-prog" style={{ strokeDashoffset: 100 - p * 100 }} /></svg>
      <span>{children}</span>
    </button>
  );
}

export function Modal({ open, onClose, children, title }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/** A group of objects arranged in rows of 5 (ten-frame style) so quantities are easy to see. */
export function Group({ n, pic, size = 'md', tappable = false, counted = [], onTap }) {
  const rows = [];
  for (let i = 0; i < n; i += 5) rows.push(Array.from({ length: Math.min(5, n - i) }, (_, k) => i + k));
  return (
    <div className={`group group-${size} ${n > 10 ? 'group-dense' : ''}`} dir="ltr">
      {rows.map((r, ri) => (
        <div className="group-row" key={ri}>
          {r.map((i) => tappable
            ? <button type="button" key={i} className={`obj obj-btn ${counted.includes(i) ? 'is-counted' : ''}`} onClick={() => onTap(i)} aria-label={`حاجة ${i + 1}`}>
                <span>{pic}</span>{counted.includes(i) && <em>{counted.indexOf(i) + 1}</em>}
              </button>
            : <span key={i} className="obj">{pic}</span>)}
        </div>
      ))}
    </div>
  );
}

export function ChoiceFace({ c }) {
  if (c.kind === 'glyph-ar') return <span className="glyph glyph-ar" lang="ar">{c.value}</span>;
  if (c.kind === 'glyph-fr') return <span className="glyph glyph-fr" lang="fr" dir="ltr">{c.value}</span>;
  if (c.kind === 'pic') return <span className="pic">{c.value}</span>;
  if (c.kind === 'numeral') return <span className="numeral" dir="ltr">{c.value}<small>{c.sub}</small></span>;
  if (c.kind === 'group') return <Group n={c.value} pic={c.pic} size="sm" />;
  return null;
}

export function ProgressBar({ value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return <div className="pbar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}><i style={{ width: pct + '%', background: color }} /></div>;
}
