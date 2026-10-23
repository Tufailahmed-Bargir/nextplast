"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/prisma";
import { AuthHttpError, requireAuth } from "@/features/auth/services/guards";

function revalidateInbox() {
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath("/collector/notifications");
  revalidatePath("/recycler/notifications");
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllNotificationsReadAction(
  _formData: FormData,
): Promise<void> {
  void _formData;
  try {
    const user = await requireAuth();
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidateInbox();
  } catch (error) {
    if (error instanceof AuthHttpError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }
}

export async function markNotificationReadAction(
  formData: FormData,
): Promise<void> {
  try {
    const user = await requireAuth();
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.notification.updateMany({
      where: { id, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidateInbox();
  } catch (error) {
    if (error instanceof AuthHttpError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }
}

export async function deleteNotificationAction(
  formData: FormData,
): Promise<void> {
  try {
    const user = await requireAuth();
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await prisma.notification.deleteMany({
      where: { id, userId: user.id },
    });
    revalidateInbox();
  } catch (error) {
    if (error instanceof AuthHttpError && error.code === "UNAUTHORIZED") {
      redirect("/login");
    }
    throw error;
  }
}
