import "server-only";

import { UserRole, type Prisma } from "@prisma/client";
import { prisma } from "@/prisma";
import { decimalToNumber } from "@/features/dashboard/types";
import { writeAdminLog } from "@/features/admin/services/admin-audit";

export async function listAdminUsers(input?: {
  q?: string;
  role?: string;
  take?: number;
}) {
  const where: Prisma.UserWhereInput = {};
  if (input?.q) {
    where.OR = [
      { name: { contains: input.q, mode: "insensitive" } },
      { email: { contains: input.q, mode: "insensitive" } },
    ];
  }
  if (input?.role && input.role !== "ALL") {
    where.role = input.role as UserRole;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: input?.take ?? 100,
    include: {
      wallet: { select: { availableBalance: true } },
      environmentalImpact: { select: { plasticRecycledGrams: true } },
      collector: { select: { id: true, verificationStatus: true } },
      recycler: { select: { id: true, verificationStatus: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    coins: decimalToNumber(u.wallet?.availableBalance),
    recycledGrams: u.environmentalImpact?.plasticRecycledGrams ?? 0,
    collectorId: u.collector?.id ?? null,
    recyclerId: u.recycler?.id ?? null,
  }));
}

export async function setUserActiveStatus(input: {
  adminId: string;
  userId: string;
  isActive: boolean;
}) {
  if (input.adminId === input.userId) {
    throw new Error("CANNOT_CHANGE_OWN_STATUS");
  }

  const target = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!target) throw new Error("USER_NOT_FOUND");
  if (target.role === UserRole.ADMIN || target.role === UserRole.SUPER_ADMIN) {
    throw new Error("CANNOT_MODIFY_ADMIN");
  }

  const user = await prisma.user.update({
    where: { id: input.userId },
    data: { isActive: input.isActive },
  });

  await writeAdminLog(prisma, {
    adminId: input.adminId,
    action: input.isActive ? "USER_ACTIVATED" : "USER_SUSPENDED",
    targetType: "User",
    targetId: user.id,
  });

  return user;
}

export async function globalAdminSearch(q: string) {
  const term = q.trim();
  if (term.length < 2) {
    return { users: [], listings: [], pickups: [], products: [], orders: [] };
  }

  const [users, listings, pickups, products, orders] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.plasticListing.findMany({
      where: {
        deletedAt: null,
        OR: [
          { id: { contains: term } },
          { pickupAddress: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: { id: true, status: true, claimedWeightGrams: true },
    }),
    prisma.pickupRequest.findMany({
      where: {
        OR: [
          { id: { contains: term } },
          { address: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: { id: true, status: true, address: true },
    }),
    prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: { id: true, name: true, isActive: true, stock: true },
    }),
    prisma.order.findMany({
      where: { id: { contains: term } },
      take: 8,
      select: { id: true, status: true, createdAt: true },
    }),
  ]);

  return { users, listings, pickups, products, orders };
}
