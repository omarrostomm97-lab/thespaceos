import { Activity, ShoppingCart, ChefHat, Users, CreditCard, BarChart3, Package } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { TranslationKey } from "@/lib/i18n";

const STRIP_ITEMS: { icon: typeof Activity; labelKey: TranslationKey; subKey: TranslationKey }[] = [
  { icon: Activity,      labelKey: "strip_sessions",  subKey: "strip_sessions_sub" },
  { icon: ShoppingCart,  labelKey: "strip_pos",       subKey: "strip_pos_sub" },
  { icon: ChefHat,       labelKey: "strip_kitchen",   subKey: "strip_kitchen_sub" },
  { icon: Users,         labelKey: "strip_staff",     subKey: "strip_staff_sub" },
  { icon: CreditCard,    labelKey: "strip_payments",  subKey: "strip_payments_sub" },
  { icon: BarChart3,     labelKey: "strip_reports",   subKey: "strip_reports_sub" },
  { icon: Package,       labelKey: "strip_inventory", subKey: "strip_inventory_sub" },
];

export function ProblemsSection() {
  const { t, dir } = useLangCtx();

  return (
    <section style={{
      background: "#0A1628",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "28px 24px",
      direction: dir,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-strip-grid">
          {STRIP_ITEMS.map(({ icon: Icon, labelKey, subKey }) => (
            <div key={labelKey} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color="#2563EB" strokeWidth={1.75} />
              </div>
              <div>
                <div style={{ color: "white", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{t(labelKey)}</div>
                <div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.3 }}>{t(subKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .lp-strip-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 1024px) { .lp-strip-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
        @media (max-width: 600px) { .lp-strip-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
      `}</style>
    </section>
  );
}
