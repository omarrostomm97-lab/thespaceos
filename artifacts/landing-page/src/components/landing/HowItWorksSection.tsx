import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface HowItWorksSectionProps {
  t: (key: TranslationKey) => string;
  dir: string;
}

const steps = [
  { num: "01", titleKey: "how1_title" as TranslationKey, descKey: "how1_desc" as TranslationKey, icon: "✍️" },
  { num: "02", titleKey: "how2_title" as TranslationKey, descKey: "how2_desc" as TranslationKey, icon: "🛠️" },
  { num: "03", titleKey: "how3_title" as TranslationKey, descKey: "how3_desc" as TranslationKey, icon: "🚀" },
];

export function HowItWorksSection({ t, dir }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-slate-900"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("how_headline")}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute top-12 hidden lg:block"
            style={{
              left: dir === "rtl" ? "auto" : "calc(16.66% + 40px)",
              right: dir === "rtl" ? "calc(16.66% + 40px)" : "auto",
              width: "calc(66.66% - 80px)",
              height: "2px",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              opacity: 0.3,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {steps.map(({ num, titleKey, descKey, icon }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl relative z-10"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    className="absolute -top-2 -end-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "#0f172a", border: "2px solid #3b82f6" }}
                  >
                    {num.replace("0", "")}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold text-slate-900 mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t(titleKey)}
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-xs">{t(descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
