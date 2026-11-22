import React from 'react';
import Avatar from '../components/Avatar.jsx';
import { TopBar, ProgressBar, HoldButton } from '../components/ui.jsx';
import { useStore } from '../lib/store.jsx';
import { audio } from '../lib/audio.js';
import { WORLDS, WORLD_ORDER, GREETING, ar } from '../data/worlds.js';
import { worldProgress } from '../lib/progress.js';

export default function Home({ onWorld, onRewards, onParent }) {
  const { state } = useStore();
  return (
    <div className="screen home">
      <TopBar title={null} right={null} />
      <section className="home-hero">
        <button type="button" className="hero-avatar" onClick={() => audio.speak([ar(GREETING)])} aria-label="ماريا">
          <Avatar avatar={state.avatar} accessory={state.equipped.accessory} size={120} />
        </button>
        <div className="hero-bubble" onClick={() => audio.speak([ar('اختاري عالم يا ماريا!')])} role="button" tabIndex={0}>
          <span>أهلاً يا ماريا! 💖</span>
          <span className="hero-sub">اختاري عالم 👇</span>
        </div>
      </section>
      <section className="worlds">
        {WORLD_ORDER.map((id) => {
          const W = WORLDS[id]; const p = worldProgress(state, id);
          return (
            <button type="button" key={id} className={`world-card wc-${id}`} style={{ '--wa': W.theme.a, '--wb': W.theme.b, '--wink': W.theme.ink }}
              onClick={() => { audio.sfx('tap'); audio.speak(W.enterSpeech); onWorld(id); }} aria-label={W.title}>
              <span className="wc-icon" aria-hidden>{W.icon}</span>
              <span className="wc-label" dir={id === 'french' ? 'ltr' : 'rtl'}>{W.label}</span>
              <span className="wc-title">{W.title}</span>
              <span className="wc-prog">
                <ProgressBar value={p.learned} max={p.items} color="#fff" />
                <span className="wc-count" dir="ltr">{p.learned}/{p.items}</span>
              </span>
              <span className="wc-mascot" aria-hidden>{W.mascot}</span>
            </button>
          );
        })}
      </section>
      <section className="home-bottom">
        <button type="button" className="rewards-btn" onClick={() => { audio.sfx('tap'); audio.speak([ar('أوضة الهدايا!')]); onRewards(); }} aria-label="أوضة الهدايا">
          <span aria-hidden>🎁</span><span>الهدايا</span>
        </button>
        <HoldButton onDone={onParent} className="parent-gate">👨‍👩‍👧 للأهل</HoldButton>
      </section>
    </div>
  );
}
