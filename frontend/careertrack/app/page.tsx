import FeaturesSection from "@/components/FeaturesSection";
import HeroSection from "@/components/HeroSection";
import Insights from "@/components/Insights";
import Interview from "@/Interview/page";
export default function Home() {
  return (
    <div className="">
      <HeroSection />
      <Insights />
      <FeaturesSection />
      <Interview />
    </div>
  )
}
