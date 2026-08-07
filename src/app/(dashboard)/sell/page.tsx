import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SellWizard } from "@/features/plastic";
import { DashboardSkeleton } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Sell Plastic",
};

/**
 * Sell Plastic — multi-step wizard (upload → AI → details → pickup → submit).
 */
export default async function SellPlasticPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellWizard />
    </Suspense>
  );
}
