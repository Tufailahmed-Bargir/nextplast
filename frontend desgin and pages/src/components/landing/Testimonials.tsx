import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Star, Quote } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const testimonials = [
  { name: 'Priya Sharma', role: 'Homemaker, Mumbai', rating: 5, text: 'NexPlast changed how my family sees waste. My kids now sort plastic eagerly because they can see the coins add up. We have recycled over 1,200 kg this year!', avatar: 'https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' },
  { name: 'Arjun Mehta', role: 'College Student, Delhi', rating: 5, text: 'The AI detection is mind-blowing. I just snap a photo and it knows the plastic type instantly. I earned enough coins for a new eco bottle in two weeks.', avatar: 'https://images.pexels.com/photos/35490803/pexels-photo-35490803.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' },
  { name: 'Rajesh Kumar', role: 'Collector, Pune', rating: 5, text: 'As a collector, NexPlast gives me a steady stream of pickups with optimized routes. The OTP verification makes everything transparent. My income has doubled.', avatar: 'https://images.pexels.com/photos/37159572/pexels-photo-37159572.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' },
];

export function Testimonials() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-24 bg-surface">
      <div ref={ref} className={`max-w-7xl mx-auto px-5 sm:px-8 reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="emerald" className="mb-4">Testimonials</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-base-strong">Loved by people who care about the planet</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Card
              key={t.name}
              hover
              className={`p-6 relative reveal-on-scroll ${visible ? 'is-visible' : ''} reveal-delay-${i + 1}`}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-surface-muted" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-coin-400 text-coin-400" />
                ))}
              </div>
              <p className="text-sm text-base-strong leading-relaxed mb-6">{t.text}</p>
              <div className="flex items-center gap-3">
                <Avatar src={t.avatar} name={t.name} size="md" ring />
                <div>
                  <p className="font-semibold text-sm text-base-strong">{t.name}</p>
                  <p className="text-xs text-base-muted">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
