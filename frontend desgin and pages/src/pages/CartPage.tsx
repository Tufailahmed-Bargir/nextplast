import { useNav } from '@/lib/nav';
import { useCart } from '@/lib/cart';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { cn } from '@/lib/utils';
import { Trash2, Minus, Plus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';

export function CartPage() {
  const { navigate } = useNav();
  const { items, remove, updateQty, totalCoins, totalRs, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="h-20 w-20 rounded-3xl bg-surface-subtle flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-base-muted" />
        </div>
        <h2 className="font-display text-xl font-bold text-base-strong">Your cart is empty</h2>
        <p className="text-base-muted mt-2 text-center max-w-sm">Browse the marketplace and add eco products to your cart.</p>
        <Button className="mt-6" onClick={() => navigate('marketplace')}>
          Explore Marketplace <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('marketplace')} className="flex items-center gap-2 text-sm text-base-muted hover:text-base-strong transition-colors">
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </button>

      <h1 className="font-display text-2xl font-bold text-base-strong">Shopping Cart ({count})</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <Card key={item.product.id} className="p-4 flex gap-4">
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-base-muted">{item.product.category}</p>
                    <h3 className="font-semibold text-base-strong">{item.product.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <CoinIcon size={16} />
                      <span className="text-sm font-bold text-base-strong">{item.product.priceCoins}</span>
                      <span className="text-sm text-base-muted">or ₹{item.product.priceRs}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(item.product.id)} className="p-2 rounded-lg text-base-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="h-8 w-8 rounded-lg border border-base flex items-center justify-center hover:bg-surface-subtle transition-colors">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-semibold text-base-strong w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="h-8 w-8 rounded-lg border border-base flex items-center justify-center hover:bg-surface-subtle transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <CoinIcon size={18} />
                      <span className="font-display font-bold text-base-strong">{item.product.priceCoins * item.qty}</span>
                    </div>
                    <p className="text-sm text-base-muted">₹{item.product.priceRs * item.qty}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h3 className="font-display text-lg font-semibold text-base-strong mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-base-muted">Items ({count})</span>
                <div className="flex items-center gap-1.5">
                  <CoinIcon size={16} />
                  <span className="font-semibold text-base-strong">{totalCoins}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-base-muted">Cash equivalent</span>
                <span className="font-semibold text-base-strong">₹{totalRs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-muted">Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="border-t border-base pt-3 flex justify-between">
                <span className="font-semibold text-base-strong">Total</span>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <CoinIcon size={18} />
                    <span className="font-display text-xl font-bold text-base-strong">{totalCoins}</span>
                  </div>
                  <span className="text-sm text-base-muted">or ₹{totalRs}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-5" size="lg" onClick={() => navigate('checkout')}>
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-base-muted text-center mt-3">You can pay with coins, cash, or a mix of both.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
