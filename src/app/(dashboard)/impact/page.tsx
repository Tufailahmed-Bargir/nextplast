import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { ImpactCard } from "@/features/dashboard/components/impact-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatNumber,
  formatWeight,
} from "@/utils/coin";
import { decimalToNumber } from "@/features/dashboard/types";

export const metadata: Metadata = { title: "Environmental Impact" };

async function ImpactContent({ userId }: { userId: string }) {
  const [impact, history, badges] = await Promise.all([
    prisma.environmentalImpact.findUnique({ where: { userId } }),
    prisma.collectorVerification.findMany({
      where: { pickupRequest: { listing: { userId } } },
      orderBy: { verifiedAt: "desc" },
      take: 12,
      select: {
        verifiedAt: true,
        actualWeightGrams: true,
        recalculatedCoins: true,
      },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
      take: 12,
    }),
  ]);

  const stats = {
    plasticRecycledGrams: impact?.plasticRecycledGrams ?? 0,
    co2SavedKg: impact ? decimalToNumber(impact.co2SavedKg) : 0,
    treesSaved: impact ? decimalToNumber(impact.treesSaved) : 0,
    oceanPlasticPreventedKg: impact
      ? decimalToNumber(impact.oceanPlasticPreventedKg)
      : 0,
    waterSavedLiters: impact ? decimalToNumber(impact.waterSavedLiters) : 0,
    energySavedKwh: impact ? decimalToNumber(impact.energySavedKwh) : 0,
    oilSavedLiters: impact ? decimalToNumber(impact.oilSavedLiters) : 0,
    rankCache: impact?.rankCache ?? null,
  };

  const milestones = [
    {
      label: "First kg recycled",
      done: stats.plasticRecycledGrams >= 1000,
    },
    {
      label: "10 kg recycled",
      done: stats.plasticRecycledGrams >= 10_000,
    },
    { label: "1 tree saved", done: stats.treesSaved >= 1 },
    { label: "10 kg CO₂ avoided", done: stats.co2SavedKg >= 10 },
  ];

  return (
    <div className="space-y-6">
      <ImpactCard impact={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {milestones.map((m) => (
              <p key={m.label} className="flex justify-between gap-2">
                <span>{m.label}</span>
                <span className={m.done ? "text-emerald-600" : "text-muted-foreground"}>
                  {m.done ? "Achieved" : "In progress"}
                </span>
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {badges.length === 0 ? (
              <p className="text-muted-foreground">
                Complete verified pickups to earn badges.
              </p>
            ) : (
              badges.map((b) => (
                <div key={b.id} className="rounded-lg border border-border p-2">
                  <p className="font-medium">{b.badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.badge.description ?? "Achievement unlocked"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No verified pickups yet — your impact timeline will appear here.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((h, i) => (
                <li
                  key={`${h.verifiedAt.toISOString()}-${i}`}
                  className="flex flex-wrap justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span>{h.verifiedAt.toLocaleString()}</span>
                  <span>
                    {formatWeight(h.actualWeightGrams)} ·{" "}
                    {formatNumber(Number(h.recalculatedCoins))} coins
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

export default async function ImpactPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Environmental Impact</h2>
        <p className="text-sm text-muted-foreground">
          Live totals from verified recycling — plastic, CO₂, trees, energy, and more.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <ImpactContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}
