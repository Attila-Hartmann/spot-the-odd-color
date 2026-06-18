// Local highscores mock API, built on top of json-server.
//
// What this wrapper adds over the plain `json-server` CLI:
//   1. It seeds from `db.seed.json` into a fresh `db.json` on every start, so
//      the data resets to a known state each run (db.json is gitignored).
//   2. It stamps `createdAt` on newly created highscores, matching the API
//      contract (json-server itself only echoes back what you POST + an id).
//   3. It validates the POST body and returns `400` with an `errors` object
//      when the data is invalid, so the client has real error states to handle.
//
// Run it with `npm run api`. Endpoints: GET/POST http://localhost:<PORT>/highscores
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js';
import { Observer } from 'json-server/lib/adapters/observer.js';
import { createApp } from 'json-server/lib/app.js';
import { Service } from 'json-server/lib/service.js';

const here = dirname(fileURLToPath(import.meta.url));
const SEED_FILE = join(here, 'db.seed.json');
const DB_FILE = join(here, 'db.json');
const PORT = Number(process.env.PORT ?? 3000);
const MAX_NAME_LENGTH = 20;
const ALLOWED_FIELDS = ['name', 'timeMs'];

// Reset the working database from the committed seed on each start.
copyFileSync(SEED_FILE, DB_FILE);

/** Returns an `{ field: message }` object of problems, or null when valid. */
function validateHighscore(data) {
  const errors = {};

  if (typeof data?.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'name is required and must be a non-empty string';
  } else if (data.name.length > MAX_NAME_LENGTH) {
    errors.name = `name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }

  if (
    typeof data?.timeMs !== 'number' ||
    !Number.isInteger(data.timeMs) ||
    data.timeMs <= 0
  ) {
    errors.timeMs = 'timeMs is required and must be a positive integer (milliseconds)';
  }

  // Reject anything outside the contract (e.g. a stray `isAdmin` field).
  for (const key of Object.keys(data ?? {})) {
    if (!ALLOWED_FIELDS.includes(key)) {
      errors[key] = `unexpected field (allowed: ${ALLOWED_FIELDS.join(', ')})`;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// Validate + stamp `createdAt` when a highscore is created. The body parser has
// already populated `data` by this point. Throwing here is turned into a clean
// 4xx response by `app.onError` below.
const create = Service.prototype.create;
Service.prototype.create = function (name, data) {
  if (name === 'highscores') {
    const errors = validateHighscore(data);
    if (errors) {
      throw Object.assign(new Error('Invalid highscore'), { status: 400, errors });
    }
    data = { ...data, createdAt: new Date().toISOString() };
  }
  return create.call(this, name, data);
};

const db = new Low(new Observer(new NormalizedAdapter(new JSONFile(DB_FILE))), {});
await db.read();

const app = createApp(db, { logger: false, static: [] });

// Turn thrown errors into JSON responses. CORS headers are already set by the
// time a route handler runs, so the browser can still read the error body.
app.onError = (err, _req, res) => {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const body = err?.errors
    ? { error: err.message, errors: err.errors }
    : { error: err?.message ?? 'Internal Server Error' };
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

app.listen(PORT, () => {
  console.log(`Highscores mock API running on http://localhost:${PORT}`);
  console.log(`Endpoints: GET/POST http://localhost:${PORT}/highscores`);
});
