import { useState } from "react";
import { Gamepad2, Building2, Coffee, Utensils, MoreHorizontal } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const TAB_DEFS: { icon: typeof Gamepad2; labelKey: TranslationKey }[] = [
  { icon: Gamepad2,      labelKey: "sp_tab1" },
  { icon: Building2,     labelKey: "sp_tab2" },
  { icon: Coffee,        labelKey: "sp_tab3" },
  { icon: Utensils,      labelKey: "sp_tab4" },
  { icon: MoreHorizontal, labelKey: "sp_tab5" },
];

export function SocialProofSection() {
  const { t, dir } = useLangCtx();
  const [active, setActive] = useState(0);

  return (
    <section style={{ background: "#F1F5F9", padding: "32px 24px", direction: dir }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
          color: "#2563EB", marginBottom: 20, textAlign: "center",
        }}>{t("sp_eyebrow")}</p>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
          {TAB_DEFS.map(({ icon: Icon, labelKey }, i) => (
            <button
              key={labelKey}
              onClick={() => setActive(i)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer", fontFamily: "inherit",
                padding: "10px 18px", borderRadius: 24,
                border: active === i ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
                background: active === i ? "white" : "transparent",
                color: active === i ? "#0F172A" : "#64748B",
                fontWeight: active === i ? 700 : 500,
                fontSize: 14,
                boxShadow: active === i ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              <Icon size={16} strokeWidth={1.75} color={active === i ? "#2563EB" : "#94A3B8"} />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
