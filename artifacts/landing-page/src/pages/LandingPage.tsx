import { useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemsSection } from "@/components/landing/ProblemsSection";
import { ProductScreenshotsSection } from "@/components/landing/ProductScreenshotsSection";
import { BuiltForSection } from "@/components/landing/BuiltForSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DemoFormSection } from "@/components/landing/DemoFormSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { MobileBottomCTA } from "@/components/landing/MobileBottomCTA";

export default function LandingPage() {
  const { t, lang, dir, toggleLang } = useLang();

  useEffect(() => {
    document.title =
      lang === "ar"
        ? "The Space OS — نظام إدارة العمليات للأعمال"
        : "The Space OS — Business Operations Management Software";
  }, [lang]);

  const base = import.meta.env.BASE_URL || "/landing-page/";
  const appLoginUrl = base.replace(/\/landing-page\/?$/, "/gaming-lounge/");

  return (
    <div dir={dir} lang={lang} className="min-h-screen overflow-x-hidden">
      <Navbar t={t} lang={lang} toggleLang={toggleLang} appLoginUrl={appLoginUrl} />
      <main>
        <HeroSection t={t} dir={dir} />
        <ProblemsSection t={t} />
        <ProductScreenshotsSection t={t} />
        <BuiltForSection t={t} />
        <FeaturesSection t={t} />
        <HowItWorksSection t={t} dir={dir} />
        <DemoFormSection t={t} dir={dir} lang={lang} />
      </main>
      <FooterSection t={t} lang={lang} toggleLang={toggleLang} />
      <MobileBottomCTA t={t} />
    </div>
  );
}
