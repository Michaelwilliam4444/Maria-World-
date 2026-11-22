// Badges are checked from progress after every lesson. `count(p)` returns a number from summary p.
export const BADGES = [
  { id: 'first', icon: '🔍', title: 'First Discovery', ar: 'أول اكتشاف', need: 1, count: (p) => p.lettersTotal, speech: 'أول حرف! برافو يا ماريا!' },
  { id: 'explorer5', icon: '🧭', title: 'Little Explorer', ar: 'المستكشفة الصغيرة', need: 5, count: (p) => p.lettersTotal, speech: 'خمس حروف! إنتي مستكشفة صغيرة!' },
  { id: 'star10', icon: '🌟', title: 'Alphabet Star', ar: 'نجمة الحروف', need: 10, count: (p) => p.lettersTotal, speech: 'عشر حروف! إنتي نجمة الحروف!' },
  { id: 'arabicChamp', icon: '🏆', title: 'Arabic Champion', ar: 'بطلة العربي', need: 28, count: (p) => p.arabic, speech: 'كل الحروف العربي! إنتي بطلة!' },
  { id: 'french10', icon: '🗼', title: 'French Explorer', ar: 'مستكشفة الفرنساوي', need: 10, count: (p) => p.french, speech: 'عشر حروف فرنساوي! برافو!' },
  { id: 'frenchStar', icon: '🎖️', title: 'French Star', ar: 'نجمة الفرنساوي', need: 26, count: (p) => p.french, speech: 'من A لحد Z! إنتي نجمة الفرنساوي!' },
  { id: 'wizard10', icon: '🪄', title: 'Number Wizard', ar: 'ساحرة الأرقام', need: 10, count: (p) => p.numbersUpTo, speech: 'من واحد لعشرة! إنتي ساحرة الأرقام!' },
  { id: 'math20', icon: '🧮', title: 'Little Mathematician', ar: 'عالمة الرياضيات الصغيرة', need: 20, count: (p) => p.numbersUpTo, speech: 'لحد عشرين! إنتي عالمة رياضيات صغيرة!' },
];

// Rewards unlock when Maria's *total earned* stars reach a threshold. Stars are never spent or
// removed, so nothing can be "lost" and there is no pressure to grind.
export const STICKERS = [
  { id: 'butterfly', pic: '🦋', ar: 'فراشة', at: 3 },
  { id: 'bunny', pic: '🐰', ar: 'أرنب', at: 8 },
  { id: 'panda', pic: '🐼', ar: 'باندا', at: 12 },
  { id: 'unicorn', pic: '🦄', ar: 'يونيكورن', at: 18 },
  { id: 'dolphin', pic: '🐬', ar: 'دولفين', at: 24 },
  { id: 'rainbow', pic: '🌈', ar: 'قوس قزح', at: 30 },
  { id: 'chick', pic: '🐥', ar: 'كتكوت', at: 38 },
  { id: 'turtle', pic: '🐢', ar: 'سلحفاة', at: 46 },
  { id: 'koala', pic: '🐨', ar: 'كوالا', at: 55 },
  { id: 'flower', pic: '🌷', ar: 'وردة', at: 65 },
  { id: 'strawberry', pic: '🍓', ar: 'فراولة', at: 75 },
  { id: 'whale', pic: '🐳', ar: 'حوت', at: 88 },
  { id: 'ladybug', pic: '🐞', ar: 'دعسوقة', at: 100 },
  { id: 'kitten', pic: '🐱', ar: 'قطة', at: 115 },
  { id: 'peacock', pic: '🦚', ar: 'طاووس', at: 130 },
  { id: 'star', pic: '🌟', ar: 'نجمة', at: 150 },
];

export const ACCESSORIES = [
  { id: 'bow', pic: '🎀', ar: 'فيونكة', at: 5 },
  { id: 'flower', pic: '🌼', ar: 'وردة للشعر', at: 15 },
  { id: 'crown', pic: '👑', ar: 'تاج', at: 30 },
  { id: 'horn', pic: '🦄', ar: 'قرن اليونيكورن', at: 50 },
  { id: 'wings', pic: '🦋', ar: 'جناحات فراشة', at: 80 },
  { id: 'glasses', pic: '⭐', ar: 'نضارة نجوم', at: 120 },
];

export const BACKGROUNDS = [
  { id: 'cotton', ar: 'غزل البنات', at: 0, css: 'linear-gradient(160deg,#ffe9f2 0%,#fff6e8 55%,#e9f6ff 100%)' },
  { id: 'peach', ar: 'شروق', at: 10, css: 'linear-gradient(160deg,#ffe3d3 0%,#fff0c9 60%,#ffe7ef 100%)' },
  { id: 'meadow', ar: 'جنينة', at: 25, css: 'linear-gradient(160deg,#e2fbe9 0%,#f4ffd9 55%,#e3f7ff 100%)' },
  { id: 'lavender', ar: 'سما بنفسجي', at: 45, css: 'linear-gradient(160deg,#efe6ff 0%,#ffe6f6 55%,#e6f0ff 100%)' },
  { id: 'rainbow', ar: 'قوس قزح', at: 70, css: 'linear-gradient(160deg,#ffe0e9 0%,#fff3cf 25%,#e1fbe5 50%,#dff0ff 75%,#f1e3ff 100%)' },
  { id: 'night', ar: 'ليلة نجوم', at: 100, css: 'radial-gradient(circle at 20% 15%,#fff8 0 2px,transparent 3px),radial-gradient(circle at 70% 30%,#fff8 0 2px,transparent 3px),radial-gradient(circle at 40% 70%,#fff8 0 2px,transparent 3px),linear-gradient(160deg,#d9d6ff 0%,#c9e4ff 60%,#ffd9ec 100%)' },
];
