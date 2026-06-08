import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface HeroSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

export function HeroSection({ t, dir }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: "#0f172a" }}>
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-100 pointer-events-none" />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Blue glow bottom-center */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#93c5fd",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Operations Management Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {dir === "rtl" ? (
              t("hero_headline")
            ) : (
              <>
                One System.{" "}
                <span className="gradient-text">Total Control.</span>
              </>
            )}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("hero_subheadline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-blue-500/25 hover:shadow-xl"
              style={{ background: "#3b82f6" }}
            >
              {t("hero_cta_primary")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir === "rtl" ? "M19 12H5M12 5l-7 7 7 7" : "M5 12h14M12 5l7 7-7 7"} />
              </svg>
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {t("hero_cta_secondary")}
            </a>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 mx-auto max-w-3xl"
          >
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                boxShadow: "0 0 80px rgba(59,130,246,0.15), 0 25px 50px rgba(0,0,0,0.5)",
              }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.04)" }}
              >
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <div
                  className="flex-1 mx-4 h-5 rounded-md px-3 text-xs flex items-center"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                >
                  app.thespaceos.com
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Active Sessions", value: "12", color: "#3b82f6" },
                  { label: "Revenue Today", value: "4,250", color: "#8b5cf6" },
                  { label: "Pending Orders", value: "7", color: "#f59e0b" },
                  { label: "Staff on Shift", value: "5", color: "#10b981" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{kpi.label}</div>
                    <div className="text-xl font-bold" style={{ color: kpi.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 grid grid-cols-3 gap-3">
                {["Session #42 · PS4 Room 1", "Session #41 · PC Station 3", "Session #40 · Billiard 2"].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{s}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-green-400">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
