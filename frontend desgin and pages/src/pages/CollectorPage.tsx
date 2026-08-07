import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { collectorPickups } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Truck, MapPin, Package, CheckCircle2, KeyRound, Navigation, Star } from 'lucide-react';

export function CollectorPage() {
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState<string | null>(null);

  const stats = [
    { label: "Today's Pickups", value: '6' },
    { label: 'Total Weight', value: '124 kg' },
    { label: 'Coins Earned', value: '1,240', isCoin: true },
    { label: 'Rating', value: '4.9 ★' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-base-strong">Collector Dashboard</h1>
            <Badge variant="sky" dot>On Duty</Badge>
          </div>
          <p className="text-base-muted mt-1">Rajesh Kumar · Pune Zone 3</p>
        </div>
        <Button variant="outline"><Navigation className="h-4 w-4" /> Optimize Route</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <p className="font-display text-2xl font-bold text-base-strong flex items-center gap-1.5">
              {s.isCoin && <CoinIcon size={22} />}
              {s.value}
            </p>
            <p className="text-sm text-base-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Active pickup */}
      <Card className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-slate-900 border-sky-200 dark:border-sky-900">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-base-strong">Active Pickup</h3>
            <p className="text-sm text-base-muted">PK-2841 · Aarav Patel</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-base-muted flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</p>
            <p className="font-semibold text-base-strong mt-1">12 MG Road, Pune</p>
            <p className="text-xs text-base-muted">2.3 km away · ETA 25 min</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-base-muted flex items-center gap-1"><Package className="h-3 w-3" /> Details</p>
            <p className="font-semibold text-base-strong mt-1">20 kg PET (est.)</p>
            <p className="text-xs text-base-muted">Quality: Clean · 200 coins</p>
          </div>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <p className="text-xs text-base-muted flex items-center gap-1 mb-2"><KeyRound className="h-3 w-3" /> OTP Verification</p>
          {verified === 'PK-2841' ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Weight verified! 20.5 kg confirmed</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                maxLength={4}
                className="flex-1 h-11 rounded-xl border border-base bg-surface-subtle px-4 text-sm font-mono tracking-widest text-base-strong focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              />
              <Button onClick={() => setVerified('PK-2841')} disabled={otp.length !== 4}>Verify Weight</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Assigned pickups */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Assigned Pickups</h3>
        <div className="space-y-3">
          {collectorPickups.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-muted transition-colors">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                p.status === 'verified' ? 'bg-emerald-50 dark:bg-emerald-950' :
                p.status === 'in-progress' ? 'bg-sky-50 dark:bg-sky-950' : 'bg-surface-muted'
              )}>
                {p.status === 'verified' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> :
                 <Truck className={cn('h-5 w-5', p.status === 'in-progress' ? 'text-sky-600' : 'text-base-muted')} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-base-strong">{p.id} · {p.user}</p>
                <p className="text-xs text-base-muted">{p.address} · {p.distance} · {p.time}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-base-strong">{p.weight}</p>
                <div className="flex items-center gap-1 justify-end">
                  <CoinIcon size={14} />
                  <span className="text-xs text-base-muted">{p.coins}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
