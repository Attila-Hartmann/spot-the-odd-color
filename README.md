# Odd Box — spot-the-odd-colour

A small Angular 21 game: find the one box that's slightly brighter, five levels,
as fast as you can. Built on the provided starter (menu + `generateBoxColor` +
mock highscores API).

## Run it

```bash
npm install
npm start          # app on http://localhost:4200
npm run api        # mock highscores API on http://localhost:3000 (second terminal)
```

```bash
npm run build      # production build
npm test           # Vitest unit + integration tests
```

Requires Node 24.

## Deployment

Live at **https://attila-hartmann.github.io/spot-the-odd-color/**, published by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (GitHub Actions)
on every push to `main`: it builds with the project base-href, adds a `404.html`
SPA fallback so client-side routes survive a refresh, and deploys to GitHub Pages.

> **Highscores on the live site:** GitHub Pages is a static host and can't run
> the `json-server` backend, so the production build points at an empty API base
> URL ([`environment.production.ts`](src/environments/environment.production.ts))
> and the highscores list/submit show their graceful error states. The full API
> integration works locally with `npm run api`.

## What's implemented

- **Gameplay** (`/game`): 5 levels, grid grows 6×6 → 10×10, odd-box brightness
  shrinks 30% → 10%. A 3-2-1 countdown starts each session, then a count-up
  timer (`mm:ss`). Click the odd box to advance; wrong clicks are a no-op.
- **Score submission**: on finish, a form posts `{name, timeMs}` with
  client-side validation mirroring the server, per-field `400` handling, and
  loading/success/error states.
- **Highscores** (`/highscores`): top-10 fastest, with loading / empty / error
  states and retry.
- **Extras**: persisted personal best + "new record" flag, a difficulty meter in
  the HUD, a confetti win celebration, and the 3-2-1 countdown.

## Key decisions

### State management — signals as the store, RxJS for streams

`GameStore` ([`src/app/game/game.store.ts`](src/app/game/game.store.ts)) is an
injectable, signal-based store: private `signal`s for writable state, `computed`
for everything derived (`gridSize`, `brightnessDelta`, `cells`), and a small set
of intent methods (`begin`, `selectBox`, `playAgain`) as the only way to mutate
it. It's **provided on `GamePage`**, so each visit to `/game` gets a fresh,
self-contained session that's torn down on leave.

The boundary I drew:

- **Signals** own synchronous UI state the template reads directly — they're the
  natural fit for a zoneless app (signal writes drive change detection) and make
  `OnPush` effortless.
- **RxJS** owns lifecycle-bound streams: the HTTP calls
  ([`HighscoreService`](src/app/highscores/highscore.service.ts)) and the game
  clock / countdown (`interval`), each bridged into signals and torn down with
  `takeUntilDestroyed`.

### Brightness mapping — additive on HSL lightness

"+X% brighter" is implemented as **adding X percentage points to the HSL
lightness channel**, clamped to `[0,100]`
([`brighten` in box-color.utils.ts](src/app/utils/box-color.utils.ts)):
`oddL = clamp(baseL + X, 0, 100)`.

I chose additive over relative (`baseL * (1 + X/100)`) deliberately: the base
lightness is random in `[40, 60)`, and additive points keep the **absolute**
brightness gap constant for a given level regardless of that random base — so the
challenge is equally fair on every colour and difficulty decreases strictly
monotonically (30 → 25 → 20 → 15 → 10 points). The provided `generateBoxColor`
is reused verbatim (only `export`ed); the odd colour is derived from it.

### Custom pipe

`DurationPipe` ([`duration.pipe.ts`](src/app/shared/duration.pipe.ts)) formats ms
as `mm:ss` (pure, clamps invalid input). Used by the timer, the result, and the
highscores list.

### Design & motion

- A **design-token system** of CSS custom properties in
  [`styles.scss`](src/styles.scss) (colour / spacing / radius / shadow /
  typography / motion scales) drives a **light/dark theme**. The choice is
  persisted and `prefers-color-scheme` is the initial value; a tiny inline script
  in [`index.html`](src/index.html) applies it before first paint to avoid a
  flash. Chrome is kept neutral so the generated HSL grid colours stay the hero.
- Micro-animations studied from the original Kuku Kube: level-reveal zoom,
  **wrong-click shake + red flash**, a floating **"Nice! / ⚡ Fast!"** reward
  popup, and a win flash + confetti. A reusable
  [`appReplayOn`](src/app/shared/replay-animation.directive.ts) directive
  restarts CSS animations on a value change without recreating DOM. Everything is
  gated behind `prefers-reduced-motion`.
- Responsive: the board is a square sized by `min(vw, vh, rem)` so it always fits
  and stays tappable from mobile to desktop.

### Accessibility

Semantic landmarks, keyboard-operable buttons with a visible focus ring, ARIA on
the toggle / countdown / live regions, and adequate chrome contrast in both
themes. (The gameplay colour subtlety is intentionally exempt.)

### Dependency added

- **`canvas-confetti`** (~2 kB) for the win celebration — lazy-`import()`ed so
  it stays off the initial bundle and a load failure never breaks the game. It's
  the only added runtime dependency; everything else (theme, animations, store)
  is hand-rolled SCSS/TypeScript.

## Tech notes

- Standalone components, new control flow (`@if`/`@for`/`@switch`), `inject()`,
  functional `input()`/`output()`, `OnPush` everywhere.
- The app is **zoneless** (Angular 21 default — no `zone.js`); change detection
  is signal-driven. Routes lazy-load the two feature pages;
  `provideHttpClient(withFetch())` is configured; the API base URL comes from
  `environment.ts`.

## Tests

Vitest, including two integration tests:

- [`game.store.spec.ts`](src/app/game/game.store.spec.ts) — plays through the
  loop: countdown → level 1 (6×6) → correct pick grows the grid → wrong pick is a
  no-op → clearing level 5 finishes with a positive time (clock driven by
  `vi.useFakeTimers()`, since `fakeAsync` needs zone.js).
- [`score-submit.component.spec.ts`](src/app/game/score-submit.component.spec.ts)
  — happy path (POST → 201 → success) and the `400 {errors}` path (field message
  rendered, form re-enabled), plus client-side validation, via
  `HttpTestingController`.

Plus unit tests for the pipe and the colour utilities.

## Trade-offs

- The store is provided per-`GamePage` rather than globally — simpler lifecycle
  and no manual "reset", at the cost of not surviving navigation (intended).
- Reward feedback (shake/popup) lives in the grid component, not the store: it's
  pure view state and the grid already knows which cell is odd, so the store
  stays free of presentation concerns.
- "Fast!" is cosmetic only; the score is always total elapsed time.
