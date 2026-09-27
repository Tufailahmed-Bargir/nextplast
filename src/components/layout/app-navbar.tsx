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
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 px-4 sm:px-6">
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

      {showSearch ? (
        <div className="mx-auto max-w-md flex-1 sm:mx-0">
          <form action="/search" method="get" className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              name="q"
              placeholder="Search products, listings, orders..."
              className="h-10 rounded-xl bg-muted/50 pl-10"
              aria-label="Search"
            />
          </form>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggleButton />
        {showNotifications ? <NotificationBell /> : null}
        {showMarketplaceLinks ? (
          <>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </>
        ) : null}
        <Link href={profileHref} aria-label="Open profile">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
