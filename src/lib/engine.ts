import "server-only";
import { prisma } from "./db";
import { getKolActivity } from "./mock";
import { executeTrade, HYPE_USD } from "./trade-engine";

const MAX_PER_TICK = 6;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export interface EngineResult {
  alerts: number;
  copies: number;
  messages: string[];
}

// Processes recent KOL/tracked-wallet activity against a user's alert + copy
// configs: emits buy alerts and executes mirrored copy trades (respecting
// safety filters + daily caps). Idempotent via ProcessedEvent keys.
export async function runEngineForUser(userId: string, userAddress: string): Promise<EngineResult> {
  const result: EngineResult = { alerts: 0, copies: 0, messages: [] };

  const [alertConfigs, copyConfigs] = await Promise.all([
    prisma.walletAlertConfig.findMany({ where: { userId, active: true } }),
    prisma.copyTradeConfig.findMany({ where: { userId, active: true } }),
  ]);
  if (alertConfigs.length === 0 && copyConfigs.length === 0) return result;

  const alertBy = new Map(alertConfigs.map((c) => [c.sourceAddress.toLowerCase(), c]));
  const copyBy = new Map(copyConfigs.map((c) => [c.sourceAddress.toLowerCase(), c]));

  const activity = getKolActivity(30);
  let processed = 0;

  for (const a of activity) {
    if (processed >= MAX_PER_TICK) break;
    const src = a.kol.address.toLowerCase();
    const alertCfg = alertBy.get(src);
    const copyCfg = copyBy.get(src);
    if (!alertCfg && !copyCfg) continue;

    // ── Buy alert ──
    if (alertCfg) {
      const wants = (a.side === "buy" && alertCfg.onBuy) || (a.side === "sell" && alertCfg.onSell);
      if (wants && a.usd >= alertCfg.minUsd) {
        const key = `alert:${alertCfg.id}:${a.id}`;
        const already = await prisma.processedEvent.findUnique({ where: { key } });
        if (!already) {
          await prisma.processedEvent.create({ data: { key } });
          await prisma.notification.create({
            data: {
              userId,
              kind: "Tracked Wallet Trade",
              title: `${a.kol.kolName ?? "Tracked wallet"} ${a.side === "buy" ? "bought" : "sold"} ${a.token.ticker}`,
              body: `$${Math.round(a.usd).toLocaleString()} · risk ${a.token.risk.score}/100`,
            },
          });
          result.alerts++;
          result.messages.push(`Alert: ${a.kol.kolName} ${a.side} ${a.token.ticker}`);
          processed++;
        }
      }
    }

    // ── Copy trade (buys only; sells handled if holding) ──
    if (copyCfg && processed < MAX_PER_TICK) {
      const key = `copy:${copyCfg.id}:${a.id}`;
      const already = await prisma.processedEvent.findUnique({ where: { key } });
      if (!already) {
        await prisma.processedEvent.create({ data: { key } });
        const passSafety = a.token.risk.score <= copyCfg.maxRisk && (!copyCfg.requireLpBurned || a.token.safety.lpBurnedPct >= 99);

        if (a.side === "buy" && passSafety) {
          // Reset daily cap bucket if the day rolled over.
          const day = today();
          const spent = copyCfg.spentDay === day ? copyCfg.spentTodayHype : 0;
          let sizeHype = Math.min(copyCfg.maxPerTradeHype, (a.usd / HYPE_USD) * copyCfg.ratio);
          const remaining = copyCfg.dailyCapHype - spent;
          sizeHype = Math.min(sizeHype, remaining);
          if (sizeHype > 0.0001) {
            const exec = await executeTrade(userId, userAddress, a.token.id, "buy", sizeHype, { awardPoints: false });
            if (exec.ok) {
              await prisma.copyTrade.create({
                data: {
                  userId,
                  sourceAddress: copyCfg.sourceAddress,
                  sourceName: copyCfg.sourceName,
                  tokenId: a.token.id,
                  ticker: a.token.ticker,
                  side: "buy",
                  usd: exec.usd ?? sizeHype * HYPE_USD,
                  sourcePrice: a.token.price,
                  execPrice: exec.price ?? a.token.price,
                },
              });
              await prisma.copyTradeConfig.update({
                where: { id: copyCfg.id },
                data: { spentTodayHype: spent + sizeHype, spentDay: day },
              });
              result.copies++;
              result.messages.push(`Copied ${a.kol.kolName} → bought ${a.token.ticker}`);
              processed++;
            }
          }
        }
      }
    }
  }

  return result;
}
