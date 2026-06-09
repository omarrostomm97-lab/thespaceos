import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface BuiltForSectionProps {
  t: (key: TranslationKey) => string;
}

const audiences: Array<{
  nameKey: TranslationKey;
  descKey: TranslationKey;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  icon: React.ReactNode;
}> = [
  {
    nameKey: "bf1_name", descKey: "bf1_desc",
    gradientFrom: "from-blue-500", gradientTo: "to-indigo-500",
    iconColor: "text-white",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  },
  {
    nameKey: "bf2_name", descKey: "bf2_desc",
    gradientFrom: "from-cyan-500", gradientTo: "to-blue-500",
    iconColor: "text-white",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    nameKey: "bf3_name", descKey: "bf3_desc",
    gradientFrom: "from-amber-500", gradientTo: "to-orange-500",
    iconColor: "text-white",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
  },
  {
    nameKey: "bf4_name", descKey: "bf4_desc",
    gradientFrom: "from-emerald-500", gradientTo: "to-teal-500",
    iconColor: "text-white",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>,
  },
  {
    nameKey: "bf5_name", descKey: "bf5_desc",
    gradientFrom: "from-violet-500", gradientTo: "to-purple-500",
    iconColor: "text-white",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" /></svg>,
  },
];

export function BuiltForSection({ t }: BuiltForSectionProps) {
  return (
    <section id="built-for" className="py-24 sm:py-32 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16 sm:mb-20 max-w-2xl mx-auto"
        >
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-violet-600 mb-4">
            {t("eyebrow_built_for")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
            {t("built_for_headline")}
          </h2>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
            {t("built_for_subheadline")}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {audiences.map(({ nameKey, descKey, gradientFrom, gradientTo, iconColor, icon }, i) => (
            <motion.div
              key={nameKey}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="premium-card rounded-2xl border border-slate-900/[0.07] p-7 overflow-hidden flex flex-col"
            >
              {/* Gradient icon box */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${gradientFrom} ${gradientTo} ${iconColor} shadow-lg flex-shrink-0`}>
                {icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight mb-3">
                {t(nameKey)}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
