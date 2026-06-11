import { useState } from "react";
import { ArrowRight } from "lucide-react";

const IMG_ROOMS    = `${import.meta.env.BASE_URL}hero-rooms.png`;
const IMG_SESSIONS = `${import.meta.env.BASE_URL}hero-sessions.png`;
const IMG_DASH     = `${import.meta.env.BASE_URL}hero-dashboard.png`;

const spaces = [
  {
    name: "Gaming Lounges",
    desc: "Session control, device management, and gaming time tracking.",
    accent: "#3B82F6",
    img: IMG_ROOMS,
  },
  {
    name: "Coworking Spaces",
    desc: "Desk & room bookings, members, and workspace management.",
    accent: "#22C55E",
    img: IMG_SESSIONS,
  },
  {
    name: "Cafés",
    desc: "Orders, menu, POS, and kitchen workflow simplified.",
    accent: "#F59E0B",
    img: IMG_DASH,
  },
  {
    name: "Restaurants",
    desc: "Table management, kitchen display, and order automation.",
    accent: "#EF4444",
    img: IMG_SESSIONS,
  },
  {
    name: "Other Businesses",
    desc: "Salons, clinics, studios, and more — all in one system.",
    accent: "#8B5CF6",
    img: IMG_DASH,
  },
];

function SpaceCard({ name, desc, accent, img }: (typeof spaces)[0]) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#07121F",
        borderRadius: 14,
        border: `1px solid ${hov ? accent + "44" : "rgba(255,255,255,0.08)"}`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.4), 0 0 24px ${accent}11` : "none",
      }}
    >
      {/* Screenshot crop */}
      <div style={{ position: "relative", overflow: "hidden", height: 110 }}>
        <img
          src={img} alt={name}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "top left",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
        {/* Gradient scrim */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, transparent 30%, #07121F 100%)`,
        }} />
        {/* Accent dot */}
        <div style={{
          position: "absolute", top: 10, left: 12,
          width: 8, height: 8, borderRadius: "50%", background: accent,
          boxShadow: `0 0 8px ${accent}`,
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 18px" }}>
        <p style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{name}</p>
        <p style={{ color: "#475569", fontSize: 12, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

export function BuiltForSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="solutions" style={{ background: "#050B18", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-builtfor-grid">

          {/* Left */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#2563EB", marginBottom: 16,
            }}>Built for modern spaces</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700,
              lineHeight: 1.12, marginBottom: 20,
            }}>
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
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#60A5FA")}
              onMouseLeave={e => (e.currentTarget.style.color = "#2563EB")}
            >
              See how it works <ArrowRight size={14} />
            </button>
          </div>

          {/* Right — cards */}
          <div className="lp-venue-grid">
            {spaces.map(s => <SpaceCard key={s.name} {...s} />)}
          </div>

        </div>
      </div>

      <style>{`
        .lp-builtfor-grid {
          display: grid;
          grid-template-columns: 30% 70%;
          gap: 64px;
          align-items: center;
        }
        .lp-venue-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .lp-venue-grid > *:nth-child(4) { grid-column: 1 / 2; }
        .lp-venue-grid > *:nth-child(5) { grid-column: 2 / 4; }
        @media (max-width: 1024px) {
          .lp-builtfor-grid { grid-template-columns: 32% 68%; gap: 40px; }
          .lp-venue-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-venue-grid > *:nth-child(4),
          .lp-venue-grid > *:nth-child(5) { grid-column: auto; }
          .lp-venue-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        }
        @media (max-width: 900px) {
          .lp-builtfor-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 500px) {
          .lp-venue-grid { grid-template-columns: 1fr; }
          .lp-venue-grid > * { grid-column: auto !important; }
        }
      `}</style>
    </section>
  );
}
