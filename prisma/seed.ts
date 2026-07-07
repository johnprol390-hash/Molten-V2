import { PrismaClient } from "@prisma/client";
import {
  getTokens,
  getTrades,
  getHolders,
  getKols,
} from "../src/lib/mock";
import { Rand } from "../src/lib/rng";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Molten database…");

  // Clean slate (respect FK order).
  await prisma.governanceVote.deleteMany();
  await prisma.governanceProposal.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pointsEntry.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.trackedWallet.deleteMany();
  await prisma.treasuryTransaction.deleteMany();
  await prisma.analyticsPoint.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.holder.deleteMany();
  await prisma.devToken.deleteMany();
  await prisma.token.deleteMany();
  await prisma.kolProfile.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const tokens = getTokens();

  for (const t of tokens) {
    await prisma.token.create({
      data: {
        id: t.id,
        name: t.name,
        ticker: t.ticker,
        logo: t.logo,
        description: t.description,
        category: t.category,
        status: t.status,
        createdAt: new Date(t.createdAt),
        price: t.price,
        change24h: t.change24h,
        volume24h: t.volume24h,
        mcap: t.mcap,
        holdersCount: t.holders,
        totalSupply: t.totalSupply,
        bondingPct: t.bondingPct,
        virtualHype: t.curve.virtualHype,
        virtualTokens: t.curve.virtualTokens,
        realHype: t.curve.realHype,
        tokensSold: t.curve.tokensSold,
        graduationHype: t.curve.graduationHype,
        curveSupply: t.curve.curveSupply,
        deployer: t.deployer,
        contract: t.contract,
        top10Pct: t.safety.top10Pct,
        devHoldingsPct: t.safety.devHoldingsPct,
        snipersPct: t.safety.snipersPct,
        insidersPct: t.safety.insidersPct,
        bundlersPct: t.safety.bundlersPct,
        lpBurnedPct: t.safety.lpBurnedPct,
        freshWalletPct: t.safety.freshWalletPct,
        mintRevoked: t.safety.mintRevoked,
        freezeRevoked: t.safety.freezeRevoked,
        dexPaid: t.safety.dexPaid,
        sellable: t.safety.sellable,
        deployerPrevTokens: t.safety.deployerPrevTokens,
        deployerRugCount: t.safety.deployerRugCount,
        riskScore: t.risk.score,
        riskLevel: t.risk.level,
        kolCount: t.kolCount,
        proTraders: t.proTraders,
        candles: JSON.stringify(t.candles),
        socials: JSON.stringify(t.socials),
      },
    });

    const trades = getTrades(t, 60);
    await prisma.trade.createMany({
      data: trades.map((tr) => ({
        id: tr.id,
        tokenId: t.id,
        ts: new Date(tr.ts),
        side: tr.side,
        amountTokens: tr.amountTokens,
        amountHype: tr.amountHype,
        usd: tr.usd,
        price: tr.price,
        wallet: tr.wallet,
        tx: tr.tx,
      })),
    });

    const holders = getHolders(t, 60);
    await prisma.holder.createMany({
      data: holders.map((h) => ({
        tokenId: t.id,
        wallet: h.wallet,
        rank: h.rank,
        badges: JSON.stringify(h.badges),
        otherTokens: h.otherTokens,
        boughtUsd: h.boughtUsd,
        boughtTokens: h.boughtTokens,
        buys: h.buys,
        avgBuy: h.avgBuy,
        soldUsd: h.soldUsd,
        soldTokens: h.soldTokens,
        sells: h.sells,
        avgSell: h.avgSell,
        unrealizedPnl: h.unrealizedPnl,
        remainingPct: h.remainingPct,
      })),
    });

    await prisma.devToken.createMany({
      data: t.devTokens.map((d) => ({
        tokenId: t.id,
        name: d.name,
        ticker: d.ticker,
        launchedAt: new Date(d.launchedAt),
        peakMcap: d.peakMcap,
        currentMcap: d.currentMcap,
        outcome: d.outcome,
      })),
    });
  }
  console.log(`  ✓ ${tokens.length} tokens with trades, holders & dev history`);

  // Seed community chat messages for the first few tokens.
  const chatSeeds = [
    { author: "0xMachi", text: "chart looking primed 🚀" },
    { author: "degenDan", text: "just aped the preset, lfg" },
    { author: "safuSue", text: "LP burned + mint revoked, clean launch" },
    { author: "whaleWatch", text: "3 KOLs already in this one 👀" },
  ];
  for (const t of tokens.slice(0, 6)) {
    await prisma.message.createMany({
      data: chatSeeds.map((c, i) => ({
        tokenId: t.id,
        author: c.author,
        text: c.text,
        ts: new Date(Date.now() - (chatSeeds.length - i) * 120000),
      })),
    });
  }

  // Wallets + KOL profiles
  const kols = getKols(10);
  for (const k of kols) {
    await prisma.wallet.upsert({
      where: { address: k.address },
      update: {},
      create: {
        address: k.address,
        label: k.kolName,
        ageMs: k.ageMs,
        balanceHype: k.balanceHype,
        isKol: true,
        pnlUsd: k.pnlUsd,
        pnlPct: k.pnlPct,
        winRate: k.winRate,
        trades: k.trades,
        avgRoi: k.avgRoi,
        avgHoldMs: k.avgHoldMs,
        badges: JSON.stringify(["KOL"]),
      },
    });
    await prisma.kolProfile.create({
      data: {
        address: k.address,
        name: k.kolName!,
        twitter: k.twitter,
        followers: k.followers,
        credibility: k.credibility ?? 0,
        volume: k.volume,
        bestTrade: k.bestTrade,
        worstTrade: k.worstTrade,
      },
    });
  }
  console.log(`  ✓ ${kols.length} KOL profiles`);

  // Demo user
  const user = await prisma.user.create({
    data: {
      address: "0xdemo000000000000000000000000000000000000",
      username: "demo",
      bio: "Molten demo account",
      points: 24180,
    },
  });

  // Governance proposals
  const proposals = [
    { title: "Reduce launch fee to 1.5 HYPE", description: "Lower the base launch fee to attract more creators during the growth phase.", category: "Economics" },
    { title: "Add insurance pool funded by 5% of fees", description: "Route 5% of protocol fees into a treasury-backed insurance pool for verified rug victims.", category: "Safety" },
    { title: "Enable community-voted metadata updates", description: "Require holder approval for post-launch logo/description changes.", category: "Governance" },
    { title: "Launch a weekly trading tournament", description: "Allocate 10,000 HYPE monthly to weekly PnL tournaments.", category: "Community" },
  ];
  const rp = new Rand("gov");
  for (const p of proposals) {
    await prisma.governanceProposal.create({
      data: {
        title: p.title,
        description: p.description,
        category: p.category,
        status: rp.bool(0.7) ? "active" : rp.bool(0.5) ? "passed" : "rejected",
        quorum: 1_000_000,
        votesFor: rp.range(200000, 1_400_000),
        votesAgainst: rp.range(50000, 700000),
        endsAt: new Date(Date.now() + rp.range(-5, 10) * 86400000),
      },
    });
  }
  console.log(`  ✓ ${proposals.length} governance proposals`);

  // Treasury transactions
  const rt = new Rand("treasury");
  const kinds = ["fee", "buyback", "burn", "investment", "revenue"];
  const treasury = Array.from({ length: 40 }, (_, i) => {
    const kind = rt.pick(kinds);
    const hype = rt.range(50, 8000);
    return {
      kind,
      amountHype: hype,
      usd: hype * 32,
      note: `${kind} settlement #${i + 1}`,
      ts: new Date(Date.now() - i * rt.range(3600000, 86400000)),
    };
  });
  await prisma.treasuryTransaction.createMany({ data: treasury });
  console.log(`  ✓ ${treasury.length} treasury transactions`);

  // Referral
  await prisma.referral.create({
    data: {
      referrerId: user.id,
      code: "MOLTEN",
      clicks: 1284,
      signups: 342,
      volumeGen: 1_920_000,
      earned: 9600,
      tier: 3,
    },
  });

  // Points log + notifications
  const rpts = new Rand("points");
  const sources = ["trade", "launch", "referral", "governance", "community", "streak"];
  await prisma.pointsEntry.createMany({
    data: Array.from({ length: 30 }, () => ({
      userId: user.id,
      source: rpts.pick(sources),
      amount: rpts.int(10, 500),
      ts: new Date(Date.now() - rpts.range(0, 30 * 86400000)),
    })),
  });
  const notifKinds = ["Trade Executed", "Whale Buy", "Dev Sell", "Token Graduated", "Tracked Wallet Trade", "Price Alert", "Copy Trade Executed"];
  await prisma.notification.createMany({
    data: Array.from({ length: 12 }, (_, i) => ({
      userId: user.id,
      kind: rpts.pick(notifKinds),
      title: rpts.pick(notifKinds),
      body: "Simulated event on the Molten network.",
      read: i > 4,
      ts: new Date(Date.now() - i * rpts.range(600000, 7200000)),
    })),
  });

  // Achievements
  const achievements = [
    { key: "first_trade", title: "First Blood", description: "Complete your first trade", icon: "🩸", points: 100 },
    { key: "first_launch", title: "Creator", description: "Launch your first token", icon: "🚀", points: 500 },
    { key: "diamond", title: "Diamond Hands", description: "Hold a position for 7 days", icon: "💎", points: 300 },
    { key: "sniper", title: "Quick Draw", description: "Snipe a token in the first block", icon: "🎯", points: 250 },
    { key: "whale", title: "Whale", description: "Reach $100k portfolio value", icon: "🐋", points: 1000 },
    { key: "streak7", title: "On Fire", description: "7-day trading streak", icon: "🔥", points: 400 },
  ];
  await prisma.achievement.createMany({ data: achievements });

  // Analytics daily points
  const ra = new Rand("analytics");
  const metrics = ["volume", "mcap", "liquidity", "holders", "revenue", "treasury", "launches", "graduationRate", "rugRate"];
  const analytics: { metric: string; day: Date; value: number }[] = [];
  for (const metric of metrics) {
    let base = ra.range(100000, 2_000_000);
    for (let d = 90; d >= 0; d--) {
      base *= 1 + ra.range(-0.06, 0.08);
      const value = metric === "graduationRate" ? ra.range(8, 34) : metric === "rugRate" ? ra.range(2, 18) : base;
      analytics.push({ metric, day: new Date(Date.now() - d * 86400000), value });
    }
  }
  await prisma.analyticsPoint.createMany({ data: analytics });
  console.log(`  ✓ analytics, referrals, points, notifications, achievements`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
