import { useScrollReveal } from '@/lib/useScrollReveal';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Waves, Skull, Fish } from 'lucide-react';

const pollutionImg1 = 'https://images.pexels.com/photos/27798146/pexels-photo-27798146.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const pollutionImg2 = 'https://images.pexels.com/photos/12050526/pexels-photo-12050526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const pollutionImg3 = 'https://images.pexels.com/photos/28273648/pexels-photo-28273648.png?auto=compress&cs=tinysrgb&h=650&w=940';

const crisisStats = [
  { value: '400M', label: 'tonnes of plastic produced yearly', icon: AlertTriangle },
  { value: '11M', label: 'tonnes enter the ocean each year', icon: Waves },
  { value: '50%', label: 'of plastic is single-use', icon: Skull },
  { value: '1M', label: 'marine animals killed annually', icon: Fish },
];

export function Problem() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-24 overflow-hidden bg-surface">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="red" className="mb-4"><AlertTriangle className="h-3 w-3" /> The Plastic Crisis</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">
            Our planet is drowning in plastic
          </h2>
          <p className="mt-4 text-lg text-base-muted">
            Every year, millions of tonnes of plastic waste pollute our oceans, harm wildlife, and choke our ecosystems. The problem is growing — but so is our solution.
          </p>
        </div>

        {/* Pollution image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { img: pollutionImg1, label: 'Rivers choked with plastic', sub: 'Waterways carry waste to the ocean' },
            { img: pollutionImg2, label: 'Beaches buried in bottles', sub: 'Coastlines disappearing under trash' },
            { img: pollutionImg3, label: 'Wildlife in danger', sub: 'Marine animals pay the price' },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer h-64 reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${i + 1}`}
            >
              <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-5 left-5 text-white">
                <p className="font-display font-bold text-lg">{item.label}</p>
                <p className="text-sm text-white/70">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Crisis stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {crisisStats.map((s, i) => (
            <div
              key={s.label}
              className={`rounded-2xl border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 p-6 text-center reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${i + 1}`}
            >
              <s.icon className="h-7 w-7 text-red-500 mx-auto mb-3" />
              <p className="font-display text-3xl font-bold text-red-600 dark:text-red-400">{s.value}</p>
              <p className="text-sm text-base-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
