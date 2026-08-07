import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminInventory } from "@/features/admin/services/admin-inventory";
import { InventoryTable } from "@/features/admin/components/inventory-table";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const inventory = await listAdminInventory();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Platform and recycler stock with audited gram adjustments.
        </p>
      </div>
      <InventoryTable
        rows={inventory.map((i) => ({
          id: i.id,
          category: i.category.name,
          grade: i.grade,
          ownerType: i.ownerType,
          quantityGrams: i.quantityGrams,
          status: i.status,
        }))}
      />
    </div>
  );
}
