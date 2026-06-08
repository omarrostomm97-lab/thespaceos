import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface WhySectionProps {
  t: (key: TranslationKey) => string;
}

const reasons: Array<{ icon: string; key: TranslationKey }> = [
  { icon: "⚡", key: "w1" },
  { icon: "🌍", key: "w2" },
  { icon: "🔗", key: "w3" },
  { icon: "🔐", key: "w4" },
  { icon: "🧩", key: "w5" },
  { icon: "📱", key: "w6" },
];

export function WhySection({ t }: WhySectionProps) {
  return (
    <section className="py-24" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("why_headline")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map(({ icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                {icon}
              </div>
              <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                {t(key)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
