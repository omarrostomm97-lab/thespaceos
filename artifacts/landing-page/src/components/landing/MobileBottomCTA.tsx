import type { TranslationKey } from "@/lib/i18n";

interface MobileBottomCTAProps {
  t: (key: TranslationKey) => string;
}

export function MobileBottomCTA({ t }: MobileBottomCTAProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
      style={{
        background: "rgba(15,23,42,0.97)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="px-4 py-3">
        <a
          href="#demo"
          className="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
          style={{ background: "#3b82f6", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }}
        >
          {t("nav_request_demo")} →
        </a>
      </div>
    </div>
  );
}
