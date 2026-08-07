import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { isAdmin } from "@/utils/roles";
import {
  getRecyclerForUser,
  listPlatformLotsForPurchase,
} from "@/features/recycler/services/purchase";
import { PurchaseLotForm } from "@/features/recycler/components/purchase-lot-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/utils/coin";

export const metadata: Metadata = { title: "Buy Inventory" };

export default async function RecyclerInventoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (
    session.user.role !== UserRole.RECYCLER &&
    !isAdmin(session.user.role)
  ) {
    redirect("/unauthorized");
  }

  const recycler = await getRecyclerForUser(session.user.id);
  const lots = await listPlatformLotsForPurchase();
  const approved = recycler?.verificationStatus === "APPROVED";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Buy inventory</h2>
        <p className="text-sm text-muted-foreground">
          Purchase verified plastic lots. Payment is recorded as platform revenue
          (unit price × kg).
        </p>
      </div>

      {!approved && !isAdmin(session.user.role) ? (
        <Card>
          <CardContent className="py-6 text-sm text-amber-700 dark:text-amber-300">
            Your recycler profile is not approved yet. Contact an admin before
            purchasing lots.
          </CardContent>
        </Card>
      ) : null}

      {lots.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            No platform stock available. Complete collector verifications to stock
            inventory.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lots.map((lot) => (
            <Card key={lot.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
                <CardTitle className="text-base">
                  {lot.category.name} · Grade {lot.grade}
                </CardTitle>
                <Badge variant="secondary">
                  {formatWeight(lot.quantityGrams)} available
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Resin {lot.category.resinType} · Status {lot.status}
                </p>
                {approved || isAdmin(session.user.role) ? (
                  <PurchaseLotForm
                    inventoryId={lot.id}
                    availableGrams={lot.quantityGrams}
                  />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
