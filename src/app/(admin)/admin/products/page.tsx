import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAdminProducts } from "@/features/admin/services/admin-marketplace";
import { ProductTable } from "@/features/admin/components/product-table";
import { AdminProductForm } from "@/features/marketplace/components/admin-product-form";
import { ensureMarketplaceCategories } from "@/features/marketplace/services/admin-catalog";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const [products, categories] = await Promise.all([
    listAdminProducts(),
    ensureMarketplaceCategories(),
  ]);

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
      />
      <ProductTable products={products} />
    </div>
  );
}
