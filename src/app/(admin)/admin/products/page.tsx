import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminProducts } from "@/features/admin/services/admin-marketplace";
import { ProductTable } from "@/features/admin/components/product-table";
import { AdminProductForm } from "@/features/marketplace/components/admin-product-form";
import { ensureMarketplaceCategories } from "@/features/marketplace/services/admin-catalog";
import { getProductRequestById } from "@/features/marketplace/services/product-requests";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const { requestId } = await searchParams;

  const [products, categories, request] = await Promise.all([
    listAdminProducts(),
    ensureMarketplaceCategories(),
    requestId ? getProductRequestById(requestId) : Promise.resolve(null),
  ]);

  const requestPrefill =
    request && request.status === "OPEN"
      ? {
          id: request.id,
          title: request.title,
          description: request.description,
          requesterName: request.user.name,
          requesterEmail: request.user.email,
          requesterRole: request.user.role,
        }
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Products</h2>
        <p className="text-sm text-muted-foreground">
          Marketplace catalog management — create, activate, and seed inventory.
        </p>
      </div>
      <AdminProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        requestPrefill={requestPrefill}
      />
      <ProductTable products={products} />
    </div>
  );
}
