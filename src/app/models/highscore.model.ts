/** A highscore as returned by the API. */
export interface Highscore {
  id: string;
  name: string;
  /** Completion time in milliseconds — lower is better. */
  timeMs: number;
  /** Server-assigned ISO 8601 timestamp. */
  createdAt: string;
}

/** The payload accepted by `POST /highscores` (server assigns id + createdAt). */
export interface HighscoreInput {
  name: string;
  timeMs: number;
}

/**
 * Per-field validation errors returned in a `400` response body under `errors`.
 * Keyed by field name; the server may also report unexpected fields.
 */
export type HighscoreErrors = Partial<Record<keyof HighscoreInput, string>> &
  Record<string, string>;
