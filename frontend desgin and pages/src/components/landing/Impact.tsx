import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ring } from '@/components/ui/Progress';
import { Leaf, Wind, TreePine, Droplets, Zap, Factory, Recycle } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const earthImg = 'https://images.pexels.com/photos/30596225/pexels-photo-30596225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const oceanImg = 'https://images.pexels.com/photos/20023182/pexels-photo-20023182.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const stats = [
  { icon: Factory, label: 'Plastic Recycled', value: '12,400', unit: 'kg', color: 'emerald' },
  { icon: Wind, label: 'CO₂ Saved', value: '24,800', unit: 'kg', color: 'sky' },
  { icon: TreePine, label: 'Trees Saved', value: '186', unit: 'trees', color: 'forest' },
  { icon: Droplets, label: 'Water Saved', value: '62K', unit: 'litres', color: 'teal' },
  { icon: Zap, label: 'Energy Saved', value: '84K', unit: 'kWh', color: 'amber' },
  { icon: Leaf, label: 'Oil Saved', value: '3,100', unit: 'litres', color: 'emerald' },
];

export function Impact() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="impact" className="py-24 relative overflow-hidden bg-surface">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className={`reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
            <Badge variant="emerald" className="mb-4">Environmental Impact</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">
              Every gram you recycle makes a measurable difference
            </h2>
            <p className="mt-4 text-lg text-base-muted leading-relaxed">
              NexPlast tracks your personal and community impact in real time. See exactly how much CO₂, water, oil, and energy your recycling has saved.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-xl border border-base bg-surface-subtle p-4 hover:shadow-card transition-all hover:-translate-y-0.5 reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${(i % 3) + 1}`}
                >
                  <s.icon className={`h-5 w-5 text-${s.color}-500 mb-2`} />
                  <p className="font-display text-2xl font-bold text-base-strong">{s.value}</p>
                  <p className="text-xs text-base-muted">{s.label} · {s.unit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-2`}>
            {/* Earth image behind card */}
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full overflow-hidden opacity-90 animate-drift">
              <img src={earthImg} alt="Earth" className="w-full h-full object-cover rounded-full" />
            </div>

            <Card className="p-8 flex flex-col items-center relative z-10">
              <h3 className="font-display text-lg font-semibold text-base-strong mb-1">Your Impact This Month</h3>
              <p className="text-sm text-base-muted mb-6">Based on 142 kg recycled in July</p>
              <Ring value={71} size={180} stroke={14} label="71%" sublabel="of monthly goal" />
              <div className="mt-8 w-full grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-emerald-600">284 kg</p>
                  <p className="text-xs text-base-muted">CO₂ saved</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-sky-600">7</p>
                  <p className="text-xs text-base-muted">trees saved</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-teal-600">35 L</p>
                  <p className="text-xs text-base-muted">oil saved</p>
                </div>
              </div>
            </Card>

            {/* Ocean strip below */}
            <div className="mt-4 rounded-2xl overflow-hidden h-28 relative group">
              <img src={oceanImg} alt="Clean ocean" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <Recycle className="h-4 w-4 mb-1" />
                <p className="text-sm font-semibold">Cleaner oceans, one pickup at a time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
