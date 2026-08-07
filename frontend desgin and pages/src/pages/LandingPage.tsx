import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { AIDetection } from '@/components/landing/AIDetection';
import { CoinSystem } from '@/components/landing/CoinSystem';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stakeholders } from '@/components/landing/Stakeholders';
import { MarketplacePreview } from '@/components/landing/MarketplacePreview';
import { Impact } from '@/components/landing/Impact';
import { NaturePromise } from '@/components/landing/NaturePromise';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <LandingNav />
      <main>
        <Hero />
        <Stats />
        <Problem />
        <Solution />
        <AIDetection />
        <CoinSystem />
        <HowItWorks />
        <Stakeholders />
        <MarketplacePreview />
        <Impact />
        <NaturePromise />
        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
