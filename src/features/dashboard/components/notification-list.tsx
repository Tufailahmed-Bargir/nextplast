"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import {
  deleteNotificationAction,
  markNotificationReadAction,
} from "@/features/dashboard/actions/notification-actions";
import { formatRelative } from "@/utils/date";
import type { NotificationItem } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

interface NotificationListProps {
  notifications: NotificationItem[];
  unreadCount?: number;
  showHeaderLink?: boolean;
  title?: string;
  interactive?: boolean;
}

/**
 * Notification list — unread indicators, optional filters/actions.
 */
export function NotificationList({
  notifications,
  unreadCount = 0,
  showHeaderLink = true,
  title = "Notifications",
  interactive = false,
}: NotificationListProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const types = useMemo(
    () => Array.from(new Set(notifications.map((n) => n.type))).sort(),
    [notifications],
  );

  const filtered = notifications.filter((n) => {
    if (filter === "unread" && n.readAt) return false;
    if (filter === "read" && !n.readAt) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {unreadCount > 0 ? (
              <Badge variant="secondary">{unreadCount} new</Badge>
            ) : null}
          </div>
          {showHeaderLink ? (
            <Link
              href="/notifications"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
        {interactive ? (
          <div className="flex flex-wrap gap-2">
            {(["all", "unread", "read"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
            <select
              className="h-7 rounded-lg border border-border bg-background px-2 text-xs"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <DashboardEmpty
            icon={Bell}
            title="No notifications yet"
            description="Pickup updates, coin rewards, and order alerts will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => {
              const unread = !n.readAt;
              return (
                <li
                  key={n.id}
                  className={cn(
                    "rounded-xl border p-3",
                    unread
                      ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/40"
                      : "border-border/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {unread ? (
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(n.createdAt)} · {n.type.toLowerCase()}
                    </p>
                    {interactive ? (
                      <div className="flex gap-2">
                        {unread ? (
                          <form action={markNotificationReadAction}>
                            <input type="hidden" name="id" value={n.id} />
                            <Button type="submit" size="xs" variant="outline">
                              Mark read
                            </Button>
                          </form>
                        ) : null}
                        <form action={deleteNotificationAction}>
                          <input type="hidden" name="id" value={n.id} />
                          <Button
                            type="submit"
                            size="xs"
                            variant="ghost"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
