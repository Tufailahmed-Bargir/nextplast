import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Zap, BarChart3, Globe2, HeartHandshake, Lock } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const features = [
  { icon: Zap, title: 'AI-Powered Detection', desc: 'Computer vision identifies plastic type, quality, and weight from a single photo with 98% accuracy.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: ShieldCheck, title: 'Fraud Prevention', desc: 'Duplicate image detection, weight verification, and OTP-confirmed pickups keep the system fair.', gradient: 'from-sky-500 to-blue-500' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track your recycling impact, coin earnings, and environmental contribution with live dashboards.', gradient: 'from-teal-500 to-emerald-500' },
  { icon: Globe2, title: 'Verified Network', desc: 'Every collector and recycler is background-verified and rated by the community.', gradient: 'from-coin-400 to-coin-600' },
  { icon: HeartHandshake, title: 'Fair Rewards', desc: 'Transparent coin system with quality bonuses. Clean, sorted plastic earns more.', gradient: 'from-emerald-500 to-green-500' },
  { icon: Lock, title: 'Secure & Private', desc: 'Bank-grade encryption. Your data and transactions are always protected.', gradient: 'from-sky-500 to-teal-500' },
];

export function Features() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-24 bg-surface-subtle">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="sky" className="mb-4">Why NexPlast</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">Built for trust, scale, and real impact</h2>
          <p className="mt-4 text-lg text-base-muted">A platform engineered like a premium SaaS product — but designed for the planet.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Card
              key={f.title}
              hover
              className={`p-6 group reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${(i % 3) + 1}`}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-base-strong mb-2">{f.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
