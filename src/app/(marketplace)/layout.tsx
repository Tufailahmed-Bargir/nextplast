import { DashboardShell } from "@/components/layout/dashboard-shell";
import { userNavItems } from "@/constants/navigation";
import { auth } from "@/auth";
import { getWalletBalance } from "@/features/dashboard/services/dashboard-queries";

/**
 * Marketplace route group layout — shares user shell navigation.
 */
export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const coinBalance = session?.user?.id
    ? await getWalletBalance(session.user.id)
    : 0;

  return (
    <DashboardShell
      navItems={userNavItems}
      title="Marketplace"
      userName={session?.user?.name ?? (session ? "User" : "Guest")}
      coinBalance={coinBalance}
      profileHref="/profile"
      showMarketplaceLinks
      showNotifications
      showSearch
    >
      {children}
    </DashboardShell>
  );
}
