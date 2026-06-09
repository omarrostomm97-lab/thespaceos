import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface FeaturesSectionProps {
  t: (key: TranslationKey) => string;
}

const features: Array<{
  nameKey: TranslationKey;
  descKey: TranslationKey;
  topBorder: string;
  iconBox: string;
  icon: React.ReactNode;
}> = [
  {
    nameKey: "f1_name",
    descKey: "f1_desc",
    topBorder: "[border-top:3px_solid_rgba(59,130,246,0.13)]",
    iconBox: "bg-[rgba(59,130,246,0.06)] border-[rgba(59,130,246,0.13)] text-blue-500",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    nameKey: "f5_name",
    descKey: "f5_desc",
    topBorder: "[border-top:3px_solid_rgba(139,92,246,0.13)]",
    iconBox: "bg-[rgba(139,92,246,0.06)] border-[rgba(139,92,246,0.13)] text-violet-500",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    nameKey: "f2_name",
    descKey: "f2_desc",
    topBorder: "[border-top:3px_solid_rgba(245,158,11,0.13)]",
    iconBox: "bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.13)] text-amber-500",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    nameKey: "f4_name",
    descKey: "f4_desc",
    topBorder: "[border-top:3px_solid_rgba(6,182,212,0.13)]",
    iconBox: "bg-[rgba(6,182,212,0.06)] border-[rgba(6,182,212,0.13)] text-cyan-500",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5" />
        <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5" />
        <line x1="16" y1="14" x2="16" y2="14" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    nameKey: "f_staff",
    descKey: "f_staff_desc",
    topBorder: "[border-top:3px_solid_rgba(16,185,129,0.13)]",
    iconBox: "bg-[rgba(16,185,129,0.06)] border-[rgba(16,185,129,0.13)] text-emerald-500",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    nameKey: "f6_name",
    descKey: "f6_desc",
    topBorder: "[border-top:3px_solid_rgba(236,72,153,0.13)]",
    iconBox: "bg-[rgba(236,72,153,0.06)] border-[rgba(236,72,153,0.13)] text-pink-500",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="block text-[11px] font-bold tracking-[0.12em] uppercase text-blue-600 mb-3">
            {t("eyebrow_features")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-[-0.02em]">
            {t("features_headline")}
          </h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
            {t("features_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, nameKey, descKey, topBorder, iconBox }, i) => (
            <motion.div
              key={nameKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`bg-[#fafafa] border border-slate-900/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-[220ms] ease-in-out hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl p-7 ${topBorder}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border ${iconBox}`}>
                {icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {t(nameKey)}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
