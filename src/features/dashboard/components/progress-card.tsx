import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GamificationLevel } from "@prisma/client";

interface ProgressCardProps {
  level: GamificationLevel;
  profileCompletion: number;
  badgesEarned: number;
  badgesTotal: number;
  userRank: number | null;
}

const LEVEL_COPY: Record<GamificationLevel, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
};

/**
 * Gamification + profile completion progress.
 */
export function ProgressCard({
  level,
  profileCompletion,
  badgesEarned,
  badgesTotal,
  userRank,
}: ProgressCardProps) {
  const badgeProgress =
    badgesTotal > 0 ? Math.round((badgesEarned / badgesTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Your progress</CardTitle>
        <Badge variant="secondary">{LEVEL_COPY[level]}</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile completion</span>
            <span className="font-medium">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion}>
            <ProgressLabel className="sr-only">Profile completion</ProgressLabel>
          </Progress>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Badges unlocked</span>
            <span className="font-medium">
              {badgesEarned}/{badgesTotal || 0}
            </span>
          </div>
          <Progress value={badgeProgress}>
            <ProgressLabel className="sr-only">Badge progress</ProgressLabel>
          </Progress>
        </div>
        <p className="text-sm text-muted-foreground">
          Leaderboard position:{" "}
          <span className="font-semibold text-foreground">
            {userRank != null ? `#${userRank}` : "Unranked"}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
