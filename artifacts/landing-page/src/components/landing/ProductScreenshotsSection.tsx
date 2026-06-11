import { useState } from "react";
import { ArrowRight } from "lucide-react";

const IMG_DASHBOARD = `${import.meta.env.BASE_URL}hero-dashboard.png`;
const IMG_SESSIONS  = `${import.meta.env.BASE_URL}hero-sessions.png`;

const bullets = [
  "Real-time session and room control",
  "POS orders with kitchen display",
  "Staff scheduling and shift management",
  "Secure payments and multi-method support",
  "Inventory tracking and low stock alerts",
  "Powerful reports and performance insights",
];

function PreviewCard({
  img,
  title,
  caption,
  alt,
  accentColor = "#2563EB",
}: {
  img: string;
  title: string;
  caption: string;
  alt: string;
  accentColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        background: "#071020",
        borderRadius: 14,
        border: `1px solid ${hovered ? accentColor + "55" : "rgba(255,255,255,0.1)"}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hovered
          ? `0 12px 48px rgba(0,0,0,0.6), 0 0 32px ${accentColor}22`
          : "0 8px 32px rgba(0,0,0,0.5)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "default",
      }}
    >
      {/* Mini chrome bar */}
      <div style={{
        background: "#040C1A",
        padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: c, display: "block",
            }} />
          ))}
        </div>
        <div style={{
          marginLeft: 6, flex: 1,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 4, height: 18,
          display: "flex", alignItems: "center", padding: "0 8px",
        }}>
          <span style={{ color: "#334155", fontSize: 9, letterSpacing: "0.02em" }}>
            app.thespaceos.com
          </span>
        </div>
      </div>

      {/* Screenshot with gradient overlay */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <img
          src={img}
          alt={alt}
          style={{
            width: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "top left",
            aspectRatio: "16 / 10",
            maxHeight: 220,
          }}
        />
        {/* Bottom fade gradient */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
          background: "linear-gradient(to bottom, transparent, #071020)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Caption */}
      <div style={{
        padding: "12px 14px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        background: hovered ? "rgba(37,99,235,0.04)" : "transparent",
        transition: "background 0.3s",
      }}>
        <div style={{
          color: "white", fontSize: 12, fontWeight: 700,
          marginBottom: 4, letterSpacing: "0.01em",
        }}>{title}</div>
        <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.55 }}>{caption}</div>
      </div>
    </div>
  );
}

export function ProductScreenshotsSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="features" style={{ background: "#050B18", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-connected-grid">

          {/* Left — text */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#2563EB", marginBottom: 14,
            }}>Platform Overview</p>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700,
              lineHeight: 1.15, marginBottom: 18, color: "white",
            }}>
              Your entire operation,<br />
              <span style={{ color: "#2563EB" }}>connected.</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.75, marginBottom: 28, maxWidth: 400 }}>
              From live sessions to orders, staff, inventory and reporting — The Space OS gives
              you complete visibility and control across every part of your business.
            </p>
            <ul style={{
              listStyle: "none", padding: 0, marginBottom: 36,
              display: "flex", flexDirection: "column", gap: 9,
            }}>
              {bullets.map(b => (
                <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#2563EB",
                    flexShrink: 0, marginTop: 8,
                    boxShadow: "0 0 6px rgba(37,99,235,0.6)",
                  }} />
                  <span style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6 }}>{b}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => scrollTo("demo")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8, color: "white", fontSize: 14, fontWeight: 500,
                padding: "10px 20px", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Explore All Features <ArrowRight size={14} />
            </button>
          </div>

          {/* Right — two preview cards */}
          <div className="lp-cards-row">
            <PreviewCard
              img={IMG_DASHBOARD}
              title="Command Center"
              caption="Live overview of shifts, revenue, sessions and orders."
              alt="Dashboard overview"
              accentColor="#2563EB"
            />
            <PreviewCard
              img={IMG_SESSIONS}
              title="Rooms & Sessions"
              caption="Check availability, start sessions, manage all spaces."
              alt="Rooms and sessions management"
              accentColor="#6366F1"
            />
          </div>

        </div>
      </div>

      <style>{`
        .lp-connected-grid {
          display: grid;
          grid-template-columns: 40% 60%;
          gap: 64px;
          align-items: center;
        }
        .lp-cards-row {
          display: flex;
          flex-direction: row;
          gap: 16px;
          align-items: stretch;
        }
        .lp-cards-row > * {
          min-width: 0;
        }
        @media (max-width: 1024px) {
          .lp-connected-grid { grid-template-columns: 45% 55%; gap: 48px; }
        }
        @media (max-width: 900px) {
          .lp-connected-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 600px) {
          .lp-cards-row { flex-direction: column; }
        }
      `}</style>
    </section>
  );
}
