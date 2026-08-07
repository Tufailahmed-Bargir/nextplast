"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { Logo, CoinIcon } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import {
  logoutNavItem,
  type NavItem,
} from "@/constants/navigation";
import { getNavIcon } from "@/components/layout/nav-icons";
import { formatCoin, coinsToInternalInr, formatInr } from "@/utils/coin";

interface AppSidebarProps {
  items: NavItem[];
  coinBalance?: number;
  title?: string;
}

/**
 * Collapsible app sidebar — desktop sticky + mobile sheet overlay.
 * Matches Frontend Design AppShell navigation patterns.
 */
export function AppSidebar({
  items,
  coinBalance,
  title,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } =
    useSidebarStore();
  const LogOutIcon = getNavIcon(logoutNavItem.icon);

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-0.5 px-3 py-4">
      {title ? (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      ) : null}
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = getNavIcon(item.icon);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={cn(
          "mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950",
          collapsed && "justify-center px-2",
        )}
      >
        <LogOutIcon className="h-[18px] w-[18px]" />
        {!collapsed && logoutNavItem.title}
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r border-border bg-card transition-all duration-300 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed ? (
            <Link href="/">
              <Logo size={28} />
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <Logo size={28} className="[&>span]:hidden" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            className={cn(collapsed && "mx-auto")}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <NavList />
        </ScrollArea>
        {!collapsed && typeof coinBalance === "number" ? (
          <div className="border-t border-border p-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950 dark:to-teal-950">
              <div className="mb-1 flex items-center gap-2">
                <CoinIcon size={20} />
                <span className="font-display font-bold">{formatCoin(coinBalance)}</span>
                <span className="text-xs text-muted-foreground">coins</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ {formatInr(coinsToInternalInr(coinBalance))} reward value
              </p>
            </div>
          </div>
        ) : null}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 animate-fade-in lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-72 flex-col border-r border-border bg-card animate-slide-up">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo size={28} />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </ScrollArea>
          </aside>
        </div>
      ) : null}
    </>
  );
}
