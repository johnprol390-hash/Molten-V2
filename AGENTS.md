# AGENTS.md

## Cursor Cloud specific instructions

Molten is a single Next.js 14 (App Router) app plus one standalone WebSocket
process. It is **simulation-first**: the UI works end-to-end against a seeded
SQLite database, so no blockchain, Redis, or external LLM/API keys are needed.
See `README.md` for the product overview and the full list of npm scripts.

### Services

| Service | Command | Port | Required? |
| --- | --- | --- | --- |
| Next.js dev server (UI + REST API routes) | `pnpm dev` | 3000 | Yes |
| Realtime WebSocket server | `pnpm ws` | 4001 | Optional — the client falls back to a local simulated ticker if it is down |

Run `pnpm ws` and `pnpm dev` in two separate terminals for the full realtime
experience. Standard lint/test/build/run commands live in `package.json`
(`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`).

### One-time setup before running (not handled by the update script)

`.env` and the SQLite DB (`prisma/dev.db`) are git-ignored, so they may be
absent on a fresh VM. If so, create them before running the app:

```bash
cp .env.example .env     # DATABASE_URL + NEXT_PUBLIC_WS_URL
pnpm db:setup            # prisma db push + deterministic seed (20 tokens, KOLs, etc.)
```

`pnpm db:setup` is safe to re-run; it re-pushes the schema and re-seeds.

### Non-obvious notes

- The update script only refreshes dependencies (`pnpm install`) and regenerates
  the Prisma client (`pnpm db:generate`). Prisma v6 does **not** auto-generate the
  client on install, so `pnpm db:generate` is required after installing/changing
  the schema.
- No auth secrets are required: `POST /api/auth/connect` is a simulated
  sign-in-with-wallet (any `0x` hex address works), and requests without a session
  fall back to a built-in `0xdemo…` demo user, so trades can be exercised even
  without connecting. The core hello-world flow is: connect a wallet → `POST /api/trade`
  (bonding-curve buy/sell) → position updates via `GET /api/positions`.
- `next.config.mjs` keeps `ws`/Prisma out of the server bundle (bundling `ws`
  breaks frame masking) and sets `eslint.ignoreDuringBuilds`, so `pnpm build` will
  not fail on lint — run `pnpm lint` separately.
