import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEmpty } from "@/features/dashboard/components/dashboard-empty";
import { formatNumber } from "@/utils/coin";
import type { LeaderboardEntry } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  userRank: number | null;
  showHeaderLink?: boolean;
  title?: string;
}

/**
 * Top leaderboard snapshot for the dashboard.
 */
export function LeaderboardPreview({
  entries,
  userRank,
  showHeaderLink = true,
  title = "Leaderboard",
}: LeaderboardPreviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your rank: {userRank != null ? `#${userRank}` : "Unranked"}
          </p>
        </div>
        {showHeaderLink ? (
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-primary hover:underline"
          >
            Full board
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <DashboardEmpty
            icon={Trophy}
            title="No rankings yet"
            description="Recycle plastic to climb the leaderboard once community activity begins."
          />
        ) : (
          <ol className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.userId}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2",
                  entry.isCurrentUser
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display w-6 text-sm font-bold text-muted-foreground">
                    {entry.rank}
                  </span>
                  <span className="text-sm font-medium">
                    {entry.isCurrentUser ? "You" : entry.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(entry.score)}
                  {entry.metric === "plastic_kg" ? " kg" : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
