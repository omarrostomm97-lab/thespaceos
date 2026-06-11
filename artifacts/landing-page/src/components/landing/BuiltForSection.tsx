import { ArrowRight } from "lucide-react";

const venues = [
  {
    name: "Gaming Lounges",
    desc: "Session control, device management, and gaming time tracking.",
    gradient: "linear-gradient(135deg, #1a2744 0%, #0d1a38 100%)",
    accent: "#3B82F6",
  },
  {
    name: "Coworking Spaces",
    desc: "Desk & room bookings, memberships, and flexible workspace management.",
    gradient: "linear-gradient(135deg, #1a2a1a 0%, #0d1f0d 100%)",
    accent: "#22C55E",
  },
  {
    name: "Cafés",
    desc: "Orders, menu, POS, and kitchen display — simplified.",
    gradient: "linear-gradient(135deg, #2a1f10 0%, #1a1208 100%)",
    accent: "#F59E0B",
  },
  {
    name: "Restaurants",
    desc: "Table management, kitchen workflows and order automation.",
    gradient: "linear-gradient(135deg, #2a1010 0%, #1a0808 100%)",
    accent: "#EF4444",
  },
  {
    name: "Other Service Spaces",
    desc: "Salons, clinics, studios and more — all in one system.",
    gradient: "linear-gradient(135deg, #1a1a2a 0%, #0d0d1a 100%)",
    accent: "#8B5CF6",
  },
];

export function BuiltForSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="solutions" style={{ background: "#0D1F3C", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-builtfor-grid">

          {/* Left */}
          <div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
              <span style={{ color: "white" }}>Built for</span><br />
              <span style={{ color: "#2563EB" }}>modern operations</span>
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 340 }}>
              One platform that adapts to the way you run your business.
            </p>
            <button onClick={() => scrollTo("demo")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                color: "#2563EB", fontSize: 14, fontWeight: 600, padding: 0, fontFamily: "inherit",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")}
              onMouseLeave={e => (e.currentTarget.style.color = "#2563EB")}
            >
              See how it works <ArrowRight size={14} />
            </button>
          </div>

          {/* Right — venue cards grid */}
          <div className="lp-venue-grid">
            {venues.map((v) => (
              <div key={v.name}
                style={{
                  background: v.gradient, borderRadius: 12, padding: "24px",
                  border: "1px solid rgba(255,255,255,0.08)", cursor: "default",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = v.accent + "55";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.accent, marginBottom: 14 }} />
                <div style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{v.name}</div>
                <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <style>{`
        .lp-builtfor-grid {
          display: grid;
          grid-template-columns: 35% 65%;
          gap: 64px;
          align-items: center;
        }
        .lp-venue-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .lp-venue-grid > *:last-child:nth-child(odd) {
          grid-column: 1 / -1;
        }
        @media (max-width: 900px) {
          .lp-builtfor-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-venue-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 500px) {
          .lp-venue-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
