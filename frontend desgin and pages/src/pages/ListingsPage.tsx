import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { CoinIcon } from '@/components/Brand';
import { pickups } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Plus, Package, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';

export function ListingsPage() {
  const { navigate } = useNav();
  const [tab, setTab] = useState('all');

  const filtered = pickups.filter(p => tab === 'all' || p.status === tab);

  const statusConfig = {
    scheduled: { icon: Clock, label: 'Scheduled', variant: 'amber' as const },
    'in-transit': { icon: Truck, label: 'In Transit', variant: 'sky' as const },
    verifying: { icon: AlertCircle, label: 'Verifying', variant: 'teal' as const },
    completed: { icon: CheckCircle2, label: 'Completed', variant: 'emerald' as const },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-strong">My Listings & Pickups</h1>
          <p className="text-base-muted mt-1">Track your plastic listings and pickup status</p>
        </div>
        <Button onClick={() => navigate('sell')}><Plus className="h-4 w-4" /> New Listing</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pickups', value: '28', icon: Package },
          { label: 'Completed', value: '24', icon: CheckCircle2 },
          { label: 'In Progress', value: '3', icon: Truck },
          { label: 'Total Coins', value: '8,420', icon: CoinIcon, isCoin: true },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-surface-subtle flex items-center justify-center">
                {s.isCoin ? <CoinIcon size={20} /> : <s.icon className="h-5 w-5 text-base-muted" />}
              </div>
              <div>
                <p className="font-display text-xl font-bold text-base-strong">{s.value}</p>
                <p className="text-xs text-base-muted">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'in-transit', label: 'In Transit' },
          { id: 'verifying', label: 'Verifying' },
          { id: 'completed', label: 'Completed' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="space-y-3">
        {filtered.map(p => {
          const s = statusConfig[p.status];
          return (
            <Card key={p.id} hover className="p-4">
              <div className="flex items-center gap-4">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                  p.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-amber-50 dark:bg-amber-950'
                )}>
                  <s.icon className={cn('h-6 w-6', p.status === 'completed' ? 'text-emerald-600' : 'text-amber-600')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-base-strong">{p.id}</p>
                    <Badge variant={s.variant} dot>{s.label}</Badge>
                  </div>
                  <p className="text-sm text-base-muted mt-0.5">{p.weight} · {p.collector}</p>
                  <p className="text-xs text-base-muted">{p.date} · {p.address}</p>
                </div>
                {p.coins > 0 && (
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <CoinIcon size={18} />
                      <span className="font-bold text-base-strong">{p.coins}</span>
                    </div>
                    <p className="text-xs text-base-muted mt-0.5">coins</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
