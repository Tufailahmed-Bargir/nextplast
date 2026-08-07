import { CoinIcon } from '@/components/Brand';
import { Leaf, Recycle, Wind, Users, Heart, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { useNav } from '@/lib/nav';
import { Button } from '@/components/ui/Button';

const volunteerImg1 = 'https://images.pexels.com/photos/36713457/pexels-photo-36713457.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const volunteerImg2 = 'https://images.pexels.com/photos/36713110/pexels-photo-36713110.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const forestImg = 'https://images.pexels.com/photos/34985169/pexels-photo-34985169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function NaturePromise() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const { navigate } = useNav();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Full-width forest background */}
      <div className="absolute inset-0">
        <img src={forestImg} alt="Forest canopy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/70 to-slate-900/85" />
      </div>

      <div ref={ref} className={`relative max-w-5xl mx-auto px-5 sm:px-8 text-center text-white reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 mb-6">
          <Leaf className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold">Our Nature Promise</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
          For every 1 kg recycled,<br />we save 2 kg of CO₂
        </h2>
        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
          NexPlast isn't just an app — it's a movement. Every pickup, every coin, every marketplace purchase contributes to a measurably cleaner planet.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-3">
              <Recycle className="h-7 w-7 text-emerald-400" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white">12.4T</p>
            <p className="text-sm text-white/70">plastic diverted</p>
          </div>
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-3">
              <Wind className="h-7 w-7 text-sky-400" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white">24.8T</p>
            <p className="text-sm text-white/70">CO₂ prevented</p>
          </div>
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-3">
              <CoinIcon size={28} />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white">124K</p>
            <p className="text-sm text-white/70">coins earned</p>
          </div>
        </div>

        {/* Volunteer images */}
        <div className="mt-12 grid grid-cols-2 gap-4 max-w-3xl mx-auto">
          {[
            { img: volunteerImg1, label: 'Forest cleanup drives', sub: 'Volunteers collecting plastic waste' },
            { img: volunteerImg2, label: 'River & beach rescue', sub: 'Communities protecting waterways' },
          ].map((item, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden group h-44">
              <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-3 left-4 text-left text-white">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-white/60">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-white/60">
          <Users className="h-5 w-5 text-emerald-400" />
          <span className="text-sm">Join 3,800+ eco-warriors making a real difference</span>
        </div>

        <Button
          size="lg"
          variant="glass"
          className="mt-6 text-white border-white/30 hover:bg-white/20"
          onClick={() => navigate('auth', { mode: 'register' })}
        >
          <Heart className="h-4 w-4" /> Join the Movement <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
