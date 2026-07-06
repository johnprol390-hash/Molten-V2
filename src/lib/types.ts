import type { CurveParams } from "./curve";
import type { SafetyInputs, RiskResult } from "./safety";

export type TokenStatus = "new" | "graduating" | "graduated";

export type HolderBadge =
  | "LP"
  | "Dev"
  | "Sniper"
  | "Insider"
  | "Bundler"
  | "Whale"
  | "Fresh"
  | "Pro"
  | "Tracked"
  | "KOL";

export interface Wallet {
  address: string;
  label?: string;
  emoji?: string;
  ageMs: number;
  balanceHype: number;
  isKol: boolean;
  kolName?: string;
  twitter?: string;
  credibility?: number;
  pnlUsd: number;
  pnlPct: number;
  winRate: number;
  trades: number;
  avgRoi: number;
  avgHoldMs: number;
  badges: HolderBadge[];
  tracked: boolean;
}

export interface Trade {
  id: string;
  tokenId: string;
  ts: number;
  side: "buy" | "sell";
  amountTokens: number;
  amountHype: number;
  usd: number;
  price: number;
  wallet: string;
  tx: string;
}

export interface Holder {
  wallet: string;
  rank: number;
  badges: HolderBadge[];
  otherTokens: number;
  boughtUsd: number;
  boughtTokens: number;
  buys: number;
  avgBuy: number;
  soldUsd: number;
  soldTokens: number;
  sells: number;
  avgSell: number;
  unrealizedPnl: number;
  remainingPct: number;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DevToken {
  name: string;
  ticker: string;
  launchedAt: number;
  peakMcap: number;
  currentMcap: number;
  outcome: "rugged" | "migrated" | "dead" | "active";
}

export interface Token {
  id: string;
  name: string;
  ticker: string;
  logo: string; // emoji stand-in for logo
  description: string;
  category: string;
  createdAt: number;
  status: TokenStatus;
  price: number;
  change24h: number;
  volume24h: number;
  mcap: number;
  holders: number;
  totalSupply: number;
  curve: CurveParams;
  bondingPct: number;
  deployer: string;
  contract: string;
  safety: SafetyInputs;
  risk: RiskResult;
  kolCount: number;
  proTraders: number;
  website?: string;
  twitter?: string;
  telegram?: string;
  candles: Candle[];
  devTokens: DevToken[];
  socials: { x?: string; tg?: string; site?: string };
}
