import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface HowItWorksSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

const steps: Array<{
  num: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  iconBox: string;
  badgeClass: string;
  icon: React.ReactNode;
}> = [
  {
    num: "01",
    titleKey: "how1_title",
    descKey: "how1_desc",
    iconBox: "text-blue-500 border border-[rgba(59,130,246,0.28)] shadow-[0_0_0_6px_rgba(59,130,246,0.22),_0_12px_40px_rgba(0,0,0,0.35)]",
    badgeClass: "bg-[linear-gradient(135deg,#3b82f6,#3b82f6cc)] shadow-[0_2px_8px_rgba(59,130,246,0.22)]",
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
    titleKey: "how2_title",
    descKey: "how2_desc",
    iconBox: "text-violet-500 border border-[rgba(139,92,246,0.28)] shadow-[0_0_0_6px_rgba(139,92,246,0.22),_0_12px_40px_rgba(0,0,0,0.35)]",
    badgeClass: "bg-[linear-gradient(135deg,#8b5cf6,#8b5cf6cc)] shadow-[0_2px_8px_rgba(139,92,246,0.22)]",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93A10 10 0 114.93 19.07M19.07 4.93L20.49 3.51M19.07 4.93l-2.83 2.83" />
      </svg>
    ),
  },
  {
    num: "03",
    titleKey: "how3_title",
    descKey: "how3_desc",
    iconBox: "text-emerald-500 border border-[rgba(16,185,129,0.28)] shadow-[0_0_0_6px_rgba(16,185,129,0.22),_0_12px_40px_rgba(0,0,0,0.35)]",
    badgeClass: "bg-[linear-gradient(135deg,#10b981,#10b981cc)] shadow-[0_2px_8px_rgba(16,185,129,0.22)]",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export function HowItWorksSection({ t, dir }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="block text-[11px] font-bold tracking-[0.12em] uppercase text-blue-400 mb-3">
            {t("eyebrow_how")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-[-0.02em]">
            {t("how_headline")}
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            {t("how_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 relative">
          {/* Dashed connector — static sizes in Tailwind; RTL left/right must stay inline (computed property key) */}
          <svg
            className="absolute hidden lg:block pointer-events-none top-[29px] h-[22px] overflow-visible w-[calc(66.66%_-_80px)]"
            style={{
              [dir === "rtl" ? "right" : "left"]: "calc(16.67% + 40px)",
              [dir === "rtl" ? "left" : "right"]: "calc(16.67% + 40px)",
            }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="connectorGrad" x1={dir === "rtl" ? "100%" : "0%"} y1="0%" x2={dir === "rtl" ? "0%" : "100%"} y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <line
              x1="0" y1="11" x2="100%" y2="11"
              stroke="url(#connectorGrad)"
              strokeWidth="1.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
          </svg>

          {steps.map(({ num, titleKey, descKey, icon, iconBox, badgeClass }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.13 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-7">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center relative z-10 bg-[linear-gradient(145deg,#1a2540,#141c2e)] ${iconBox}`}>
                  {icon}
                </div>
                <div className={`absolute -top-2 -end-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-20 ${badgeClass}`}>
                  {i + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 tracking-[-0.01em]">
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
