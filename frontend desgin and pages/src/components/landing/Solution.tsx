import { useScrollReveal } from '@/lib/useScrollReveal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Recycle, Leaf, Wind, TreePine, Droplets, Sun, ArrowRight, Sparkles, Heart } from 'lucide-react';

const solutionImg = 'https://images.pexels.com/photos/36713500/pexels-photo-36713500.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const recyclingImg = 'https://images.pexels.com/photos/14370990/pexels-photo-14370990.png?auto=compress&cs=tinysrgb&h=650&w=940';
const earthImg = 'https://images.pexels.com/photos/30596291/pexels-photo-30596291.png?auto=compress&cs=tinysrgb&h=650&w=940';

const solutions = [
  { icon: Recycle, title: 'Diverts plastic from landfills', desc: 'Every kg recycled through NexPlast is one less kg in a landfill or ocean. We have diverted 12.4 tonnes so far.', color: 'emerald' },
  { icon: Wind, title: 'Reduces CO₂ emissions', desc: 'Recycling plastic uses 88% less energy than producing new plastic. Each kg recycled saves 2 kg of CO₂.', color: 'sky' },
  { icon: TreePine, title: 'Saves forests and trees', desc: 'Less plastic production means less deforestation for industrial sites. 42 trees saved this year alone.', color: 'forest' },
  { icon: Droplets, title: 'Protects water sources', desc: 'Preventing plastic from reaching rivers and oceans keeps water clean. 4,200 litres of water saved.', color: 'teal' },
  { icon: Sun, title: 'Conserves energy', desc: 'Recycled plastic uses far less energy than virgin plastic. 5,880 kWh of energy saved.', color: 'amber' },
  { icon: Leaf, title: 'Creates eco products', desc: 'Recycled plastic becomes new products — bottles, pots, furniture — closing the loop.', color: 'emerald' },
];

export function Solution() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-24 overflow-hidden bg-surface-subtle">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="emerald" className="mb-4"><Sparkles className="h-3 w-3" /> The NexPlast Solution</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">
            How NexPlast helps nature heal
          </h2>
          <p className="mt-4 text-lg text-base-muted">
            We turn the plastic problem into a circular economy — where waste becomes worth, and every action creates measurable environmental impact.
          </p>
        </div>

        {/* Before/After visual */}
        <div className="grid lg:grid-cols-2 gap-6 mb-14">
          <div className={`relative rounded-3xl overflow-hidden group h-80 reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-1`}>
            <img src={recyclingImg} alt="Plastic waste piling up" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/20" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-500/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">BEFORE</span>
              </div>
              <p className="font-display text-2xl font-bold">Plastic piling up</p>
              <p className="text-white/70">Waste filling up facilities with no system to process it</p>
            </div>
          </div>
          <div className={`relative rounded-3xl overflow-hidden group h-80 reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-2`}>
            <img src={solutionImg} alt="Volunteers cleaning beach" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-emerald-900/20" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold">AFTER</span>
              </div>
              <p className="font-display text-2xl font-bold">Communities in action</p>
              <p className="text-white/70">NexPlast users, collectors, and recyclers cleaning up together</p>
            </div>
          </div>
        </div>

        {/* Solutions grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((s, i) => (
            <Card
              key={s.title}
              hover
              className={`p-6 group reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${(i % 3) + 1}`}
            >
              <div className={`h-12 w-12 rounded-xl bg-${s.color}-50 dark:bg-${s.color}-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <s.icon className={`h-6 w-6 text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
              <h3 className="font-display text-lg font-semibold text-base-strong mb-2">{s.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>

        {/* Earth banner */}
        <div className={`relative rounded-3xl overflow-hidden mt-10 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
          <img src={earthImg} alt="Earth from space" className="w-full h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 sm:px-12 max-w-lg">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm">One Planet, One Mission</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Every gram recycled is a win for Earth
              </h3>
              <p className="mt-3 text-white/70">
                NexPlast tracks every kg of plastic diverted, every gram of CO₂ prevented, and every tree saved — so you can see your real impact on the planet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
