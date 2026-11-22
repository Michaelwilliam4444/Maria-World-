import React from 'react';
import Avatar from '../components/Avatar.jsx';
import { MuteToggle } from '../components/ui.jsx';
import { useStore } from '../lib/store.jsx';
import { audio } from '../lib/audio.js';
import { GREETING, ar } from '../data/worlds.js';

export default function Welcome({ onStart }) {
  const { state, dispatch } = useStore();
  const start = () => {
    audio.unlock(); audio.sfx('celebrate');
    dispatch({ type: 'VISIT' });
    audio.speak([ar(GREETING)]);
    onStart();
  };
  return (
    <div className="screen welcome">
      <div className="welcome-sky" aria-hidden><span>☁️</span><span>🌈</span><span>☁️</span><span>🦋</span></div>
      <button type="button" className="welcome-avatar" onClick={() => { audio.unlock(); audio.speak([ar(GREETING)]); }} aria-label="سلمي على ماريا">
        <Avatar avatar={state.avatar} accessory={state.equipped.accessory} size={210} />
      </button>
      <h1 className="welcome-title"><span className="t-ar">عالم ماريا الصغير</span><span className="t-en" dir="ltr">Maria's Little World</span></h1>
      <p className="welcome-greet">أهلاً يا ماريا مايكل! 👋</p>
      <button type="button" className="start-btn" onClick={start} aria-label="يلا نبدأ">
        <svg viewBox="0 0 48 48" aria-hidden><path d="M32 10 L14 24 L32 38 Z" fill="currentColor" /></svg>
      </button>
      <div className="welcome-sound">
        <MuteToggle big />
        <label className="vol" aria-label="علو الصوت">
          <span aria-hidden>🔈</span>
          <input type="range" min="0" max="1" step="0.05" value={state.settings.volume}
            onChange={(e) => { const v = +e.target.value; dispatch({ type: 'SETTINGS', patch: { volume: v } }); audio.configure({ volume: v }); }}
            onPointerUp={() => { audio.unlock(); audio.sfx('tap'); }} />
          <span aria-hidden>🔊</span>
        </label>
      </div>
    </div>
  );
}
