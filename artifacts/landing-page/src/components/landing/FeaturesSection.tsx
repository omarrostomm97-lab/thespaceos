import {
  LayoutGrid, ShoppingCart, ChefHat, Users, CreditCard,
  Package, BarChart3, MapPin, Shield, Languages,
} from "lucide-react";

const features = [
  { icon: LayoutGrid, label: "الجلسات والغرف",         desc: "إدارة الغرف والأجهزة والجلسات المباشرة بسهولة." },
  { icon: ShoppingCart, label: "نقطة البيع والطلبات",  desc: "إنشاء الطلبات، تطبيق الخصومات، ومعالجة المبيعات." },
  { icon: ChefHat, label: "شاشة المطبخ",              desc: "توجيه الطلبات فورًا إلى المطبخ بدون تأخير." },
  { icon: Users, label: "الموظفون والشيفتات",          desc: "أدوار فورية، حضور وانصراف، وجداول العمل." },
  { icon: CreditCard, label: "المدفوعات",              desc: "قبول الكاش، البطاقات، InstaPay وأكثر." },
  { icon: Package, label: "المخزون",                   desc: "تتبع المخزون، تنبيهات النقص، وتحكم كامل." },
  { icon: BarChart3, label: "التقارير والتحليلات",     desc: "مبيعات، أداء، ورؤى تجارية متعمقة." },
  { icon: MapPin, label: "متعدد الفروع",               desc: "إدارة عدة فروع بسهولة ومن مكان واحد." },
  { icon: Shield, label: "صلاحيات الوصول",             desc: "امنح كل مستخدم صلاحياته المخصصة." },
  { icon: Languages, label: "عربي / إنجليزي",          desc: "دعم كامل لغة عربية وإنجليزية لفريقك." },
];

export function FeaturesSection() {
  return (
    <section style={{ background: "#F8FAFC", padding: "96px 24px", direction: "rtl" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
            color: "#2563EB", marginBottom: 16,
          }}>قوي بتصميمه</p>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
            lineHeight: 1.15, color: "#0F172A",
          }}>
            كل ما تحتاجه.{" "}
            <span style={{ color: "#94A3B8", fontWeight: 400 }}>بلا أي زيادة.</span>
          </h2>
        </div>

        <div className="lp-features-grid">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label}
              style={{
                background: "white",
                border: "1px solid #E2E8F0",
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
              <div style={{ color: "#0F172A", fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{label}</div>
              <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.65 }}>{desc}</div>
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
