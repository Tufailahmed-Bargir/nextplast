import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavItems } from "@/constants/navigation";
import { auth } from "@/auth";

/**
 * Admin route group layout.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <DashboardShell
      navItems={adminNavItems}
      title="Admin"
      sidebarTitle="Admin"
      userName={session?.user?.name ?? "Admin"}
      profileHref="/admin/settings"
    >
      {children}
    </DashboardShell>
  );
}
