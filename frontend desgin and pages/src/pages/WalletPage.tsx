import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Tabs } from '@/components/ui/Tabs';
import { coinTransactions } from '@/lib/data';
import { cn, formatCoin } from '@/lib/utils';
import { TrendingUp, TrendingDown, Gift, ArrowDownLeft, ArrowUpRight, Store, Recycle, Trophy } from 'lucide-react';

export function WalletPage() {
  const { navigate } = useNav();
  const [tab, setTab] = useState('all');

  const filtered = coinTransactions.filter(t => tab === 'all' || t.type === tab);

  const earned = coinTransactions.filter(t => t.type === 'earned').reduce((s, t) => s + t.amount, 0);
  const spent = coinTransactions.filter(t => t.type === 'spent').reduce((s, t) => s + Math.abs(t.amount), 0);
  const bonus = coinTransactions.filter(t => t.type === 'bonus').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wallet hero */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-coin-500 via-coin-600 to-amber-700 border-0 text-white p-6 sm:p-8">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CoinIcon size={24} className="drop-shadow" />
              <span className="text-sm text-amber-100">Your Nature Coin Balance</span>
            </div>
            <p className="font-display text-4xl sm:text-5xl font-bold">{formatCoin(8420)}</p>
            <p className="mt-2 text-amber-100">≈ Rs 4,210 internal reward value</p>
          </div>
          <div className="flex gap-3">
            <Button variant="glass" className="text-white border-white/30 hover:bg-white/20" onClick={() => navigate('marketplace')}>
              <Store className="h-4 w-4" /> Spend Coins
            </Button>
            <Button variant="glass" className="text-white border-white/30 hover:bg-white/20" onClick={() => navigate('sell')}>
              <Recycle className="h-4 w-4" /> Earn More
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'Total Earned', value: formatCoin(earned + bonus), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
          { icon: TrendingDown, label: 'Total Spent', value: formatCoin(spent), color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' },
          { icon: Gift, label: 'Bonus Coins', value: formatCoin(bonus), color: 'text-coin-600', bg: 'bg-coin-50 dark:bg-coin-950' },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon className={cn('h-5 w-5', s.color)} />
            </div>
            <p className="font-display text-xl font-bold text-base-strong">{s.value}</p>
            <p className="text-sm text-base-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Transactions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="font-display text-lg font-semibold text-base-strong">Transaction History</h3>
          <Tabs
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'earned', label: 'Earned' },
              { id: 'spent', label: 'Spent' },
              { id: 'bonus', label: 'Bonus' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-surface-subtle transition-colors">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                t.amount > 0 ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-red-50 dark:bg-red-950'
              )}>
                {t.type === 'earned' ? <ArrowDownLeft className="h-5 w-5 text-emerald-600" /> :
                 t.type === 'spent' ? <ArrowUpRight className="h-5 w-5 text-red-500" /> :
                 <Trophy className="h-5 w-5 text-coin-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-base-strong">{t.title}</p>
                <p className="text-xs text-base-muted">{t.detail} · {t.date}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <CoinIcon size={18} />
                  <span className={cn('font-bold', t.amount > 0 ? 'text-emerald-600' : 'text-red-500')}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
                <p className="text-xs text-base-muted">Bal: {t.balance}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
