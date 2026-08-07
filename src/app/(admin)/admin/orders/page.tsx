import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminOrders } from "@/features/admin/services/admin-marketplace";
import { OrderTable } from "@/features/admin/components/order-table";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const orders = await listAdminOrders();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Orders</h2>
        <p className="text-sm text-muted-foreground">
          Marketplace order overview from live Prisma data.
        </p>
      </div>
      <OrderTable orders={orders} />
    </div>
  );
}
