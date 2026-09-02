import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminProductRequests } from "@/features/admin/services/admin-product-requests";
import { ProductRequestTable } from "@/features/admin/components/product-request-table";

export const metadata: Metadata = { title: "Product requests" };

export default async function AdminProductRequestsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const requests = await listAdminProductRequests();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Product requests</h2>
        <p className="text-sm text-muted-foreground">
          Users ask for products missing from the marketplace. Create the
          product to fulfill a request — the requester gets a notification with
          a link to buy it.
        </p>
      </div>
      <ProductRequestTable
        requests={requests.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
          user: r.user,
          fulfilledProduct: r.fulfilledProduct,
        }))}
      />
    </div>
  );
}
