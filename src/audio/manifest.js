// Recorded-audio fallback layer.
//
// Every spoken line in the app has a stable key (e.g. "ar-intro-ba", "fr-name-B", "num-name-3").
// If a key is listed here, the app plays the recorded clip instead of browser speech synthesis.
// If the clip fails to load, it falls back to speech synthesis, then to on-screen captions.
//
// To add recordings: put files in /public/audio/ and map them here, e.g.
//   'ar-intro-ba': 'audio/ar-intro-ba.mp3',
//   'fr-name-B':   'audio/fr-name-B.mp3',
// Paths are relative to the site root (they work with the default `base: './'`).
export const AUDIO_MANIFEST = {
  // (empty in v1 — all speech uses the device's voices)
};
