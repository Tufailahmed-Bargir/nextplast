import { useNav } from '@/lib/nav';
import { Button } from '@/components/ui/Button';
import { CoinIcon } from '@/components/Brand';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Recycle, Sparkles, TrendingUp, Star, MapPin } from 'lucide-react';

const heroBg = 'https://images.pexels.com/photos/540006/pexels-photo-540006.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920';
const mountainImg = 'https://images.pexels.com/photos/34030925/pexels-photo-34030925.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function Hero() {
  const { navigate } = useNav();
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Full-width nature background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Lush green nature" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-surface dark:to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-transparent" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl animate-drift" />
      <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl animate-drift" style={{ animationDelay: '3s' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: content */}
          <div className="animate-slide-up">
            <Badge variant="emerald" dot className="mb-5 bg-white/15 backdrop-blur text-white border-white/20">
              <Sparkles className="h-3 w-3" /> AI-Powered Circular Economy
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white">
              Turn plastic waste into <span className="gradient-animated">Nature Coins</span> & eco rewards
            </h1>
            <p className="mt-5 text-lg text-white/80 leading-relaxed max-w-xl">
              NexPlast connects you with AI plastic detection, local collectors, and recyclers. Earn Nature Coins for every gram of plastic you recycle — then spend them in our eco marketplace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('auth', { mode: 'register' })}>
                Start Selling Plastic <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate('marketplace')} className="text-white border-white/30 hover:bg-white/20">
                <Recycle className="h-4 w-4" /> Explore Marketplace
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div>
                <p className="font-display text-2xl font-bold text-white">12,400+</p>
                <p className="text-sm text-white/60">kg recycled</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold text-white">3,800+</p>
                <p className="text-sm text-white/60">active users</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold text-coin-300">124K</p>
                <p className="text-sm text-white/60">coins earned</p>
              </div>
            </div>
          </div>

          {/* Right: floating image cards */}
          <div className="hidden lg:block relative h-[500px]">
            {/* Mountain image - small */}
            <div className="absolute top-1/2 right-1/2 w-48 h-36 rounded-2xl overflow-hidden shadow-float border-2 border-white/20 animate-float" style={{ animationDelay: '0.8s' }}>
              <img src={mountainImg} alt="Mountains" className="w-full h-full object-cover" />
            </div>

            {/* Floating glass cards */}
            <div className="absolute -top-4 left-8 glass-card rounded-2xl p-3.5 shadow-float animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2.5">
                <CoinIcon size={32} />
                <div>
                  <p className="text-sm font-semibold text-base-strong">200 Coins</p>
                  <p className="text-xs text-base-muted">for 20 kg PET</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 right-4 glass-card rounded-2xl p-3.5 shadow-float animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-eco-gradient flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-strong">98% AI accuracy</p>
                  <p className="text-xs text-base-muted">plastic detection</p>
                </div>
              </div>
            </div>

            <div className="absolute top-1/3 -right-2 glass-card rounded-2xl p-3 shadow-float animate-float" style={{ animationDelay: '2.5s' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-coin-400 text-coin-400" />)}
                </div>
                <span className="text-xs font-semibold text-base-strong">4.9</span>
              </div>
            </div>

            <div className="absolute -bottom-2 left-1/3 glass-card rounded-2xl p-3 shadow-float animate-float" style={{ animationDelay: '1.2s' }}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-base-strong">142 collectors active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-surface dark:from-slate-950 to-transparent" />
    </section>
  );
}
