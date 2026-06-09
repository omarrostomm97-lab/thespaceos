import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface ProductScreenshotsSectionProps {
  t: (key: TranslationKey) => string;
}

const base = import.meta.env.BASE_URL;
const dashboardImg = `${base}screenshots/dashboard.png`;
const sessionsImg = `${base}screenshots/sessions.png`;

const screenshots: Array<{
  titleKey: TranslationKey;
  descKey: TranslationKey;
  src: string;
  screenshotBorder: string;
  captionBorder: string;
  dotBg: string;
}> = [
  {
    titleKey: "ss_sessions",
    descKey: "ss_sessions_desc",
    src: sessionsImg,
    screenshotBorder: "border-b-2 border-b-blue-500",
    captionBorder: "border-l-[3px] border-l-blue-500",
    dotBg: "bg-blue-500",
  },
  {
    titleKey: "ss_orders",
    descKey: "ss_orders_desc",
    src: dashboardImg,
    screenshotBorder: "border-b-2 border-b-amber-500",
    captionBorder: "border-l-[3px] border-l-amber-500",
    dotBg: "bg-amber-500",
  },
  {
    titleKey: "ss_reports",
    descKey: "ss_reports_desc",
    src: dashboardImg,
    screenshotBorder: "border-b-2 border-b-violet-500",
    captionBorder: "border-l-[3px] border-l-violet-500",
    dotBg: "bg-violet-500",
  },
  {
    titleKey: "ss_staff",
    descKey: "ss_staff_desc",
    src: dashboardImg,
    screenshotBorder: "border-b-2 border-b-emerald-500",
    captionBorder: "border-l-[3px] border-l-emerald-500",
    dotBg: "bg-emerald-500",
  },
];

export function ProductScreenshotsSection({ t }: ProductScreenshotsSectionProps) {
  return (
    <section id="product" className="py-24 sm:py-32 bg-[#f8fafc] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p className="block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-4">
            {t("eyebrow_product")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-[-0.02em]">
            {t("ss_headline")}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {t("ss_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7">
          {screenshots.map(({ titleKey, descKey, src, screenshotBorder, captionBorder, dotBg }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-900/[0.07] shadow-md hover:-translate-y-1 transition-transform duration-200"
            >
              <div className={`overflow-hidden max-h-[240px] bg-[#0f172a] ${screenshotBorder}`}>
                <img
                  src={src}
                  alt={t(titleKey)}
                  className="w-full block object-cover object-top"
                  loading="lazy"
                />
              </div>
              <div className={`flex items-start gap-4 px-6 py-5 ${captionBorder}`}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dotBg}`} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{t(titleKey)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(descKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
