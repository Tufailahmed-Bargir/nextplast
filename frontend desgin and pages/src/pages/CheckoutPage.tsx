import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { useCart } from '@/lib/cart';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CoinIcon } from '@/components/Brand';
import { Segmented } from '@/components/ui/Tabs';
import { cn, formatRs } from '@/lib/utils';
import { CheckCircle2, MapPin, CreditCard, Truck, ArrowLeft, ArrowRight, Leaf } from 'lucide-react';

export function CheckoutPage() {
  const { navigate } = useNav();
  const { items, totalCoins, totalRs, count, clear } = useCart();
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');
  const [payMode, setPayMode] = useState('coins');
  const [coinSplit, setCoinSplit] = useState(totalCoins);
  const [placed, setPlaced] = useState(false);

  const cashPortion = totalRs - (coinSplit * 0.5);

  if (placed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-scale-in">
        <div className="h-24 w-24 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-base-strong">Order placed successfully!</h2>
        <p className="text-base-muted mt-2 text-center max-w-md">Your eco products are on the way. You'll receive a notification when they ship.</p>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => navigate('orders')}>View Orders</Button>
          <Button onClick={() => navigate('marketplace')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirm', label: 'Confirm', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('cart')} className="flex items-center gap-2 text-sm text-base-muted hover:text-base-strong transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </button>

      <h1 className="font-display text-2xl font-bold text-base-strong">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center transition-all',
              step === s.id ? 'bg-emerald-600 text-white shadow-glow' :
              steps.findIndex(x => x.id === step) > i ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-surface-subtle text-base-muted'
            )}>
              <s.icon className="h-5 w-5" />
            </div>
            <span className={cn('text-sm font-medium', step === s.id ? 'text-base-strong' : 'text-base-muted')}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-base" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {step === 'address' && (
            <Card className="p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-base-strong">Delivery Address</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full name" defaultValue="Aarav Patel" />
                <Input label="Phone" defaultValue="+91 98765 43210" />
                <Input label="Address line 1" defaultValue="12 MG Road" className="sm:col-span-2" />
                <Input label="City" defaultValue="Pune" />
                <Input label="PIN code" defaultValue="411001" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep('payment')}>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </Card>
          )}

          {step === 'payment' && (
            <Card className="p-6 space-y-5">
              <h3 className="font-display text-lg font-semibold text-base-strong">Payment Method</h3>
              <Segmented
                options={[
                  { value: 'coins', label: 'All Coins' },
                  { value: 'cash', label: 'All Cash' },
                  { value: 'hybrid', label: 'Hybrid' },
                ]}
                value={payMode}
                onChange={setPayMode}
              />
              {payMode === 'coins' && (
                <div className="rounded-xl bg-coin-50 dark:bg-coin-950 border border-coin-200 dark:border-coin-900 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CoinIcon size={20} />
                    <span className="font-semibold text-base-strong">Pay with Nature Coins</span>
                  </div>
                  <p className="text-sm text-base-muted">You have 8,420 coins. This order costs {totalCoins} coins.</p>
                </div>
              )}
              {payMode === 'cash' && (
                <div className="rounded-xl bg-surface-subtle border border-base p-4">
                  <p className="font-semibold text-base-strong mb-1">Pay with Cash / UPI</p>
                  <p className="text-sm text-base-muted">Total: {formatRs(totalRs)}</p>
                </div>
              )}
              {payMode === 'hybrid' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-base-strong">Coins to use</span>
                      <div className="flex items-center gap-1.5">
                        <CoinIcon size={18} />
                        <span className="font-bold text-base-strong">{coinSplit}</span>
                        <span className="text-sm text-base-muted">/ {totalCoins}</span>
                      </div>
                    </div>
                    <input type="range" min="0" max={totalCoins} value={coinSplit} onChange={e => setCoinSplit(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="rounded-xl bg-surface-subtle p-4 text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-base-muted">Coins portion</span><span className="font-semibold">{coinSplit} coins</span></div>
                    <div className="flex justify-between"><span className="text-base-muted">Cash portion</span><span className="font-semibold">{formatRs(totalRs - (coinSplit * 0.5))}</span></div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep('address')}>Back</Button>
                <Button onClick={() => setStep('confirm')}>Review Order <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </Card>
          )}

          {step === 'confirm' && (
            <Card className="p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-base-strong">Review Your Order</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3 p-3 rounded-xl bg-surface-subtle">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-surface shrink-0">
                      <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-base-strong">{item.product.name}</p>
                      <p className="text-xs text-base-muted">Qty: {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CoinIcon size={18} />
                      <span className="font-bold text-base-strong">{item.product.priceCoins * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                <Button onClick={() => { setPlaced(true); clear(); }} className="flex-1">
                  Place Order <Leaf className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-base-muted">Items ({count})</span><div className="flex items-center gap-1.5"><CoinIcon size={16} /><span className="font-semibold">{totalCoins}</span></div></div>
              <div className="flex justify-between"><span className="text-base-muted">Delivery</span><span className="font-semibold text-emerald-600">Free</span></div>
              <div className="border-t border-base pt-3 flex justify-between">
                <span className="font-semibold text-base-strong">Total</span>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end"><CoinIcon size={18} /><span className="font-display text-xl font-bold">{totalCoins}</span></div>
                  <span className="text-sm text-base-muted">or {formatRs(totalRs)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-base-muted">
              <Truck className="h-4 w-4 text-emerald-500" /> Estimated delivery: 3-5 days
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
