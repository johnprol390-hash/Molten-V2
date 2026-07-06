# Molten — Hyperliquid Launchpad & Trading Terminal

Molten is a **Hyperliquid-native memecoin launchpad and trading terminal** that combines
Pump.fun-style launch mechanics with an Axiom Pro-grade trading interface, with
institutional-grade safety analytics on every token.

This repository is a **simulation-first** build (as the spec endorses): the entire UI works
end-to-end against deterministic seeded data and a simulated realtime layer, so real
Hyperliquid wiring can slot in behind the same interfaces later.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** design system — dark, Hyperliquid mint-green (`#97FCE4`), terminal density, tabular numerics
- **Zustand** for client state, **Framer Motion** for micro-animations
- **lightweight-charts** (candlesticks), **D3** (bubble map)
- **Vitest** unit tests for the pure math/safety modules

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts:

```bash
pnpm build      # production build
pnpm start      # run the production build
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest (curve + safety engine)
```

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

## Status

Phases 1–3 of the master roadmap are implemented, plus a slice of the tracking layer (KOLs,
wallet tracking, trader modal). See the roadmap section on the landing page for what's shipped
vs. planned.
