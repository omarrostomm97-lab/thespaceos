import { Gamepad2, Settings, Rocket } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: Gamepad2,
    title: "Discover your setup",
    desc: "Tell us about your business and how you operate.",
  },
  {
    num: 2,
    icon: Settings,
    title: "Configure your space",
    desc: "We take the system to your items, services and workflows.",
  },
  {
    num: 3,
    icon: Rocket,
    title: "Go live & grow",
    desc: "Launch fast and start running your business better.",
  },
];

export function HowItWorksSection() {
  return (
    <section style={{ background: "#050B18", padding: "96px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#2563EB", marginBottom: 16,
          }}>Simple. Fast. Powerful.</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "white", lineHeight: 1.15 }}>
            How it works
          </h2>
        </div>

        {/* Steps row */}
        <div style={{ position: "relative" }}>
          {/* Dashed connector line - desktop only */}
          <div className="lp-step-line">
            <svg width="100%" height="2" style={{ overflow: "visible" }}>
              <line x1="16.7%" y1="1" x2="83.3%" y2="1"
                stroke="#1E3A5F" strokeWidth="1.5"
                strokeDasharray="8 5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="lp-steps-grid">
            {steps.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                {/* Step circle */}
                <div style={{ position: "relative", marginBottom: 28 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 16,
                    background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={28} color="#2563EB" strokeWidth={1.5} />
                  </div>
                  {/* Number badge */}
                  <div style={{
                    position: "absolute", top: -10, right: -10,
                    width: 26, height: 26, borderRadius: "50%",
                    background: "#2563EB", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>{num}</div>
                </div>

                <h3 style={{ color: "white", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`
        .lp-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .lp-step-line {
          position: absolute;
          top: 36px;
          left: 0; right: 0;
          pointer-events: none;
        }
        @media (max-width: 640px) {
          .lp-steps-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-step-line { display: none; }
        }
      `}</style>
    </section>
  );
}
