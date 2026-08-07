import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CoinIcon } from '@/components/Brand';
import { Progress } from '@/components/ui/Progress';
import { monthlyData, weeklyData } from '@/lib/data';
import { TrendingUp, TrendingDown, Users, Recycle, Package, Coins } from 'lucide-react';

export function AnalyticsPage() {
  const kpis = [
    { label: 'Total Recycled', value: '12,400 kg', change: '+18%', up: true, icon: Recycle },
    { label: 'Active Users', value: '3,847', change: '+12%', up: true, icon: Users },
    { label: 'Pickups Completed', value: '2,106', change: '+8%', up: true, icon: Package },
    { label: 'Coins Distributed', value: '124K', change: '+22%', up: true, icon: Coins },
  ];

  const typeDistribution = [
    { type: 'PET', value: 45, color: 'bg-emerald-500' },
    { type: 'HDPE', value: 25, color: 'bg-sky-500' },
    { type: 'PP', value: 15, color: 'bg-teal-500' },
    { type: 'LDPE', value: 10, color: 'bg-coin-500' },
    { type: 'Other', value: 5, color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">Analytics</h1>
        <p className="text-base-muted mt-1">Platform-wide insights and performance metrics</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-surface-subtle flex items-center justify-center">
                <k.icon className="h-5 w-5 text-base-muted" />
              </div>
              <Badge variant={k.up ? 'emerald' : 'red'} dot>
                {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {k.change}
              </Badge>
            </div>
            <p className="font-display text-2xl font-bold text-base-strong">{k.value}</p>
            <p className="text-sm text-base-muted">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-base-strong">Recycling Volume</h3>
              <p className="text-sm text-base-muted">Monthly kg recycled across platform</p>
            </div>
            <Badge variant="emerald" dot>+18% YoY</Badge>
          </div>
          <div className="flex items-end gap-2 sm:gap-4 h-56">
            {monthlyData.map(m => {
              const max = Math.max(...monthlyData.map(d => d.kg));
              const h = (m.kg / max) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex-1 flex items-end">
                    <div className="w-full rounded-t-lg bg-eco-gradient opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-xs text-base-muted">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-5">Plastic Type Mix</h3>
          <div className="space-y-4">
            {typeDistribution.map(t => (
              <div key={t.type}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-base-strong">{t.type}</span>
                  <span className="text-sm text-base-muted">{t.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-muted overflow-hidden">
                  <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weekly activity */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold text-base-strong mb-5">Weekly Pickup Activity</h3>
        <div className="flex items-end gap-3 h-40">
          {weeklyData.map(d => {
            const max = Math.max(...weeklyData.map(x => x.value));
            const h = (d.value / max) * 100;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div className="w-full rounded-t-lg bg-sky-400/80 hover:bg-sky-500 transition-colors" style={{ height: `${h}%` }} />
                </div>
                <span className="text-xs text-base-muted">{d.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Regional */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { city: 'Mumbai', kg: 3200, pct: 85 },
          { city: 'Delhi', kg: 2800, pct: 72 },
          { city: 'Bangalore', kg: 2400, pct: 65 },
          { city: 'Pune', kg: 1800, pct: 48 },
        ].map(r => (
          <Card key={r.city} className="p-5">
            <p className="font-semibold text-base-strong">{r.city}</p>
            <p className="font-display text-2xl font-bold text-base-strong mt-1">{r.kg.toLocaleString()} kg</p>
            <div className="mt-3">
              <Progress value={r.pct} size="sm" />
              <p className="text-xs text-base-muted mt-1">{r.pct}% of capacity</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
