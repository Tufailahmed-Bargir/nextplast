import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { CoinIcon } from '@/components/Brand';
import { adminUsers } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Users, Shield, Store, Recycle, TrendingUp, Search, MoreVertical, Ban, CheckCircle2 } from 'lucide-react';

export function AdminPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = adminUsers.filter(u =>
    (tab === 'all' || u.role === tab) &&
    (search === '' || u.name.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: 'Total Users', value: '3,847', icon: Users, color: 'emerald' },
    { label: 'Collectors', value: '142', icon: Shield, color: 'sky' },
    { label: 'Recyclers', value: '28', icon: Recycle, color: 'teal' },
    { label: 'Marketplace GMV', value: '₹4.2L', icon: Store, color: 'coin' },
  ];

  const roleConfig = {
    user: { label: 'User', variant: 'default' as const },
    collector: { label: 'Collector', variant: 'sky' as const },
    recycler: { label: 'Recycler', variant: 'teal' as const },
    admin: { label: 'Admin', variant: 'emerald' as const },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-base-strong">Admin Dashboard</h1>
        <p className="text-base-muted mt-1">Manage users, collectors, recyclers, and platform operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center mb-3',
              s.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950',
              s.color === 'sky' && 'bg-sky-50 dark:bg-sky-950',
              s.color === 'teal' && 'bg-teal-50 dark:bg-teal-950',
              s.color === 'coin' && 'bg-coin-50 dark:bg-coin-950',
            )}>
              {s.color === 'coin' ? <CoinIcon size={22} /> : <s.icon className={cn('h-5 w-5',
                s.color === 'emerald' && 'text-emerald-600',
                s.color === 'sky' && 'text-sky-600',
                s.color === 'teal' && 'text-teal-600',
              )} />}
            </div>
            <p className="font-display text-2xl font-bold text-base-strong">{s.value}</p>
            <p className="text-sm text-base-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full h-11 rounded-xl border border-base bg-surface pl-10 pr-4 text-sm text-base-strong placeholder:text-base-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <Tabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'user', label: 'Users' },
            { id: 'collector', label: 'Collectors' },
            { id: 'recycler', label: 'Recyclers' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base bg-surface-subtle">
                {['User', 'Role', 'Coins', 'Recycled', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-base-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-base last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-base-strong">{u.name}</p>
                        <p className="text-xs text-base-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={roleConfig[u.role].variant}>{roleConfig[u.role].label}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <CoinIcon size={16} />
                      <span className="text-sm font-semibold text-base-strong">{u.coins.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-base-muted">{u.recycled} kg</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'active' ? 'emerald' : 'red'} dot>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-base-muted">{u.joined}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
