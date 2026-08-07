import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DashboardHome,
  DashboardSkeleton,
  getDashboardData,
} from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardContent({ userId }: { userId: string }) {
  const data = await getDashboardData(userId);
  return <DashboardHome data={data} />;
}

/**
 * User dashboard home — real Prisma data + production empty states.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent userId={session.user.id} />
    </Suspense>
  );
}
