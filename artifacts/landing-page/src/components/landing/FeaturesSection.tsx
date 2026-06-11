import {
  LayoutGrid, ShoppingCart, ChefHat, Users, CreditCard,
  Package, BarChart3, MapPin, Shield, Languages,
} from "lucide-react";

const features = [
  { icon: LayoutGrid, label: "Sessions & Rooms", desc: "Manage rooms, devices and live sessions." },
  { icon: ShoppingCart, label: "POS & Orders", desc: "Create orders, apply discounts, process sales." },
  { icon: ChefHat, label: "Kitchen Display", desc: "Route orders instantly to the kitchen." },
  { icon: Users, label: "Staff & Shifts", desc: "Real-time roles, clocks and attendance tracking." },
  { icon: CreditCard, label: "Payments", desc: "Accept cash, card, InstaPay and more." },
  { icon: Package, label: "Inventory", desc: "Track stock, receive alerts, stay in control." },
  { icon: BarChart3, label: "Reports & Analytics", desc: "Sales, performance and business insights." },
  { icon: MapPin, label: "Multi-location", desc: "Manage multiple branches with ease." },
  { icon: Shield, label: "Role-based Access", desc: "Give each user access with custom permissions." },
  { icon: Languages, label: "Arabic / English", desc: "Fully switching support for your team." },
];

export function FeaturesSection() {
  return (
    <section style={{ background: "#050B18", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#2563EB", marginBottom: 16,
          }}>Powerful by Design</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.15, color: "white" }}>
            Everything you need.{" "}
            <span style={{ color: "#94A3B8", fontWeight: 400 }}>Nothing you don't.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="lp-features-grid">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{
              background: "#0A1628", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "24px 20px",
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(37,99,235,0.35)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color="#2563EB" strokeWidth={1.75} />
              </div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{label}</div>
              <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
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
        @media (max-width: 640px) { .lp-features-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </section>
  );
}
