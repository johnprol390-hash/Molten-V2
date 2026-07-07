// Full catalog of the 150 numbered platform features (spec §"50 ADDITIONAL
// FEATURES" + §"100 MORE FEATURES"). Status is the feature flag:
//   live = implemented and usable · beta = partially implemented · soon = planned
// The /features page renders this so scope is transparent, and it doubles as the
// feature-flag registry referenced by the build order.

export type FeatureStatus = "live" | "beta" | "soon";

export interface Feature {
  n: number;
  title: string;
  group: string;
  status: FeatureStatus;
  href?: string;
}

export const FEATURES: Feature[] = [
  // ── Core 1–50 ─────────────────────────────────────────────────────────────
  { n: 1, title: "Global command palette (⌘K)", group: "Terminal & UX", status: "live" },
  { n: 2, title: "Multi-chart view (up to 4 charts)", group: "Terminal & UX", status: "live", href: "/multichart" },
  { n: 3, title: "Customizable terminal layout", group: "Terminal & UX", status: "soon" },
  { n: 4, title: "Hotkeys for buy/sell/preset switching", group: "Terminal & UX", status: "beta" },
  { n: 5, title: "Price alerts (above/below/percent-move)", group: "Alerts", status: "beta", href: "/notifications" },
  { n: 6, title: "Limit-order sniper (fires at market cap)", group: "Advanced Trading", status: "soon" },
  { n: 7, title: "Auto take-profit ladders", group: "Advanced Trading", status: "soon" },
  { n: 8, title: "Trailing stop-loss orders", group: "Advanced Trading", status: "soon" },
  { n: 9, title: "Portfolio rebalance tool", group: "Portfolio", status: "soon" },
  { n: 10, title: "Tax report export (CSV, cost basis)", group: "Portfolio", status: "beta" },
  { n: 11, title: "Trade journal with notes & tags", group: "Portfolio", status: "soon" },
  { n: 12, title: "PnL calendar heatmap", group: "Portfolio", status: "soon" },
  { n: 13, title: "Session stats bar (PnL/win/volume)", group: "Terminal & UX", status: "live", href: "/dashboard" },
  { n: 14, title: "Watchlist folders", group: "Tracking", status: "soon" },
  { n: 15, title: "Token comparison view", group: "Analytics", status: "live", href: "/compare" },
  { n: 16, title: "Holder overlap tool", group: "Analytics", status: "soon" },
  { n: 17, title: "First-buyers list", group: "Analytics", status: "beta" },
  { n: 18, title: "Wallet funding tracer", group: "Safety", status: "soon" },
  { n: 19, title: "Cluster alerts (entity > X% supply)", group: "Safety", status: "beta" },
  { n: 20, title: "Token age verification badge", group: "Safety", status: "live" },
  { n: 21, title: "Social link verification", group: "Social", status: "soon" },
  { n: 22, title: "Embedded live X/Twitter feed", group: "Social", status: "soon" },
  { n: 23, title: "Token SEO / OG cards", group: "Infra", status: "beta" },
  { n: 24, title: "Shareable referral QR codes", group: "Growth", status: "beta", href: "/referrals" },
  { n: 25, title: "Mobile PWA (installable + offline)", group: "Mobile", status: "live" },
  { n: 26, title: "Lite mode toggle", group: "Terminal & UX", status: "live", href: "/settings" },
  { n: 27, title: "Onboarding tour", group: "Terminal & UX", status: "soon" },
  { n: 28, title: "Paper trading mode", group: "Advanced Trading", status: "live", href: "/settings" },
  { n: 29, title: "Launch simulator", group: "Launch", status: "live", href: "/launch" },
  { n: 30, title: "Creator dashboard", group: "Creator", status: "beta" },
  { n: 31, title: "Creator payout streaming", group: "Creator", status: "soon" },
  { n: 32, title: "Token buyback tool for creators", group: "Creator", status: "soon" },
  { n: 33, title: "Trending narratives page", group: "Discovery", status: "live", href: "/narratives" },
  { n: 34, title: "Platform Fear/Greed index", group: "Analytics", status: "live", href: "/analytics" },
  { n: 35, title: "Net flow indicator per token", group: "Analytics", status: "live" },
  { n: 36, title: "Volume anomaly / wash-trade detector", group: "Safety", status: "beta" },
  { n: 37, title: "Slippage guard", group: "Advanced Trading", status: "live" },
  { n: 38, title: "Gas/priority optimizer", group: "Advanced Trading", status: "beta" },
  { n: 39, title: "Multi-language support", group: "Terminal & UX", status: "soon" },
  { n: 40, title: "Currency display toggle", group: "Terminal & UX", status: "live", href: "/settings" },
  { n: 41, title: "Theme customization / accent picker", group: "Terminal & UX", status: "beta", href: "/settings" },
  { n: 42, title: "Sound alerts per event", group: "Alerts", status: "live", href: "/settings" },
  { n: 43, title: "Streamer mode (hide balances)", group: "Terminal & UX", status: "live", href: "/settings" },
  { n: 44, title: "Read-only portfolio share links", group: "Portfolio", status: "soon" },
  { n: 45, title: "Personal REST/WS API keys", group: "Infra", status: "soon" },
  { n: 46, title: "Webhook integrations", group: "Integrations", status: "soon" },
  { n: 47, title: "CSV/JSON export on every table", group: "Terminal & UX", status: "live" },
  { n: 48, title: "Status page with uptime", group: "Infra", status: "live", href: "/status" },
  { n: 49, title: "Bug bounty & feedback portal", group: "Community", status: "soon" },
  { n: 50, title: "Accessibility suite (a11y, reduced motion)", group: "Terminal & UX", status: "beta", href: "/settings" },

  // ── Advanced Trading 51–65 ────────────────────────────────────────────────
  { n: 51, title: "DCA recurring orders", group: "Advanced Trading", status: "soon" },
  { n: 52, title: "OCO bracket orders", group: "Advanced Trading", status: "soon" },
  { n: 53, title: "Scaled / ladder entries", group: "Advanced Trading", status: "soon" },
  { n: 54, title: "Dip-buy automation", group: "Advanced Trading", status: "soon" },
  { n: 55, title: "Position size calculator", group: "Advanced Trading", status: "beta" },
  { n: 56, title: "Break-even price line on chart", group: "Advanced Trading", status: "soon" },
  { n: 57, title: "One-click Sell Initials", group: "Advanced Trading", status: "beta" },
  { n: 58, title: "Auto-sell on graduation", group: "Advanced Trading", status: "soon" },
  { n: 59, title: "Anti-fat-finger guard", group: "Advanced Trading", status: "live" },
  { n: 60, title: "Trade replay", group: "Analytics", status: "soon" },
  { n: 61, title: "Basket buy", group: "Advanced Trading", status: "soon" },
  { n: 62, title: "Launch sniping queue", group: "Advanced Trading", status: "soon" },
  { n: 63, title: "Auto priority-fee bump & retry", group: "Advanced Trading", status: "soon" },
  { n: 64, title: "Human-readable tx diagnostics", group: "Advanced Trading", status: "beta" },
  { n: 65, title: "Quick-flip scalp preset", group: "Advanced Trading", status: "beta" },

  // ── Deep Analytics 66–80 ──────────────────────────────────────────────────
  { n: 66, title: "Holder retention curve", group: "Analytics", status: "beta" },
  { n: 67, title: "Buyer source breakdown", group: "Analytics", status: "beta" },
  { n: 68, title: "Token velocity metric", group: "Analytics", status: "soon" },
  { n: 69, title: "Holder age distribution", group: "Analytics", status: "beta" },
  { n: 70, title: "Realized vs unrealized in-supply", group: "Analytics", status: "soon" },
  { n: 71, title: "Liquidity depth chart", group: "Analytics", status: "soon" },
  { n: 72, title: "Historical Risk Score timeline", group: "Safety", status: "beta" },
  { n: 73, title: "Correlation matrix of holdings", group: "Analytics", status: "soon" },
  { n: 74, title: "Portfolio exposure by narrative", group: "Portfolio", status: "beta" },
  { n: 75, title: "Performance heatmap by hour/day", group: "Analytics", status: "soon" },
  { n: 76, title: "Median holder position size", group: "Analytics", status: "beta" },
  { n: 77, title: "Wash-adjusted Real Volume", group: "Analytics", status: "beta" },
  { n: 78, title: "Buy-size distribution histogram", group: "Analytics", status: "soon" },
  { n: 79, title: "AI time-to-graduation prediction", group: "AI", status: "beta", href: "/ai" },
  { n: 80, title: "Volume by wallet cohort", group: "Analytics", status: "soon" },

  // ── Social & Community 81–92 ──────────────────────────────────────────────
  { n: 81, title: "Live viewer count per token", group: "Social", status: "beta" },
  { n: 82, title: "Embedded livestreams / watch parties", group: "Social", status: "soon" },
  { n: 83, title: "Creator AMA scheduling", group: "Social", status: "soon" },
  { n: 84, title: "On-page community polls", group: "Community", status: "soon" },
  { n: 85, title: "Meme gallery per token", group: "Community", status: "soon" },
  { n: 86, title: "Trading Rooms (private groups)", group: "Community", status: "soon" },
  { n: 87, title: "Squads (team points comps)", group: "Gamification", status: "soon" },
  { n: 88, title: "Prediction game (next to graduate)", group: "Gamification", status: "soon" },
  { n: 89, title: "Opt-in social feed", group: "Social", status: "soon" },
  { n: 90, title: "Comment position tags", group: "Community", status: "beta" },
  { n: 91, title: "Tip jar", group: "Community", status: "soon" },
  { n: 92, title: "Verified creator program", group: "Creator", status: "beta" },

  // ── Gamification 93–100 ───────────────────────────────────────────────────
  { n: 93, title: "Daily quests", group: "Gamification", status: "live", href: "/points" },
  { n: 94, title: "Weekly trading tournaments", group: "Gamification", status: "soon" },
  { n: 95, title: "Season pass tracks", group: "Gamification", status: "soon" },
  { n: 96, title: "Mystery reward boxes", group: "Gamification", status: "soon" },
  { n: 97, title: "Profile cosmetics unlocks", group: "Gamification", status: "soon" },
  { n: 98, title: "Streak protection", group: "Gamification", status: "beta" },
  { n: 99, title: "Referral contests", group: "Growth", status: "soon" },
  { n: 100, title: "Hall of Fame page", group: "Community", status: "beta", href: "/leaderboards" },

  // ── Extended Safety 101–112 ───────────────────────────────────────────────
  { n: 101, title: "Contract diff checker", group: "Safety", status: "beta" },
  { n: 102, title: "Metadata mutability flag", group: "Safety", status: "live" },
  { n: 103, title: "Continuous sellability re-checks", group: "Safety", status: "beta" },
  { n: 104, title: "Sniper-bot fingerprinting", group: "Safety", status: "beta" },
  { n: 105, title: "Deployer drain alert", group: "Safety", status: "beta" },
  { n: 106, title: "Linked-social credibility check", group: "Safety", status: "soon" },
  { n: 107, title: "Verified ticker registry", group: "Safety", status: "soon" },
  { n: 108, title: "Treasury-funded insurance pool", group: "Safety", status: "soon" },
  { n: 109, title: "Scam pattern library", group: "Safety", status: "soon" },
  { n: 110, title: "2FA for large trades/withdrawals", group: "Safety", status: "soon" },
  { n: 111, title: "Withdrawal address whitelist", group: "Safety", status: "soon" },
  { n: 112, title: "Session security center", group: "Safety", status: "soon" },

  // ── Mobile & UX 113–122 ───────────────────────────────────────────────────
  { n: 113, title: "Home-screen widgets", group: "Mobile", status: "soon" },
  { n: 114, title: "Swipe gestures on token cards", group: "Mobile", status: "soon" },
  { n: 115, title: "Offline mode with cache", group: "Mobile", status: "beta", href: "/offline" },
  { n: 116, title: "Haptic feedback", group: "Mobile", status: "soon" },
  { n: 117, title: "Picture-in-picture mini-chart", group: "Terminal & UX", status: "soon" },
  { n: 118, title: "Table density settings", group: "Terminal & UX", status: "live", href: "/settings" },
  { n: 119, title: "Custom column picker per table", group: "Terminal & UX", status: "soon" },
  { n: 120, title: "Pinned / recently-viewed tokens bar", group: "Terminal & UX", status: "live" },
  { n: 121, title: "Recently viewed history", group: "Terminal & UX", status: "live" },
  { n: 122, title: "Drag-to-compare token cards", group: "Terminal & UX", status: "beta", href: "/compare" },

  // ── Creator Tools 123–130 ─────────────────────────────────────────────────
  { n: 123, title: "Airdrop tool", group: "Creator", status: "soon" },
  { n: 124, title: "Holder snapshot export", group: "Creator", status: "beta" },
  { n: 125, title: "Engagement rewards", group: "Creator", status: "soon" },
  { n: 126, title: "Holder-voted metadata updates", group: "Creator", status: "soon" },
  { n: 127, title: "Creator KYC / Doxxed badge", group: "Creator", status: "soon" },
  { n: 128, title: "Launch templates", group: "Creator", status: "beta", href: "/launch" },
  { n: 129, title: "Team launches / revenue splits", group: "Creator", status: "soon" },
  { n: 130, title: "Post-graduation marketing kit", group: "Creator", status: "soon" },

  // ── Integrations & Infra 131–140 ──────────────────────────────────────────
  { n: 131, title: "Telegram trading bot", group: "Integrations", status: "soon" },
  { n: 132, title: "Discord community bot", group: "Integrations", status: "soon" },
  { n: 133, title: "TradingView webhook alerts", group: "Integrations", status: "soon" },
  { n: 134, title: "Public GraphQL API", group: "Infra", status: "soon" },
  { n: 135, title: "Embeddable widgets", group: "Integrations", status: "soon" },
  { n: 136, title: "No-code automation builder", group: "Integrations", status: "soon" },
  { n: 137, title: "Daily data warehouse exports", group: "Infra", status: "beta" },
  { n: 138, title: "RSS/Atom feeds", group: "Integrations", status: "soon" },
  { n: 139, title: "Chrome extension safety card", group: "Integrations", status: "soon" },
  { n: 140, title: "Open-source TS/Python SDK", group: "Infra", status: "soon" },

  // ── Pro & Platform 141–150 ────────────────────────────────────────────────
  { n: 141, title: "Sub-portfolios / strategies", group: "Pro", status: "soon" },
  { n: 142, title: "Institutional team accounts", group: "Pro", status: "soon" },
  { n: 143, title: "OTC desk flow", group: "Pro", status: "soon" },
  { n: 144, title: "Responsible trading controls", group: "Pro", status: "beta", href: "/settings" },
  { n: 145, title: "Vault strategies", group: "Pro", status: "soon" },
  { n: 146, title: "Borrow/lend against tokens", group: "Pro", status: "soon" },
  { n: 147, title: "NFT avatar integration", group: "Pro", status: "soon" },
  { n: 148, title: "Time machine (historical views)", group: "Analytics", status: "soon" },
  { n: 149, title: "Embedded AI assistant", group: "AI", status: "live", href: "/ai" },
  { n: 150, title: "White-label mode", group: "Pro", status: "soon" },
];

export const FEATURE_GROUPS = Array.from(new Set(FEATURES.map((f) => f.group)));

export function featureCounts() {
  return {
    live: FEATURES.filter((f) => f.status === "live").length,
    beta: FEATURES.filter((f) => f.status === "beta").length,
    soon: FEATURES.filter((f) => f.status === "soon").length,
    total: FEATURES.length,
  };
}
