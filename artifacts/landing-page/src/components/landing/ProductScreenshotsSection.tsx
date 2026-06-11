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
}: {
  img: string;
  title: string;
  caption: string;
  alt: string;
}) {
  return (
    <div style={{
      flex: 1,
      background: "#071020",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      {/* Mini chrome bar */}
      <div style={{
        background: "#040C1A",
        padding: "7px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBD2E", display: "block" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#28C840", display: "block" }} />
        <span style={{ marginLeft: 6, color: "#334155", fontSize: 9, letterSpacing: "0.02em" }}>{title}</span>
      </div>

      {/* Screenshot */}
      <div style={{ overflow: "hidden", flex: 1 }}>
        <img
          src={img}
          alt={alt}
          style={{
            width: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "top left",
            maxHeight: 200,
          }}
        />
      </div>

      {/* Caption */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <div style={{ color: "white", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{title}</div>
        <div style={{ color: "#475569", fontSize: 11, lineHeight: 1.5 }}>{caption}</div>
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
            <h2 style={{
              fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700,
              lineHeight: 1.15, marginBottom: 20, color: "white",
            }}>
              Your entire operation,<br />
              <span style={{ color: "#2563EB" }}>connected.</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
              From live sessions to orders, staff, inventory and reporting — The Space OS gives
              you complete visibility and control across every part of your business.
            </p>
            <ul style={{
              listStyle: "none", padding: 0, marginBottom: 36,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {bullets.map(b => (
                <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#2563EB",
                    flexShrink: 0, marginTop: 7,
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
                padding: "10px 18px", fontFamily: "inherit",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >
              Explore All Features <ArrowRight size={14} />
            </button>
          </div>

          {/* Right — two preview cards side by side */}
          <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
            <PreviewCard
              img={IMG_DASHBOARD}
              title="Command Center"
              caption="Live overview of shifts, revenue, sessions and orders."
              alt="Dashboard overview"
            />
            <PreviewCard
              img={IMG_SESSIONS}
              title="Rooms & Sessions"
              caption="Check availability, start sessions, manage all spaces."
              alt="Rooms and sessions management"
            />
          </div>

        </div>
      </div>

      <style>{`
        .lp-connected-grid {
          display: grid;
          grid-template-columns: 42% 58%;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .lp-connected-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-connected-grid > div:last-child { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
