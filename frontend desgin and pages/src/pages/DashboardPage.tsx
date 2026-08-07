import { useNav } from '@/lib/nav';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Ring, Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { weeklyData, monthlyData, activities, pickups, impactData } from '@/lib/data';
import { formatCoin, formatRs, cn } from '@/lib/utils';
import {
  Recycle, TrendingUp, Wallet, Truck, Leaf, Wind, TreePine, ArrowRight,
  Package, Plus, Clock, CheckCircle2, Sparkles, ChevronRight, Store,
} from 'lucide-react';

export function DashboardPage() {
  const { navigate } = useNav();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 border-0 text-white p-6 sm:p-8">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm text-emerald-100">Welcome back</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Aarav Patel</h2>
            <p className="mt-1 text-emerald-100">You've recycled 842 kg of plastic and saved 1,684 kg of CO₂</p>
          </div>
          <Button variant="glass" className="text-white border-white/30 hover:bg-white/20" onClick={() => navigate('sell')}>
            <Plus className="h-4 w-4" /> Sell Plastic
          </Button>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CoinIcon, label: 'Nature Coins', value: formatCoin(8420), sub: '≈ Rs 4,210', color: 'coin', onClick: () => navigate('wallet') },
          { icon: Recycle, label: 'Plastic Recycled', value: '842 kg', sub: 'all time', color: 'emerald', onClick: () => navigate('environment') },
          { icon: Truck, label: 'Pickups', value: '28', sub: '4 this month', color: 'sky', onClick: () => navigate('listings') },
          { icon: Leaf, label: 'CO₂ Saved', value: '1,684 kg', sub: '42 trees', color: 'teal', onClick: () => navigate('environment') },
        ].map((stat, i) => (
          <Card key={i} hover className="p-5 cursor-pointer" onClick={stat.onClick}>
            <div className="flex items-start justify-between">
              <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center',
                stat.color === 'coin' && 'bg-coin-50 dark:bg-coin-950',
                stat.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950',
                stat.color === 'sky' && 'bg-sky-50 dark:bg-sky-950',
                stat.color === 'teal' && 'bg-teal-50 dark:bg-teal-950',
              )}>
                {stat.color === 'coin' ? <CoinIcon size={22} /> : (
                  <stat.icon className={cn('h-5 w-5',
                    stat.color === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                    stat.color === 'sky' && 'text-sky-600 dark:text-sky-400',
                    stat.color === 'teal' && 'text-teal-600 dark:text-teal-400',
                  )} />
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-base-muted" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-base-strong">{stat.value}</p>
            <p className="text-sm text-base-muted">{stat.label}</p>
            <p className="text-xs text-base-muted mt-0.5">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts + Impact ring */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-base-strong">Recycling Activity</h3>
              <p className="text-sm text-base-muted">Monthly kg recycled this year</p>
            </div>
            <Badge variant="emerald" dot>+18% vs last month</Badge>
          </div>
          <div className="flex items-end gap-2 sm:gap-3 h-48">
            {monthlyData.map((m, i) => {
              const max = Math.max(...monthlyData.map(d => d.kg));
              const h = (m.kg / max) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-eco-gradient opacity-80 group-hover:opacity-100 transition-opacity relative"
                      style={{ height: `${h}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-base-strong opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{m.kg}kg</span>
                    </div>
                  </div>
                  <span className="text-xs text-base-muted">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-1">Monthly Goal</h3>
          <p className="text-sm text-base-muted mb-6">142 / 200 kg</p>
          <Ring value={71} size={160} stroke={12} label="71%" sublabel="completed" />
          <Button variant="outline" size="sm" className="mt-6" onClick={() => navigate('environment')}>
            View details <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>

      {/* Weekly + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-4">This Week</h3>
          <div className="space-y-3">
            {weeklyData.map(d => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs text-base-muted w-8">{d.day}</span>
                <div className="flex-1 h-6 rounded-md bg-surface-subtle overflow-hidden">
                  <div className="h-full rounded-md bg-eco-gradient transition-all duration-700" style={{ width: `${(d.value / 32) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-base-strong w-8 text-right">{d.value}kg</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Recycle, label: 'Sell Plastic', route: 'sell' as const, color: 'emerald' },
              { icon: Truck, label: 'Schedule Pickup', route: 'sell' as const, color: 'sky' },
              { icon: Store, label: 'Marketplace', route: 'marketplace' as const, color: 'teal' },
              { icon: Wallet, label: 'View Wallet', route: 'wallet' as const, color: 'coin' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.route)}
                className="rounded-xl border border-base p-4 text-left hover:shadow-soft hover:border-emerald-300 transition-all group"
              >
                <action.icon className={cn('h-5 w-5 mb-2',
                  action.color === 'emerald' && 'text-emerald-600',
                  action.color === 'sky' && 'text-sky-600',
                  action.color === 'teal' && 'text-teal-600',
                  action.color === 'coin' && 'text-coin-600',
                )} />
                <p className="text-sm font-medium text-base-strong">{action.label}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Impact Summary</h3>
          <div className="space-y-3">
            {[
              { icon: Wind, label: 'CO₂ Saved', value: '1,684 kg', color: 'text-sky-600' },
              { icon: TreePine, label: 'Trees Saved', value: '42', color: 'text-emerald-600' },
              { icon: Recycle, label: 'Plastic Recycled', value: '842 kg', color: 'text-teal-600' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className={cn('h-5 w-5', item.color)} />
                <span className="text-sm text-base-muted flex-1">{item.label}</span>
                <span className="font-semibold text-base-strong">{item.value}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4" onClick={() => navigate('environment')}>
            View full dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>

      {/* Pickups + Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-base-strong">Recent Pickups</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('listings')}>View all</Button>
          </div>
          <div className="space-y-3">
            {pickups.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center',
                  p.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-amber-50 dark:bg-amber-950')}>
                  {p.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Clock className="h-5 w-5 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-strong truncate">{p.id} · {p.weight}</p>
                  <p className="text-xs text-base-muted">{p.date} · {p.collector}</p>
                </div>
                {p.coins > 0 && (
                  <div className="flex items-center gap-1">
                    <CoinIcon size={16} />
                    <span className="text-sm font-bold text-base-strong">{p.coins}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-base-strong">Recent Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('notifications')}>View all</Button>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                  a.type === 'reward' && 'bg-coin-50 dark:bg-coin-950',
                  a.type === 'pickup' && 'bg-sky-50 dark:bg-sky-950',
                  a.type === 'purchase' && 'bg-emerald-50 dark:bg-emerald-950',
                  a.type === 'listing' && 'bg-teal-50 dark:bg-teal-950',
                  a.type === 'system' && 'bg-slate-100 dark:bg-slate-800',
                )}>
                  {a.type === 'reward' ? <CoinIcon size={16} /> : <Package className={cn('h-4 w-4',
                    a.type === 'pickup' && 'text-sky-600',
                    a.type === 'purchase' && 'text-emerald-600',
                    a.type === 'listing' && 'text-teal-600',
                    a.type === 'system' && 'text-slate-500',
                  )} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-base-strong">{a.title}</p>
                  <p className="text-xs text-base-muted">{a.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  {a.coins !== undefined && (
                    <p className={cn('text-sm font-bold', a.coins > 0 ? 'text-coin-600' : 'text-base-muted')}>
                      {a.coins > 0 ? '+' : ''}{a.coins}
                    </p>
                  )}
                  <p className="text-xs text-base-muted">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
