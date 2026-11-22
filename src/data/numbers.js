// World 3 — Numbers. Built as ranges so 21–50, 51–100 (and other languages) can be added
// by appending to NUMBER_LEVELS and NUMBER_NAMES without touching lesson logic.
export const NUMBER_NAMES = {
  ar: [null, 'واحد', 'اتنين', 'تلاتة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'تمانية', 'تسعة', 'عشرة',
    'حداشر', 'اتناشر', 'تلاتاشر', 'أربعتاشر', 'خمستاشر', 'ستاشر', 'سبعتاشر', 'تمنتاشر', 'تسعتاشر', 'عشرين'],
  // future: fr: [null, 'un', 'deux', ...]
};

export const NUMBER_LEVELS = [
  { id: 'n1', from: 1, to: 10, title: '١ – ١٠', available: true },
  { id: 'n2', from: 11, to: 20, title: '١١ – ٢٠', available: true },
  { id: 'n3', from: 21, to: 50, title: '٢١ – ٥٠', available: false },
  { id: 'n4', from: 51, to: 100, title: '٥١ – ١٠٠', available: false },
];

const OBJECTS = [
  { pic: '🎈', ar: 'بالونات' }, { pic: '🍎', ar: 'تفاحات' }, { pic: '⭐', ar: 'نجوم' }, { pic: '🐟', ar: 'سمكات' },
  { pic: '🦋', ar: 'فراشات' }, { pic: '🌸', ar: 'وردات' }, { pic: '🍓', ar: 'فراولات' }, { pic: '🐥', ar: 'كتاكيت' },
  { pic: '🚗', ar: 'عربيات' }, { pic: '🧁', ar: 'كب كيك' },
];

const toArabicDigits = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

export const NUMBERS = [];
for (const lvl of NUMBER_LEVELS.filter((l) => l.available)) {
  for (let n = lvl.from; n <= lvl.to; n++) {
    const obj = OBJECTS[(n - 1) % OBJECTS.length];
    NUMBERS.push({ id: 'n' + n, value: n, level: lvl.id, name: NUMBER_NAMES.ar[n], digit: String(n), arDigit: toArabicDigits(n), pic: obj.pic, objName: obj.ar });
  }
}

export const countingPhrase = (n) => NUMBER_NAMES.ar.slice(1, n + 1).join('، ');
export { toArabicDigits };
