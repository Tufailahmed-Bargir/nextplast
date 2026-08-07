import { Card } from '@/components/ui/Card';
import { Users, Recycle, Coins, Truck } from 'lucide-react';
import { CoinIcon } from '@/components/Brand';
import { useScrollReveal } from '@/lib/useScrollReveal';

const stats = [
  { icon: Recycle, value: '12,400', label: 'kg plastic recycled', suffix: 'kg', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Users, value: '3,800', label: 'active users', suffix: '', gradient: 'from-sky-500 to-blue-500' },
  { icon: Coins, value: '124,000', label: 'Nature Coins earned', suffix: '', gradient: 'from-coin-400 to-coin-600' },
  { icon: Truck, value: '2,100', label: 'pickups completed', suffix: '', gradient: 'from-teal-500 to-emerald-500' },
];

export function Stats() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <section className="py-16 relative overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-hero-mesh opacity-50" />
      <div ref={ref} className={`relative max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card
              key={s.label}
              className={`p-6 text-center hover:shadow-float transition-all duration-300 hover:-translate-y-1 group reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${i + 1}`}
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:scale-110 transition-transform`}>
                {s.label.includes('Coins') ? <CoinIcon size={28} /> : <s.icon className="h-7 w-7 text-white" />}
              </div>
              <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-base-muted mt-1">{s.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
