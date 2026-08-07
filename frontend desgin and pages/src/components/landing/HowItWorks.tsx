import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Recycle, Scan, Coins, Truck, Factory, ShoppingBag } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const steps = [
  { icon: Scan, title: 'AI Plastic Detection', desc: 'Snap a photo of your plastic. Our AI identifies the type, quality, and estimated weight in seconds.', color: 'from-emerald-500 to-teal-500' },
  { icon: Recycle, title: 'List Your Plastic', desc: 'Create a listing with the AI-verified details. Set your preferred pickup window.', color: 'from-teal-500 to-sky-500' },
  { icon: Truck, title: 'Collector Pickup', desc: 'A verified collector is assigned. They arrive, verify weight with OTP, and collect your plastic.', color: 'from-sky-500 to-blue-500' },
  { icon: Factory, title: 'Recycler Processing', desc: 'Plastic reaches our recycler partners who process it into raw material for new eco products.', color: 'from-blue-500 to-indigo-500' },
  { icon: Coins, title: 'Earn Nature Coins', desc: 'Get rewarded instantly. 1 Coin per 100 g of plastic. Quality bonuses apply.', color: 'from-coin-400 to-coin-600' },
  { icon: ShoppingBag, title: 'Spend in Marketplace', desc: 'Redeem coins for eco products — bottles, pots, furniture, and more.', color: 'from-emerald-500 to-green-500' },
];

export function HowItWorks() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <section id="how" className="py-24 bg-surface-subtle">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="emerald" className="mb-4">How It Works</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">From waste to worth in six steps</h2>
          <p className="mt-4 text-base-muted text-lg">A seamless journey powered by AI — from detecting plastic at home to earning rewards and buying eco products.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <Card key={step.title} hover className={`p-6 relative overflow-hidden group reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${(i % 3) + 1}`}>
              <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${step.color} opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`} />
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <span className="font-display text-3xl font-bold text-surface-muted">0{i + 1}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-base-strong mb-2">{step.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
