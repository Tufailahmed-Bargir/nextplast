import "server-only";

import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger";

/**
 * Singleton Prisma client for Next.js (avoids exhausting connections in dev HMR).
 *
 * Neon free/dev limits are small. We:
 * - Prefer the Neon pooler hostname when a direct endpoint is given
 * - Cap Prisma's pool size so dashboard fan-out cannot exhaust Neon
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const url = new URL(raw);

    // Direct Neon → pooled (PgBouncer) endpoint
    if (
      url.hostname.endsWith(".neon.tech") &&
      !url.hostname.includes("-pooler.")
    ) {
      url.hostname = url.hostname.replace(
        /^([^.]+)\./,
        (_, endpoint: string) => `${endpoint}-pooler.`,
      );
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
    }

    // Keep Prisma client pool small (many RSC layouts + pages run in parallel).
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set(
        "connection_limit",
        process.env.NODE_ENV === "development" ? "5" : "8",
      );
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "30");
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "15");
    }

    return url.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: resolveDatabaseUrl(process.env.DATABASE_URL) },
    },
    // Neon round trips plus scale-to-zero wake-ups can push a multi-step
    // transaction past Prisma's 5s default.
    transactionOptions: { maxWait: 10_000, timeout: 20_000 },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error(
      "Database connection failed",
      { error: error instanceof Error ? error.message : "unknown" },
      "prisma",
    );
    return false;
  }
}
