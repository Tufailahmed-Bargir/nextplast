import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/utils/roles";
import { listAllCollectors } from "@/features/collector/services/ensure-collector";
import { CollectorTable } from "@/features/admin/components/collector-table";

export const metadata: Metadata = { title: "Collectors" };

export default async function AdminCollectorsPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect("/unauthorized");
  }

  const collectors = await listAllCollectors();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Collectors</h2>
        <p className="text-sm text-muted-foreground">
          Roster, verification, and duty status for Phase 6 pickup assignment.
        </p>
      </div>
      <CollectorTable
        collectors={collectors.map((c) => ({
          id: c.id,
          name: c.user.name,
          email: c.user.email,
          zone: c.zone,
          isOnDuty: c.isOnDuty,
          verificationStatus: c.verificationStatus,
          completedPickups: c.completedPickups,
          activeAssigned: c._count.pickupRequests,
          isActive: c.user.isActive,
        }))}
      />
    </div>
  );
}
