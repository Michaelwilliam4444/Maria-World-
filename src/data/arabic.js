// World 1 — Arabic letters, in the order requested.
// glyph: isolated form shown to the child (positional forms are a later level).
// name: letter name as spoken in Egyptian Arabic. sound: letter with fatha for "say it together".
// word / pic: example word + illustration. family: letters that share a skeleton (used for harder distractors).
export const ARABIC_LETTERS = [
  { id: 'alif', glyph: 'أ', name: 'الألف', short: 'ألف', sound: 'أَ', word: 'أسد', pic: '🦁', family: 'alif' },
  { id: 'ba', glyph: 'ب', name: 'الباء', short: 'با', sound: 'بَ', word: 'بطة', pic: '🦆', family: 'ba' },
  { id: 'ta', glyph: 'ت', name: 'التاء', short: 'تا', sound: 'تَ', word: 'تفاحة', pic: '🍎', family: 'ba' },
  { id: 'tha', glyph: 'ث', name: 'الثاء', short: 'ثا', sound: 'ثَ', word: 'ثعلب', pic: '🦊', family: 'ba' },
  { id: 'jim', glyph: 'ج', name: 'الجيم', short: 'جيم', sound: 'جَ', word: 'جمل', pic: '🐪', family: 'jim' },
  { id: 'ha', glyph: 'ح', name: 'الحاء', short: 'حا', sound: 'حَ', word: 'حصان', pic: '🐴', family: 'jim' },
  { id: 'kha', glyph: 'خ', name: 'الخاء', short: 'خا', sound: 'خَ', word: 'خروف', pic: '🐑', family: 'jim' },
  { id: 'dal', glyph: 'د', name: 'الدال', short: 'دال', sound: 'دَ', word: 'دب', pic: '🐻', family: 'dal' },
  { id: 'dhal', glyph: 'ذ', name: 'الذال', short: 'ذال', sound: 'ذَ', word: 'ذرة', pic: '🌽', family: 'dal' },
  { id: 'ra', glyph: 'ر', name: 'الراء', short: 'را', sound: 'رَ', word: 'رز', pic: '🍚', family: 'ra' },
  { id: 'zay', glyph: 'ز', name: 'الزاي', short: 'زاي', sound: 'زَ', word: 'زرافة', pic: '🦒', family: 'ra' },
  { id: 'sin', glyph: 'س', name: 'السين', short: 'سين', sound: 'سَ', word: 'سمكة', pic: '🐟', family: 'sin' },
  { id: 'shin', glyph: 'ش', name: 'الشين', short: 'شين', sound: 'شَ', word: 'شمس', pic: '☀️', family: 'sin' },
  { id: 'sad', glyph: 'ص', name: 'الصاد', short: 'صاد', sound: 'صَ', word: 'صاروخ', pic: '🚀', family: 'sad' },
  { id: 'dad', glyph: 'ض', name: 'الضاد', short: 'ضاد', sound: 'ضَ', word: 'ضفدع', pic: '🐸', family: 'sad' },
  { id: 'tah', glyph: 'ط', name: 'الطاء', short: 'طا', sound: 'طَ', word: 'طيارة', pic: '✈️', family: 'tah' },
  { id: 'zah', glyph: 'ظ', name: 'الظاء', short: 'ظا', sound: 'ظَ', word: 'ظرف', pic: '✉️', family: 'tah' },
  { id: 'ain', glyph: 'ع', name: 'العين', short: 'عين', sound: 'عَ', word: 'عنب', pic: '🍇', family: 'ain' },
  { id: 'ghain', glyph: 'غ', name: 'الغين', short: 'غين', sound: 'غَ', word: 'غزال', pic: '🦌', family: 'ain' },
  { id: 'fa', glyph: 'ف', name: 'الفاء', short: 'فا', sound: 'فَ', word: 'فيل', pic: '🐘', family: 'fa' },
  { id: 'qaf', glyph: 'ق', name: 'القاف', short: 'قاف', sound: 'قَ', word: 'قطة', pic: '🐱', family: 'fa' },
  { id: 'kaf', glyph: 'ك', name: 'الكاف', short: 'كاف', sound: 'كَ', word: 'كلب', pic: '🐶', family: 'kaf' },
  { id: 'lam', glyph: 'ل', name: 'اللام', short: 'لام', sound: 'لَ', word: 'ليمون', pic: '🍋', family: 'lam' },
  { id: 'mim', glyph: 'م', name: 'الميم', short: 'ميم', sound: 'مَ', word: 'موز', pic: '🍌', family: 'mim' },
  { id: 'nun', glyph: 'ن', name: 'النون', short: 'نون', sound: 'نَ', word: 'نحلة', pic: '🐝', family: 'ba' },
  { id: 'haa', glyph: 'هـ', name: 'الهاء', short: 'ها', sound: 'هَ', word: 'هدية', pic: '🎁', family: 'haa' },
  { id: 'waw', glyph: 'و', name: 'الواو', short: 'واو', sound: 'وَ', word: 'وردة', pic: '🌹', family: 'waw' },
  { id: 'ya', glyph: 'ي', name: 'الياء', short: 'يا', sound: 'يَ', word: 'يد', pic: '✋', family: 'ya' },
];
