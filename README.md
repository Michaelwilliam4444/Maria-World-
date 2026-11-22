# Maria's Little World — عالم ماريا الصغير

An audio-first KG1 learning web app for Maria Michael, with three separate worlds:

| World | Content | Activities per item |
|---|---|---|
| 🌙 Arabic letters | All 28 letters (أ → ي), example word + picture each | Listen & identify · choose the matching picture · match word → letter (+ guided try, tracing demo, review) |
| 🗼 French alphabet | A → Z, uppercase + lowercase, French example word | Listen & pick · letter → picture · uppercase ↔ lowercase (+ guided try, demo, review) |
| 🎈 Numbers | 1–10, then 11–20 (21–50 and 51–100 shown as "coming soon") | Tap-to-count · numeral → quantity · quantity → numeral · listen → numeral (+ counting demo, review) |

Every lesson: **introduce → listen → watch a demonstration → guided try → 3 mini-games → spaced review → celebrate.**
A review lesson follows every 5 items. Mistakes get a warm "قربتي يا ماريا، نجرب تاني؟", a simpler choice set, then the answer is shown and explained — no timers, lives, penalties or negative sounds, and stars are never taken away.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev          # local dev server (open the URL it prints, e.g. http://localhost:5173)
npm run build        # static build in dist/
npm run preview      # serve dist/ locally
npm run build:single # one self-contained file: dist-single/index.html
```

## Deploy

It is a static site with no backend, accounts, API keys or paid services.

- **Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, output directory `dist`.
- **GitHub Pages**: run `npm run build` and publish the `dist/` folder (the build uses relative paths, so a sub-folder URL works).
- **Simplest**: `npm run build:single` and host or open `dist-single/index.html` — everything is inlined in one file.

Fonts (Baloo Bhaijaan 2, Fredoka) load from Google Fonts; without a connection the app falls back to system fonts and still works.

## How audio works

- One audio channel: a new line always cancels the previous one, so nothing overlaps.
- Each line is tagged Arabic (`ar`) or French (`fr`) and spoken with a matching device voice — prefers `ar-EG`, then any Arabic voice; prefers `fr-FR`, then any French voice. The French audio and the Egyptian Arabic explanation are always separate utterances.
- The parent dashboard shows **which voice the device actually reports** (or warns that none exists) and lets you pick another, test it, and change the speed.
- **Recorded-audio fallback**: every line has a stable key (e.g. `ar-intro-ba`, `fr-name-B`, `num-name-3`). Put clips in `public/audio/` and map them in `src/audio/manifest.js`; a mapped clip plays instead of the device voice, and if it fails the app falls back to the device voice, then to captions.
- Every audio item has a visible replay button; mute and volume are on the welcome screen and in the parent area, and mute is in every top bar. Captions show what is being said, and all activities work with sound off.

## Privacy & data

- Progress, settings and the optional photo are stored **only in this browser on this device** (`localStorage`). Nothing is sent anywhere. Clearing browser data, private browsing, or another device/browser starts fresh.
- The optional photo is turned into a soft cartoon-style picture on the device (canvas), stored as a small image in local storage, never uploaded and never given a URL. It can be removed in the parent dashboard.
- No ads, links for the child, chat, accounts, purchases or tracking.

## Parent area

Hold the **👨‍👩‍👧 للأهل** button on the home screen for ~3 seconds. It shows progress by world, lessons completed, items learned, first-try accuracy, time spent, current difficulty, suggested items to revisit and badges, plus sound/voice, motion, avatar/photo controls and reset (with confirmation).

## Project structure

```
src/
  data/        arabic.js · french.js · numbers.js (extensible ranges/languages) · worlds.js (lesson paths & scripts) · rewards.js (badges, stickers, accessories, backgrounds)
  lib/         audio.js (speech queue, voices, recorded fallback, sound effects) · progress.js (state, adaptivity, spaced repetition, lesson builder) · storage.js · photo.js · store.jsx
  audio/       manifest.js (recorded clip mapping)
  components/  Avatar.jsx · ui.jsx (speak button, top bar, captions, confetti, parent gate, modal, object groups…)
  screens/     Welcome · Home · Journey · Lesson · Rewards · Parent
```

**Add a number range**: set `available: true` on a level in `NUMBER_LEVELS` and extend `NUMBER_NAMES.ar`. **Add a language for numbers**: add e.g. `NUMBER_NAMES.fr` and a world entry in `worlds.js`.

## Known limitations

- Voice quality depends on the device. Many devices have no Egyptian-specific Arabic voice; a standard Arabic voice reads the Egyptian Arabic text with a more formal accent. Recorded clips (see above) are the fix.
- Some browsers (notably some Firefox/Linux setups) report no Arabic or French voice; the app then shows captions and the parent dashboard says so.
- Illustrations use system emoji, so they look slightly different on iOS, Android and Windows.
- The photo avatar is a stylised (posterised) version of the photo, not a hand-drawn cartoon.
- Letters are taught in their isolated form; connected/positional Arabic forms are a natural next level.
