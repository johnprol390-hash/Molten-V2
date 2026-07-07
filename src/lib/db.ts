import { PrismaClient } from "@prisma/client";

// Lazy singleton PrismaClient.
//
// The client is constructed on first *use*, not on import. This is important for
// Vercel: Next.js imports every route/page module during "Collecting page data"
// at build time, and constructing a PrismaClient without DATABASE_URL (or with an
// unreachable DB) must never crash the build. Deferring construction — combined
// with the resilient wrappers in queries.ts — means the app builds and renders
// even when the database is momentarily unavailable.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

// Proxy that instantiates the real client on first property access.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** True when a database connection string is configured. */
export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
