import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemsSection } from "@/components/landing/ProblemsSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { ProductScreenshotsSection } from "@/components/landing/ProductScreenshotsSection";
import { BuiltForSection } from "@/components/landing/BuiltForSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DemoFormSection } from "@/components/landing/DemoFormSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function LandingPage() {
  useEffect(() => {
    document.title = "The Space OS — One System. Total Control.";
  }, []);

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", background: "#050B18" }}>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemsSection />
        <SocialProofSection />
        <ProductScreenshotsSection />
        <BuiltForSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoFormSection />
      </main>
      <FooterSection />
    </div>
  );
}
