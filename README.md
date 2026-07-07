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

> **Repository layout:** Molten is a **single-root Next.js app** (`src/app`), _not_ a
> Turborepo/`apps/web` monorepo. There are no internal `packages/*`, so there's nothing to
> `transpilePackages` and Vercel's **Root Directory must be the repository root**.

## Getting started

```bash
pnpm install                 # also runs `prisma generate` via postinstall
cp .env.example .env         # set DATABASE_URL to a Postgres connection string
pnpm db:setup                # prisma db push + seed (needs a reachable Postgres)
pnpm ws                      # terminal 1: realtime WebSocket server (port 4001)
pnpm dev                     # terminal 2: http://localhost:3000
```

Need a local Postgres? Any of Vercel Postgres, Neon, Supabase, or `docker run -e
POSTGRES_PASSWORD=postgres -p 5432:5432 postgres` works — just point `DATABASE_URL` at it.

## Deploying to Vercel

This is a single Next.js app; deploy it directly.

**Dashboard settings**

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `./` (repository root — **not** `apps/web`) |
| Include files outside root directory | Off (there are no workspace packages) |
| Install Command | leave default, or `pnpm install --no-frozen-lockfile` |
| Build Command | leave default (`pnpm build` → `prisma generate && next build`) |
| Output Directory | leave default (`.next`) |
| Node.js Version | 20.x |

`vercel.json` in the repo already pins the framework, install and build commands.

**Environment variables** (Project → Settings → Environment Variables)

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string. With Vercel Postgres, copy `POSTGRES_PRISMA_URL`. |
| `SESSION_SECRET` | recommended | Long random string for signing session cookies. |
| `NEXT_PUBLIC_WS_URL` | optional | Leave **empty** on Vercel — serverless can't host the long-lived ws server, so the client falls back to a simulated in-browser feed. Set it only if you self-host `pnpm ws` somewhere. |

**After the first deploy**, seed the database once (from your machine, pointing at the prod DB):

```bash
DATABASE_URL="<your-prod-postgres-url>" pnpm db:push
DATABASE_URL="<your-prod-postgres-url>" pnpm db:seed
```

The app is **build-safe and runtime-resilient**: it builds with no DB connection, and if the DB
is unreachable at runtime every page still renders (empty states) instead of erroring — so a
missing/misconfigured `DATABASE_URL` won't produce platform 404/500s.

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
- **Auth** — simulated sign-in-with-wallet: `POST /api/auth/connect` upserts a `User` and sets a
  signed session cookie (`src/lib/session.ts`); `GET /api/auth/me` restores it. Stands in for
  SIWE + iron-session.
- **Trade execution** — `POST /api/trade` applies the bonding-curve math, writes the `Trade`,
  updates the token's price/curve/volume/status, upserts the user's `Position`, awards points, and
  broadcasts the fill over the realtime layer.
- **REST API** — route handlers under `src/app/api/*`: `/tokens`, `/tokens/[id]`, `.../trades`,
  `.../holders`, `.../messages` (community chat GET+POST), `/kols`, `/governance` (GET+POST),
  `/governance/[id]/vote` (POST, transactional), `/treasury`, `/analytics`, `/points`, `/referrals`,
  `/notifications` (GET+PATCH), `/positions`, `/tracked` (GET/POST/DELETE), `/trade`, `/auth/*`,
  `/ai/generate`, `/ai/ask`.
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
- `/ai` — AI token generator + data-grounded assistant
- `/features` — live registry of all 150 numbered features + rollout status
- `/settings` — currency, density, accent, lite mode, streamer mode, paper trading, sound alerts, reduced motion, daily loss cap
- `/compare` — side-by-side token comparison
- `/multichart` — up to 4 live charts at once
- `/narratives` — tokens grouped by meta/narrative
- `/status` — system status + uptime

## Wallet connection & auth (real)

Wallet connect uses **wagmi v3 + viem** with the `injected` connector, so any EIP-1193 browser
wallet works out of the box: **MetaMask, Rabby, Phantom (EVM), OKX, Trust, Coinbase extension,
Brave**. Sign-in is real **EIP-4361 (Sign-In With Ethereum)**:

1. `GET /api/auth/nonce` issues a signed, httpOnly nonce
2. the wallet signs a SIWE message (no gas, no transaction)
3. `POST /api/auth/verify` verifies the signature with `viem.verifyMessage`, upserts the `User`,
   and opens a session cookie

The chain is **HyperEVM** (chainId 999). WalletConnect / Coinbase Smart Wallet can be added by
installing their SDKs and setting `NEXT_PUBLIC_WC_PROJECT_ID`.

## What's live end-to-end

- **Real Sign-In-With-Ethereum** → server session → per-user data
- **Real trade execution** on the bonding curve: buy/sell updates price, position, points, and
  broadcasts the fill to every connected client over WebSocket in real time
- **Per-user positions** shown on the position strip and dashboard, updating live on fills
- **Persistent community chat** per token
- **Governance voting** that persists (transactional, idempotent per user)
- **Tracked wallets** persisted per user
- **AI** token generator + assistant grounded in live DB data
- **CSV export** on data tables, recently-viewed token bar, ⌘K command palette

## The 150 features

All 150 numbered features (spec §"50 ADDITIONAL FEATURES" + §"100 MORE FEATURES") are catalogued in
`src/lib/features.ts` and surfaced at `/features` as a live feature-flag registry with per-feature
status (`live` / `beta` / `soon`). Per the spec's Phase 6 guidance ("implement quick wins first,
stub the rest behind feature flags"), a large batch of quick wins is fully implemented —
command palette, multi-chart, token comparison, trending narratives, currency toggle, lite mode,
streamer mode, table density, sound alerts, reduced motion, paper trading, anti-fat-finger guard,
net-flow gauge, Fear/Greed index, recently-viewed bar, CSV export, status page, and more — while
the remainder are transparently flagged as planned.

## Status

Phases 1–5 of the master roadmap are substantially implemented, backed by a **real persistent
database, REST API, session auth and WebSocket server**, plus the Phase 6 feature-flag registry.
Remaining deep items: worker-driven copy-trading (needs Redis), real Hyperliquid SDK wiring, and
the features still marked `soon` in the registry.
