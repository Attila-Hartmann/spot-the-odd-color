/**
 * Production environment (used by `ng build`).
 *
 * The highscores API (`json-server`) only runs locally via `npm run api`, and
 * the static GitHub Pages host can't run it. An empty base URL means highscore
 * requests resolve to a path that 404s in production, so the app falls back to
 * its built-in loading/error states instead of calling `localhost:3000`.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
};
