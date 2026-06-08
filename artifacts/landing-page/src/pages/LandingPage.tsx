import { useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { ProblemsSection } from "@/components/landing/ProblemsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BuiltForSection } from "@/components/landing/BuiltForSection";
import { WhySection } from "@/components/landing/WhySection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DemoFormSection } from "@/components/landing/DemoFormSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function LandingPage() {
  const { t, lang, dir, toggleLang } = useLang();

  useEffect(() => {
    document.title =
      lang === "ar"
        ? "The Space OS — نظام واحد. تحكم كامل."
        : "The Space OS — One System. Total Control.";
  }, [lang]);

  const base = import.meta.env.BASE_URL || "/landing-page/";
  const appLoginUrl = base.replace(/\/landing-page\/?$/, "/gaming-lounge/");

  return (
    <div dir={dir} lang={lang}>
      <Navbar t={t} lang={lang} toggleLang={toggleLang} appLoginUrl={appLoginUrl} />
      <main>
        <HeroSection t={t} dir={dir} />
        <SocialProofSection t={t} />
        <ProblemsSection t={t} />
        <FeaturesSection t={t} />
        <BuiltForSection t={t} />
        <WhySection t={t} />
        <HowItWorksSection t={t} dir={dir} />
        <DemoFormSection t={t} dir={dir} lang={lang} />
      </main>
      <FooterSection t={t} lang={lang} toggleLang={toggleLang} />
    </div>
  );
}
