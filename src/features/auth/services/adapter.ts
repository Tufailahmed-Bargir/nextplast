import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "@auth/core/adapters";
import { prisma } from "@/prisma";

/**
 * Prisma adapter for Auth.js with typed User role support.
 * Session strategy remains JWT; Account/User persistence uses Prisma.
 */
export function createAuthAdapter(): Adapter {
  return PrismaAdapter(prisma) as Adapter;
}
