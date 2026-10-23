import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Recycle } from "lucide-react";
import { auth } from "@/auth";
import { getWalletPageData } from "@/features/dashboard";
import { signedWalletAmount } from "@/features/dashboard/types";
import { WalletCard } from "@/features/dashboard/components/wallet-card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCoin } from "@/utils/coin";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wallet",
};

/**
 * Nature Coin wallet — balance summary + transaction ledger from Prisma.
 */
export default async function WalletPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { wallet, transactions } = await getWalletPageData(session.user.id);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Nature Wallet</h2>
        <p className="text-muted-foreground text-sm">
          Coins are earned from verified pickups and redeemable only in the
          marketplace — never cash-convertible.
        </p>
      </div>

      <WalletCard wallet={wallet} compact />

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <DashboardEmpty
              icon={Recycle}
              title="No transactions yet"
              description="Verified pickups and marketplace redemptions will appear in this ledger."
            />
          ) : (
            <ul className="divide-border divide-y">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {tx.title ?? tx.type}
                      </p>
                      <Badge variant="secondary">
                        {tx.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {tx.description ?? tx.type} ·{" "}
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold",
                      signedWalletAmount(tx.type, tx.amount) >= 0
                        ? "coin-text"
                        : "text-destructive",
                    )}
                  >
                    {signedWalletAmount(tx.type, tx.amount) >= 0 ? "+" : ""}
                    {formatCoin(signedWalletAmount(tx.type, tx.amount))}
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
