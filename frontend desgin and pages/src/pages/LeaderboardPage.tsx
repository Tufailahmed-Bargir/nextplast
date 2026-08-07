import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { CoinIcon } from '@/components/Brand';
import { leaderboard } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

export function LeaderboardPage() {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">Eco Leaderboard</h1>
        <p className="text-base-muted mt-1">Top recyclers in the NexPlast community</p>
      </div>

      {/* Podium */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
          {podiumOrder.map((entry, i) => {
            const isUser = entry.name === 'You';
            const isFirst = i === 1;
            const heights = ['h-24', 'h-32', 'h-20'];
            const medalColors = ['text-slate-400', 'text-coin-500', 'text-amber-600'];
            return (
              <div key={entry.rank} className="flex flex-col items-center">
                <div className="relative mb-3">
                  {isFirst && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-6 text-coin-500" />}
                  <Avatar name={entry.name} size={isFirst ? 'xl' : 'lg'} ring={isFirst} className={cn(isUser && 'ring-emerald-500')} />
                </div>
                <p className="font-semibold text-sm text-base-strong text-center">{entry.name}</p>
                <p className="text-xs text-base-muted">{entry.city}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CoinIcon size={16} />
                  <span className="font-bold text-sm text-base-strong">{entry.coins.toLocaleString()}</span>
                </div>
                <div className={cn('mt-3 w-20 sm:w-28 rounded-t-xl flex items-center justify-center text-white font-display font-bold text-lg', heights[i], isFirst ? 'bg-coin-gradient' : i === 0 ? 'bg-slate-400' : 'bg-amber-600')}>
                  #{entry.rank}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-base-strong">Full Rankings</h3>
          <Badge variant="emerald" dot>Updated live</Badge>
        </div>
        <div className="space-y-2">
          {leaderboard.map(entry => {
            const isUser = entry.name === 'You';
            return (
              <div key={entry.rank} className={cn('flex items-center gap-4 p-3.5 rounded-xl transition-colors', isUser ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900' : 'hover:bg-surface-subtle')}>
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center font-display font-bold shrink-0',
                  entry.rank === 1 ? 'bg-coin-gradient text-white' :
                  entry.rank === 2 ? 'bg-slate-200 dark:bg-slate-700 text-base-strong' :
                  entry.rank === 3 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700' : 'bg-surface-subtle text-base-muted'
                )}>
                  {entry.rank <= 3 ? <Medal className="h-5 w-5" /> : entry.rank}
                </div>
                <Avatar name={entry.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-base-strong">{entry.name} {isUser && <Badge variant="emerald" className="ml-1">You</Badge>}</p>
                  <p className="text-xs text-base-muted">{entry.city} · {entry.recycled} kg recycled</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <CoinIcon size={18} />
                    <span className="font-display font-bold text-base-strong">{entry.coins.toLocaleString()}</span>
                  </div>
                  {entry.rank <= 3 && <span className="text-xs text-emerald-600 flex items-center gap-0.5 justify-end"><TrendingUp className="h-3 w-3" /> Top recycler</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
