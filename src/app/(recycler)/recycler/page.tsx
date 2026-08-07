import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { UserRole } from "@/constants/roles";
import {
  getRecyclerForUser,
  listPlatformLotsForPurchase,
  listRecyclerPurchases,
} from "@/features/recycler/services/purchase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatInr, formatNumber, formatWeight } from "@/utils/coin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Recycler Dashboard" };

export default async function RecyclerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (
    session.user.role !== UserRole.RECYCLER &&
    !isAdmin(session.user.role)
  ) {
    redirect("/unauthorized");
  }

  const recycler = await getRecyclerForUser(session.user.id);
  if (!recycler && !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const [lots, history] = await Promise.all([
    listPlatformLotsForPurchase(),
    recycler ? listRecyclerPurchases(recycler.id) : Promise.resolve([]),
  ]);

  const ownedGrams = history.reduce((s, h) => s + h.quantityGrams, 0);
  const spentInr = history.reduce(
    (s, h) => s + Number(h.unitPriceInr ?? 0),
    0,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Recycler dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {recycler?.companyName ?? "Partner"} · Buy verified plastic lots from
            NexPlast inventory.
          </p>
        </div>
        <Link
          href="/recycler/inventory"
          className={cn(buttonVariants())}
        >
          Browse lots
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Available platform lots
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-bold">
            {formatNumber(lots.length)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Purchased stock (recent)
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-bold">
            {formatWeight(ownedGrams)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Recorded payments
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-bold">
            {formatInr(spentInr)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Verification:{" "}
          <span className="font-medium text-foreground">
            {recycler?.verificationStatus ?? "N/A"}
          </span>
          . Approved recyclers can purchase PLATFORM inventory; stock never goes
          negative.
        </CardContent>
      </Card>
    </div>
  );
}
