# ONE OFF — final QA report

Date: October 18, 2026. Release: **Build 20 / version 1.0.0**.

**Result:** playable release verified within the scope below. No unresolved game-blocking defect was found. Marketplace publication and payment setup remain unperformed.

Live game: https://lcsmith2009.github.io/one-off-game/

Repository: https://github.com/lcsmith2009/one-off-game

Tested gameplay source commit: `1614657f38015bba0428f636116321475de6f2d3`.

Successful existing Pages workflow: https://github.com/lcsmith2009/one-off-game/actions/runs/39155744604

## Inspection and preservation

Inspected all 12 original tracked files, all 65 commits available on the repository's sole remote branch, the live deployment, prior ONE OFF project context, and the repository's issues/pull requests (none returned). The repository used GitHub Pages' existing dynamic branch deployment, with no checked-in deployment workflow. The previous README described Build 12 even though gameplay had reached Build 19.

Preserved the wordmark, dark/lime presentation, “Miss perfectly” premise, exactly-one-away scoring, five-round sequence, four mechanics, deterministic Daily targets/choices, Practice, local stats, streaks, perfect-run speed records, and spoiler-free sharing. There was no separate narrative/story content in the source to alter. Approved earlier source remains in Git history at `873c7bf24fec369ff73505219436d55a5745a542`.

The sole intentional timing-flow adjustment is an explicit **TAP TO START** before Quick Tap. Its 900 ms ready delay, 650 ms steps, one valid one-away number, and single pass remain. This prevents the timed challenge running before a player can reach/read it on a short screen. Total run time still includes waiting.

## Verified issues and repairs

| Finding | Verification | Repair |
| --- | --- | --- |
| Home stats crashed with `ReferenceError: load is not defined` | Reproduced in the original live browser; completed run still appeared as zero runs on home | Shared guarded store and dedicated home script; records and return state now display |
| Letters consumed Type It and displayed `OFF BY NaN` | Reproduced by submitting `abc` in the original live game | Whole-number validation; invalid entries leave the round open; browser retest passed |
| Untyped/whitespace/non-finite input and duplicate events were unsafe | Regression tests | Input validation, locked controls, guarded Next and completion |
| Daily first score could be overwritten by a run opened before another tab finished | Source inspection and a two-store regression test | Re-read records when saving; preserve the first completed score, including zero |
| Runs spanning midnight could save/share the wrong challenge date; challenge numbering depended on DST | Source inspection and date regression tests | Freeze the run date and use calendar-day numbering |
| Streak/return text could become stale | Source inspection and home refresh tests | Refresh on return, visibility and storage changes; expire broken streaks |
| Input names, feedback announcements, keyboard focus, and modal semantics were incomplete | Browser accessibility tree and source inspection | Labels/status text, focus styles and round navigation, disabled answered inputs, native dialog with Escape/focus return |
| Clipboard path omitted the playable URL and lacked a useful failure state | Source inspection; clipboard browser retest and API-failure regression tests | Complete share text, copy confirmation, selectable fallback; elapsed time stays frozen |
| Standalone itch.io copy could drift and sent Home outside the game | Source inspection and standalone navigation tests | Reproducible self-contained build generated from production; home, rules, stats, privacy, Daily and Practice included |

## Automated verification — 22 passing checks

Executed `npm test`, JavaScript syntax checks, `git diff --check`, standalone source-parity check, and ZIP inspection before deployment. `npm audit` returned zero vulnerabilities at verification time.

The test suite includes complete five-round flows using the actual UI scripts in a **simulated DOM**, perfect and zero scores, invalid input/Enter, duplicate events, Quick Tap readiness/timeout, share success/cancellation/fallback, blocked storage, old/malformed records, streaks/dates, and the generated standalone in Daily and Practice. These are automated application tests, not real-browser or physical-device claims.

Generated and checked **3,660 daily seeds** for valid target ranges, distinct choices, and exactly one winning Pick/Quick Tap option. Fixed October 18 fixtures also confirm the original Build 19 targets and choice order are unchanged.

`dist/one-off-itch.zip` was inspected: a single root `index.html`, byte-identical to the generated standalone, with no external game assets or runtime dependencies.

## Actual browser verification

Chrome cloud browser, desktop viewport **1363 × 936**. Mobile-size checks use the real deployed game inside a sized iframe in `qa/mobile.html`. They exercise real rendering and controls at those CSS sizes; they do not emulate a physical Android phone, a mobile user agent, an on-screen keyboard, or touch hardware.

| Check | Observed outcome |
| --- | --- |
| Original production baseline | Completed all five rounds at 3/5; reproduced stats and NaN bugs |
| Build 20 desktop Daily replay | **5/5**, 34 seconds; all four mechanics; Quick Tap completed with keyboard |
| 360 × 800 Practice | Completed all five rounds at **4/5**; late Quick Tap was correctly scored as a miss |
| 360 × 800 Daily replay | **5/5**, 18 seconds; all mechanics and result navigation |
| Standalone Daily replay | **5/5**, 17 seconds; remained inside the standalone file |
| Standalone Practice failure/timeout | Deliberate **0/5** completed normally, including automatic Quick Tap timeout; Home and Privacy worked |
| Stored records and replay integrity | Home loaded previous records; the original Daily **3/5** remained unchanged after perfect replays; best/perfect time updated; another open home refreshed |
| Native stats dialog | Opened on desktop and 320 px layout; Escape closed it and returned focus to Stats |
| Type It validation | `abc` produced a useful message without scoring; corrected input and Enter advanced normally |
| Keyboard controls | Type It Enter, slider Home/arrows, Quick Tap Enter, and focused Next/result heading verified |
| Sharing | Actual clipboard contained run identity, 5/5, frozen 34-second time, five spoiler-free blocks, tagline and playable URL; copy confirmation displayed |
| Other layouts | Home and first-round width/overflow checks passed at **320 × 568**, **393 × 852**, **412 × 915**, **800 × 360**; 320 px stats dialog also exercised |
| New application console errors | None observed on the tested Build 20/standalone pages; browser-extension metadata messages were unrelated to game code |

No horizontal content overflow was measured in the checked mobile frames. Desktop scrollbars reduce usable frame width in some cases (for example 360 nominal pixels → 345 content pixels); vertical scrolling is expected on short screens.

Screenshots in this package were captured during these real browser tests and cropped to the game viewport. Test scores and local run counters are not customer or revenue metrics.

## Limits and remaining owner actions

- No physical Android/TalkBack, iOS/Safari, Firefox, real mobile keyboard, hardware vibration, or native phone-share-sheet testing was performed. Quick Tap remains a visual timing challenge; full screen-reader-only play is not certified.
- Storage-denial and unavailable/rejected sharing APIs were tested in the simulated DOM. Live clipboard copying was tested; real itch.io sandbox/host behavior still needs its final preview check.
- itch.io redirected the new-game route to login and persistently displayed a Cloudflare security-verification page. One reload did not clear it. No listing, account, payment setup, purchase, or charge was created. See `ITCH-UPLOAD-GUIDE.md` for the exact owner steps.
- The owner must sign in/create a free itch.io account and verify email if prompted, upload/preview the supplied package in a private draft, then approve public publication. Financial identity/terms and payment decisions belong to the owner. The documented $3 collected-payout identity adjustment was not authorized or incurred.

**Spent: $0. Verified sales/customers/revenue: none.** The game and launch assets are ready; marketplace publication is awaiting owner access and approval.
