import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

const base = import.meta.env.BASE_URL;
const dashboardImg = `${base}screenshots/dashboard.png`;
const sessionsImg = `${base}screenshots/sessions.png`;

interface ProductScreenshotsSectionProps {
  t: (key: TranslationKey) => string;
}

const screenshots: Array<{
  titleKey: TranslationKey;
  descKey: TranslationKey;
  src: string;
  urlPath: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  bullets: TranslationKey[];
}> = [
  {
    titleKey: "ss_sessions",
    descKey: "ss_sessions_desc",
    src: sessionsImg,
    urlPath: "/sessions",
    dotColor: "bg-blue-400",
    badgeBg: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    badgeText: "Live",
    bullets: ["ss_sessions", "ss_orders"],
  },
  {
    titleKey: "ss_orders",
    descKey: "ss_orders_desc",
    src: dashboardImg,
    urlPath: "/dashboard",
    dotColor: "bg-emerald-400",
    badgeBg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    badgeText: "Overview",
    bullets: ["ss_reports", "ss_staff"],
  },
];

export function ProductScreenshotsSection({ t }: ProductScreenshotsSectionProps) {
  return (
    <section id="product" className="py-24 sm:py-32 bg-[#0a1628] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16 sm:mb-20 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-400 mb-4">
            {t("eyebrow_product")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
            {t("ss_headline")}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            {t("ss_subheadline")}
          </p>
        </motion.div>

        {/* Screenshot cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {screenshots.map(({ titleKey, descKey, src, urlPath, dotColor, badgeBg, badgeText, bullets }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="section-frame rounded-2xl overflow-hidden bg-[#1a2438] border border-white/10 flex flex-col"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 h-10 bg-[#141f35] border-b border-white/8 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 flex-shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 flex-shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60 flex-shrink-0" />
                <div className="ml-2 flex-1 bg-white/5 rounded h-5 flex items-center px-3 min-w-0">
                  <span className="text-[10px] text-slate-500 truncate">
                    app.thespaceos.com{urlPath}
                  </span>
                </div>
              </div>

              {/* Screenshot */}
              <div className="overflow-hidden flex-shrink-0">
                <img
                  src={src}
                  alt={t(titleKey)}
                  className="w-full block"
                  loading="lazy"
                />
              </div>

              {/* Caption panel */}
              <div className="p-6 border-t border-white/8 flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-white text-base">{t(titleKey)}</h3>
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${badgeBg}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{t(descKey)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ps-5">
                  {bullets.map((bKey) => (
                    <span
                      key={bKey}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-medium"
                    >
                      {t(bKey)}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
