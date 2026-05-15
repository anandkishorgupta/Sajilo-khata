import CTASection from "@/components/home/CtaSection"
import FeaturesSection from "@/components/home/FeaturesSection"
import HeroSection from "@/components/home/HeroSection"
import ModulesSection from "@/components/home/ModulesSection"
import PricingSection from "@/components/home/PricingSection"
import StatsSection from "@/components/home/StatsSection"
import TestimonialsSection from "@/components/home/TestimonialsSection"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ModulesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </div>
  )
}
