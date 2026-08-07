import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { inventory } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Package, Layers, TrendingUp, ArrowUpRight, Filter } from 'lucide-react';

export function InventoryPage() {
  const [tab, setTab] = useState('all');
  const filtered = inventory.filter(i => tab === 'all' || i.status === tab);

  const statusConfig = {
    'in-stock': { label: 'In Stock', variant: 'emerald' as const },
    'reserved': { label: 'Reserved', variant: 'amber' as const },
    'shipped': { label: 'Shipped', variant: 'sky' as const },
  };

  const qualityColors = { A: 'emerald', B: 'amber', C: 'red' };

  const totalKg = inventory.reduce((s, i) => s + i.weight, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-strong">Inventory</h1>
          <p className="text-base-muted mt-1">Sorted plastic ready for recycler purchase</p>
        </div>
        <Button variant="outline"><Filter className="h-4 w-4" /> Filter</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Stock', value: `${totalKg} kg`, icon: Package },
          { label: 'Plastic Types', value: '5', icon: Layers },
          { label: 'Reserved', value: '180 kg', icon: TrendingUp },
          { label: 'Avg Quality', value: 'A-', icon: ArrowUpRight },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-surface-subtle flex items-center justify-center">
                <s.icon className="h-5 w-5 text-base-muted" />
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
          { id: 'in-stock', label: 'In Stock' },
          { id: 'reserved', label: 'Reserved' },
          { id: 'shipped', label: 'Shipped' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base bg-surface-subtle">
                {['ID', 'Type', 'Weight', 'Quality', 'Source', 'Date', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-base-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-base last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-base-strong">{item.id}</td>
                  <td className="px-4 py-3">
                    <Badge variant="teal">{item.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-base-strong">{item.weight} kg</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold',
                      qualityColors[item.quality] === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600',
                      qualityColors[item.quality] === 'amber' && 'bg-amber-50 dark:bg-amber-950 text-amber-600',
                      qualityColors[item.quality] === 'red' && 'bg-red-50 dark:bg-red-950 text-red-600',
                    )}>{item.quality}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-base-muted">{item.source}</td>
                  <td className="px-4 py-3 text-sm text-base-muted">{item.date}</td>
                  <td className="px-4 py-3"><Badge variant={statusConfig[item.status].variant} dot>{statusConfig[item.status].label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">View</Button>
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
