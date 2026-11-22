import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WORLDS, getItem, PRAISE, TRY_AGAIN, ar } from '../data/worlds.js';
import { BADGES } from '../data/rewards.js';
import { buildLessonSteps, reducer, newBadges } from '../lib/progress.js';
import { audio } from '../lib/audio.js';
import { useStore, useAudioState, useReducedMotion } from '../lib/store.jsx';
import { SpeakButton, Confetti, StarBurst, Group, ChoiceFace, StarCount, MuteToggle } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { countingPhrase, NUMBER_NAMES } from '../data/numbers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function NextButton({ onClick, ready = true, label = 'يلا نكمل' }) {
  return (
    <button type="button" className={`next-btn ${ready ? 'is-ready' : ''}`} onClick={() => { audio.sfx('tap'); onClick(); }} aria-label={label}>
      <svg viewBox="0 0 48 48" aria-hidden><path d="M30 10 L16 24 L30 38" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function BigGlyph({ worldId, item, onTap, anim = true }) {
  if (worldId === 'arabic') return <button type="button" className={`big-glyph glyph-ar ${anim ? 'pop' : ''}`} lang="ar" onClick={onTap} aria-label={item.name}>{item.glyph}</button>;
  if (worldId === 'french') return (
    <button type="button" className={`big-glyph glyph-fr pair ${anim ? 'pop' : ''}`} lang="fr" dir="ltr" onClick={onTap} aria-label={`${item.up} ${item.low}`}>
      <span>{item.up}</span><span className="low">{item.low}</span>
    </button>
  );
  return <button type="button" className={`big-glyph numeral ${anim ? 'pop' : ''}`} dir="ltr" onClick={onTap} aria-label={item.name}>{item.digit}<small>{item.arDigit}</small></button>;
}

// ---------- steps ----------
function IntroStep({ step, onNext }) {
  const W = WORLDS[step.worldId]; const item = getItem(step.worldId, step.itemId);
  const { dispatch } = useStore();
  const [heard, setHeard] = useState(false);
  useEffect(() => { dispatch({ type: 'INTRODUCE', world: step.worldId, itemId: item.id }); }, []); // eslint-disable-line
  return (
    <div className="step step-intro">
      <div className="intro-stage">
        <BigGlyph worldId={step.worldId} item={item} onTap={() => audio.speak(W.nameSpeech(item))} />
        {step.worldId === 'numbers'
          ? <div className="intro-pic"><Group n={item.value} pic={item.pic} size={item.value > 10 ? 'sm' : 'md'} /></div>
          : <button type="button" className="intro-pic pic-card" onClick={() => audio.speak(W.wordSpeech(item))} aria-label={item.word}>
              <span className="pic wiggle">{item.pic}</span><span className="pic-label" lang={step.worldId === 'french' ? 'fr' : 'ar'} dir={step.worldId === 'french' ? 'ltr' : 'rtl'}>{item.word}</span>
            </button>}
      </div>
      <div className="step-controls">
        <SpeakButton segments={W.intro(item)} auto onEnd={() => setHeard(true)} />
        <NextButton onClick={onNext} ready={heard} />
      </div>
    </div>
  );
}

function DemoStep({ step, onNext }) {
  const W = WORLDS[step.worldId]; const item = getItem(step.worldId, step.itemId);
  const [k, setK] = useState(0);
  const [heard, setHeard] = useState(false);
  const reduce = useReducedMotion();
  const replay = () => { setK((x) => x + 1); audio.speak(W.demoSpeech(item), { onEnd: () => setHeard(true) }); };
  useEffect(() => { audio.speak(W.demoSpeech(item), { onEnd: () => setHeard(true) }); }, []); // eslint-disable-line
  return (
    <div className="step step-demo">
      <div className="demo-stage" key={k}>
        {step.worldId === 'numbers' ? (
          <div className="count-demo" dir="ltr">
            {Array.from({ length: item.value }, (_, i) => (
              <span key={i} className={`obj appear ${reduce ? 'no-anim' : ''}`} style={{ animationDelay: `${i * 0.55}s` }}>
                {item.pic}<em style={{ animationDelay: `${i * 0.55}s` }}>{i + 1}</em>
              </span>
            ))}
          </div>
        ) : (
          <svg className={`trace ${reduce ? 'no-anim' : ''}`} viewBox="0 0 300 220" aria-hidden dir={step.worldId === 'french' ? 'ltr' : 'rtl'}>
            {step.worldId === 'arabic'
              ? <text x="150" y="160" textAnchor="middle" className="trace-text ar">{item.glyph}</text>
              : <>
                  <text x="95" y="165" textAnchor="middle" className="trace-text fr">{item.up}</text>
                  <text x="215" y="165" textAnchor="middle" className="trace-text fr low">{item.low}</text>
                </>}
          </svg>
        )}
        {!reduce && step.worldId !== 'numbers' && <span className="trace-hand" aria-hidden>✏️</span>}
      </div>
      <div className="step-controls">
        <button type="button" className="speak-btn speak-lg" onClick={() => { audio.sfx('tap'); replay(); }} aria-label="شوفي تاني">🔁</button>
        <NextButton onClick={onNext} ready={heard} />
      </div>
    </div>
  );
}

function CountStep({ step, onNext, addStars }) {
  const item = getItem(step.worldId, step.itemId);
  const { dispatch } = useStore();
  const [counted, setCounted] = useState([]);
  const done = counted.length === item.value;
  const instruction = [ar(`يلا نعد مع بعض! دوسي على كل واحدة وعدي معايا.`)];
  useEffect(() => { audio.speak(instruction); }, []); // eslint-disable-line
  const tap = (i) => {
    if (counted.includes(i) || done) return;
    const next = [...counted, i];
    setCounted(next);
    audio.sfx('tap');
    if (next.length === item.value) {
      audio.sfx('correct');
      audio.speak([ar(`${NUMBER_NAMES.ar[next.length]}! برافو يا ماريا! دول ${item.name}.`)]);
      dispatch({ type: 'STARS', n: 1 }); addStars(1);
    } else audio.speak([ar(NUMBER_NAMES.ar[next.length])]);
  };
  return (
    <div className="step step-count">
      <div className="count-head">
        <SpeakButton segments={done ? [ar(`يلا نعد: ${countingPhrase(item.value)}`)] : instruction} size="md" />
        <span className="count-badge" dir="ltr">{counted.length}<small>/{item.value}</small></span>
      </div>
      <div className={`count-area ${counted.length === 0 ? 'show-hand' : ''}`}>
        <Group n={item.value} pic={item.pic} size={item.value > 10 ? 'md' : 'lg'} tappable counted={counted} onTap={tap} />
        {counted.length === 0 && <span className="point-hand" aria-hidden>👆</span>}
      </div>
      {done && <><StarBurst /><div className="step-controls"><NextButton onClick={onNext} /></div></>}
    </div>
  );
}

function PromptVisual({ v }) {
  if (v.kind === 'ear') return <div className="prompt-ear" aria-hidden>👂</div>;
  if (v.kind === 'glyph-ar') return <div className="prompt-glyph glyph-ar" lang="ar">{v.value}</div>;
  if (v.kind === 'glyph-fr') return <div className="prompt-glyph glyph-fr" dir="ltr" lang="fr">{v.value}{v.sub && <span className="low"> {v.sub}</span>}</div>;
  if (v.kind === 'pic-word') return <div className="prompt-picword"><span className="pic">{v.pic}</span><span className="pic-label">{v.word}</span></div>;
  if (v.kind === 'numeral') return <div className="prompt-glyph numeral" dir="ltr">{v.value}<small>{v.sub}</small></div>;
  if (v.kind === 'group') return <div className="prompt-group"><Group n={v.value} pic={v.pic} size={v.value > 10 ? 'sm' : 'md'} /></div>;
  return null;
}

function ChoiceStep({ step, onNext, addStars }) {
  const { dispatch } = useStore();
  const [attempt, setAttempt] = useState(0);
  const [removed, setRemoved] = useState([]);
  const [wobble, setWobble] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [nudge, setNudge] = useState(false);
  const busy = useRef(false);
  const lastTap = useRef(Date.now());
  const a = useAudioState();

  useEffect(() => { audio.speak(step.prompt); }, []); // eslint-disable-line
  // guided activity: if Maria hasn't tapped for a while, softly glow the answer
  useEffect(() => {
    if (!step.guided || solved) return;
    const t = setInterval(() => { if (!a.speaking && Date.now() - lastTap.current > 6000) setNudge(true); }, 1000);
    return () => clearInterval(t);
  }, [step.guided, solved, a.speaking]);

  const choose = (c) => {
    if (busy.current || solved || removed.includes(c.id)) return;
    lastTap.current = Date.now();
    busy.current = true; setTimeout(() => { busy.current = false; }, 650); // ignores rapid-fire tapping
    if (c.id === step.correctId) {
      const star = attempt <= 1 && !revealed;
      setSolved(true);
      audio.sfx('correct'); if (star) setTimeout(() => audio.sfx('star'), 250);
      dispatch({ type: 'ANSWER', world: step.worldId, itemId: step.itemId, firstTry: attempt === 0, attempts: attempt + 1, star });
      if (star) addStars(1);
      const praise = revealed ? 'برافو! كده عرفتيها!' : pick(PRAISE);
      let advanced = false;
      const go = () => { if (!advanced) { advanced = true; onNext(); } };
      audio.speak([ar(praise), ...step.praiseExtra], { onEnd: () => setTimeout(go, 500) });
      setTimeout(go, 9000); // safety: never get stuck
    } else {
      audio.sfx('soft');
      setWobble(c.id); setTimeout(() => setWobble(null), 600);
      const n = attempt + 1; setAttempt(n);
      if (n === 1) {
        // simplify: take the wrong option away (if more than 2 remain) and replay
        const left = step.choices.filter((x) => !removed.includes(x.id)).length;
        if (left > 2) setTimeout(() => setRemoved((r) => [...r, c.id]), 500);
        audio.speak([ar(TRY_AGAIN), ...(step.hint || step.prompt)]);
      } else {
        setRevealed(true);
        audio.speak([ar('بصي، دي الإجابة الصح!'), ...step.explain, ar('دوسي عليها!')]);
      }
    }
  };

  const visible = step.choices.filter((c) => !removed.includes(c.id));
  return (
    <div className={`step step-choice ${step.review ? 'is-review' : ''}`}>
      {step.review && <div className="review-tag" aria-hidden>🔁</div>}
      <div className="prompt">
        <PromptVisual v={step.visual} />
        <SpeakButton segments={step.prompt} size="md" />
      </div>
      <div className={`choices n${visible.length} ${step.choices[0].kind === 'group' ? 'choices-groups' : ''}`}>
        {visible.map((c) => {
          const isAns = c.id === step.correctId;
          return (
            <button type="button" key={c.id}
              className={`choice ${wobble === c.id ? 'wobble' : ''} ${(revealed || nudge) && isAns && !solved ? 'glow' : ''} ${solved && isAns ? 'is-correct' : ''} ${solved && !isAns ? 'is-faded' : ''}`}
              onClick={() => choose(c)} aria-label="اختيار" data-ok={isAns ? "1" : undefined}>
              <ChoiceFace c={c} />
              {revealed && isAns && !solved && <span className="point-hand small" aria-hidden>👆</span>}
              {solved && isAns && <StarBurst />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewIntroStep({ step, onNext }) {
  const W = WORLDS[step.worldId];
  const items = step.itemIds.map((id) => getItem(step.worldId, id));
  return (
    <div className="step step-rintro">
      <div className="rintro-items" dir={step.worldId === 'arabic' ? 'rtl' : 'ltr'}>
        {items.map((it) => <span key={it.id} className="rintro-chip">{W.label4(it)}</span>)}
      </div>
      <div className="rintro-mascot" aria-hidden>🎯</div>
      <div className="step-controls">
        <SpeakButton segments={[ar('يلا نراجع اللي اتعلمناه! جاهزة يا ماريا؟')]} auto />
        <NextButton onClick={onNext} />
      </div>
    </div>
  );
}

function CelebrateStep({ step, lesson, earned, onMap, onNextLesson, hasNext }) {
  const { state, dispatch } = useStore();
  const [badges, setBadges] = useState([]);
  const [bonus, setBonus] = useState(0);
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return; once.current = true;
    const first = !state.worlds[step.worldId].done[lesson.id];
    const b = first ? 2 : 1;
    setBonus(b);
    const total = earned + b;
    let next = reducer(state, { type: 'STARS', n: b });
    next = reducer(next, { type: 'COMPLETE_LESSON', world: step.worldId, lessonId: lesson.id, stars: total });
    const nb = newBadges(next);
    dispatch({ type: 'STARS', n: b });
    dispatch({ type: 'COMPLETE_LESSON', world: step.worldId, lessonId: lesson.id, stars: total });
    if (nb.length) dispatch({ type: 'BADGES', ids: nb.map((x) => x.id) });
    setBadges(nb);
    audio.sfx('celebrate');
    audio.speak([ar(`برافو يا ماريا! خلصتي الدرس! كسبتي ${total} نجوم!`), ...nb.map((x) => ar(x.speech))]);
  }, []); // eslint-disable-line
  return (
    <div className="step step-celebrate">
      <Confetti />
      <Avatar avatar={state.avatar} accessory={state.equipped.accessory} size={170} mood="cheer" className="bounce" />
      <div className="earned" aria-label={`${earned + bonus} نجوم`}>
        {Array.from({ length: Math.min(earned + bonus, 12) }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.08}s` }}>⭐</span>)}
      </div>
      {badges.map((b) => (
        <div key={b.id} className="badge-won"><span className="badge-ic">{b.icon}</span><div><b>{b.ar}</b><small dir="ltr">{b.title}</small></div></div>
      ))}
      <div className="step-controls">
        <button type="button" className="round-btn" onClick={() => { audio.sfx('tap'); onMap(); }} aria-label="الخريطة">🗺️</button>
        {hasNext && <NextButton onClick={onNextLesson} label="الدرس الجاي" />}
      </div>
    </div>
  );
}

export default function Lesson({ worldId, lessonId, onExit, onStartLesson }) {
  const W = WORLDS[worldId];
  const { state } = useStore();
  const lessonIndex = W.lessons.findIndex((l) => l.id === lessonId);
  const lesson = W.lessons[lessonIndex];
  const steps = useMemo(() => buildLessonSteps(state, worldId, lesson), [lessonId]); // eslint-disable-line
  const [i, setI] = useState(0);
  const earned = useRef(0);
  const step = steps[i];
  const next = () => setI((x) => Math.min(steps.length - 1, x + 1));
  useEffect(() => () => audio.stop(), []);
  const nextLesson = W.lessons[lessonIndex + 1];
  const props = { step, onNext: next, addStars: (n) => { earned.current += n; } };
  return (
    <div className="screen lesson" style={{ '--wa': W.theme.a, '--wb': W.theme.b, '--wsoft': W.theme.soft, '--wink': W.theme.ink }} dir="rtl">
      <header className="topbar lesson-bar">
        <button type="button" className="icon-btn" onClick={() => { audio.sfx('tap'); onExit(); }} aria-label="رجوع للخريطة">✖️</button>
        <div className="dots" aria-hidden>{steps.map((s, k) => <i key={s.id} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
        <div className="topbar-right"><StarCount /><MuteToggle /></div>
      </header>
      <main className="lesson-body" key={step.id}>
        {step.type === 'intro' && <IntroStep {...props} />}
        {step.type === 'demo' && <DemoStep {...props} />}
        {step.type === 'count' && <CountStep {...props} />}
        {step.type === 'choice' && <ChoiceStep {...props} />}
        {step.type === 'reviewIntro' && <ReviewIntroStep {...props} />}
        {step.type === 'celebrate' && <CelebrateStep step={step} lesson={lesson} earned={earned.current} onMap={onExit} hasNext={!!nextLesson} onNextLesson={() => onStartLesson(nextLesson.id)} />}
      </main>
    </div>
  );
}
export { BADGES };
