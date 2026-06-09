import type { TranslationKey } from "@/lib/i18n";

interface MobileBottomCTAProps {
  t: (key: TranslationKey) => string;
}

export function MobileBottomCTA({ t }: MobileBottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-slate-900/[0.97] backdrop-blur-md border-t border-white/[0.08] pb-[env(safe-area-inset-bottom,_0px)]">
      <div className="px-4 py-3">
        <a
          href="#demo"
          className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white bg-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-200 active:scale-95"
        >
          {t("nav_request_demo")} →
        </a>
      </div>
    </div>
  );
}
