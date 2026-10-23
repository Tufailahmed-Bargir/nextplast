import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { UserRole } from "@/constants/roles";
import {
  getRecyclerForUser,
  getRecyclerPurchaseTotals,
  listPlatformLotsForPurchase,
} from "@/features/recycler/services/purchase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatInr, formatNumber, formatWeight } from "@/utils/coin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Recycler Dashboard" };

export default async function RecyclerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== UserRole.RECYCLER && !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const recycler = await getRecyclerForUser(session.user.id);
  if (!recycler && !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const [lots, totals] = await Promise.all([
    listPlatformLotsForPurchase(),
    recycler
      ? getRecyclerPurchaseTotals(recycler.id)
      : Promise.resolve({ grams: 0, spentInr: 0 }),
  ]);
  const { grams: ownedGrams, spentInr } = totals;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Recycler dashboard
          </h2>
          <p className="text-muted-foreground text-sm">
            {recycler?.companyName ?? "Partner"} · Buy verified plastic lots
            from NexPlast inventory.
          </p>
        </div>
        <Link href="/recycler/inventory" className={cn(buttonVariants())}>
          Browse lots
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">
              Available platform lots
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-bold">
            {formatNumber(lots.length)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">
              Purchased stock
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-bold">
            {formatWeight(ownedGrams)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">
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
        <CardContent className="text-muted-foreground text-sm">
          Verification:{" "}
          <span className="text-foreground font-medium">
            {recycler?.verificationStatus ?? "N/A"}
          </span>
          . Approved recyclers can purchase PLATFORM inventory; stock never goes
          negative.
        </CardContent>
      </Card>
    </div>
  );
}
