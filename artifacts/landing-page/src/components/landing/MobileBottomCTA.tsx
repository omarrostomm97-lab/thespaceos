import type { TranslationKey } from "@/lib/i18n";

interface MobileBottomCTAProps {
  t: (key: TranslationKey) => string;
}

export function MobileBottomCTA({ t }: MobileBottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <div className="bg-[#0a1628]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <a
          href="#demo"
          className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg"
        >
          {t("hero_cta_primary")}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
