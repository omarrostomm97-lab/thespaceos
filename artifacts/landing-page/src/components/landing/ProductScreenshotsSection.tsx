import { ArrowRight } from "lucide-react";
import heroImg from "@assets/ChatGPT_Image_Jun_11,_2026,_10_21_54_PM_1781205824750.png";

const bullets = [
  "Real-time session and room control",
  "POS orders with kitchen display",
  "Staff scheduling and shift management",
  "Secure payments and multi-method support",
  "Inventory tracking and low stock alerts",
  "Powerful reports and performance insights",
];

function MiniDashCard({ title, caption, isRooms }: { title: string; caption: string; isRooms?: boolean }) {
  return (
    <div style={{
      background: "#0A1628", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden", flex: 1,
    }}>
      {/* Chrome */}
      <div style={{
        background: "#071020", padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E", display: "block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840", display: "block" }} />
      </div>
      {/* Content */}
      {isRooms ? (
        <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {["Air Hockey $50", "Air Hockey $50", "BabyFoot $150", "BabyFoot $150", "Billiard $50", "Billiard $50", "POS Room 1", "POS Room 2"].map((r, i) => (
            <div key={i} style={{
              background: i % 2 === 0 ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 8px",
            }}>
              <div style={{ color: "white", fontSize: 9, fontWeight: 600 }}>{r.split(" $")[0]}</div>
              {r.includes("$") && <div style={{ color: "#2563EB", fontSize: 9, marginTop: 2 }}>${r.split("$")[1]}</div>}
            </div>
          ))}
        </div>
      ) : (
        <img src={heroImg} alt={title} style={{ width: "100%", display: "block", maxHeight: 180, objectFit: "cover", objectPosition: "top" }} />
      )}
      {/* Caption */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "white", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{title}</div>
        <div style={{ color: "#64748B", fontSize: 11 }}>{caption}</div>
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

          {/* Right — two preview cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <MiniDashCard
              title="Command Center Dashboard"
              caption="Live overview of sessions, revenue, orders, alerts and performance — all in real time."
            />
            <MiniDashCard
              title="Rooms & Sessions Management"
              caption="Check room availability, start sessions, and manage bookings across all your spaces."
              isRooms
            />
          </div>

        </div>
      </div>
      <style>{`
        .lp-connected-grid {
          display: grid;
          grid-template-columns: 45% 55%;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .lp-connected-grid { grid-template-columns: 1fr; gap: 48px; }
        }
      `}</style>
    </section>
  );
}
