# AI usage notes

This project was built with AI assistance (Claude Code). Summary of how AI was
used and what I directed, so the work is fully explainable:

## Process

1. **Research** — read the PDF brief, `INSTRUCTIONS.md`, and every starter file;
   confirmed Angular 21 specifics (zoneless-by-default, `input()`/`output()`,
   the Vitest `@angular/build:unit-test` builder) against current docs rather
   than memory.
2. **Plan** — agreed an architecture (signal `GameStore`, `HighscoreService`,
   `DurationPipe`, design-token theme system) and chose extras up front:
   personal best, difficulty meter, confetti, 3-2-1 countdown.
3. **Inspiration** — studied the original Kuku Kube's CSS animations in the
   browser (shake on wrong pick, float-up reward popup, reveal/flash) and
   reproduced the high-value ones as reduced-motion-aware CSS.
4. **Implement → verify** — built in phases, then drove the running app in a
   browser to verify the full flow (5 levels, submit happy + error, highscores,
   theme persistence, mobile layout) and ran the test suite.

## Key decisions I own (see README for detail)

- **Brightness mapping**: additive percentage points on HSL lightness (fair,
  monotonic), not relative scaling.
- **Signals vs RxJS boundary**: signals for synchronous game state; RxJS for the
  HTTP streams and the game clock, bridged into signals.
- **Per-route store provisioning** for a clean session lifecycle.
- **`appReplayOn` directive** to restart CSS animations without DOM recreation
  (avoids Angular's NG0956 warning).

## Transcript

- [`chat-transcript.txt`](chat-transcript.txt) — readable export of the session.
- [`chat-transcript.jsonl`](chat-transcript.jsonl) — raw Claude Code transcript.
