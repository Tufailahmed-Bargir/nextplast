import { useNav } from '@/lib/nav';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const mountainImg = 'https://images.pexels.com/photos/34030925/pexels-photo-34030925.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920';

export function CTA() {
  const { navigate } = useNav();
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div ref={ref} className={`relative rounded-3xl overflow-hidden p-12 sm:p-20 text-center reveal-on-scroll ${visible ? 'is-visible' : ''}`}>
          {/* Mountain sunrise background */}
          <div className="absolute inset-0">
            <img src={mountainImg} alt="Mountain sunrise" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/90 via-teal-800/85 to-sky-900/90" />
          </div>
          <div className="absolute inset-0 grid-pattern opacity-15" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-drift" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-drift" style={{ animationDelay: '3s' }} />

          <div className="relative">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-1.5 text-sm font-semibold text-white mb-6">
              <Sparkles className="h-4 w-4" /> Join the Green Movement
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              Your plastic waste is worth<br />more than you think
            </h2>
            <p className="mt-5 text-lg text-emerald-50 max-w-xl mx-auto">
              Join 3,800+ users who have recycled over 12,400 kg of plastic and earned Nature Coins. Get started in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="xl" variant="glass" onClick={() => navigate('auth', { mode: 'register' })} className="text-white border-white/30 hover:bg-white/20">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="xl" variant="glass" onClick={() => navigate('marketplace')} className="text-white border-white/30 hover:bg-white/20">
                Explore Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
