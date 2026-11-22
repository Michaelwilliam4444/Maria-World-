import React, { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { Modal, ProgressBar } from '../components/ui.jsx';
import { useStore } from '../lib/store.jsx';
import { audio } from '../lib/audio.js';
import { cartoonizePhoto } from '../lib/photo.js';
import { WORLDS, WORLD_ORDER, getItem, ar, fr } from '../data/worlds.js';
import { BADGES } from '../data/rewards.js';
import { worldProgress, learnedItems, accuracy, itemsToRevisit, difficulty } from '../lib/progress.js';

const fmtTime = (s) => { const m = Math.round(s / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
const SKINS = ['#fde2cc', '#f6cfae', '#e8b48f', '#c98d62', '#9c6643', '#6e452d'];
const HAIRS = ['#1f1410', '#3a2418', '#6b3f22', '#a8662f', '#d9a35b', '#7a2e2e'];
const OUTFITS = ['#ff7eb0', '#b48cff', '#6fb6ff', '#4fd1a5', '#ffb347', '#ff6b6b'];
const DIFF_LABEL = { easy: 'Simplified (2 choices)', normal: 'Standard (3 choices)', hard: 'Challenge (4 choices, look-alikes)' };

export default function Parent({ onClose }) {
  const { state, dispatch, storageOk } = useStore();
  const [confirm, setConfirm] = useState(null);
  const [photoMsg, setPhotoMsg] = useState('');
  const [voices, setVoices] = useState(() => ({ ar: audio.voicesFor('ar'), fr: audio.voicesFor('fr'), report: audio.voiceReport() }));
  const fileRef = useRef(null);
  useEffect(() => audio.subscribe(() => setVoices({ ar: audio.voicesFor('ar'), fr: audio.voicesFor('fr'), report: audio.voiceReport() })), []);
  const set = (patch) => { dispatch({ type: 'SETTINGS', patch }); audio.configure(patch); };
  const setAv = (patch) => dispatch({ type: 'AVATAR', patch });

  const onPhoto = async (e) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setPhotoMsg('Processing on this device…');
    try {
      const url = await cartoonizePhoto(f);
      setAv({ photo: url, usePhoto: true });
      setPhotoMsg('Done — the photo was converted on this device and is stored only in this browser.');
    } catch { setPhotoMsg('Could not read that image. Please try a JPG or PNG photo.'); }
  };

  const doReset = () => {
    audio.stop();
    dispatch({ type: confirm === 'all' ? 'RESET_ALL' : 'RESET_PROGRESS' });
    setConfirm(null);
  };

  const rep = voices.report;
  return (
    <div className="screen parent" dir="ltr" lang="en">
      <header className="parent-bar">
        <h2>Parent dashboard</h2>
        <button type="button" className="btn" onClick={onClose}>Back to Maria ↩</button>
      </header>

      <section className="card">
        <h3>Progress by world</h3>
        <div className="pworlds">
          {WORLD_ORDER.map((id) => {
            const W = WORLDS[id]; const p = worldProgress(state, id); const acc = accuracy(state, id);
            const learned = learnedItems(state, id).map((x) => W.label4(getItem(id, x)));
            const revisit = itemsToRevisit(state, id);
            return (
              <div className="pworld" key={id} style={{ '--wa': W.theme.a }}>
                <div className="pw-head"><span>{W.icon}</span><b>{{ arabic: 'Arabic letters', french: 'French alphabet', numbers: 'Numbers' }[id]}</b></div>
                <ProgressBar value={p.learned} max={p.items} color={W.theme.a} />
                <dl>
                  <dt>Introduced / learned</dt><dd>{p.learned} of {p.items}</dd>
                  <dt>Lessons completed</dt><dd>{p.done} of {p.total}</dd>
                  <dt>First-try accuracy</dt><dd>{acc == null ? '—' : Math.round(acc * 100) + '%'}</dd>
                  <dt>Time spent</dt><dd>{fmtTime(state.time[id] || 0)}</dd>
                  <dt>Current level</dt><dd>{DIFF_LABEL[difficulty(state, id)]}</dd>
                </dl>
                <div className="learned-list" dir={id === 'arabic' ? 'rtl' : 'ltr'}>{learned.length ? learned.map((g, i) => <span key={i}>{g}</span>) : <em dir="ltr">Nothing yet — start the first lesson.</em>}</div>
                {revisit.length > 0 && <p className="revisit">Suggested to revisit: <b dir="auto">{revisit.map((r) => W.label4(getItem(id, r.id))).join('  ')}</b></p>}
              </div>
            );
          })}
        </div>
        <p className="muted">Total time in the app: {fmtTime(state.time.total)} · Sessions: {state.sessions} · Stars earned: {state.stars}</p>
      </section>

      <section className="card">
        <h3>Badges</h3>
        <div className="pbadges">
          {BADGES.map((b) => <div key={b.id} className={`pbadge ${state.badges[b.id] ? 'got' : ''}`}><span>{b.icon}</span><b>{b.title}</b><small>{state.badges[b.id] ? new Date(state.badges[b.id]).toLocaleDateString() : `needs ${b.need}`}</small></div>)}
        </div>
      </section>

      <section className="card">
        <h3>Sound & voices</h3>
        <div className="form-row"><label><input type="checkbox" checked={!state.settings.muted} onChange={(e) => set({ muted: !e.target.checked })} /> Sound on</label></div>
        <div className="form-row"><label>Volume <input type="range" min="0" max="1" step="0.05" value={state.settings.volume} onChange={(e) => set({ volume: +e.target.value })} /></label></div>
        <div className="form-row"><label>Speaking speed <input type="range" min="0.6" max="1.1" step="0.05" value={state.settings.rate} onChange={(e) => set({ rate: +e.target.value })} /> <span>{state.settings.rate.toFixed(2)}×</span></label></div>
        <div className="form-row"><label><input type="checkbox" checked={state.settings.captions} onChange={(e) => set({ captions: e.target.checked })} /> Show captions of what is spoken</label></div>
        {!rep.synth && <p className="warn">This browser has no speech synthesis. Captions and visuals will still work; add recorded clips (see README) for full audio.</p>}
        <div className="voice-grid">
          <div>
            <b>Arabic voice</b>
            {voices.ar.length ? (
              <select value={state.settings.voiceAr} onChange={(e) => set({ voiceAr: e.target.value })}>
                <option value="">Automatic (prefers ar-EG)</option>
                {voices.ar.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
              </select>
            ) : <p className="warn">No Arabic voice reported by this device. Try Chrome/Edge, or install an Arabic voice in the device settings.</p>}
            {rep.ar && <small>Using: {rep.ar.name} ({rep.ar.lang}){!/EG/i.test(rep.ar.lang) && ' — not an Egyptian-specific voice, but it reads the Egyptian Arabic text.'}</small>}
            <button type="button" className="btn small" onClick={() => audio.speak([ar('برافو يا ماريا! شاطرة جداً!')])}>Test Arabic</button>
          </div>
          <div>
            <b>French voice</b>
            {voices.fr.length ? (
              <select value={state.settings.voiceFr} onChange={(e) => set({ voiceFr: e.target.value })}>
                <option value="">Automatic (prefers fr-FR)</option>
                {voices.fr.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
              </select>
            ) : <p className="warn">No French voice reported by this device.</p>}
            {rep.fr && <small>Using: {rep.fr.name} ({rep.fr.lang})</small>}
            <button type="button" className="btn small" onClick={() => audio.speak([fr('Bonjour Maria ! A comme avion !')])}>Test French</button>
          </div>
        </div>
        <div className="form-row"><label><input type="checkbox" checked={state.settings.reduceMotion} onChange={(e) => set({ reduceMotion: e.target.checked })} /> Reduce animations (also follows the device setting)</label></div>
      </section>

      <section className="card">
        <h3>Maria's avatar</h3>
        <div className="av-edit">
          <Avatar avatar={state.avatar} accessory={state.equipped.accessory} size={140} />
          <div className="av-controls">
            <div className="swatches"><span>Skin</span>{SKINS.map((c) => <button key={c} type="button" className={`sw ${state.avatar.skin === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setAv({ skin: c, usePhoto: false })} aria-label={`skin ${c}`} />)}</div>
            <div className="swatches"><span>Hair</span>{HAIRS.map((c) => <button key={c} type="button" className={`sw ${state.avatar.hair === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setAv({ hair: c, usePhoto: false })} aria-label={`hair ${c}`} />)}</div>
            <div className="swatches"><span>Outfit</span>{OUTFITS.map((c) => <button key={c} type="button" className={`sw ${state.avatar.outfit === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setAv({ outfit: c })} aria-label={`outfit ${c}`} />)}</div>
            <div className="photo-box">
              <b>Optional photo</b>
              <p className="muted">The photo is turned into a soft cartoon-style picture right here in the browser. It is never uploaded, shared or given a web address — it is stored only in this browser and you can remove it any time.</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} hidden />
              <div className="btn-row">
                <button type="button" className="btn" onClick={() => fileRef.current?.click()}>{state.avatar.photo ? 'Replace photo' : 'Choose photo'}</button>
                {state.avatar.photo && <>
                  <label><input type="checkbox" checked={state.avatar.usePhoto} onChange={(e) => setAv({ usePhoto: e.target.checked })} /> Use photo avatar</label>
                  <button type="button" className="btn danger" onClick={() => { setAv({ photo: null, usePhoto: false }); setPhotoMsg('Photo removed from this browser.'); }}>Remove photo</button>
                </>}
              </div>
              {photoMsg && <p className="muted">{photoMsg}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Data & privacy</h3>
        <p>All progress, settings and the optional photo are stored <b>only on this device, in this browser</b> (localStorage). Nothing is sent to any server. Clearing browser data, using private browsing, or switching device/browser starts fresh.</p>
        {!storageOk && <p className="warn">This browser is blocking local storage, so progress will be lost when the page is closed.</p>}
        <div className="btn-row">
          <button type="button" className="btn danger" onClick={() => setConfirm('progress')}>Reset learning progress…</button>
          <button type="button" className="btn danger ghost" onClick={() => setConfirm('all')}>Reset everything (incl. avatar & settings)…</button>
        </div>
      </section>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Are you sure?">
        <p>{confirm === 'all' ? 'This deletes all progress, stars, badges, rewards, settings and the avatar photo from this browser.' : 'This deletes lessons, stars, badges and rewards. Avatar and sound settings are kept.'} This cannot be undone.</p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => setConfirm(null)}>Cancel</button>
          <button type="button" className="btn danger" onClick={doReset}>Yes, reset</button>
        </div>
      </Modal>
    </div>
  );
}
