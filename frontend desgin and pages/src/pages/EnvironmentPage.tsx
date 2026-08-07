import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ring, Progress } from '@/components/ui/Progress';
import { CoinIcon } from '@/components/Brand';
import { impactData, monthlyData, achievements } from '@/lib/data';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

export function EnvironmentPage() {
  const stats = [
    { icon: Icons.Recycle, label: 'Plastic Recycled', value: '842', unit: 'kg', color: 'emerald' },
    { icon: Icons.Wind, label: 'CO₂ Saved', value: '1,684', unit: 'kg', color: 'sky' },
    { icon: Icons.TreePine, label: 'Trees Saved', value: '42', unit: 'trees', color: 'forest' },
    { icon: Icons.Droplets, label: 'Water Saved', value: '4,200', unit: 'L', color: 'teal' },
    { icon: Icons.Zap, label: 'Energy Saved', value: '5,880', unit: 'kWh', color: 'amber' },
    { icon: Icons.Fuel, label: 'Oil Saved', value: '210', unit: 'L', color: 'emerald' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">Environmental Dashboard</h1>
        <p className="text-base-muted mt-1">Track your real-world environmental impact</p>
      </div>

      {/* Hero ring */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 border-0 text-white p-6 sm:p-8">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-3">Your Impact</Badge>
            <h2 className="font-display text-3xl font-bold">842 kg recycled</h2>
            <p className="mt-2 text-emerald-100">That's equivalent to saving 42 trees and 1,684 kg of CO₂</p>
          </div>
          <Ring value={71} size={160} stroke={12} label="71%" sublabel="of 2025 goal" />
        </div>
      </Card>

      {/* Impact stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} hover className="p-5">
            <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center mb-4',
              s.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950',
              s.color === 'sky' && 'bg-sky-50 dark:bg-sky-950',
              s.color === 'forest' && 'bg-green-50 dark:bg-green-950',
              s.color === 'teal' && 'bg-teal-50 dark:bg-teal-950',
              s.color === 'amber' && 'bg-amber-50 dark:bg-amber-950',
            )}>
              <s.icon className={cn('h-5 w-5',
                s.color === 'emerald' && 'text-emerald-600',
                s.color === 'sky' && 'text-sky-600',
                s.color === 'forest' && 'text-green-600',
                s.color === 'teal' && 'text-teal-600',
                s.color === 'amber' && 'text-amber-600',
              )} />
            </div>
            <p className="font-display text-2xl font-bold text-base-strong">{s.value} <span className="text-base font-normal text-base-muted">{s.unit}</span></p>
            <p className="text-sm text-base-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Monthly chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-semibold text-base-strong">Monthly Recycling Trend</h3>
            <p className="text-sm text-base-muted">kg recycled per month in 2025</p>
          </div>
          <Badge variant="emerald" dot>+18% growth</Badge>
        </div>
        <div className="flex items-end gap-2 sm:gap-4 h-56">
          {monthlyData.map(m => {
            const max = Math.max(...monthlyData.map(d => d.kg));
            const h = (m.kg / max) * 100;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex-1 flex items-end">
                  <div className="w-full rounded-t-lg bg-eco-gradient opacity-80 group-hover:opacity-100 transition-opacity relative" style={{ height: `${h}%` }}>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-base-strong opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{m.kg}kg</span>
                  </div>
                </div>
                <span className="text-xs text-base-muted">{m.month}</span>
                <span className="text-xs font-semibold text-base-strong">{m.kg}kg</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold text-base-strong mb-5">Achievements</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(a => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] || Icons.Award;
            return (
              <div key={a.id} className={cn('rounded-2xl border-2 p-5 transition-all', a.unlocked ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-base bg-surface-subtle')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', a.unlocked ? 'bg-eco-gradient shadow-glow' : 'bg-surface-muted')}>
                    <Icon className={cn('h-6 w-6', a.unlocked ? 'text-white' : 'text-base-muted')} />
                  </div>
                  <div>
                    <p className="font-semibold text-base-strong">{a.name}</p>
                    <p className="text-xs text-base-muted">{a.desc}</p>
                  </div>
                  {a.unlocked && <Icons.CheckCircle2 className="h-5 w-5 text-emerald-600 ml-auto" />}
                </div>
                {!a.unlocked && a.progress !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs text-base-muted mb-1">
                      <span>Progress</span>
                      <span>{a.progress}%</span>
                    </div>
                    <Progress value={a.progress} size="sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
