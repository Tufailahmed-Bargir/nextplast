"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma";
import {
  AuthHttpError,
  requireAuth,
} from "@/features/auth/services/guards";
import {
  changePasswordSchema,
  profileUpdateSchema,
  settingsPreferencesSchema,
  softDeleteAccountSchema,
} from "@/validations/settings";
import { logger } from "@/utils/logger";

export type SettingsActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

function mapAuth(error: unknown): string {
  if (error instanceof AuthHttpError) {
    return error.code === "UNAUTHORIZED"
      ? "Please sign in again."
      : "Permission denied.";
  }
  return "Something went wrong. Please try again.";
}

function makeReferralCode(userId: string): string {
  return `NP${userId.slice(-8).toUpperCase()}`;
}

export async function updateProfileAction(
  raw: unknown,
): Promise<SettingsActionResult> {
  try {
    const user = await requireAuth();
    const parsed = profileUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Check your profile fields and try again." };
    }

    const data = parsed.data;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name: data.name },
      }),
      prisma.userProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          phone: data.phone || null,
          city: data.city || null,
          address: data.address || null,
          bio: data.bio || null,
          referralCode: makeReferralCode(user.id),
        },
        update: {
          phone: data.phone || null,
          city: data.city || null,
          address: data.address || null,
          bio: data.bio || null,
        },
      }),
    ]);

    // Ensure referral code exists for older profiles.
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile && !profile.referralCode) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: { referralCode: makeReferralCode(user.id) },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/settings");
    return { success: true, message: "Profile updated." };
  } catch (error) {
    logger.error("updateProfileAction", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return { success: false, error: mapAuth(error) };
  }
}

export async function updatePreferencesAction(
  raw: unknown,
): Promise<SettingsActionResult> {
  try {
    const user = await requireAuth();
    const parsed = settingsPreferencesSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: "Invalid preference values." };
    }

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferences: parsed.data,
        referralCode: makeReferralCode(user.id),
      },
      update: { preferences: parsed.data },
    });

    revalidatePath("/settings");
    return { success: true, message: "Preferences saved." };
  } catch (error) {
    return { success: false, error: mapAuth(error) };
  }
}

export async function changePasswordAction(
  raw: unknown,
): Promise<SettingsActionResult> {
  try {
    const user = await requireAuth();
    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid password form.",
      };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.passwordHash) {
      return {
        success: false,
        error: "This account uses Google sign-in. Set a password via reset email first.",
      };
    }

    const ok = await bcrypt.compare(
      parsed.data.currentPassword,
      dbUser.passwordHash,
    );
    if (!ok) {
      return { success: false, error: "Current password is incorrect." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password updated." };
  } catch (error) {
    return { success: false, error: mapAuth(error) };
  }
}

export async function softDeleteAccountAction(
  raw: unknown,
): Promise<SettingsActionResult> {
  try {
    const user = await requireAuth();
    const parsed = softDeleteAccountSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: 'Type DELETE to confirm account removal.' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        email: `deleted+${user.id}@nexplast.invalid`,
        name: "Deleted User",
        image: null,
        passwordHash: null,
      },
    });

    await prisma.session.deleteMany({ where: { userId: user.id } });
    revalidatePath("/");
    return { success: true, message: "Account deactivated." };
  } catch (error) {
    return { success: false, error: mapAuth(error) };
  }
}
