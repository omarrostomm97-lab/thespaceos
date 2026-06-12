import {
  LayoutGrid, ShoppingCart, ChefHat, Users, CreditCard,
  Package, BarChart3, MapPin, Shield, Languages,
} from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const FEATURE_ITEMS: { icon: typeof LayoutGrid; nameKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: LayoutGrid,   nameKey: "fi1_name",  descKey: "fi1_desc" },
  { icon: ShoppingCart, nameKey: "fi2_name",  descKey: "fi2_desc" },
  { icon: ChefHat,      nameKey: "fi3_name",  descKey: "fi3_desc" },
  { icon: Users,        nameKey: "fi4_name",  descKey: "fi4_desc" },
  { icon: CreditCard,   nameKey: "fi5_name",  descKey: "fi5_desc" },
  { icon: Package,      nameKey: "fi6_name",  descKey: "fi6_desc" },
  { icon: BarChart3,    nameKey: "fi7_name",  descKey: "fi7_desc" },
  { icon: MapPin,       nameKey: "fi8_name",  descKey: "fi8_desc" },
  { icon: Shield,       nameKey: "fi9_name",  descKey: "fi9_desc" },
  { icon: Languages,    nameKey: "fi10_name", descKey: "fi10_desc" },
];

export function FeaturesSection() {
  const { t, dir } = useLangCtx();

  return (
    <section style={{ background: "#F8FAFC", padding: "96px 24px", direction: dir }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
            color: "#2563EB", marginBottom: 16,
          }}>{t("feat_eyebrow")}</p>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
            lineHeight: 1.15, color: "#0F172A",
          }}>
            {t("feat_h2")}{" "}
            <span style={{ color: "#94A3B8", fontWeight: 400 }}>{t("feat_h2_gray")}</span>
          </h2>
        </div>

        <div className="lp-features-grid">
          {FEATURE_ITEMS.map(({ icon: Icon, nameKey, descKey }) => (
            <div key={nameKey}
              style={{
                background: "white", border: "1px solid #E2E8F0",
                borderRadius: 14, padding: "22px 20px",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(37,99,235,0.3)";
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 8px 24px rgba(37,99,235,0.08)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "#E2E8F0";
                el.style.transform = "none";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color="#2563EB" strokeWidth={1.75} />
              </div>
              <div style={{ color: "#0F172A", fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{t(nameKey)}</div>
              <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.65 }}>{t(descKey)}</div>
            </div>
          ))}
        </div>

      </div>
      <style>{`
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        @media (max-width: 1024px) { .lp-features-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px)  { .lp-features-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </section>
  );
}
