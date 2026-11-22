import React, { useState } from 'react';
import { TopBar } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { useStore } from '../lib/store.jsx';
import { audio } from '../lib/audio.js';
import { STICKERS, ACCESSORIES, BACKGROUNDS, BADGES } from '../data/rewards.js';
import { ar } from '../data/worlds.js';

const TABS = [
  { id: 'stickers', icon: '🦋', speech: 'الاستيكرز' },
  { id: 'acc', icon: '👑', speech: 'حاجات حلوة لماريا' },
  { id: 'bg', icon: '🌈', speech: 'الألوان' },
  { id: 'badges', icon: '🏅', speech: 'الميداليات' },
];

export default function Rewards({ onHome }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('stickers');
  const stars = state.stars;
  const locked = (at) => {
    audio.sfx('soft');
    audio.speak([ar(`محتاجين ${at - stars} نجوم كمان! يلا نتعلم ونجمع نجوم.`)]);
  };
  return (
    <div className="screen rewards">
      <TopBar onHome={onHome} title="أوضة الهدايا 🎁" />
      <div className="room-avatar">
        <Avatar avatar={state.avatar} accessory={state.equipped.accessory} size={150} />
      </div>
      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? 'on' : ''}`}
            onClick={() => { audio.sfx('tap'); audio.speak([ar(t.speech)]); setTab(t.id); }} aria-label={t.speech}>{t.icon}</button>
        ))}
      </nav>
      <div className="shelf">
        {tab === 'stickers' && STICKERS.map((s) => {
          const open = stars >= s.at;
          return (
            <button key={s.id} type="button" className={`reward ${open ? '' : 'is-locked'}`} aria-label={open ? s.ar : 'مقفول'}
              onClick={() => { if (!open) return locked(s.at); audio.sfx('star'); audio.speak([ar(s.ar)]); }}>
              <span className={`reward-pic ${open ? 'wiggle-hover' : ''}`}>{s.pic}</span>
              {!open && <span className="reward-lock" dir="ltr">🔒 ⭐{s.at}</span>}
            </button>
          );
        })}
        {tab === 'acc' && <>
          <button type="button" className={`reward ${!state.equipped.accessory ? 'is-on' : ''}`} onClick={() => { audio.sfx('tap'); dispatch({ type: 'EQUIP', slot: 'accessory', id: null }); }} aria-label="من غير">
            <span className="reward-pic">🙂</span>
          </button>
          {ACCESSORIES.map((a) => {
            const open = stars >= a.at; const on = state.equipped.accessory === a.id;
            return (
              <button key={a.id} type="button" className={`reward ${open ? '' : 'is-locked'} ${on ? 'is-on' : ''}`} aria-label={open ? a.ar : 'مقفول'}
                onClick={() => { if (!open) return locked(a.at); audio.sfx('star'); audio.speak([ar(`${a.ar}! حلو أوي!`)]); dispatch({ type: 'EQUIP', slot: 'accessory', id: on ? null : a.id }); }}>
                <span className="reward-pic">{a.pic}</span>
                {!open && <span className="reward-lock" dir="ltr">🔒 ⭐{a.at}</span>}
              </button>
            );
          })}
        </>}
        {tab === 'bg' && BACKGROUNDS.map((b) => {
          const open = stars >= b.at; const on = state.equipped.background === b.id;
          return (
            <button key={b.id} type="button" className={`reward bg-swatch ${open ? '' : 'is-locked'} ${on ? 'is-on' : ''}`} style={{ background: b.css }} aria-label={open ? b.ar : 'مقفول'}
              onClick={() => { if (!open) return locked(b.at); audio.sfx('star'); audio.speak([ar(b.ar)]); dispatch({ type: 'EQUIP', slot: 'background', id: b.id }); }}>
              {on && <span className="reward-pic small">✔️</span>}
              {!open && <span className="reward-lock" dir="ltr">🔒 ⭐{b.at}</span>}
            </button>
          );
        })}
        {tab === 'badges' && BADGES.map((b) => {
          const got = !!state.badges[b.id];
          return (
            <button key={b.id} type="button" className={`reward badge ${got ? '' : 'is-locked'}`} aria-label={got ? b.ar : 'لسه'}
              onClick={() => { audio.sfx(got ? 'star' : 'soft'); audio.speak([ar(got ? b.ar : 'لسه! يلا نكمل ونكسبها.')]); }}>
              <span className="reward-pic">{b.icon}</span>
              <span className="badge-name">{b.ar}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
