import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface SocialProofSectionProps {
  t: (key: TranslationKey) => string;
}

const businessTypes = [
  { icon: "🎮", key: "sp_gaming" as TranslationKey },
  { icon: "🏢", key: "sp_coworking" as TranslationKey },
  { icon: "☕", key: "sp_cafe" as TranslationKey },
  { icon: "🍽️", key: "sp_restaurant" as TranslationKey },
  { icon: "✨", key: "sp_more" as TranslationKey },
];

export function SocialProofSection({ t }: SocialProofSectionProps) {
  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-slate-500 text-sm font-medium mb-8 max-w-xl mx-auto"
        >
          {t("social_proof_text")}
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {businessTypes.map(({ icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-semibold text-slate-700">{t(key)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
