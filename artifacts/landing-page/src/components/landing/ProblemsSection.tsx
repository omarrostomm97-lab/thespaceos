import { motion } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface ProblemsSectionProps {
  t: (key: TranslationKey) => string;
}

const problems: Array<{
  icon: React.ReactNode;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}> = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    titleKey: "p1_title",
    descKey: "p1_desc",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    titleKey: "p2_title",
    descKey: "p2_desc",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    titleKey: "p3_title",
    descKey: "p3_desc",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    titleKey: "p4_title",
    descKey: "p4_desc",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    titleKey: "p5_title",
    descKey: "p5_desc",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6s1-1 4-1 4 2 7 2 4-1 4-1V3s-1 1-4 1-4-2-7-2-4 1-4 1v3z" /><path d="M1 12s1-1 4-1 4 2 7 2 4-1 4-1V9s-1 1-4 1-4-2-7-2-4 1-4 1v3z" /><path d="M1 18s1-1 4-1 4 2 7 2 4-1 4-1v-3s-1 1-4 1-4-2-7-2-4 1-4 1v3z" />
      </svg>
    ),
    titleKey: "p6_title",
    descKey: "p6_desc",
  },
];

export function ProblemsSection({ t }: ProblemsSectionProps) {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="block text-[11px] font-bold tracking-[0.12em] uppercase text-red-500 mb-3">
            {t("eyebrow_problem")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-[-0.02em]">
            {t("problems_headline")}
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            {t("problems_subheadline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map(({ icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="relative bg-white border border-slate-900/[0.07] shadow-md rounded-2xl p-7 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Red top accent stripe */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-red-500/50" />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 bg-red-500/10 border border-red-500/20 text-red-500">
                {icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
