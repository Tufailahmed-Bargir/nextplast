import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeaderboardPageData } from "@/features/dashboard";
import { LeaderboardPreview } from "@/features/dashboard/components/leaderboard-preview";

export const metadata: Metadata = {
  title: "Leaderboard",
};

/**
 * Leaderboard page — Prisma Leaderboard rows with impact fallback.
 */
export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getLeaderboardPageData(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Leaderboard</h2>
        <p className="text-sm text-muted-foreground">
          Community recycling rankings. Climb by completing verified pickups.
        </p>
      </div>
      <LeaderboardPreview
        entries={data.leaderboard}
        userRank={data.userRank}
        showHeaderLink={false}
        title="Rankings"
      />
    </div>
  );
}
