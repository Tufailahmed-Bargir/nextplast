import { SiteFooter } from "@/components/layout/site-footer";
import {
  LandingNav,
  Hero,
  Stats,
  Solution,
  HowItWorks,
  AIDetection,
  CoinSystem,
  MarketplacePreview,
  Impact,
  BusinessBenefits,
  Testimonials,
  FAQ,
  Contact,
  CTA,
} from "@/features/landing/components";

/**
 * Marketing landing page — composes all landing sections.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <Hero />
        <Stats />
        <Solution />
        <HowItWorks />
        <AIDetection />
        <CoinSystem />
        <MarketplacePreview />
        <Impact />
        <BusinessBenefits />
        <Testimonials />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}
