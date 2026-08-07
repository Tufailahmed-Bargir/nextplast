import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { notifications as initialNotifs } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Bell, CheckCircle2, Truck, Package, Trophy, Sparkles, Check } from 'lucide-react';

export function NotificationsPage() {
  const [notifs, setNotifs] = useState(initialNotifs);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id: string) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const iconFor = (type: string) => {
    switch (type) {
      case 'reward': return <CoinIcon size={18} />;
      case 'pickup': return <Truck className="h-[18px] w-[18px] text-sky-600" />;
      case 'order': return <Package className="h-[18px] w-[18px] text-emerald-600" />;
      case 'achievement': return <Trophy className="h-[18px] w-[18px] text-coin-600" />;
      default: return <Sparkles className="h-[18px] w-[18px] text-base-muted" />;
    }
  };

  const bgFor = (type: string) => {
    switch (type) {
      case 'reward': return 'bg-coin-50 dark:bg-coin-950';
      case 'pickup': return 'bg-sky-50 dark:bg-sky-950';
      case 'order': return 'bg-emerald-50 dark:bg-emerald-950';
      case 'achievement': return 'bg-coin-50 dark:bg-coin-950';
      default: return 'bg-surface-subtle';
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-strong">Notifications</h1>
          <p className="text-base-muted mt-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><Check className="h-4 w-4" /> Mark all read</Button>}
      </div>

      <div className="space-y-2">
        {notifs.map(n => (
          <Card
            key={n.id}
            className={cn('p-4 cursor-pointer transition-all', !n.read && 'border-emerald-300 dark:border-emerald-800')}
            onClick={() => markRead(n.id)}
          >
            <div className="flex gap-3">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', bgFor(n.type))}>
                {iconFor(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-base-strong">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-base-muted mt-0.5">{n.detail}</p>
                <p className="text-xs text-base-muted mt-1.5">{n.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
