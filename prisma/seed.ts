import { PrismaClient } from "@prisma/client";
import { generateContractAddress, getAvatarUrl, getTokenImageUrl } from "../src/lib/utils";

const prisma = new PrismaClient();

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

const COMMENTS = [
  "LFG!!! 🚀🚀🚀", "This is going to moon", "Dev is based af",
  "Just aped in", "WAGMI", "Chart looks bullish", "Diamond hands only",
  "Early gang", "This is the one", "Don't fade this", "Bonding curve looking good",
  "Almost graduated!", "To the moon 🌙", "Best community ever",
  "Dev doxxed and based", "100x incoming", "Generational wealth",
];

function randomBetween(min: number, max: number) {
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

async function main() {
  console.log("🌋 Seeding Molten V2 database...");

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.candle.deleteMany();
  await prisma.holder.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tickerEvent.deleteMany();
  await prisma.token.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.emailCapture.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = [];
  for (let i = 0; i < 15; i++) {
    const wallet = generateContractAddress();
    const user = await prisma.user.create({
      data: {
        walletAddress: wallet,
        username: `degen${Math.floor(Math.random() * 9999)}`,
        avatar: getAvatarUrl(wallet),
        bio: randomPick([
          "Hyperliquid maxi. Meme coin degen.",
          "Building on HL. Launching coins daily.",
          "Just here for the vibes.",
          "Professional ape. DYOR.",
          null,
        ]),
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users`);

  // Create tokens in various states
  const tokens = [];
  for (let i = 0; i < 60; i++) {
    const name = MEME_NAMES[i % MEME_NAMES.length] + (i > 30 ? `${Math.floor(i / 10)}` : "");
    const creator = randomPick(users);
    const isGraduated = i >= 55;
    const bondingProgress = isGraduated
      ? 100
      : i >= 45
        ? randomBetween(85, 99)
        : i >= 30
          ? randomBetween(40, 84)
          : randomBetween(0, 39);

    const initialPrice = randomBetween(0.00001, 0.01);
    const createdAt = new Date(Date.now() - randomBetween(3600000, 86400000 * 7));

    const token = await prisma.token.create({
      data: {
        contractAddress: generateContractAddress(),
        name,
        ticker: generateTicker(name),
        description: randomPick(DESCRIPTIONS),
        imageUrl: getTokenImageUrl(name),
        website: Math.random() > 0.7 ? `https://${name.toLowerCase()}.xyz` : null,
        twitter: Math.random() > 0.5 ? `@${name.toLowerCase()}` : null,
        telegram: Math.random() > 0.6 ? `t.me/${name.toLowerCase()}` : null,
        creatorId: creator.id,
        price: initialPrice,
        marketCap: initialPrice * randomBetween(500_000_000, 1_200_000_000),
        bondingProgress,
        holderCount: Math.floor(randomBetween(10, 500)),
        replyCount: Math.floor(randomBetween(0, 50)),
        trendingScore: randomBetween(10, 1000),
        volume24h: randomBetween(1000, 100000),
        change24h: randomBetween(-30, 80),
        change1h: randomBetween(-15, 30),
        change6h: randomBetween(-20, 50),
        isGraduated,
        graduatedAt: isGraduated ? new Date() : null,
        createdAt,
      },
    });
    tokens.push(token);

    // Create holders
    await prisma.holder.create({
      data: {
        tokenId: token.id,
        wallet: creator.walletAddress,
        balance: randomBetween(5, 15),
        percentage: randomBetween(5, 15),
        isDev: true,
      },
    });

    for (let h = 0; h < Math.floor(randomBetween(5, 15)); h++) {
      await prisma.holder.create({
        data: {
          tokenId: token.id,
          wallet: generateContractAddress(),
          balance: randomBetween(0.1, 8),
          percentage: randomBetween(0.1, 8),
          isEarly: h < 3,
        },
      });
    }

    // Create candle history
    const timeframes = ["1m", "5m", "15m", "1h", "1d"];
    for (const tf of timeframes) {
      const intervalMs =
        tf === "1d" ? 86400000 : tf === "1h" ? 3600000 : tf === "15m" ? 900000 : tf === "5m" ? 300000 : 60000;
      const count = tf === "1d" ? 30 : tf === "1h" ? 48 : 60;
      let price = initialPrice * randomBetween(0.5, 1.5);

      for (let c = count; c >= 0; c--) {
        const timestamp = new Date(Date.now() - c * intervalMs);
        const change = randomBetween(-0.08, 0.08);
        const open = price;
        price = Math.max(0.000001, price * (1 + change));

        await prisma.candle.create({
          data: {
            tokenId: token.id,
            timeframe: tf,
            timestamp,
            open,
            high: Math.max(open, price) * randomBetween(1, 1.03),
            low: Math.min(open, price) * randomBetween(0.97, 1),
            close: price,
            volume: randomBetween(100, 5000),
          },
        });
      }
    }

    // Create comments
    const commentCount = Math.floor(randomBetween(2, 8));
    for (let c = 0; c < commentCount; c++) {
      await prisma.comment.create({
        data: {
          tokenId: token.id,
          userId: randomPick(users).id,
          content: randomPick(COMMENTS),
          createdAt: new Date(Date.now() - randomBetween(60000, 86400000)),
        },
      });
    }

    // Create activities
    for (let a = 0; a < Math.floor(randomBetween(5, 20)); a++) {
      await prisma.activity.create({
        data: {
          tokenId: token.id,
          type: randomPick(["buy", "sell"]),
          amount: randomBetween(0.1, 100),
          price: initialPrice * randomBetween(0.8, 1.2),
          wallet: generateContractAddress(),
          createdAt: new Date(Date.now() - randomBetween(60000, 86400000)),
        },
      });
    }
  }
  console.log(`Created ${tokens.length} tokens with candles, holders, comments`);

  // Create follows
  for (let i = 0; i < 20; i++) {
    const follower = randomPick(users);
    const following = randomPick(users.filter((u) => u.id !== follower.id));
    try {
      await prisma.follow.create({
        data: { followerId: follower.id, followingId: following.id },
      });
    } catch {
      // ignore duplicates
    }
  }

  // Create ticker events
  const events = [
    { type: "launch", message: "🚀 HYPER just launched!" },
    { type: "milestone", message: "🔥 MOON is 95% bonded!" },
    { type: "graduation", message: "🎓 PEPE graduated to Hyperliquid!" },
    { type: "launch", message: "🚀 DOGE2 just launched!" },
    { type: "milestone", message: "🔥 CHAD hit $50K market cap!" },
  ];
  for (const event of events) {
    await prisma.tickerEvent.create({ data: event });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
