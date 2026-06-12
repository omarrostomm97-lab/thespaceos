import { Activity, ShoppingCart, ChefHat, Users, CreditCard, BarChart3, Package } from "lucide-react";

const features = [
  { icon: Activity, label: "جلسات مباشرة", sub: "تحكم فوري وكامل" },
  { icon: ShoppingCart, label: "نقطة البيع والطلبات", sub: "سريع ودقيق" },
  { icon: ChefHat, label: "شاشة المطبخ", sub: "سير عمل ذكي" },
  { icon: Users, label: "الموظفون والشيفتات", sub: "الشخص المناسب في وقته" },
  { icon: CreditCard, label: "المدفوعات", sub: "جميع طرق الدفع" },
  { icon: BarChart3, label: "التقارير", sub: "بيانات تساعدك تكبر" },
  { icon: Package, label: "المخزون", sub: "تتبع وإدارة كاملة" },
];

export function ProblemsSection() {
  return (
    <section style={{
      background: "#0A1628",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "28px 24px",
      direction: "rtl",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-strip-grid">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color="#2563EB" strokeWidth={1.75} />
              </div>
              <div>
                <div style={{ color: "white", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{label}</div>
                <div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.3 }}>{sub}</div>
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
