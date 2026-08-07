import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Progress } from '@/components/ui/Progress';
import { inventory } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Factory, Package, TrendingUp, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export function RecyclerPage() {
  const available = inventory.filter(i => i.status === 'in-stock');
  const totalKg = available.reduce((s, i) => s + i.weight, 0);
  const totalValue = totalKg * 32;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-base-strong">Recycler Dashboard</h1>
          <Badge variant="teal" dot>Partner</Badge>
        </div>
        <p className="text-base-muted mt-1">GreenCycle Ltd · Verified Processing Partner</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Stock', value: `${totalKg} kg`, icon: Package },
          { label: 'Avg Price', value: '₹32/kg', icon: TrendingUp },
          { label: 'Total Value', value: `₹${totalValue.toLocaleString()}`, icon: Factory },
          { label: 'This Month', value: '1,240 kg', icon: CheckCircle2 },
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

      {/* Available batches */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-base-strong">Available Batches</h3>
          <Badge variant="emerald" dot>{available.length} batches ready</Badge>
        </div>
        <div className="space-y-3">
          {available.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-subtle hover:bg-surface-muted transition-colors">
              <div className="h-12 w-12 rounded-xl bg-eco-gradient flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-base-strong">{item.id} · {item.type}</p>
                  <Badge variant="emerald">Grade {item.quality}</Badge>
                </div>
                <p className="text-sm text-base-muted mt-0.5">{item.weight} kg · Source: {item.source} · {item.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-base-strong">₹{(item.weight * 32).toLocaleString()}</p>
                <p className="text-xs text-base-muted">₹32/kg</p>
              </div>
              <Button size="sm">Reserve <ArrowRight className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Processing capacity */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Processing Capacity</h3>
        <div className="space-y-4">
          {[
            { label: 'PET Processing', value: 78, current: '780 / 1000 kg' },
            { label: 'HDPE Processing', value: 45, current: '180 / 400 kg' },
            { label: 'PP Processing', value: 60, current: '95 / 160 kg' },
          ].map(c => (
            <div key={c.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-base-strong">{c.label}</span>
                <span className="text-sm text-base-muted">{c.current}</span>
              </div>
              <Progress value={c.value} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
