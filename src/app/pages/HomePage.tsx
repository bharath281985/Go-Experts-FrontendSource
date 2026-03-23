import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import HeroSection from '@/app/components/home/HeroSection';
import TrustStatsSection from '@/app/components/home/TrustStatsSection';
import CategoriesSection from '@/app/components/home/CategoriesSection';
import FeaturedProjectsSection from '@/app/components/home/FeaturedProjectsSection';
import HowItWorksSection from '@/app/components/home/HowItWorksSection';
import TalentSection from '@/app/components/home/TalentSection';
import TestimonialsSection from '@/app/components/home/TestimonialsSection';
import FAQSection from '@/app/components/home/FAQSection';
import FinalCTASection from '@/app/components/home/FinalCTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <HeroSection />
        <TrustStatsSection />
        <CategoriesSection />
        <FeaturedProjectsSection />
        <HowItWorksSection />
        <TalentSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}