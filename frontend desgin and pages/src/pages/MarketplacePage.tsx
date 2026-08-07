import { useState } from 'react';
import { useNav } from '@/lib/nav';
import { useCart } from '@/lib/cart';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Segmented } from '@/components/ui/Tabs';
import { products, categories, type Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Star, Leaf, Search, SlidersHorizontal, Heart, ShoppingCart, ArrowRight } from 'lucide-react';

export function MarketplacePage() {
  const { navigate } = useNav();
  const { add } = useCart();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleWish = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-strong">Eco Marketplace</h1>
          <p className="text-base-muted mt-1">Spend your Nature Coins on sustainable products</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-coin-50 dark:bg-coin-950 border border-coin-200 dark:border-coin-900">
            <CoinIcon size={18} />
            <span className="font-display font-bold text-base-strong">8,420</span>
            <span className="text-xs text-base-muted">coins</span>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search eco products..."
            className="w-full h-11 rounded-xl border border-base bg-surface pl-10 pr-4 text-sm text-base-strong placeholder:text-base-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <Segmented
          options={[{ value: 'popular', label: 'Popular' }, { value: 'coins', label: 'Best Value' }, { value: 'eco', label: 'Eco Score' }]}
          value={sort}
          onChange={setSort}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              category === cat
                ? 'bg-emerald-600 text-white shadow-soft'
                : 'bg-surface border border-base text-base-muted hover:text-base-strong hover:border-emerald-300'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <Card key={p.id} hover className="overflow-hidden group cursor-pointer flex flex-col" onClick={() => navigate('product', { id: p.id })}>
            <div className="aspect-square overflow-hidden bg-surface-subtle relative">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
                className="absolute top-2.5 right-2.5 h-9 w-9 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Heart className={cn('h-4 w-4', wishlist.has(p.id) ? 'fill-red-500 text-red-500' : 'text-base-strong')} />
              </button>
              <div className="absolute top-2.5 left-2.5">
                <span className="glass rounded-full px-2 py-1 text-xs font-semibold text-base-strong flex items-center gap-1">
                  <Leaf className="h-3 w-3 text-emerald-500" /> {p.ecoScore}
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <p className="text-xs text-base-muted">{p.category}</p>
              <h3 className="font-semibold text-sm text-base-strong mt-0.5 line-clamp-1">{p.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3.5 w-3.5 fill-coin-400 text-coin-400" />
                <span className="text-xs text-base-muted">{p.rating} ({p.reviews})</span>
              </div>
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CoinIcon size={20} />
                    <span className="font-display font-bold text-lg text-base-strong">{p.priceCoins}</span>
                  </div>
                  <span className="text-sm text-base-muted">₹{p.priceRs}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => { e.stopPropagation(); add(p); navigate('cart'); }}
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
