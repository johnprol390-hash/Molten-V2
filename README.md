# Molten — Hyperliquid Launchpad & Trading Terminal

Molten is a **Hyperliquid-native memecoin launchpad and trading terminal** that combines
Pump.fun-style launch mechanics with an Axiom Pro-grade trading interface, with
institutional-grade safety analytics on every token.

This repository is a **simulation-first** build (as the spec endorses): the entire UI works
end-to-end against deterministic seeded data and a simulated realtime layer, so real
Hyperliquid wiring can slot in behind the same interfaces later.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Prisma ORM** + **SQLite** (swap `DATABASE_URL` for Postgres in production)
- **REST API** route handlers + a standalone **`ws` WebSocket server** for realtime
- **Tailwind CSS** design system — dark, Hyperliquid mint-green (`#97FCE4`), terminal density, tabular numerics
- **Zustand** for client state, **Framer Motion** for micro-animations
- **lightweight-charts** (candlesticks), **D3** (bubble map)
- **Vitest** unit tests for the pure math/safety modules

## Getting started

```bash
pnpm install
cp .env.example .env      # DATABASE_URL + NEXT_PUBLIC_WS_URL
pnpm db:setup            # prisma db push + seed
pnpm ws                  # terminal 1: realtime WebSocket server (port 4001)
pnpm dev                 # terminal 2: http://localhost:3000
```

Other scripts:

```bash
pnpm build       # prisma generate + next build
pnpm start       # run the production build
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest (curve + safety engine)
pnpm db:push     # apply schema to the database
pnpm db:seed     # seed deterministic data
pnpm ws          # start the realtime server
```

### Backend

- **Database** — Prisma schema in `prisma/schema.prisma` covering Users, Wallets, KOLs, Tokens,
  Trades, Holders, DevTokens, Governance (proposals + votes), Treasury, Referrals, Points,
  Achievements, Notifications and Analytics. SQLite by default; change the `datasource` provider
  and `DATABASE_URL` to run on Postgres.
- **Seed** — `prisma/seed.ts` populates the DB deterministically from the generators in
  `src/lib/mock.ts`.
- **Data access** — `src/lib/queries.ts` (server-only) reads through Prisma and maps rows to the
  domain types; risk factor breakdowns are recomputed by the safety engine (single source of truth).
- **REST API** — route handlers under `src/app/api/*` (`/tokens`, `/tokens/[id]`, `.../trades`,
  `.../holders`, `/kols`, `/governance` (GET+POST), `/governance/[id]/vote` (POST, transactional),
  `/treasury`, `/analytics`, `/points`, `/referrals`, `/notifications`).
- **Realtime** — `server/ws.ts` is a standalone WebSocket server that loads tokens from the DB and
  broadcasts `tick` / `trade` events. The client (`src/store/useRealtime.tsx`) connects to
  `NEXT_PUBLIC_WS_URL` and **falls back to a local simulated ticker** if the server is unavailable,
  with auto-reconnect. The footer shows which transport is active.

The landing, Discover and Token terminal pages are React Server Components that read from the
database; Governance writes real votes back through the API.

## Architecture

Core logic is isolated into pure, unit-tested modules (mirroring the intended
`/packages/curve` and `/packages/safety-engine`), imported by both UI and (future) API so the
math is never duplicated:

| Path | Responsibility |
| --- | --- |
| `src/lib/curve.ts` | Constant-product virtual bonding curve — price, buy/sell quotes, price impact, graduation progress |
| `src/lib/safety.ts` | Safety engine — sniper/insider/bundler/honeypot/… detection rules → composite Risk Score |
| `src/lib/mock.ts` | Deterministic seeded data (tokens, wallets, trades, holders, KOLs, candles) |
| `src/lib/types.ts` | Domain types |
| `src/store/useAppStore.ts` | Session, wallets, presets, tracked wallets, trader modal, connection |
| `src/store/useRealtime.tsx` | Simulated WebSocket ticker driving all live values |

Every wallet address rendered anywhere is a `<WalletLink>` that opens the single global
**Trader Quick-View modal** via `openTraderModal(address)`.

## Pages

- `/` — Landing (hero, live stat counters, trending carousel, features, roadmap, FAQ)
- `/discover` — Pulse layout: **New Pairs**, **About to Graduate**, **Graduated** columns + safety filters
- `/token/[id]` — Axiom-grade terminal: chart, position strip, trade widget (3 presets, order types,
  instant trade), safety panel, bonding-curve viz, and tabs (Trades, Positions, Orders, Holders,
  Top Traders, Dev Tokens, Bubble Map, Community, AI Insights)
- `/launch` — 6-step launch wizard with a live curve simulator
- `/kols` — KOL directory, leaderboard, and live activity feed
- `/leaderboards` — multi-category, multi-timeframe leaderboards
- `/dashboard` — portfolio value, holdings, points, watchlist
- `/wallet/[address]` — wallet profile with PnL curve and trade history
- `/governance` — proposals with **real, transactional voting** and proposal creation
- `/treasury` — holdings, allocation, and on-chain transaction log
- `/analytics` — 9 platform metrics with timeframe toggles
- `/points` — level, points-by-source, achievements
- `/referrals` — link, stats, multi-tier rewards
- `/notifications` — activity feed + per-category preferences
- `/admin` — platform stats, fraud queue, emergency controls

## Status

Phases 1–3 of the master roadmap plus a slice of the tracking layer, now backed by a **real
persistent database, REST API and WebSocket server**. See the roadmap on the landing page for
what's shipped vs. planned.
