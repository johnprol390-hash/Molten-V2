/**
 * SIMULATION ENGINE
 * =================
 * This module generates realistic live-looking token data.
 * Replace with a real Hyperliquid indexer behind the same interface.
 */

import { prisma } from "@/lib/db";
import { generateContractAddress, getTokenImageUrl } from "@/lib/utils";

export const TIMEFRAMES = ["1m", "5m", "15m", "1h", "1d"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const GRADUATION_TARGET = 69000; // $69K market cap to graduate

const MEME_NAMES = [
  "HyperPepe", "LiquidMoon", "MoltenDoge", "HL Chad", "GigaBrain",
  "BasedApe", "WojakCoin", "FrogFi", "CatLiquid", "BullRun",
  "DiamondPaws", "RocketFuel", "MemeLord", "ChadCoin", "SigmaGrind",
  "AlphaWolf", "TurboApe", "MegaPump", "LaserEyes", "MoonBoy",
  "DegenKing", "WhaleAlert", "ShillCoin", "RugProof", "SafeMoon2",
  "ElonTweet", "TrumpCoin", "AIAgent", "BotCoin", "NeuralNet",
  "QuantumMeme", "SpaceCat", "DragonFi", "PhoenixRise", "ThunderBolt",
  "IceCold", "FireStorm", "WindRider", "EarthShaker", "StarDust",
  "CosmicRay", "GalaxyBrain", "UniverseCoin", "NebulaFi", "BlackHole",
  "SuperNova", "PlasmaFi", "AtomicSwap", "NuclearMeme", "FusionCoin",
  "HyperLiquid", "PerpKing", "LeverageLord", "FundingRate", "OpenInterest",
  "MarkPrice", "IndexPrice", "Liquidation", "MarginCall", "CrossMargin",
];

const DESCRIPTIONS = [
  "The next big thing on Hyperliquid. Community driven, dev locked.",
  "100% community token. No team allocation. Pure degen energy.",
  "Built different. Hyperliquid native memecoin with real vibes.",
  "Just a chill coin vibing on the bonding curve. WAGMI.",
  "Fair launch. No presale. No team tokens. Just pure memetic energy.",
  "Hyperliquid's finest. Graduating soon™.",
  "Dev is based. Community is strong. Chart goes up.",
  "The people's coin. For the people, by the people.",
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTicker(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (clean.length <= 5) return clean;
  return clean.slice(0, 4) + Math.floor(Math.random() * 10);
}

export interface SimTickResult {
  tokensUpdated: number;
  newTokens: number;
  graduated: number;
  events: { type: string; message: string; tokenId?: string }[];
}

export async function runSimulationTick(): Promise<SimTickResult> {
  const result: SimTickResult = {
    tokensUpdated: 0,
    newTokens: 0,
    graduated: 0,
    events: [],
  };

  const activeTokens = await prisma.token.findMany({
    where: { isGraduated: false },
    take: 50,
  });

  for (const token of activeTokens) {
    const priceChange = randomBetween(-0.08, 0.12);
    const newPrice = Math.max(0.000001, token.price * (1 + priceChange));
    const newMarketCap = newPrice * randomBetween(800_000_000, 1_200_000_000);
    const progressDelta = randomBetween(0.1, 2.5);
    const newProgress = Math.min(100, token.bondingProgress + progressDelta);
    const holderDelta = Math.random() > 0.7 ? Math.floor(randomBetween(1, 5)) : 0;
    const volumeDelta = randomBetween(100, 5000);

    const change1h = token.change1h + priceChange * 10;
    const change6h = token.change6h + priceChange * 5;
    const change24h = token.change24h + priceChange * 2;
    const trendingScore =
      volumeDelta * 0.3 +
      holderDelta * 10 +
      progressDelta * 5 +
      Math.abs(priceChange) * 100 +
      token.trendingScore * 0.95;

    await prisma.token.update({
      where: { id: token.id },
      data: {
        price: newPrice,
        marketCap: newMarketCap,
        bondingProgress: newProgress,
        holderCount: token.holderCount + holderDelta,
        volume24h: token.volume24h + volumeDelta,
        change1h,
        change6h,
        change24h,
        trendingScore,
      },
    });

    // Generate candles for each timeframe
    for (const tf of TIMEFRAMES) {
      await generateCandle(token.id, tf, newPrice, volumeDelta);
    }

    // Random activity
    if (Math.random() > 0.5) {
      await prisma.activity.create({
        data: {
          tokenId: token.id,
          type: Math.random() > 0.5 ? "buy" : "sell",
          amount: randomBetween(0.1, 50),
          price: newPrice,
          wallet: generateContractAddress(),
        },
      });
    }

    result.tokensUpdated++;

    // Check graduation
    if (newProgress >= 100 && !token.isGraduated) {
      await prisma.token.update({
        where: { id: token.id },
        data: { isGraduated: true, graduatedAt: new Date(), bondingProgress: 100 },
      });
      result.graduated++;
      result.events.push({
        type: "graduation",
        message: `🎓 ${token.ticker} graduated to Hyperliquid!`,
        tokenId: token.id,
      });
    } else if (newProgress > 85 && token.bondingProgress <= 85) {
      result.events.push({
        type: "milestone",
        message: `🔥 ${token.ticker} is about to graduate! ${newProgress.toFixed(0)}% bonded`,
        tokenId: token.id,
      });
    }
  }

  // Occasionally launch new token (10% chance per tick)
  if (Math.random() < 0.1) {
    const newToken = await launchSimulatedToken();
    if (newToken) {
      result.newTokens++;
      result.events.push({
        type: "launch",
        message: `🚀 ${newToken.ticker} just launched!`,
        tokenId: newToken.id,
      });
    }
  }

  // Save ticker events
  for (const event of result.events) {
    await prisma.tickerEvent.create({
      data: {
        type: event.type,
        message: event.message,
        tokenId: event.tokenId,
      },
    });
  }

  // Clean old ticker events (keep last 100)
  const oldEvents = await prisma.tickerEvent.findMany({
    orderBy: { createdAt: "desc" },
    skip: 100,
    select: { id: true },
  });
  if (oldEvents.length > 0) {
    await prisma.tickerEvent.deleteMany({
      where: { id: { in: oldEvents.map((e) => e.id) } },
    });
  }

  return result;
}

async function generateCandle(
  tokenId: string,
  timeframe: string,
  currentPrice: number,
  volume: number
) {
  const now = new Date();
  const intervalMs = getIntervalMs(timeframe);
  const timestamp = new Date(Math.floor(now.getTime() / intervalMs) * intervalMs);

  const existing = await prisma.candle.findUnique({
    where: {
      tokenId_timeframe_timestamp: { tokenId, timeframe, timestamp },
    },
  });

  if (existing) {
    await prisma.candle.update({
      where: { id: existing.id },
      data: {
        high: Math.max(existing.high, currentPrice),
        low: Math.min(existing.low, currentPrice),
        close: currentPrice,
        volume: existing.volume + volume,
      },
    });
  } else {
    const open = currentPrice * randomBetween(0.95, 1.05);
    await prisma.candle.create({
      data: {
        tokenId,
        timeframe,
        timestamp,
        open,
        high: Math.max(open, currentPrice),
        low: Math.min(open, currentPrice),
        close: currentPrice,
        volume,
      },
    });
  }
}

function getIntervalMs(timeframe: string): number {
  switch (timeframe) {
    case "1m": return 60_000;
    case "5m": return 300_000;
    case "15m": return 900_000;
    case "1h": return 3_600_000;
    case "1d": return 86_400_000;
    default: return 60_000;
  }
}

export async function launchSimulatedToken(creatorId?: string) {
  let creator = creatorId
    ? await prisma.user.findUnique({ where: { id: creatorId } })
    : null;

  if (!creator) {
    const wallets = await prisma.user.findMany({ take: 10 });
    creator = wallets.length > 0 ? randomPick(wallets) : null;
  }

  if (!creator) {
    creator = await prisma.user.create({
      data: {
        walletAddress: generateContractAddress(),
        username: `degen${Math.floor(Math.random() * 9999)}`,
        avatar: getTokenImageUrl(`user-${Date.now()}`),
      },
    });
  }

  const name = randomPick(MEME_NAMES) + (Math.random() > 0.7 ? randomPick(["2", "X", "Fi", "Inu"]) : "");
  const ticker = generateTicker(name);
  const contractAddress = generateContractAddress();
  const initialPrice = randomBetween(0.00001, 0.001);

  const token = await prisma.token.create({
    data: {
      contractAddress,
      name,
      ticker,
      description: randomPick(DESCRIPTIONS),
      imageUrl: getTokenImageUrl(ticker),
      creatorId: creator.id,
      price: initialPrice,
      marketCap: initialPrice * randomBetween(500_000_000, 1_000_000_000),
      bondingProgress: randomBetween(0, 5),
      holderCount: Math.floor(randomBetween(1, 10)),
      trendingScore: randomBetween(10, 100),
      volume24h: randomBetween(100, 1000),
      change24h: randomBetween(-20, 50),
      change1h: randomBetween(-10, 20),
      change6h: randomBetween(-15, 30),
    },
  });

  // Create initial holders
  await prisma.holder.create({
    data: {
      tokenId: token.id,
      wallet: creator.walletAddress,
      balance: randomBetween(5, 15),
      percentage: randomBetween(5, 15),
      isDev: true,
    },
  });

  for (let i = 0; i < Math.floor(randomBetween(3, 8)); i++) {
    await prisma.holder.create({
      data: {
        tokenId: token.id,
        wallet: generateContractAddress(),
        balance: randomBetween(0.5, 5),
        percentage: randomBetween(0.5, 5),
        isEarly: i < 3,
      },
    });
  }

  // Generate initial candle history
  const now = Date.now();
  for (const tf of TIMEFRAMES) {
    const intervalMs = getIntervalMs(tf);
    const candleCount = tf === "1d" ? 30 : tf === "1h" ? 48 : 60;
    let price = initialPrice;

    for (let i = candleCount; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalMs);
      const change = randomBetween(-0.05, 0.05);
      const open = price;
      price = price * (1 + change);
      const high = Math.max(open, price) * randomBetween(1, 1.02);
      const low = Math.min(open, price) * randomBetween(0.98, 1);

      await prisma.candle.create({
        data: {
          tokenId: token.id,
          timeframe: tf,
          timestamp,
          open,
          high,
          low,
          close: price,
          volume: randomBetween(50, 2000),
        },
      });
    }
  }

  return token;
}

export async function createUserToken(
  creatorId: string,
  data: {
    name: string;
    ticker: string;
    description: string;
    imageUrl: string;
    website?: string;
    twitter?: string;
    telegram?: string;
  }
) {
  const contractAddress = generateContractAddress();
  const initialPrice = randomBetween(0.00001, 0.0001);

  const token = await prisma.token.create({
    data: {
      contractAddress,
      name: data.name,
      ticker: data.ticker.toUpperCase(),
      description: data.description,
      imageUrl: data.imageUrl,
      website: data.website,
      twitter: data.twitter,
      telegram: data.telegram,
      creatorId,
      price: initialPrice,
      marketCap: initialPrice * 1_000_000_000,
      bondingProgress: 0,
      holderCount: 1,
      trendingScore: 50,
    },
  });

  await prisma.holder.create({
    data: {
      tokenId: token.id,
      wallet: (await prisma.user.findUnique({ where: { id: creatorId } }))!.walletAddress,
      balance: 10,
      percentage: 10,
      isDev: true,
    },
  });

  // Initial candles
  const now = Date.now();
  for (const tf of TIMEFRAMES) {
    await prisma.candle.create({
      data: {
        tokenId: token.id,
        timeframe: tf,
        timestamp: new Date(now),
        open: initialPrice,
        high: initialPrice,
        low: initialPrice,
        close: initialPrice,
        volume: 0,
      },
    });
  }

  await prisma.tickerEvent.create({
    data: {
      type: "launch",
      message: `🚀 ${token.ticker} just launched!`,
      tokenId: token.id,
    },
  });

  return token;
}

export function calculateTrendingScore(
  volume24h: number,
  holderGrowth: number,
  progressVelocity: number,
  priceChange: number
): number {
  return (
    volume24h * 0.3 +
    holderGrowth * 10 +
    progressVelocity * 5 +
    Math.abs(priceChange) * 100
  );
}
