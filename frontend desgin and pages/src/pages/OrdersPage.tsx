import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { CoinIcon } from '@/components/Brand';
import { products } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Package, Truck, CheckCircle2, Clock, ArrowRight, Star } from 'lucide-react';

interface Order {
  id: string;
  product: typeof products[0];
  qty: number;
  coins: number;
  status: 'processing' | 'shipped' | 'delivered';
  date: string;
}

const orders: Order[] = [
  { id: 'ORD-2841', product: products[0], qty: 1, coins: 40, status: 'delivered', date: 'Jul 27' },
  { id: 'ORD-2830', product: products[4], qty: 2, coins: 50, status: 'shipped', date: 'Jul 28' },
  { id: 'ORD-2815', product: products[5], qty: 1, coins: 15, status: 'processing', date: 'Jul 29' },
  { id: 'ORD-2801', product: products[1], qty: 1, coins: 100, status: 'delivered', date: 'Jul 20' },
];

export function OrdersPage() {
  const { navigate } = useNav();
  const [tab, setTab] = useState('all');

  const filtered = orders.filter(o => tab === 'all' || o.status === tab);

  const statusConfig = {
    processing: { icon: Clock, label: 'Processing', variant: 'amber' as const },
    shipped: { icon: Truck, label: 'Shipped', variant: 'sky' as const },
    delivered: { icon: CheckCircle2, label: 'Delivered', variant: 'emerald' as const },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-strong">My Orders</h1>
          <p className="text-base-muted mt-1">Track your marketplace purchases</p>
        </div>
        <Button variant="outline" onClick={() => navigate('marketplace')}>Browse Marketplace <ArrowRight className="h-4 w-4" /></Button>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'processing', label: 'Processing' },
          { id: 'shipped', label: 'Shipped' },
          { id: 'delivered', label: 'Delivered' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="space-y-3">
        {filtered.map(order => {
          const s = statusConfig[order.status];
          return (
            <Card key={order.id} hover className="p-4">
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
                  <img src={order.product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-base-muted">{order.id} · {order.date}</p>
                      <h3 className="font-semibold text-base-strong">{order.product.name}</h3>
                      <p className="text-xs text-base-muted">Qty: {order.qty}</p>
                    </div>
                    <Badge variant={s.variant} dot>{s.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center gap-1.5">
                      <CoinIcon size={18} />
                      <span className="font-bold text-base-strong">{order.coins}</span>
                      <span className="text-sm text-base-muted">coins</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate('product', { id: order.product.id })}>
                        <Star className="h-3.5 w-3.5" /> Rate
                      </Button>
                      <Button variant="outline" size="sm">Track</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
