import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface FeaturesSectionProps {
  t: (key: TranslationKey) => string;
}

const features = [
  {
    nameKey: "f1_name" as TranslationKey,
    descKey: "f1_desc" as TranslationKey,
    color: "#3b82f6",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    nameKey: "f5_name" as TranslationKey,
    descKey: "f5_desc" as TranslationKey,
    color: "#8b5cf6",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    nameKey: "f2_name" as TranslationKey,
    descKey: "f2_desc" as TranslationKey,
    color: "#f59e0b",
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
    nameKey: "f4_name" as TranslationKey,
    descKey: "f4_desc" as TranslationKey,
    color: "#06b6d4",
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
    nameKey: "f_staff" as TranslationKey,
    descKey: "f_staff_desc" as TranslationKey,
    color: "#10b981",
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
    nameKey: "f6_name" as TranslationKey,
    descKey: "f6_desc" as TranslationKey,
    color: "#ec4899",
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
          <p className="section-eyebrow text-blue-600 mb-3">{t("eyebrow_features")}</p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            {t("features_headline")}
          </h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
            {t("features_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, nameKey, descKey, color }, i) => (
            <motion.div
              key={nameKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="premium-card bg-white rounded-2xl p-7"
              style={{ borderTop: `3px solid ${color}22` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}
              >
                {icon}
              </div>
              <h3
                className="text-base font-semibold text-slate-900 mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
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
