import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Truck, Factory, Users, PackageCheck, Leaf } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const forestImg = 'https://images.pexels.com/photos/12421351/pexels-photo-12421351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const roles = [
  {
    icon: Users,
    title: 'Users',
    desc: 'Everyday people who collect and sell household plastic waste. They earn Nature Coins for every pickup.',
    points: ['Snap & list plastic', 'Schedule free pickup', 'Earn Nature Coins', 'Shop in marketplace'],
    color: 'emerald',
  },
  {
    icon: Truck,
    title: 'Collectors',
    desc: 'Verified local agents who pick up plastic from users, verify weight with OTP, and deliver to recyclers.',
    points: ['Receive pickup assignments', 'OTP weight verification', 'Route optimization', 'Earn per kg delivered'],
    color: 'sky',
  },
  {
    icon: Factory,
    title: 'Recyclers',
    desc: 'Processing partners who buy sorted plastic by weight and type, turning waste into raw material.',
    points: ['Browse sorted inventory', 'Reserve & purchase batches', 'Quality grading (A/B/C)', 'Track shipments'],
    color: 'teal',
  },
];

export function Stakeholders() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-24 relative overflow-hidden bg-surface">
      {/* Background nature image */}
      <div className="absolute inset-0 opacity-5">
        <img src={forestImg} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/95 to-surface" />

      <div ref={ref} className={`relative max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="teal" className="mb-4"><Leaf className="h-3 w-3" /> The Ecosystem</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">A network that works together</h2>
          <p className="mt-4 text-lg text-base-muted">Users, collectors, and recyclers — connected through AI and rewarded through Nature Coins.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {roles.map((role, i) => (
            <Card
              key={role.title}
              hover
              className={`p-6 group reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${i + 1}`}
            >
              <div className={`h-14 w-14 rounded-2xl bg-${role.color}-50 dark:bg-${role.color}-950 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <role.icon className={`h-7 w-7 text-${role.color}-600 dark:text-${role.color}-400`} />
              </div>
              <h3 className="font-display text-xl font-bold text-base-strong mb-2">{role.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed mb-4">{role.desc}</p>
              <ul className="space-y-2">
                {role.points.map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-base-strong">
                    <PackageCheck className="h-4 w-4 text-emerald-500 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
