import AboutHero from '@/app/components/about/AboutHero';
import MissionSection from '@/app/components/about/MissionSection';
import VisionSection from '@/app/components/about/VisionSection';
import WhyWeExistSection from '@/app/components/about/WhyWeExistSection';
import DifferenceSection from '@/app/components/about/DifferenceSection';
import StatsSection from '@/app/components/about/StatsSection';
import TeamSection from '@/app/components/about/TeamSection';
import ValuesSection from '@/app/components/about/ValuesSection';
import QualitySection from '@/app/components/about/QualitySection';
import TestimonialsSection from '@/app/components/about/TestimonialsSection';
import CTASection from '@/app/components/about/CTASection';

export default function About() {
  return (
    <div className="min-h-screen bg-black">
      <AboutHero />
      <MissionSection />
      <VisionSection />
      <WhyWeExistSection />
      <DifferenceSection />
      <StatsSection />
      <TeamSection />
      <ValuesSection />
      <QualitySection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
