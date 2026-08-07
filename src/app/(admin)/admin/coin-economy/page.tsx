import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listWalletTransactions } from "@/features/admin/services/admin-wallet";
import { listAdminUsers } from "@/features/admin/services/admin-users";
import { WalletTable } from "@/features/admin/components/wallet-table";

export const metadata: Metadata = { title: "Coin Economy" };

export default async function AdminCoinEconomyPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const [transactions, users] = await Promise.all([
    listWalletTransactions(80),
    listAdminUsers({ take: 200 }),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Coin economy</h2>
        <p className="text-sm text-muted-foreground">
          Nature Coin ledger and audited admin adjustments.
        </p>
      </div>
      <WalletTable
        transactions={transactions}
        users={users
          .filter(
            (u) =>
              u.id !== session.user.id &&
              u.role !== "ADMIN" &&
              u.role !== "SUPER_ADMIN",
          )
          .map((u) => ({
            id: u.id,
            label: `${u.name ?? u.email} (${u.email})`,
          }))}
      />
    </div>
  );
}
