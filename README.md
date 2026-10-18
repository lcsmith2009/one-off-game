# ONE OFF — Miss perfectly.

A five-round daily browser game about being exactly wrong. Land **exactly one** above or below the target. Hitting the target loses the round; every run continues through all five rounds.

**Play:** https://lcsmith2009.github.io/one-off-game/

## Release

Build 20 / version 1.0.0. The approved dark/lime design, challenge sequence, seeded daily numbers, four mechanics, and five-round format are retained. `v2.html` remains the production play route; `play.html` remains a compatible entry point.

- Pick One, Type It, Slide It, and single-pass Quick Tap.
- Daily challenges by local calendar date; unlimited practice and labeled daily replays.
- First completed daily score stays fixed. Local streaks, best score, and fastest perfect run.
- Spoiler-free native sharing, clipboard copy, or selectable text fallback.
- Touch-sized controls, keyboard play, labeled inputs, focus management, native stats dialog, and reduced-motion support.
- No runtime dependencies, accounts, analytics, ads, API calls, or payment integration.

Quick Tap waits for **TAP TO START**, followed by the original 900 ms ready period and 650 ms number steps. Tap/click or use Enter/Space on the button. All other rounds have no time limit. Total run time includes time spent reading and waiting.

## Develop and validate

Serve this folder with any static web server, or open `index.html`. Node 20+ is needed only for development checks; Python 3 is needed to create the ZIP.

```sh
npm ci
npm test
npm run build
node scripts/build-release.mjs --check
```

The test suite runs rule/storage checks and real application scripts in a simulated DOM, including complete five-round daily/practice flows, invalid input, replay integrity, blocked storage, timing, and share fallbacks. It is not a replacement for browser testing.

`qa/mobile.html` is a manual QA harness. It embeds the real game at 320×568, 360×800, 393×852, 412×915, and 800×360 CSS-pixel viewports. These are viewport checks, not physical Android device certification.

## itch.io build

`npm run build` regenerates `one-off-itch.html` directly from the production HTML, styles, and JavaScript. Do not edit the generated file by hand.

- `dist/one-off-itch.zip`: upload-ready HTML5 archive, with a self-contained `index.html` at its root.
- `dist/one-off-itch.html`: equivalent single-file upload/download.

Both include the home screen, rules, daily/practice play, local stats, results, sharing, and privacy copy. Navigation stays inside the uploaded game. They require no external assets or network requests to play. Records are local to the browser and host; GitHub Pages and itch.io do not share records.

## Deployment

The existing GitHub Pages “pages build and deployment” workflow publishes `main`. No hosting migration or paid infrastructure is required. Run checks and regenerate the standalone before updating `main`; then check the Pages workflow and test the live game. Previous approved Build 19 remains in Git history at `873c7bf24fec369ff73505219436d55a5745a542`.

## Release materials

See `release/` for listing copy, instructions, launch options, QA findings, and promotional assets when included. No marketplace listing or payment account is created by the build process. Publication and payment setup require the owner's action/approval.
