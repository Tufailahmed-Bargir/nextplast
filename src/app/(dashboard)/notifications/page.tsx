import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotificationsPageData } from "@/features/dashboard";
import { NotificationList } from "@/features/dashboard/components/notification-list";
import { markAllNotificationsReadAction } from "@/features/dashboard/actions/notification-actions";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Pickup updates, rewards, orders, and system alerts.
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline">
              Mark all as read
            </Button>
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
