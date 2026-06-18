# SimpledCard Interview — Odd-Box Frontend Assignment

The starting project for your assignment. See the assignment instructions in the provided PDF.

## Prerequisites

- Node.js 24 (LTS)

## Setup

```bash
npm install
```

## Development server

```bash
npm start
```

Then open `http://localhost:4200/`. The app reloads on source changes.

## Build

```bash
npm run build
```

Build artifacts are written to `dist/`.

## Unit tests

Tests run with [Vitest](https://vitest.dev/):

```bash
npm test
```

## Highscores API (local mock)

The highscores REST API is mocked with [json-server](https://github.com/typicode/json-server).
Run it alongside the dev server (in a second terminal):

```bash
npm run api
```

It starts a server on `http://localhost:3000/`. The base URL is configured in
[`src/environments/environment.ts`](src/environments/environment.ts).

### Highscore resource

| Field       | Type     | Notes                                                  |
| ----------- | -------- | ------------------------------------------------------ |
| `id`        | string   | Server-assigned on create.                             |
| `name`      | string   | Required, non-empty, max 20 characters.                |
| `timeMs`    | number   | Required, positive integer (milliseconds).             |
| `createdAt` | string   | Server-assigned ISO 8601 timestamp (UTC) on create.    |

### `GET /highscores`

Returns the full list of highscores.

- **Request body:** none.
- **Response:** `200 OK`

```json
[
  { "id": "seed-grace", "name": "Grace", "timeMs": 38900, "createdAt": "2026-01-17T09:15:00.000Z" },
  { "id": "seed-ada", "name": "Ada", "timeMs": 42310, "createdAt": "2026-01-15T10:00:00.000Z" }
]
```

### `POST /highscores`

Creates a new highscore. The server assigns `id` and stamps `createdAt`; any
client-supplied value for those fields is ignored.

- **Request headers:** `Content-Type: application/json`
- **Request body:** only `name` and `timeMs` are accepted — extra fields are rejected (see below).

```json
{ "name": "Tim", "timeMs": 45000 }
```

- **Response:** `201 Created`

```json
{ "id": "a1b2c3", "name": "Tim", "timeMs": 45000, "createdAt": "2026-06-16T12:00:00.000Z" }
```

- **Response:** `400 Bad Request` — when validation fails. The body carries a
  per-field `errors` object. Validation rejects a missing/empty/over-20-char
  `name`, a `timeMs` that is not a positive integer, and any unexpected field.

```json
{
  "error": "Invalid highscore",
  "errors": {
    "name": "name is required and must be a non-empty string",
    "timeMs": "timeMs is required and must be a positive integer (milliseconds)"
  }
}
```

> The data resets on every `npm run api` start: the runtime `db.json` is
> regenerated from the committed seed [`db.seed.json`](db.seed.json) (so it's
> gitignored). Edit `db.seed.json` to change the starting highscores.
