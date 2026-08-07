import { useNav } from '@/lib/nav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { products } from '@/lib/data';
import { Star, Leaf, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

export function MarketplacePreview() {
  const { navigate } = useNav();
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <section id="marketplace" className="py-24 bg-surface-subtle">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="emerald" className="mb-4">Marketplace</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">Spend coins on real eco products</h2>
            <p className="mt-4 text-lg text-base-muted max-w-xl">From bamboo toothbrushes to recycled furniture — every product is made from or supports recycled materials.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('marketplace')}>
            View all products <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p, i) => (
            <Card
              key={p.id}
              hover
              className={`overflow-hidden group cursor-pointer reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${i + 1}`}
              onClick={() => navigate('product', { id: p.id })}
            >
              <div className="aspect-square overflow-hidden bg-surface-subtle relative">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="glass rounded-full px-2 py-1 text-xs font-semibold text-base-strong flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-emerald-500" /> {p.ecoScore}
                  </span>
                </div>
              </div>
              <div className="p-3.5">
                <p className="text-xs text-base-muted">{p.category}</p>
                <h3 className="font-semibold text-sm text-base-strong mt-0.5 truncate">{p.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-coin-400 text-coin-400" />
                  <span className="text-xs text-base-muted">{p.rating} ({p.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <CoinIcon size={18} />
                    <span className="font-display font-bold text-base-strong">{p.priceCoins}</span>
                  </div>
                  <span className="text-xs text-base-muted">₹{p.priceRs}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
