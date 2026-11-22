import { WORLDS, WORLD_ORDER, itemKey, getItem, ar, fr } from '../data/worlds.js';
import { BADGES } from '../data/rewards.js';

export const SCHEMA = 1;

export function initialState() {
  return {
    schema: SCHEMA,
    createdAt: Date.now(),
    settings: { muted: false, volume: 0.9, rate: 0.85, voiceAr: '', voiceFr: '', captions: true, reduceMotion: false },
    avatar: { skin: '#f6cfae', hair: '#3a2418', outfit: '#ff7eb0', style: 'puffs', photo: null, usePhoto: false },
    equipped: { background: 'cotton', accessory: null },
    stars: 0,
    badges: {},
    worlds: { arabic: { done: {} }, french: { done: {} }, numbers: { done: {} } },
    items: {},
    recent: { arabic: [], french: [], numbers: [] },
    time: { total: 0, arabic: 0, french: 0, numbers: 0 },
    lessonCounter: 0,
    sessions: 0,
    lastVisit: null,
  };
}

/** Merge a loaded (possibly older/partial) state over defaults so new fields never crash. */
export function hydrate(saved) {
  const base = initialState();
  if (!saved || typeof saved !== 'object' || saved.schema !== SCHEMA) return base;
  return {
    ...base, ...saved,
    settings: { ...base.settings, ...saved.settings },
    avatar: { ...base.avatar, ...saved.avatar },
    equipped: { ...base.equipped, ...saved.equipped },
    worlds: { ...base.worlds, ...saved.worlds },
    recent: { ...base.recent, ...saved.recent },
    time: { ...base.time, ...saved.time },
    items: saved.items || {},
    badges: saved.badges || {},
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SETTINGS': return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'AVATAR': return { ...state, avatar: { ...state.avatar, ...action.patch } };
    case 'EQUIP': return { ...state, equipped: { ...state.equipped, [action.slot]: action.id } };
    case 'VISIT': return { ...state, sessions: state.sessions + 1, lastVisit: Date.now() };
    case 'TICK': {
      const t = { ...state.time, total: state.time.total + action.seconds };
      if (action.world) t[action.world] = (t[action.world] || 0) + action.seconds;
      return { ...state, time: t };
    }
    case 'INTRODUCE': {
      const k = itemKey(action.world, action.itemId);
      const it = state.items[k] || {};
      if (it.introduced) return state;
      return { ...state, items: { ...state.items, [k]: { asked: 0, firstTry: 0, attempts: 0, ...it, introduced: Date.now() } } };
    }
    case 'ANSWER': {
      // one call per finished question: firstTry = correct on first tap; attempts = taps used
      const k = itemKey(action.world, action.itemId);
      const it = { asked: 0, firstTry: 0, attempts: 0, ...(state.items[k] || {}) };
      it.asked += 1; it.attempts += action.attempts; if (action.firstTry) it.firstTry += 1;
      it.lastSeen = state.lessonCounter;
      const recent = [...(state.recent[action.world] || []), action.firstTry ? 1 : 0].slice(-12);
      return {
        ...state,
        stars: state.stars + (action.star ? 1 : 0),
        items: { ...state.items, [k]: it },
        recent: { ...state.recent, [action.world]: recent },
      };
    }
    case 'STARS': return { ...state, stars: state.stars + action.n };
    case 'COMPLETE_LESSON': {
      const w = state.worlds[action.world];
      const prev = w.done[action.lessonId];
      const rec = { at: Date.now(), times: (prev?.times || 0) + 1, best: Math.max(prev?.best || 0, action.stars) };
      return {
        ...state,
        lessonCounter: state.lessonCounter + 1,
        worlds: { ...state.worlds, [action.world]: { ...w, done: { ...w.done, [action.lessonId]: rec } } },
      };
    }
    case 'BADGES': {
      const b = { ...state.badges };
      action.ids.forEach((id) => { if (!b[id]) b[id] = Date.now(); });
      return { ...state, badges: b };
    }
    case 'RESET_PROGRESS': {
      const fresh = initialState();
      return { ...fresh, settings: state.settings, avatar: state.avatar, sessions: state.sessions };
    }
    case 'RESET_ALL': return initialState();
    default: return state;
  }
}

// ---------- derived data ----------
export const isDone = (state, world, lessonId) => !!state.worlds[world]?.done?.[lessonId];

export function lessonStatus(state, worldId) {
  const lessons = WORLDS[worldId].lessons;
  let firstOpen = -1;
  return lessons.map((l, i) => {
    const done = isDone(state, worldId, l.id);
    const open = i === 0 || isDone(state, worldId, lessons[i - 1].id);
    if (!done && open && firstOpen < 0) firstOpen = i;
    return { lesson: l, done, open: open || done, current: !done && open && firstOpen === i };
  });
}

export function learnedItems(state, worldId) {
  return WORLDS[worldId].lessons.filter((l) => l.kind === 'learn' && isDone(state, worldId, l.id)).map((l) => l.itemId);
}

export function worldProgress(state, worldId) {
  const lessons = WORLDS[worldId].lessons;
  const done = lessons.filter((l) => isDone(state, worldId, l.id)).length;
  return { done, total: lessons.length, learned: learnedItems(state, worldId).length, items: WORLDS[worldId].items.length };
}

export function summary(state) {
  const a = learnedItems(state, 'arabic').length;
  const f = learnedItems(state, 'french').length;
  const nums = new Set(learnedItems(state, 'numbers').map((id) => getItem('numbers', id).value));
  let upTo = 0; while (nums.has(upTo + 1)) upTo++;
  return { arabic: a, french: f, lettersTotal: a + f, numbersUpTo: upTo };
}

export function newBadges(state) {
  const s = summary(state);
  return BADGES.filter((b) => !state.badges[b.id] && b.count(s) >= b.need);
}

export function accuracy(state, worldId) {
  let asked = 0, first = 0;
  for (const [k, v] of Object.entries(state.items)) if (k.startsWith(worldId + ':')) { asked += v.asked || 0; first += v.firstTry || 0; }
  return asked ? first / asked : null;
}

export function itemsToRevisit(state, worldId, n = 4) {
  return Object.entries(state.items)
    .filter(([k, v]) => k.startsWith(worldId + ':') && v.asked >= 2)
    .map(([k, v]) => ({ id: k.split(':')[1], acc: v.firstTry / v.asked, asked: v.asked }))
    .filter((x) => x.acc < 0.75)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, n);
}

/** Gentle adaptation: 2 choices if struggling, 3 normally, 4 (with look-alikes) when doing very well. */
export function difficulty(state, worldId) {
  const r = state.recent[worldId] || [];
  if (r.length < 6) return 'normal';
  const acc = r.reduce((a, b) => a + b, 0) / r.length;
  if (acc >= 0.85 && r.length >= 8) return 'hard';
  if (acc < 0.5) return 'easy';
  return 'normal';
}

// ---------- lesson building ----------
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const choicesFor = (diff) => (diff === 'easy' ? 2 : diff === 'hard' ? 4 : 3);

function distractors(worldId, target, n, diff, learned) {
  const items = WORLDS[worldId].items.filter((i) => i.id !== target.id);
  let pool = [];
  if (worldId === 'numbers') {
    const max = target.value <= 10 ? 10 : 20;
    const near = items.filter((i) => i.value <= max && Math.abs(i.value - target.value) <= (diff === 'hard' ? 2 : 4));
    pool = shuffle(near);
    if (diff !== 'hard') pool.sort((a, b) => Math.abs(b.value - target.value) - Math.abs(a.value - target.value)); // farther = easier
  } else {
    const similar = worldId === 'arabic' ? items.filter((i) => i.family === target.family) : [];
    const known = items.filter((i) => learned.includes(i.id));
    const rest = items.filter((i) => !learned.includes(i.id));
    if (diff === 'hard') pool = [...shuffle(similar), ...shuffle(known), ...shuffle(rest)];
    else {
      // Avoid same-shape letters early; prefer letters Maria has already met.
      const notSimilar = (i) => !similar.includes(i);
      pool = [...shuffle(known.filter(notSimilar)), ...shuffle(rest.filter(notSimilar)), ...shuffle(similar)];
    }
  }
  const out = [];
  const backup = worldId === 'numbers' ? shuffle(items.filter((i) => i.value <= (target.value <= 10 ? 10 : 20))) : shuffle(items);
  for (const p of [...pool, ...backup]) { if (out.length >= n) break; if (!out.find((o) => o.id === p.id)) out.push(p); }
  return out;
}

const glyphChoice = (worldId, it, lower = false) => ({ id: it.id + (lower ? '-low' : ''), kind: worldId === 'arabic' ? 'glyph-ar' : 'glyph-fr', value: worldId === 'arabic' ? it.glyph : lower ? it.low : it.up, itemId: it.id });
const picChoice = (it) => ({ id: it.id + '-pic', kind: 'pic', value: it.pic, itemId: it.id });

export function makeQuestion(worldId, item, variant, { diff = 'normal', learned = [], count, guided = false, review = false } = {}) {
  const W = WORLDS[worldId];
  const n = (count ?? choicesFor(diff)) - 1;
  const others = distractors(worldId, item, n, diff, learned);
  const base = { type: 'choice', worldId, itemId: item.id, variant, guided, review, explain: W.explain(item), praiseExtra: W.wordSpeech(item) };
  let q;
  if (worldId === 'arabic') {
    if (variant === 'listen') q = { prompt: [ar(`فين حرف ${item.short}؟`), ...W.nameSpeech(item)], visual: { kind: 'ear' }, choices: [item, ...others].map((i) => glyphChoice('arabic', i)) };
    if (variant === 'picture') q = { prompt: [ar(`ده حرف ${item.short}. أنهي صورة بتبدأ بحرف ${item.short}؟`)], visual: { kind: 'glyph-ar', value: item.glyph }, choices: [item, ...others].map(picChoice), hint: [ar(`${item.short} زي ${item.word}`)] };
    if (variant === 'word') q = { prompt: [ar(`ده ${item.word}. ${item.word} بتبدأ بأنهي حرف؟`)], visual: { kind: 'pic-word', pic: item.pic, word: item.word }, choices: [item, ...others].map((i) => glyphChoice('arabic', i)) };
  }
  if (worldId === 'french') {
    if (variant === 'listen') q = { prompt: [ar('فين الحرف ده؟'), ...W.nameSpeech(item)], visual: { kind: 'ear' }, choices: [item, ...others].map((i) => glyphChoice('french', i)) };
    if (variant === 'picture') q = { prompt: [fr(item.up), ar('أنهي صورة بتبدأ بالحرف ده؟')], visual: { kind: 'glyph-fr', value: item.up, sub: item.low }, choices: [item, ...others].map(picChoice), hint: [fr(`${item.up} comme ${item.word}`)] };
    if (variant === 'case') {
      let low = others;
      if (diff === 'hard') {
        const look = item.look.map((l) => W.items.find((x) => x.low === l)).filter(Boolean);
        low = [...look, ...others].filter((v, i, a) => a.findIndex((z) => z.id === v.id) === i).slice(0, n);
      }
      q = { prompt: [ar('فين الحرف الصغير بتاع'), fr(item.up)], visual: { kind: 'glyph-fr', value: item.up }, choices: [item, ...low].map((i) => glyphChoice('french', i, true)), hint: [fr(`${item.up}... ${item.low}`)] };
    }
  }
  if (worldId === 'numbers') {
    const numChoice = (i) => ({ id: i.id + '-num', kind: 'numeral', value: i.digit, sub: i.arDigit, itemId: i.id });
    const groupChoice = (i) => ({ id: i.id + '-grp', kind: 'group', value: i.value, pic: item.pic, itemId: i.id });
    if (variant === 'quantity') q = { prompt: [ar(`فين ${item.name}؟`)], visual: { kind: 'numeral', value: item.digit, sub: item.arDigit }, choices: [item, ...others].map(groupChoice) };
    if (variant === 'numeral') q = { prompt: [ar('عدي معايا... دول كام؟')], visual: { kind: 'group', value: item.value, pic: item.pic }, choices: [item, ...others].map(numChoice), hint: W.demoSpeech(item) };
    if (variant === 'listen') q = { prompt: [ar(`فين رقم ${item.name}؟`)], visual: { kind: 'ear' }, choices: [item, ...others].map(numChoice) };
  }
  q.choices = shuffle(q.choices);
  q.correctId = q.choices.find((c) => c.itemId === item.id).id;
  return { ...base, ...q, id: `${variant}-${item.id}-${Math.random().toString(36).slice(2, 7)}` };
}

const VARIANTS = { arabic: ['listen', 'picture', 'word'], french: ['listen', 'picture', 'case'], numbers: ['quantity', 'numeral', 'listen'] };

/** Spaced repetition: weakest and least-recently-seen learned items come back first. */
function pickReviewItems(state, worldId, exclude, n) {
  const learned = learnedItems(state, worldId).filter((id) => !exclude.includes(id));
  const scored = learned.map((id) => {
    const s = state.items[itemKey(worldId, id)] || {};
    const acc = s.asked ? s.firstTry / s.asked : 0.5;
    const stale = state.lessonCounter - (s.lastSeen ?? 0);
    return { id, score: (1 - acc) * 2 + Math.min(stale, 10) / 5 + Math.random() * 0.4 };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, n).map((x) => x.id);
}

export function buildLessonSteps(state, worldId, lesson) {
  const W = WORLDS[worldId];
  const diff = difficulty(state, worldId);
  const learned = learnedItems(state, worldId);
  const steps = [];
  if (lesson.kind === 'learn') {
    const item = getItem(worldId, lesson.itemId);
    steps.push({ type: 'intro', worldId, itemId: item.id, id: 'intro' });
    steps.push({ type: 'demo', worldId, itemId: item.id, id: 'demo' });
    if (worldId === 'numbers') steps.push({ type: 'count', worldId, itemId: item.id, id: 'count' });
    else steps.push(makeQuestion(worldId, item, 'listen', { diff, learned, count: 2, guided: true }));
    for (const v of VARIANTS[worldId]) steps.push(makeQuestion(worldId, item, v, { diff, learned: [...learned, item.id] }));
    for (const rid of pickReviewItems(state, worldId, [item.id], 2)) {
      const v = VARIANTS[worldId][Math.floor(Math.random() * 3)];
      steps.push(makeQuestion(worldId, getItem(worldId, rid), v, { diff, learned, review: true }));
    }
  } else {
    // Review lesson: the last block + a couple of older weak items, mixed activity types.
    const ids = shuffle([...lesson.itemIds, ...pickReviewItems(state, worldId, lesson.itemIds, 2)]);
    const qs = [];
    ids.forEach((id, i) => {
      const v = VARIANTS[worldId][i % 3];
      qs.push(makeQuestion(worldId, getItem(worldId, id), v, { diff, learned, review: true }));
    });
    steps.push({ type: 'reviewIntro', worldId, id: 'rintro', itemIds: lesson.itemIds });
    steps.push(...qs.slice(0, 7));
  }
  steps.push({ type: 'celebrate', worldId, id: 'celebrate' });
  return steps;
}

export { WORLD_ORDER };
