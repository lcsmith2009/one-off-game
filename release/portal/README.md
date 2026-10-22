# ONE OFF — CrazyGames Basic Launch candidate

Prepared October 22, 2026. **Not submitted, approved, monetized or deployed.**

This package evaluates an additional distribution channel for the existing game. It does not replace the public itch.io or GitHub Pages release. Basic Launch has no advertising revenue; selection for Full Launch and a subsequent integration pass are required before monetization.

## Upload files

| Field | Prepared file |
|---|---|
| HTML5 game archive | `one-off-crazygames-basic.zip` — `index.html` at the archive root |
| Landscape cover | `covers/landscape.png` — 1920×1080 |
| Portrait cover | `covers/portrait.png` — 800×1200 |
| Square cover | `covers/square.png` — 800×800 |
| Landscape video | `preview-landscape.mp4` — 1920×1080, 17.1 seconds, 30 fps, silent |
| Portrait video | `preview-portrait.mp4` — 1080×1620, 17.1 seconds, 30 fps, silent |

Preview footage is actual, unspeeded application gameplay. A cover frame opens each preview. There is no sound or visible pointer. Covers extend the existing code-native wordmark and palette without third-party imagery. SVG source files are retained for regeneration; upload PNGs as covers.

## Prepared submission copy

**Title:** ONE OFF

**Short description:** Miss perfectly in five quick number challenges. Land exactly one above or below the target—hitting the target itself loses the round.

**Description:** ONE OFF is a five-round number puzzle about being exactly wrong. Pick a number, type an answer, move the slider and time a Quick Tap. Every answer must be exactly one away from the target. A fresh Daily Run gives everyone the same challenge for their local date; unlimited practice lets you keep playing. Track local scores and streaks, then share a spoiler-free result.

**Controls:** Use a mouse or touch to pick an answer. Type a whole number and press Enter or Lock It. Drag the slider and press Lock It. For Quick Tap, select Tap to Start, wait for the numbers, and tap/click or press Enter/Space when the displayed number is exactly one away. Use Next after each answer.

**Suggested categories:** Puzzle, number, casual. Choose only applicable options actually offered by the submission form.

**Technology:** HTML5/CSS/JavaScript. Self-contained file, no runtime dependencies or external network requests. Local browser storage; no accounts, analytics, purchases, external game promotion or ads in the candidate. There is no backend or cloud save integration.

**Version:** Approved Build 20 / 1.0.0 gameplay, portal packaging variant 1. The game does not claim platform certification.

## What changed in this candidate

- Removed the GitHub playable URL from shared result text to avoid sending portal users to another playable web version.
- Added a compact portal-only layout for short desktop frames; retained the existing touch layout.
- Kept the approved challenge generator, rules, timing, daily records, practice and scoring unchanged.
- Added consistent cover art and real gameplay videos required for submission.

The production `index.html`, `v2.html`, `core.js`, `app.js`, `play-v2.js`, `style.css` and `one-off-itch.html` are unchanged.

## Verification

- Existing suite: **22 tests passed, zero failures**.
- Generated standalone matched production before deriving the candidate.
- Actual Chromium 153.0.8010.0 completed 5/5 at 821×462, 907×510, 1216×684, 360×800 and 720×1080. No horizontal overflow; Play and the round Next controls stayed within each viewport. Share text contained no outgoing URL. No page errors occurred.
- Archive has a single `index.html` at its root, passes ZIP CRC validation, and is about 10 KB compressed / 29 KB uncompressed.
- Video metadata: each 17.1 seconds, 513 frames, 30 fps, H.264, one video stream and no audio. Sampled gameplay frames were visually inspected. Both are far below the 50 MB limit.
- Screen-size checks are simulations, not physical-device certification. Portal QA, its actual embedded environment, engagement metrics and SDK/ad integration are not yet tested.

## Reproduce

```sh
npm ci
npm test
node scripts/build-portal.mjs
node scripts/create-portal-covers.mjs
node scripts/record-portal-preview.cjs
```

The last two scripts require optional local development tools: Sharp for artwork; Playwright, a compatible Chromium binary and ffmpeg/ffprobe for video. The cover/preview scripts can use the existing Codex runtime modules through `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Set `CHROMIUM_EXECUTABLE` when using a separately installed browser. These are development tools, not player dependencies. No paid generation service is used.

## Remaining account steps

1. Sign into an authorized CrazyGames developer account, or complete owner registration and review its terms. No account was created here. Complete the actual form using real owner/company information; never invent missing identity, billing or rights declarations.
2. Inspect any existing ONE OFF submission before making a new one. Upload the game ZIP and the matching covers/videos; use the copy above. Declare Basic Launch and accurately disclose the absence of SDK integration.
3. Test the uploaded preview in the portal QA tool, including keyboard, touch, all rounds, Daily replay, practice, local records and sharing. Fix any actual platform defect before submitting.
4. Submit only after the actual agreement/rights and account details are settled. The submission package itself grants no rights and earns no revenue.
5. If invited to Full Launch, implement and test the required SDK gameplay events, applicable progress-save integration, appropriate ad placements and pause/resume behavior. A between-runs ad opportunity is a candidate to evaluate, not an implemented promise. Do not add intrusive ads after every answer.

## Official references

- [Basic vs Full Launch](https://docs.crazygames.com/)
- [Technical requirements and SDK stages](https://docs.crazygames.com/requirements/technical/)
- [Gameplay requirements, including cross-promotion](https://docs.crazygames.com/requirements/gameplay/)
- [Cover/video specifications](https://docs.crazygames.com/requirements/game-covers/)
- [Payout threshold and timing](https://docs.crazygames.com/payouts/)

Basic Launch measures engagement before Full Launch. It does not guarantee acceptance, traffic, earnings or a payout date.
