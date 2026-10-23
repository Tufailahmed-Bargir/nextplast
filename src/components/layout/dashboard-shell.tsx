import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";
import type { NavItem } from "@/constants/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title?: string;
  coinBalance?: number;
  userName?: string;
  sidebarTitle?: string;
  profileHref?: string;
  showMarketplaceLinks?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  notificationsHref?: string;
}

/**
 * Shared authenticated shell: collapsible sidebar + top navbar + content.
 */
export function DashboardShell({
  children,
  navItems,
  title,
  coinBalance,
  userName,
  sidebarTitle,
  profileHref,
  showMarketplaceLinks,
  showNotifications,
  showSearch,
  notificationsHref,
}: DashboardShellProps) {
  return (
    <div className="bg-muted/30 flex min-h-screen">
      <AppSidebar
        items={navItems}
        coinBalance={coinBalance}
        title={sidebarTitle}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar
          title={title}
          userName={userName}
          profileHref={profileHref}
          showMarketplaceLinks={showMarketplaceLinks}
          showNotifications={showNotifications}
          showSearch={showSearch}
          notificationsHref={notificationsHref}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
