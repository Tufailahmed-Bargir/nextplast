import { DashboardShell } from "@/components/layout/dashboard-shell";
import { collectorNavItems } from "@/constants/navigation";
import { auth } from "@/auth";

/**
 * Collector route group layout.
 */
export default async function CollectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <DashboardShell
      navItems={collectorNavItems}
      title="Collector"
      sidebarTitle="Collector"
      userName={session?.user?.name ?? "Collector"}
    >
      {children}
    </DashboardShell>
  );
}
