import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";
import dashboardImg from "@assets/dashboard_owner_screenshot_1780963787697.png";
// @ts-ignore — filename contains commas; Vite resolves it correctly at runtime
import sessionsImg from "@assets/ChatGPT_Image_Jun_9,_2026,_03_16_41_AM_1780964285641.png";

interface ProductScreenshotsSectionProps {
  t: (key: TranslationKey) => string;
}

const screenshots: Array<{
  titleKey: TranslationKey;
  descKey: TranslationKey;
  src: string;
  accent: string;
}> = [
  {
    titleKey: "ss_sessions",
    descKey: "ss_sessions_desc",
    src: sessionsImg,
    accent: "#3b82f6",
  },
  {
    titleKey: "ss_orders",
    descKey: "ss_orders_desc",
    src: dashboardImg,
    accent: "#f59e0b",
  },
  {
    titleKey: "ss_reports",
    descKey: "ss_reports_desc",
    src: dashboardImg,
    accent: "#8b5cf6",
  },
  {
    titleKey: "ss_staff",
    descKey: "ss_staff_desc",
    src: dashboardImg,
    accent: "#10b981",
  },
];

export function ProductScreenshotsSection({
  t,
}: ProductScreenshotsSectionProps) {
  return (
    <section id="product" className="py-20 sm:py-28 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="section-eyebrow text-slate-500 mb-3">
            {t("eyebrow_product")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-[-0.02em]">
            {t("ss_headline")}
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            {t("ss_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {screenshots.map(({ titleKey, descKey, src, accent }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-900/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_8px_32px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-200"
            >
              {/* Real screenshot — dark header, crops to top 220px */}
              <div
                className="overflow-hidden max-h-[220px]"
                style={{
                  background:
                    "linear-gradient(170deg, #141d2e 0%, #0f172a 60%, #111827 100%)",
                  borderBottom: `2px solid ${accent}`,
                }}
              >
                <img
                  src={src}
                  alt={t(titleKey)}
                  className="w-full block object-cover object-top"
                  loading="lazy"
                />
              </div>

              {/* Caption with colored left accent bar */}
              <div
                className="flex items-start gap-3 px-5 py-4"
                style={{ borderLeft: `3px solid ${accent}` }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: accent }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                    {t(titleKey)}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
