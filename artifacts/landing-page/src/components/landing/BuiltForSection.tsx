import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface BuiltForSectionProps {
  t: (key: TranslationKey) => string;
}

const audiences: Array<{
  nameKey: TranslationKey;
  descKey: TranslationKey;
  accentBg: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  icon: React.ReactNode;
}> = [
  {
    nameKey: "bf1_name",
    descKey: "bf1_desc",
    accentBg: "bg-blue-500/50",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
    iconColor: "text-blue-500",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    nameKey: "bf2_name",
    descKey: "bf2_desc",
    accentBg: "bg-cyan-500/50",
    iconBg: "bg-cyan-500/10",
    iconBorder: "border-cyan-500/20",
    iconColor: "text-cyan-500",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    nameKey: "bf3_name",
    descKey: "bf3_desc",
    accentBg: "bg-amber-500/50",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    iconColor: "text-amber-500",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    nameKey: "bf4_name",
    descKey: "bf4_desc",
    accentBg: "bg-emerald-500/50",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    iconColor: "text-emerald-500",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
  {
    nameKey: "bf5_name",
    descKey: "bf5_desc",
    accentBg: "bg-violet-500/50",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/20",
    iconColor: "text-violet-500",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
      </svg>
    ),
  },
];

export function BuiltForSection({ t }: BuiltForSectionProps) {
  return (
    <section id="built-for" className="py-20 sm:py-28 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="block text-[11px] font-bold tracking-[0.12em] uppercase text-purple-600 mb-3">
            {t("eyebrow_built_for")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-[-0.02em]">
            {t("built_for_headline")}
          </h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
            {t("built_for_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {audiences.map(({ icon, nameKey, descKey, accentBg, iconBg, iconBorder, iconColor }, i) => (
            <motion.div
              key={nameKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="relative bg-white border border-slate-900/[0.07] shadow-md rounded-2xl p-7 flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-[3px] ${accentBg}`} />
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border ${iconBg} ${iconBorder} ${iconColor}`}>
                {icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{t(nameKey)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
