import "server-only";

import { randomBytes, createHash } from "crypto";
import { prisma } from "@/prisma";
import { hashPassword, verifyPassword } from "@/features/auth/services/password";
import type { UserRole } from "@/constants/roles";
import { UserRole as Roles, ADMIN_ROLES } from "@/constants/roles";
import { logger } from "@/utils/logger";
import type { User } from "@prisma/client";
import { adminAssignableRoles } from "@/validations/auth";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type SafeUser = Omit<User, "passwordHash">;

function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safe } = user;
  void passwordHash;
  return safe;
}

async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function listUsers(): Promise<SafeUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return users.map(toSafeUser);
}

/**
 * Public registration always creates USER accounts.
 * Role elevation is admin-only via assignUserRoleByAdmin.
 */
export async function createUserWithPassword(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SafeUser> {
  const email = input.email.toLowerCase().trim();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: Roles.USER,
      emailVerified: null,
    },
  });

  logger.info("User registered", { userId: user.id, role: user.role }, "auth");
  return toSafeUser(user);
}

export async function authenticateWithPassword(
  email: string,
  password: string,
): Promise<SafeUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  if (!user.isActive || user.deletedAt) {
    throw new Error("ACCOUNT_DISABLED");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return toSafeUser(user);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email: string): Promise<{
  rawToken: string;
  expires: Date;
} | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  const identifier = user.email.toLowerCase();

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  logger.info("Password reset token created", { userId: user.id }, "auth");
  return { rawToken, expires };
}

export async function resetPasswordWithToken(input: {
  email: string;
  token: string;
  password: string;
}): Promise<boolean> {
  const identifier = input.email.toLowerCase().trim();
  const hashed = hashToken(input.token);

  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: { identifier, token: hashed },
    },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token: hashed } },
      });
    }
    return false;
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { email: identifier },
      data: { passwordHash },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token: hashed } },
    }),
  ]);

  logger.info("Password reset completed", { email: identifier }, "auth");
  return true;
}

/**
 * Admin-only role assignment.
 * Collector/Recycler (and Seller/User) may be assigned by Admin.
 * Cannot demote/modify SUPER_ADMIN or self-escalation to ADMIN via this path.
 */
export async function assignUserRoleByAdmin(input: {
  actorRole: UserRole;
  actorId: string;
  targetUserId: string;
  role: UserRole;
}): Promise<SafeUser> {
  if (!(ADMIN_ROLES as readonly string[]).includes(input.actorRole)) {
    throw new Error("FORBIDDEN");
  }

  if (
    !(adminAssignableRoles as readonly string[]).includes(input.role)
  ) {
    throw new Error("INVALID_ROLE");
  }

  if (input.targetUserId === input.actorId) {
    throw new Error("CANNOT_CHANGE_OWN_ROLE");
  }

  const target = await findUserById(input.targetUserId);
  if (!target) {
    throw new Error("USER_NOT_FOUND");
  }

  if (
    target.role === Roles.SUPER_ADMIN ||
    target.role === Roles.ADMIN
  ) {
    throw new Error("CANNOT_MODIFY_ADMIN");
  }

  const user = await prisma.user.update({
    where: { id: input.targetUserId },
    data: { role: input.role },
  });

  if (input.role === Roles.COLLECTOR) {
    const { ensureCollectorProfile } = await import(
      "@/features/collector/services/ensure-collector"
    );
    await ensureCollectorProfile(user.id);
  }

  if (input.role === Roles.RECYCLER) {
    const { ensureRecyclerProfile } = await import(
      "@/features/admin/services/ensure-recycler"
    );
    await ensureRecyclerProfile(user.id, user.name ?? "Recycler Partner");
  }

  logger.info(
    "Admin assigned user role",
    {
      actorId: input.actorId,
      targetUserId: input.targetUserId,
      role: input.role,
    },
    "auth",
  );

  return toSafeUser(user);
}
