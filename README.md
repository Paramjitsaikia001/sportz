# Sportz API

`Sportz` is a Node.js backend for managing sports matches and live commentary, with real-time delivery over WebSockets.

## Features

- Create and list matches
- Create and list commentary for a match
- Automatic match status calculation (`scheduled`, `live`, `finished`)
- Real-time events over WebSocket
- PostgreSQL persistence with Drizzle ORM + migrations
- Request/upgrade protection with Arcjet

## Tech Stack

- Node.js (ESM)
- Express 5
- WebSocket (`ws`)
- PostgreSQL
- Drizzle ORM / Drizzle Kit
- Zod validation
- Arcjet security middleware

## Project Structure

```text
.
├── src/
│   ├── index.js                   # App bootstrap + HTTP server
│   ├── arcjet.js                  # Arcjet middleware/config
│   ├── db/
│   │   ├── db.js                  # PostgreSQL pool + Drizzle client
│   │   └── schema.js              # Drizzle table schemas
│   ├── routes/
│   │   ├── matches.routes.js      # /matches REST endpoints
│   │   └── commentary.route.js    # /matches/:id/commentary endpoints
│   ├── validation/
│   │   ├── matches.js             # Match request/query validation
│   │   └── commentary.js          # Commentary request/query validation
│   ├── utils/
│   │   └── match-status.js        # Match status computation
│   └── ws/
│       └── server.js              # WebSocket server and subscriptions
├── drizzle/                       # SQL migrations + metadata
├── drizzle.config.js              # Drizzle Kit config
└── package.json
```

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- PostgreSQL database

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sportz
ARCJET_KEY=your_arcjet_key
ARCJET_MODE=DRY_RUN
NODE_ENV=development
PORT=8000
HOST=0.0.0.0
```

### Notes

- `DATABASE_URL` is required by the app and Drizzle config.
- `ARCJET_KEY` is required by current middleware setup.
- In development, Arcjet runs in `DRY_RUN` mode by default.

## Installation

```bash
npm install
```

## Database Setup

Generate migrations (if schema changes):

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

## Run the App

Development mode (with watch):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Default URLs:

- HTTP: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`

## REST API

### Health / Base

- `GET /`
  - Response: plain text welcome message

### Matches

- `GET /matches?limit=50`
  - Query:
    - `limit` (optional, max 100)
  - Response:
    - `{ "data": [ ...matches ] }`

- `POST /matches`
  - Body:

    ```json
    {
      "sport": "football",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "startTime": "2026-04-27T14:00:00.000Z",
      "endTime": "2026-04-27T16:00:00.000Z",
      "homeScore": 0,
      "awayScore": 0
    }
    ```
  - Creates a match and broadcasts a real-time `match_created` event.

### Commentary

- `GET /matches/:id/commentary?limit=10`
  - Query:
    - `limit` (optional, max 100)
  - Response:
    - `{ "data": [ ...commentary ] }`

- `POST /matches/:id/commentary`
  - Body:

    ```json
    {
      "minute": 23,
      "sequence": 1,
      "period": "1H",
      "eventType": "goal",
      "actor": "Player Name",
      "team": "Team A",
      "message": "Great finish into the bottom corner",
      "metadata": { "xg": 0.42 },
      "tags": ["goal", "open-play"]
    }
    ```
  - Creates commentary and broadcasts a real-time `commentary` event for subscribers of the match.

## WebSocket Protocol

Connect to:

`ws://<host>:<port>/ws`

### Client -> Server messages

- Subscribe to a match:

  ```json
  { "type": "subscribe", "matchId": 1 }
  ```

- Unsubscribe from a match:

  ```json
  { "type": "unsubscribe", "matchId": 1 }
  ```

### Server -> Client messages

- On connect:

  ```json
  { "type": "welcome" }
  ```

- Subscribe acknowledgement:

  ```json
  { "type": "subscribed", "matchId": 1 }
  ```

- Unsubscribe acknowledgement:

  ```json
  { "type": "unsubscribed", "matchId": 1 }
  ```

- Match created broadcast:

  ```json
  { "type": "match_created", "data": { "...": "match payload" } }
  ```

- Commentary broadcast:

  ```json
  { "type": "commentary", "data": { "...": "commentary payload" } }
  ```

## Available Scripts

- `npm run dev` - start with file watch
- `npm start` - start server
- `npm run db:generate` - generate migrations from schema
- `npm run db:migrate` - run migrations

## License

ISC
