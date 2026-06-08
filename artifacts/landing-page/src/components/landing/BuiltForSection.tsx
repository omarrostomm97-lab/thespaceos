import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface BuiltForSectionProps {
  t: (key: TranslationKey) => string;
}

const audiences = [
  { icon: "🎮", nameKey: "bf1_name" as TranslationKey, descKey: "bf1_desc" as TranslationKey },
  { icon: "🏢", nameKey: "bf2_name" as TranslationKey, descKey: "bf2_desc" as TranslationKey },
  { icon: "☕", nameKey: "bf3_name" as TranslationKey, descKey: "bf3_desc" as TranslationKey },
  { icon: "🍽️", nameKey: "bf4_name" as TranslationKey, descKey: "bf4_desc" as TranslationKey },
  { icon: "🏬", nameKey: "bf5_name" as TranslationKey, descKey: "bf5_desc" as TranslationKey },
];

export function BuiltForSection({ t }: BuiltForSectionProps) {
  return (
    <section id="built-for" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("built_for_headline")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {audiences.map(({ icon, nameKey, descKey }, i) => (
            <motion.div
              key={nameKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl p-6 feature-card bg-slate-50 border border-slate-200 flex flex-col items-start"
            >
              <span className="text-3xl mb-4">{icon}</span>
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
