import React, { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { useStore } from '../lib/store.jsx';
import { audio } from '../lib/audio.js';
import { WORLDS, getItem, ar } from '../data/worlds.js';
import { lessonStatus, worldProgress } from '../lib/progress.js';

export default function Journey({ worldId, onHome, onLesson }) {
  const W = WORLDS[worldId];
  const { state } = useStore();
  const status = lessonStatus(state, worldId);
  const currentRef = useRef(null);
  const [shake, setShake] = useState(null);
  const p = worldProgress(state, worldId);

  useEffect(() => { currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, []);

  const tapLocked = (id) => {
    audio.sfx('soft'); setShake(id); setTimeout(() => setShake(null), 600);
    audio.speak([ar('لسه مقفول! خلصي الدرس اللي منور الأول.')]);
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  // Build rows, inserting level headers for the numbers world.
  const rows = []; let lastLevel = null; let n = 0;
  status.forEach((s) => {
    if (W.levels && s.lesson.level !== lastLevel) {
      const lvl = W.levels.find((l) => l.id === s.lesson.level);
      rows.push({ type: 'level', lvl, key: 'lvl-' + lvl.id }); lastLevel = s.lesson.level;
    }
    rows.push({ type: 'node', s, idx: n++, key: s.lesson.id });
  });
  if (W.levels) W.levels.filter((l) => !l.available).forEach((lvl) => rows.push({ type: 'future', lvl, key: 'f-' + lvl.id }));

  return (
    <div className="screen journey" style={{ '--wa': W.theme.a, '--wb': W.theme.b, '--wsoft': W.theme.soft, '--wink': W.theme.ink }}>
      <TopBar onHome={onHome} world={W} title={W.title} />
      <div className="journey-head">
        <span className="jh-mascot" aria-hidden>{W.mascot}</span>
        <div className="jh-prog" dir="ltr" aria-label={`${p.learned} من ${p.items}`}><b>{p.learned}</b>/{p.items}</div>
      </div>
      <ol className="path">
        {rows.map((r) => {
          if (r.type === 'level') return <li key={r.key} className="level-head"><span dir="ltr">{r.lvl.title}</span></li>;
          if (r.type === 'future') return (
            <li key={r.key} className="level-head future">
              <button type="button" onClick={() => { audio.sfx('soft'); audio.speak([ar('ده جاي قريب أوي!')]); }} aria-label="قريباً">
                <span aria-hidden>🔒</span> <span dir="ltr">{r.lvl.title}</span> <span aria-hidden>🌱</span>
              </button>
            </li>
          );
          const { s, idx } = r; const l = s.lesson;
          const item = l.kind === 'learn' ? getItem(worldId, l.itemId) : null;
          const face = item ? W.label4(item) : '🎯';
          const side = ['mid', 'right', 'mid', 'left'][idx % 4];
          const best = state.worlds[worldId].done[l.id]?.best;
          return (
            <li key={r.key} className={`node-row side-${side}`}>
              <button type="button" ref={s.current ? currentRef : null}
                className={`node ${l.kind} ${s.done ? 'is-done' : ''} ${s.current ? 'is-current' : ''} ${!s.open ? 'is-locked' : ''} ${shake === l.id ? 'wobble' : ''}`}
                onClick={() => {
                  if (!s.open) return tapLocked(l.id);
                  audio.sfx('tap');
                  if (item) audio.speak(W.nameSpeech(item)); else audio.speak([ar('مراجعة!')]);
                  onLesson(l.id);
                }}
                aria-label={s.open ? (item ? `درس ${face}` : 'مراجعة') : 'مقفول'}>
                <span className="node-face" dir={worldId === 'arabic' ? 'rtl' : 'ltr'} lang={worldId === 'french' ? 'fr' : 'ar'}>{s.open ? face : '🔒'}</span>
                {s.done && <span className="node-check" aria-hidden>✓</span>}
                {s.done && best ? <span className="node-stars" aria-hidden>⭐{best}</span> : null}
                {s.current && <span className="node-avatar" aria-hidden><Avatar avatar={state.avatar} accessory={state.equipped.accessory} size={54} /></span>}
              </button>
            </li>
          );
        })}
        <li className="node-row side-mid"><div className="path-end" aria-hidden>🏆</div></li>
      </ol>
    </div>
  );
}
