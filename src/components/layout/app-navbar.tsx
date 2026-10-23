"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggleButton } from "@/components/shared/theme-toggle-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/hooks/use-sidebar-store";

interface AppNavbarProps {
  title?: string;
  userName?: string;
  /** Avatar destination — role-specific (e.g. /collector/profile). */
  profileHref?: string;
  /** Cart + wishlist — only for user/marketplace shells. */
  showMarketplaceLinks?: boolean;
  /** Bell icon — only when notifications live in this shell. */
  showNotifications?: boolean;
  /** Product/listing search — only for user/marketplace shells. */
  showSearch?: boolean;
  notificationsHref?: string;
}

const TITLE_BY_PATH: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/wallet": "Wallet",
  "/profile": "Profile",
  "/notifications": "Notifications",
  "/history": "History",
  "/leaderboard": "Leaderboard",
  "/sell": "Sell Plastic",
  "/listings": "My Listings",
  "/settings": "Settings",
  "/marketplace": "Marketplace",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/wishlist": "Wishlist",
  "/orders": "Orders",
  "/search": "Search",
  "/impact": "Environmental Impact",
  "/ai": "AI Detection",
  "/collector": "Collector",
  "/collector/profile": "Profile",
  "/recycler": "Recycler",
  "/recycler/profile": "Profile",
};

/**
 * Sticky glass topbar — optional search/notifications/wishlist/cart + avatar.
 */
export function AppNavbar({
  title = "Dashboard",
  userName = "User",
  profileHref = "/profile",
  showMarketplaceLinks = false,
  showNotifications = false,
  showSearch = false,
  notificationsHref,
}: AppNavbarProps) {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebarStore();

  const pageTitle =
    TITLE_BY_PATH[pathname] ??
    Object.entries(TITLE_BY_PATH).find(([path]) =>
      pathname.startsWith(`${path}/`),
    )?.[1] ??
    title;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="glass border-border/50 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="font-display hidden text-lg font-semibold sm:block">
        {pageTitle}
      </h1>

      {/* Phones get a search icon instead of a cramped input. */}
      <div className="flex-1 sm:hidden" />
      {showSearch ? (
        <div className="hidden max-w-md flex-1 sm:block">
          <form action="/search" method="get" className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              name="q"
              placeholder="Search products, listings, orders..."
              className="bg-muted/50 h-10 rounded-xl pl-10"
              aria-label="Search"
            />
          </form>
        </div>
      ) : (
        <div className="hidden flex-1 sm:block" />
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {showSearch ? (
          <Link
            href="/search"
            aria-label="Search"
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors sm:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
        ) : null}
        <ThemeToggleButton />
        {showNotifications ? (
          <NotificationBell href={notificationsHref} />
        ) : null}
        {showMarketplaceLinks ? (
          <>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </>
        ) : null}
        <Link href={profileHref} aria-label="Open profile">
          <Avatar className="ring-primary/20 h-8 w-8 ring-2">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
