import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminUsers } from "@/features/admin/services/admin-users";
import { UserTable } from "@/features/admin/components/user-table";
import type { UserRole } from "@/constants/roles";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const users = await listAdminUsers({ take: 150 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Users</h2>
        <p className="text-sm text-muted-foreground">
          Central user management with role assignment and suspension.
        </p>
      </div>
      <UserTable
        currentUserId={session.user.id}
        users={users.map((u) => ({
          ...u,
          role: u.role as UserRole,
        }))}
      />
    </div>
  );
}
