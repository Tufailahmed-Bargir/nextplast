import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { isAdmin } from "@/utils/roles";
import {
  getRecyclerForUser,
  listRecyclerPurchases,
} from "@/features/recycler/services/purchase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatWeight } from "@/utils/coin";

export const metadata: Metadata = { title: "Purchase History" };

export default async function RecyclerHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (
    session.user.role !== UserRole.RECYCLER &&
    !isAdmin(session.user.role)
  ) {
    redirect("/unauthorized");
  }

  const recycler = await getRecyclerForUser(session.user.id);
  if (!recycler) {
    return (
      <p className="text-sm text-muted-foreground">
        No recycler profile linked to this account.
      </p>
    );
  }

  const history = await listRecyclerPurchases(recycler.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Purchase history</h2>
        <p className="text-sm text-muted-foreground">
          Inventory movements for your recycler account.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent movements</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span>
                    {m.type} · {m.inventory.category.name} · Grade{" "}
                    {m.inventory.grade}
                  </span>
                  <span className="text-muted-foreground">
                    {formatWeight(m.quantityGrams)}
                    {m.unitPriceInr
                      ? ` · ${formatInr(Number(m.unitPriceInr))}`
                      : ""}{" "}
                    · {m.createdAt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
