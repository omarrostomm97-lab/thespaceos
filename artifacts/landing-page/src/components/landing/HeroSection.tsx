import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface HeroSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

const dashboardImg = `${import.meta.env.BASE_URL}screenshots/dashboard.png`;

function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.09] browser-frame">
      <div className="flex items-center gap-3 px-4 h-10 bg-[#1a2035] border-b border-white/[0.07]">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c840]" />
        </div>
        <div className="flex-1 mx-2 h-6 rounded-md flex items-center px-2.5 gap-2 bg-black/[0.28]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
          <span className="font-grotesk text-white/[0.2] text-[11px] tracking-[0.01em]">
            app.thespaceos.com
          </span>
        </div>
      </div>
      <img src={src} alt={alt} className="w-full block" />
    </div>
  );
}

export function HeroSection({ t, dir }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pb-0 bg-[#0f172a]">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-[0.38]" />

      {/* Top radial accent */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(59,130,246,0.13)_0%,transparent_65%)]" />

      {/* Blue orb — left */}
      <div className="absolute pointer-events-none top-[10%] -left-[8%] w-[500px] h-[500px] rounded-full blur-[48px] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)]" />

      {/* Purple orb — right */}
      <div className="absolute pointer-events-none top-[15%] -right-[6%] w-[420px] h-[420px] rounded-full blur-[48px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Spacer that clears the fixed navbar (h-16 mobile / md:h-18) + breathing room */}
        <div className="h-24 sm:h-28" aria-hidden="true" />
        <div className="max-w-3xl mx-auto text-center pb-14 sm:pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.12em] uppercase text-blue-300 bg-blue-500/10 border border-blue-500/[0.22]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            {t("hero_badge")}
          </motion.div>

          {/* Headline — clamp via Tailwind arbitrary */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-bold text-white leading-[1.06] tracking-tight mb-5 text-[clamp(3rem,6vw,5rem)]"
          >
            {t("hero_headline")}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="max-w-xl mx-auto mb-9 text-slate-400/90 text-base sm:text-lg leading-relaxed"
          >
            {t("hero_subheadline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-[0_4px_24px_rgba(59,130,246,0.38)]"
            >
              {t("hero_cta_primary")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir === "rtl" ? "M19 12H5M12 5l-7 7 7 7" : "M5 12h14M12 5l7 7-7 7"} />
              </svg>
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl text-white/75 border border-white/[0.14] hover:border-white/30 hover:text-white transition-all duration-200 active:scale-95"
            >
              {t("hero_cta_secondary")}
            </a>
          </motion.div>
        </div>

        {/* Real dashboard screenshot in browser frame */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.32 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Glow behind frame */}
          <div className="absolute -inset-4 rounded-3xl pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(59,130,246,0.12)_0%,transparent_70%)]" />
          <BrowserFrame src={dashboardImg} alt="The Space OS — Owner Dashboard" />
          {/* Gradient fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-[140px] pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(15,23,42,0.6)_35%,#ffffff_100%)]" />
        </motion.div>
      </div>
    </section>
  );
}
