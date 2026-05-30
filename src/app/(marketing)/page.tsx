import type { Metadata } from 'next';
import { MarketingNav }        from './_components/marketing-nav';
import { HeroSection }         from './_components/hero-section';
import { FeaturesSection }     from './_components/features-section';
import { HowItWorksSection }   from './_components/how-it-works-section';
import { TestimonialsSection } from './_components/testimonials-section';
import { PricingSection }      from './_components/pricing-section';
import { CtaBanner }           from './_components/cta-banner';
import { MarketingFooter }     from './_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Pantry Pilot — Trợ lý bếp AI | AI Kitchen Assistant',
  description: 'Chụp ảnh tủ lạnh, nhận công thức cá nhân hóa, nấu thông minh hơn — lãng phí ít hơn. / Snap your fridge, get personalized recipes, cook smarter with less waste.',
};

export default function MarketingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaBanner />
      </main>
      <MarketingFooter />
    </>
  );
}
