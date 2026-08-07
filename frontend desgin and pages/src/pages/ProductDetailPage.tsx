import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { useCart } from '@/lib/cart';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Segmented } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { products } from '@/lib/data';
import { cn, formatRs } from '@/lib/utils';
import { Star, Leaf, Heart, ShoppingCart, ArrowLeft, Check, Truck, Shield, RefreshCw, Minus, Plus } from 'lucide-react';

export function ProductDetailPage() {
  const { params, navigate } = useNav();
  const { add } = useCart();
  const product = products.find(p => p.id === params.id) || products[0];
  const [qty, setQty] = useState(1);
  const [payMode, setPayMode] = useState('coins');
  const [wishlist, setWishlist] = useState(false);

  const coinTotal = product.priceCoins * qty;
  const rsTotal = product.priceRs * qty;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('marketplace')} className="flex items-center gap-2 text-sm text-base-muted hover:text-base-strong transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square bg-surface-subtle">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </Card>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn('aspect-square rounded-xl border-2 overflow-hidden cursor-pointer', i === 1 ? 'border-emerald-500' : 'border-base')}>
                <img src={product.image} alt="" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="emerald">{product.category}</Badge>
              <Badge variant="teal" dot>In Stock</Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-base-strong">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-coin-400 text-coin-400" />
                <span className="text-sm font-semibold text-base-strong">{product.rating}</span>
                <span className="text-sm text-base-muted">({product.reviews} reviews)</span>
              </div>
              <span className="text-base-muted">·</span>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Eco Score {product.ecoScore}</span>
              </div>
            </div>
          </div>

          <p className="text-base-muted leading-relaxed">{product.description}</p>

          {/* Materials */}
          <div>
            <p className="text-sm font-semibold text-base-strong mb-2">Made from</p>
            <div className="flex flex-wrap gap-2">
              {product.materials.map(m => (
                <Badge key={m} variant="emerald">{m}</Badge>
              ))}
            </div>
          </div>

          {/* Eco Score breakdown */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-base-strong">Eco Score Breakdown</span>
              <span className="font-display text-2xl font-bold text-emerald-600">{product.ecoScore}</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Recycled content', value: 95 },
                { label: 'Recyclability', value: 90 },
                { label: 'Carbon footprint', value: 88 },
                { label: 'Local sourcing', value: 85 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-base-muted w-32">{item.label}</span>
                  <Progress value={item.value} size="sm" className="flex-1" />
                  <span className="text-xs font-semibold text-base-strong w-8 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment mode */}
          <div>
            <p className="text-sm font-semibold text-base-strong mb-2">Payment Mode</p>
            <Segmented
              options={[
                { value: 'coins', label: 'Nature Coins' },
                { value: 'cash', label: 'Cash' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
              value={payMode}
              onChange={setPayMode}
            />
          </div>

          {/* Price + quantity */}
          <Card className="p-5 bg-surface-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-base-muted">Price</p>
                <div className="flex items-center gap-2 mt-1">
                  {payMode !== 'cash' && (
                    <div className="flex items-center gap-1.5">
                      <CoinIcon size={24} />
                      <span className="font-display text-2xl font-bold text-base-strong">{coinTotal}</span>
                      <span className="text-sm text-base-muted">coins</span>
                    </div>
                  )}
                  {payMode === 'hybrid' && <span className="text-base-muted">+</span>}
                  {payMode !== 'coins' && (
                    <span className="font-display text-2xl font-bold text-base-strong">{formatRs(rsTotal)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 rounded-lg border border-base flex items-center justify-center hover:bg-surface transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-lg font-bold w-8 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-9 w-9 rounded-lg border border-base flex items-center justify-center hover:bg-surface transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => { add(product, qty); navigate('cart'); }}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" onClick={() => setWishlist(!wishlist)}>
                <Heart className={cn('h-4 w-4', wishlist && 'fill-red-500 text-red-500')} />
              </Button>
            </div>
          </Card>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'On orders over 50 coins' },
              { icon: Shield, label: 'Verified Eco', sub: '100% recycled materials' },
              { icon: RefreshCw, label: 'Easy Returns', sub: '30-day return policy' },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-base p-3 text-center">
                <item.icon className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-base-strong">{item.label}</p>
                <p className="text-xs text-base-muted">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
