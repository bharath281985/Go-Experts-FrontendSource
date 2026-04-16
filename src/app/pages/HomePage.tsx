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
import PricingSection from '@/app/components/home/PricingSection';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error('Error parsing user from localStorage');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <HeroSection />
        <TrustStatsSection />
        <CategoriesSection />
        
        {/* Show Projects to Freelancers and Unauthenticated Users (Hide for Clients) */}
        {userRole !== 'client' && <FeaturedProjectsSection />}
        
        <HowItWorksSection />
        
        {/* Show Talent to Clients and Unauthenticated Users (Hide for Freelancers) */}
        {userRole !== 'freelancer' && <TalentSection />}
        
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}