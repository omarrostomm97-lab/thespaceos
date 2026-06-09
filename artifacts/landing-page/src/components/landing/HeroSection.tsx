import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

const base = import.meta.env.BASE_URL;
const dashboardImg = `${base}screenshots/dashboard.png`;

interface HeroSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

const TRUST_TAGS = [
  { key: "bf1_name" as TranslationKey },
  { key: "bf2_name" as TranslationKey },
  { key: "bf3_name" as TranslationKey },
  { key: "bf4_name" as TranslationKey },
];

export function HeroSection({ t, dir }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#020617]">
      {/* Background: dot grid */}
      <div className="dot-grid absolute inset-0 pointer-events-none" />

      {/* Background gradient layers */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#020617] via-[#0a1628] to-[#020617]" />

      {/* Top-left blue orb (text side) */}
      <div className="absolute pointer-events-none -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-blue-600/10 blur-3xl" />

      {/* Bottom-right purple orb */}
      <div className="absolute pointer-events-none bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-violet-600/8 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-20 pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24 lg:pb-28 ${dir === "rtl" ? "lg:flex-row-reverse" : ""}`}>

          {/* ── Left: Text column ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`lg:w-[52%] flex flex-col items-center text-center ${dir === "rtl" ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {t("hero_badge")}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.06] mb-6">
              {t("hero_headline")}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed mb-10 max-w-lg">
              {t("hero_subheadline")}
            </p>

            {/* CTA buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10 ${dir === "rtl" ? "sm:flex-row-reverse" : ""}`}>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg"
              >
                {t("hero_cta_primary")}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#product"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white font-medium px-7 py-3.5 rounded-xl transition-all duration-200 text-sm"
              >
                {t("hero_cta_secondary")}
              </a>
            </div>

            {/* Trust tags */}
            <div className={`flex flex-wrap items-center gap-2 justify-center ${dir === "rtl" ? "lg:justify-end" : "lg:justify-start"}`}>
              <span className="text-xs text-slate-600 flex-shrink-0">
                {dir === "rtl" ? "مصمم لـ" : "Built for"}
              </span>
              {TRUST_TAGS.map(({ key }) => (
                <span
                  key={key}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-500 font-medium"
                >
                  {t(key)}
                </span>
              ))}
              <span className="text-xs text-slate-600">
                {dir === "rtl" ? "والمزيد" : "& more"}
              </span>
            </div>
          </motion.div>

          {/* ── Right: Screenshot column ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:w-[48%] w-full hero-screenshot-glow"
          >
            {/* Browser chrome frame */}
            <div className="premium-frame rounded-xl overflow-hidden bg-[#1e293b] border border-white/10">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 h-10 bg-[#1a2438] border-b border-white/8 flex-shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-500/70 flex-shrink-0" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70 flex-shrink-0" />
                <span className="w-3 h-3 rounded-full bg-green-500/70 flex-shrink-0" />
                <div className="ml-2 flex-1 bg-white/5 rounded-md h-6 flex items-center px-3 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span className="text-[10px] text-slate-500 truncate">app.thespaceos.com</span>
                  </div>
                </div>
              </div>
              {/* Screenshot */}
              <img
                src={dashboardImg}
                alt="The Space OS — Business Operations Dashboard"
                className="w-full block"
                loading="eager"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
