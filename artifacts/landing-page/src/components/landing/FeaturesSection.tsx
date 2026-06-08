import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface FeaturesSectionProps {
  t: (key: TranslationKey) => string;
}

const features = [
  {
    icon: "⏱️",
    nameKey: "f1_name" as TranslationKey,
    descKey: "f1_desc" as TranslationKey,
    color: "#3b82f6",
  },
  {
    icon: "🍳",
    nameKey: "f2_name" as TranslationKey,
    descKey: "f2_desc" as TranslationKey,
    color: "#f59e0b",
  },
  {
    icon: "💰",
    nameKey: "f3_name" as TranslationKey,
    descKey: "f3_desc" as TranslationKey,
    color: "#10b981",
  },
  {
    icon: "📅",
    nameKey: "f4_name" as TranslationKey,
    descKey: "f4_desc" as TranslationKey,
    color: "#8b5cf6",
  },
  {
    icon: "🧾",
    nameKey: "f5_name" as TranslationKey,
    descKey: "f5_desc" as TranslationKey,
    color: "#ec4899",
  },
  {
    icon: "📊",
    nameKey: "f6_name" as TranslationKey,
    descKey: "f6_desc" as TranslationKey,
    color: "#06b6d4",
  },
];

export function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section id="features" className="py-24" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("features_headline")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, nameKey, descKey, color }, i) => (
            <motion.div
              key={nameKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl p-6 feature-card"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}
              >
                {icon}
              </div>
              <h3
                className="text-base font-semibold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t(nameKey)}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
