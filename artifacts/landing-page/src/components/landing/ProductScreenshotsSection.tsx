import { ArrowRight } from "lucide-react";

const HERO_IMG = "/landing-page/ChatGPT_Image_Jun_11,_2026,_10_21_54_PM_1781205824750.png";

const bullets = [
  "Real-time session and room control",
  "POS orders with kitchen display",
  "Staff scheduling and shift management",
  "Secure payments and multi-method support",
  "Inventory tracking and low stock alerts",
  "Powerful reports and performance insights",
];

function DashCard() {
  return (
    <div style={{
      background: "#0A1628", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden", flex: 1,
    }}>
      <div style={{
        background: "#071020", padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840", display: "block" }} />
        <span style={{ marginLeft: 6, color: "#334155", fontSize: 9 }}>Command Center</span>
      </div>
      <img src={HERO_IMG} alt="Dashboard Preview" style={{
        width: "100%", display: "block", maxHeight: 160,
        objectFit: "cover", objectPosition: "top",
      }} />
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "white", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>Command Center</div>
        <div style={{ color: "#64748B", fontSize: 10 }}>Live overview of sessions, revenue, orders, alerts and performance.</div>
      </div>
    </div>
  );
}

function RoomsCard() {
  const rooms = ["Air Hockey", "BabyFoot", "Billiard", "POS Room 1", "POS Room 2", "VIP Suite"];
  const colors = ["#1E40AF", "#065F46", "#92400E", "#312E81", "#1E3A5F", "#4C1D95"];
  return (
    <div style={{
      background: "#0A1628", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden", flex: 1,
    }}>
      <div style={{
        background: "#071020", padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840", display: "block" }} />
        <span style={{ marginLeft: 6, color: "#334155", fontSize: 9 }}>Rooms & Sessions</span>
      </div>
      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {rooms.map((r, i) => (
          <div key={r} style={{
            background: colors[i] + "22",
            border: `1px solid ${colors[i]}44`,
            borderRadius: 6, padding: "7px 8px",
          }}>
            <div style={{ color: "white", fontSize: 9, fontWeight: 600 }}>{r}</div>
            <div style={{ color: colors[i], fontSize: 8, marginTop: 3, fontWeight: 500 }}>Active</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "white", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>Rooms & Sessions</div>
        <div style={{ color: "#64748B", fontSize: 10 }}>Check availability, start sessions, manage bookings.</div>
      </div>
    </div>
  );
}

export function ProductScreenshotsSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="features" style={{ background: "#050B18", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lp-connected-grid">

          {/* Left */}
          <div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: "white" }}>
              Your entire operation,<br />
              <span style={{ color: "#2563EB" }}>connected.</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
              From live sessions to orders, staff, inventory and reporting — The Space OS gives you complete visibility and control across every part of your business.
            </p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 36, display: "flex", flexDirection: "column", gap: 10 }}>
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
            <button onClick={() => scrollTo("demo")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                color: "white", fontSize: 14, fontWeight: 500, padding: "10px 18px", fontFamily: "inherit",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              Explore All Features <ArrowRight size={14} />
            </button>
          </div>

          {/* Right — two preview cards SIDE BY SIDE */}
          <div style={{ display: "flex", flexDirection: "row", gap: 14, alignItems: "stretch" }}>
            <DashCard />
            <RoomsCard />
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
