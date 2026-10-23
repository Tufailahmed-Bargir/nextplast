import { DashboardShell } from "@/components/layout/dashboard-shell";
import { recyclerNavItems } from "@/constants/navigation";
import { auth } from "@/auth";

export default async function RecyclerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <DashboardShell
      navItems={recyclerNavItems}
      title="Recycler"
      sidebarTitle="Recycler"
      userName={session?.user?.name ?? "Recycler"}
      profileHref="/recycler/profile"
      showNotifications
      notificationsHref="/recycler/notifications"
    >
      {children}
    </DashboardShell>
  );
}
