import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface HowItWorksSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

const steps = [
  {
    num: "01",
    titleKey: "how1_title" as TranslationKey,
    descKey: "how1_desc" as TranslationKey,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    num: "02",
    titleKey: "how2_title" as TranslationKey,
    descKey: "how2_desc" as TranslationKey,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93A10 10 0 114.93 19.07M19.07 4.93L20.49 3.51M19.07 4.93l-2.83 2.83" />
      </svg>
    ),
  },
  {
    num: "03",
    titleKey: "how3_title" as TranslationKey,
    descKey: "how3_desc" as TranslationKey,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export function HowItWorksSection({ t, dir }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-20 sm:py-28" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("how_headline")}
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            {t("how_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 relative">
          {/* Connector line (desktop only) */}
          <div
            className="absolute top-10 hidden lg:block pointer-events-none"
            style={{
              [dir === "rtl" ? "right" : "left"]: "calc(16.66% + 56px)",
              width: "calc(66.66% - 112px)",
              height: "1px",
              background: "linear-gradient(90deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4))",
            }}
          />

          {steps.map(({ num, titleKey, descKey, icon }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              {/* Step number + icon */}
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
                  style={{
                    background: "linear-gradient(135deg, #1e3a5f, #1e1b4b)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#60a5fa",
                    boxShadow: "0 8px 32px rgba(59,130,246,0.15)",
                  }}
                >
                  {icon}
                </div>
                <div
                  className="absolute -top-2 -end-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-20"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                >
                  {i + 1}
                </div>
              </div>

              <h3
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t(titleKey)}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm max-w-xs">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
