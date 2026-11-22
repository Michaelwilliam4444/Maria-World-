import { ARABIC_LETTERS } from './arabic.js';
import { FRENCH_LETTERS } from './french.js';
import { NUMBERS, NUMBER_LEVELS, countingPhrase } from './numbers.js';

// A speech segment: { text, lang: 'ar' | 'fr', key? }  (key = id of an optional recorded clip)
const ar = (text, key) => ({ text, lang: 'ar', key });
const fr = (text, key) => ({ text, lang: 'fr', key });

export const PRAISE = ['برافو يا ماريا!', 'شاطرة جداً!', 'واااو، إجابة صح!', 'جميل أوي يا ماريا!', 'هايلة يا ماريا!'];
export const TRY_AGAIN = 'قربتي يا ماريا، نجرب تاني؟';
export const GREETING = 'أهلاً يا ماريا مايكل! مستعدة نلعب ونتعلم النهارده؟';

const REVIEW_EVERY = 5;

function buildLessons(worldId, items, levelOf) {
  const lessons = [];
  let sinceReview = [];
  items.forEach((item, i) => {
    lessons.push({ id: `${worldId}-${item.id}`, kind: 'learn', itemId: item.id, level: levelOf?.(item) });
    sinceReview.push(item.id);
    const levelEnds = levelOf && (i === items.length - 1 || levelOf(items[i + 1]) !== levelOf(item));
    if (sinceReview.length === REVIEW_EVERY || i === items.length - 1 || levelEnds) {
      lessons.push({ id: `${worldId}-review-${lessons.length}`, kind: 'review', itemIds: [...sinceReview], level: levelOf?.(item) });
      sinceReview = [];
    }
  });
  return lessons;
}

export const WORLDS = {
  arabic: {
    id: 'arabic',
    title: 'الحروف العربي',
    label: 'أ ب ت',
    icon: '🌙',
    mascot: '🦁',
    theme: { a: '#ff9f6b', b: '#ffd38a', soft: '#fff1e3', ink: '#a14a14' },
    items: ARABIC_LETTERS,
    lessons: buildLessons('arabic', ARABIC_LETTERS),
    enterSpeech: [ar('يلا ندخل عالم الحروف العربي!')],
    label4: (it) => it.glyph,
    intro: (it) => [ar(`بصي يا ماريا، ده حرف ${it.name}.${it.short} زي ${it.word}. يلا نقولها مع بعض: ${it.sound}... ${it.word}!`, `ar-intro-${it.id}`)],
    nameSpeech: (it) => [ar(`${it.short}... ${it.sound}`, `ar-name-${it.id}`)],
    wordSpeech: (it) => [ar(it.word, `ar-word-${it.id}`)],
    demoSpeech: (it) => [ar(`بصي الحرف بيترسم إزاي... ده حرف ${it.short}!`)],
    explain: (it) => [ar(`ده حرف ${it.short}! ${it.short} زي ${it.word}.`)],
  },
  french: {
    id: 'french',
    title: 'الحروف الفرنساوي',
    label: 'A B C',
    icon: '🗼',
    mascot: '🦉',
    theme: { a: '#7aa7ff', b: '#b9a6ff', soft: '#eef1ff', ink: '#2f3f9a' },
    items: FRENCH_LETTERS,
    lessons: buildLessons('french', FRENCH_LETTERS),
    enterSpeech: [ar('يلا ندخل عالم الحروف الفرنساوي!'), fr('Bonjour Maria !')],
    label4: (it) => it.up,
    intro: (it) => [
      fr(`Bonjour Maria ! Voici la lettre ${it.up}. ${it.up} comme ${it.word} !`, `fr-intro-${it.id}`),
      ar(`ده حرف جديد بالفرنساوي، والكلمة دي معناها ${it.meaning}.`, `fr-explain-${it.id}`),
    ],
    nameSpeech: (it) => [fr(it.up, `fr-name-${it.id}`)],
    wordSpeech: (it) => [fr(it.word, `fr-word-${it.id}`)],
    demoSpeech: (it) => [ar('بصي الحرف الكبير والحرف الصغير.'), fr(`${it.up}... ${it.up} !`)],
    explain: (it) => [fr(`${it.up} comme ${it.word}.`), ar(`الكلمة دي معناها ${it.meaning}.`)],
  },
  numbers: {
    id: 'numbers',
    title: 'الأرقام',
    label: '١ ٢ ٣',
    icon: '🎈',
    mascot: '🐢',
    theme: { a: '#4fd1a5', b: '#a6e86b', soft: '#e9fbf2', ink: '#1d7155' },
    items: NUMBERS,
    levels: NUMBER_LEVELS,
    lessons: buildLessons('numbers', NUMBERS, (it) => it.level),
    enterSpeech: [ar('يلا ندخل عالم الأرقام ونعد مع بعض!')],
    label4: (it) => it.digit,
    intro: (it) => [ar(`ده رقم ${it.name}!`, `num-name-${it.value}`)],
    nameSpeech: (it) => [ar(it.name, `num-name-${it.value}`)],
    wordSpeech: (it) => [ar(it.name, `num-name-${it.value}`)],
    demoSpeech: (it) => [ar(`يلا يا ماريا نعد مع بعض: ${countingPhrase(it.value)}! دول ${it.name}.`, `num-count-${it.value}`)],
    explain: (it) => [ar(`دول ${it.name}! يلا نعدهم: ${countingPhrase(it.value)}.`)],
  },
};

export const WORLD_ORDER = ['arabic', 'french', 'numbers'];
export const itemKey = (worldId, itemId) => `${worldId}:${itemId}`;
export const getItem = (worldId, itemId) => WORLDS[worldId].items.find((i) => i.id === itemId);
export { ar, fr };
