import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { getAdminReports } from "@/features/admin/services/admin-reports";
import { ReportCard } from "@/features/admin/components/report-card";
import { ReportDateFilter } from "@/features/admin/components/report-date-filter";
import { formatCoin, formatWeight } from "@/utils/coin";
import { formatDate } from "@/utils/date";

export const metadata: Metadata = { title: "Reports" };

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const sp = await searchParams;
  const from = parseDate(sp.from);
  const to = parseDate(sp.to, true);
  const reports = await getAdminReports({ from, to });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Date-filtered operational datasets from Prisma with CSV export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {(
            [
              ["users", "Users"],
              ["listings", "Listings"],
              ["orders", "Orders"],
              ["inventory", "Inventory"],
              ["wallet", "Wallet"],
              ["leaderboard", "Leaderboard"],
            ] as const
          ).map(([type, label]) => (
            <a
              key={type}
              href={`/api/admin/export?type=${type}`}
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
            >
              CSV {label}
            </a>
          ))}
        </div>
      </div>

      <Suspense fallback={null}>
        <ReportDateFilter />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportCard
          title="Users"
          count={reports.users.length}
          description="Account registrations in range"
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {reports.users.slice(0, 25).map((u) => (
              <li key={u.id} className="flex justify-between gap-2">
                <span className="truncate">{u.email}</span>
                <span className="shrink-0 text-muted-foreground">
                  {u.role} · {formatDate(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="Plastic listings"
          count={reports.listings.length}
          description="Listings created in range"
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {reports.listings.slice(0, 25).map((l) => (
              <li key={l.id} className="flex justify-between gap-2">
                <span className="truncate">
                  #{l.id.slice(0, 8)} · {l.userEmail}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {l.status.replaceAll("_", " ").toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="Inventory"
          count={reports.inventory.length}
          description="Current lots (not date-scoped)"
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {reports.inventory.slice(0, 25).map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {i.category} · {i.grade}
                </span>
                <span className="shrink-0">{formatWeight(i.quantityGrams)}</span>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="Orders"
          count={reports.orders.length}
          description="Marketplace orders in range"
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {reports.orders.length === 0 ? (
              <li className="text-muted-foreground">No orders in range.</li>
            ) : (
              reports.orders.slice(0, 25).map((o) => (
                <li key={o.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    #{o.id.slice(0, 8)} · {o.userEmail}
                  </span>
                  <span className="shrink-0">
                    {formatCoin(o.coinAmount)} · ₹{Math.round(o.cashAmountInr)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </ReportCard>

        <ReportCard
          title="Wallet"
          count={reports.wallet.length}
          description="Transactions in range"
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {reports.wallet.slice(0, 25).map((t) => (
              <li key={t.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {t.userEmail} · {t.type}
                </span>
                <span className="shrink-0 coin-text">{formatCoin(t.amount)}</span>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard
          title="Environmental impact"
          count={reports.impact.length}
          description="Current cumulative impact (not date-scoped)"
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {reports.impact.slice(0, 25).map((i) => (
              <li key={i.userId} className="flex justify-between gap-2">
                <span className="truncate">{i.userName}</span>
                <span className="shrink-0">
                  {formatWeight(i.plasticRecycledGrams)} · {i.co2SavedKg} kg
                  CO₂
                </span>
              </li>
            ))}
          </ul>
        </ReportCard>
      </div>
    </div>
  );
}
