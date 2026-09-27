import { DashboardShell } from "@/components/layout/dashboard-shell";
import { userNavItems } from "@/constants/navigation";
import { auth } from "@/auth";
import { getWalletBalance } from "@/features/dashboard";

/**
 * User dashboard route group layout.
 */
export default async function DashboardLayout({
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
      title="Dashboard"
      userName={session?.user?.name ?? "User"}
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
