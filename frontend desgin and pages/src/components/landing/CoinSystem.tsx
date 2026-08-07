import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CoinIcon } from '@/components/Brand';
import { formatCoin } from '@/lib/utils';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useNav } from '@/lib/nav';
import { Button } from '@/components/ui/Button';
import { useScrollReveal } from '@/lib/useScrollReveal';

export function CoinSystem() {
  const { navigate } = useNav();
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <section className="py-24 bg-surface">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="coin" className="mb-4"><CoinIcon size={14} /> Nature Coin Economy</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">
            Earn coins. Spend coins. Save the planet.
          </h2>
          <p className="mt-4 text-lg text-base-muted">
            Nature Coins represent real environmental contribution — not cash. Earn them by recycling, spend them in the marketplace.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold text-base-strong mb-4">How coins are calculated</h3>
            <div className="space-y-3">
              {[
                { label: 'Base rate', value: '1 Coin = 100 g of standard recyclable plastic', highlight: true },
                { label: '1 g', value: '0.01 Coin' },
                { label: '100 g', value: '1 Coin' },
                { label: '1 kg', value: '10 Coins' },
                { label: '10 kg', value: '100 Coins' },
                { label: '20 kg (clean PET)', value: '200 Coins', highlight: true },
              ].map(row => (
                <div key={row.label} className={`flex items-center justify-between rounded-xl px-4 py-3 ${row.highlight ? 'bg-coin-50 dark:bg-coin-950/40 border border-coin-200 dark:border-coin-900' : 'bg-surface-subtle'}`}>
                  <span className="text-sm font-medium text-base-strong">{row.label}</span>
                  <span className={`text-sm font-bold ${row.highlight ? 'coin-text' : 'text-base-strong'}`}>{row.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-base-muted">Plastic type and quality may increase or decrease coin rewards. Clean, sorted plastic earns bonuses.</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-coin-50 to-amber-50 dark:from-coin-950/40 dark:to-slate-900 border-coin-200 dark:border-coin-900">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <CoinIcon size={64} className="animate-float" />
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold text-center text-base-strong">Internal Reward Value</h3>
            <p className="text-center text-3xl font-display font-bold coin-text mt-2">Rs 0.50<span className="text-base text-base-muted font-normal"> / coin</span></p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-base-muted">
                <ArrowRight className="h-4 w-4 text-emerald-500" /> Coins cannot be exchanged for cash
              </div>
              <div className="flex items-center gap-2 text-base-muted">
                <ArrowRight className="h-4 w-4 text-emerald-500" /> Redeem only in NexPlast Marketplace
              </div>
              <div className="flex items-center gap-2 text-base-muted">
                <ArrowRight className="h-4 w-4 text-emerald-500" /> Quality bonuses apply
              </div>
            </div>
            <Button variant="coin" className="w-full mt-6" onClick={() => navigate('auth', { mode: 'register' })}>
              Start Earning Coins <TrendingUp className="h-4 w-4" />
            </Button>
          </Card>
        </div>

        {/* Marketplace price examples */}
        <Card className="mt-6 p-6">
          <h3 className="font-display text-lg font-semibold text-base-strong mb-1">Marketplace price examples</h3>
          <p className="text-sm text-base-muted mb-4">Every product price follows 1 Coin = Rs 0.50. Pay with coins, cash, or a mix.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Eco Bottle', coins: 40, rs: 20 },
              { name: 'Flower Pot', coins: 100, rs: 50 },
              { name: 'Dustbin', coins: 300, rs: 150 },
              { name: 'Chair', coins: 600, rs: 300 },
            ].map(item => (
              <div key={item.name} className="rounded-xl bg-surface-subtle p-4">
                <p className="text-sm font-semibold text-base-strong">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <CoinIcon size={18} />
                  <span className="font-display text-lg font-bold text-base-strong">{item.coins}</span>
                  <span className="text-xs text-base-muted">coins</span>
                </div>
                <p className="text-xs text-base-muted mt-0.5">or ₹{item.rs} cash</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </section>
  );
}
