import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listRecyclers } from "@/features/admin/services/ensure-recycler";
import { RecyclerTable } from "@/features/admin/components/recycler-table";

export const metadata: Metadata = { title: "Recyclers" };

export default async function AdminRecyclersPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const recyclers = await listRecyclers();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Recyclers</h2>
        <p className="text-sm text-muted-foreground">
          Recycling partners and verification for inventory ownership.
        </p>
      </div>
      <RecyclerTable
        recyclers={recyclers.map((r) => ({
          id: r.id,
          companyName: r.companyName,
          name: r.user.name,
          email: r.user.email,
          verificationStatus: r.verificationStatus,
          inventoryLots: r._count.inventory,
          isActive: r.user.isActive,
        }))}
      />
    </div>
  );
}
