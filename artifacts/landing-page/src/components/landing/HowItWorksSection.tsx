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
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  icon: React.ReactNode;
}> = [
  {
    num: "01",
    titleKey: "how1_title", descKey: "how1_desc",
    gradientFrom: "from-blue-500", gradientTo: "to-indigo-500",
    iconBg: "bg-blue-500/10", iconBorder: "border-blue-500/25", iconColor: "text-blue-400",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    num: "02",
    titleKey: "how2_title", descKey: "how2_desc",
    gradientFrom: "from-violet-500", gradientTo: "to-purple-500",
    iconBg: "bg-violet-500/10", iconBorder: "border-violet-500/25", iconColor: "text-violet-400",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>,
  },
  {
    num: "03",
    titleKey: "how3_title", descKey: "how3_desc",
    gradientFrom: "from-emerald-500", gradientTo: "to-teal-500",
    iconBg: "bg-emerald-500/10", iconBorder: "border-emerald-500/25", iconColor: "text-emerald-400",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  },
];

export function HowItWorksSection({ t, dir }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#0a1628] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16 sm:mb-24 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-400 mb-4">
            {t("eyebrow_how")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
            {t("how_headline")}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            {t("how_subheadline")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">

          {/* Dashed connector — desktop only */}
          <div className="absolute hidden lg:block top-10 inset-x-0 pointer-events-none">
            <div className="mx-auto max-w-none px-8">
              <svg width="100%" height="2" className="overflow-visible">
                <defs>
                  <linearGradient id="stepGrad" x1={dir === "rtl" ? "100%" : "0%"} y1="0%" x2={dir === "rtl" ? "0%" : "100%"} y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <line x1="16.67%" y1="1" x2="83.33%" y2="1" stroke="url(#stepGrad)" strokeWidth="1.5" strokeDasharray="6 5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {steps.map(({ num, titleKey, descKey, icon, gradientFrom, gradientTo, iconBg, iconBorder, iconColor }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon circle with step badge */}
              <div className="relative mb-8">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${iconBg} ${iconBorder} ${iconColor}`}>
                  {icon}
                </div>
                {/* Step number badge */}
                <div className={`absolute -top-2.5 -end-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg`}>
                  {i + 1}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
                {t(titleKey)}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="#demo"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg"
          >
            {t("hero_cta_primary")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
