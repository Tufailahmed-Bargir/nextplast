import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotificationsPageData } from "@/features/dashboard";
import { NotificationList } from "@/features/dashboard/components/notification-list";
import { markAllNotificationsReadAction } from "@/features/dashboard/actions/notification-actions";
import { SubmitButton } from "@/components/shared/submit-button";
import { UnreadCountSync } from "@/components/layout/notification-bell";

export const metadata: Metadata = {
  title: "Notifications",
};

/**
 * Full notifications inbox backed by Prisma Notification model.
 */
export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { notifications, unread } = await getNotificationsPageData(
    session.user.id,
  );

  return (
    <div className="animate-fade-in space-y-6">
      <UnreadCountSync count={unread} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground text-sm">
            Pickup updates, rewards, orders, and system alerts.
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <SubmitButton variant="outline">Mark all as read</SubmitButton>
          </form>
        ) : null}
      </div>

      <NotificationList
        notifications={notifications}
        unreadCount={unread}
        showHeaderLink={false}
        title="Inbox"
        interactive
      />
    </div>
  );
}
