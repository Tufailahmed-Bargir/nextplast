"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch("/api/notifications/unread-count", {
    cache: "no-store",
  });
  if (res.status === 401) return 0;
  if (!res.ok) throw new Error("Failed to load unread count");
  const json = (await res.json()) as { data?: { count?: number } };
  return json.data?.count ?? 0;
}

/**
 * Header bell with an unread badge. Refreshes on navigation and every minute
 * while the tab is visible.
 */
export function NotificationBell() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: count = 0 } = useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: fetchUnreadCount,
    staleTime: 0,
    refetchInterval: 60_000,
  });

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
  }, [pathname, queryClient]);

  const label = count > 0 ? `Notifications (${count} unread)` : "Notifications";

  return (
    <Link
      href="/notifications"
      aria-label={label}
      title={label}
      className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Keeps the header badge in step with server-rendered counts (e.g. after
 * "Mark read" on the inbox, which doesn't change the URL).
 */
export function UnreadCountSync({ count }: { count: number }) {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.setQueryData(UNREAD_COUNT_KEY, count);
  }, [count, queryClient]);
  return null;
}
