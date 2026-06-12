import { useState } from "react";
import { Gamepad2, Building2, Coffee, Utensils, MoreHorizontal } from "lucide-react";

const tabs = [
  { icon: Gamepad2, label: "محلات البلايستيشن والجيمينج" },
  { icon: Building2, label: "مساحات العمل المشتركة" },
  { icon: Coffee, label: "الكافيهات" },
  { icon: Utensils, label: "المطاعم" },
  { icon: MoreHorizontal, label: "وأنشطة أخرى" },
];

export function SocialProofSection() {
  const [active, setActive] = useState(0);

  return (
    <section style={{ background: "#F1F5F9", padding: "32px 24px", direction: "rtl" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
          color: "#2563EB", marginBottom: 20, textAlign: "center",
        }}>مصمم للأنشطة التجارية الحديثة</p>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
          {tabs.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              onClick={() => setActive(i)}
              style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit",
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
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
