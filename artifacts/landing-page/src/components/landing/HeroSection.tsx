const HERO_IMG = `${import.meta.env.BASE_URL}hero-rooms.png`;

export function HeroSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section style={{
      background: "#050B18",
      minHeight: "90vh",
      paddingTop: 64,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      alignItems: "center",
    }}>
      {/* Background glow — left */}
      <div style={{
        position: "absolute", top: "10%", left: "-10%",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Background glow — right, animated */}
      <div className="lp-glow-pulse" style={{
        position: "absolute", top: "5%", right: "-5%",
        width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Bottom glow */}
      <div style={{
        position: "absolute", bottom: "-5%", left: "40%",
        width: 500, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 32px", width: "100%" }}>
        <div className="lp-hero-grid">

          {/* ── Left column ── */}
          <div className="lp-hero-left">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
              borderRadius: 20, padding: "5px 14px", marginBottom: 24,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "#2563EB",
                display: "block", boxShadow: "0 0 6px rgba(37,99,235,0.8)",
              }} />
              <span style={{ color: "#93C5FD", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
                The All-in-One Operations Platform
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(42px, 5.5vw, 68px)", fontWeight: 800,
              lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: 24, color: "white",
            }}>
              One System.<br />
              <span style={{
                color: "#2563EB",
                textShadow: "0 0 40px rgba(37,99,235,0.5)",
              }}>Total Control.</span>
            </h1>

            <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.75, marginBottom: 10, maxWidth: 460 }}>
              The Space OS is the all-in-one operations platform for gaming lounges, coworking
              spaces, cafés, restaurants, and other physical businesses.
            </p>
            <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              Manage sessions, orders, staff, shifts, payments, inventory, and reports —
              in one powerful system.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <button
                onClick={() => scrollTo("demo")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#2563EB", color: "white", border: "none",
                  borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 600,
                  padding: "14px 28px", fontFamily: "inherit",
                  boxShadow: "0 4px 32px rgba(37,99,235,0.45)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#1D4ED8";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 40px rgba(37,99,235,0.55)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#2563EB";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 32px rgba(37,99,235,0.45)";
                }}
              >
                Request a Demo →
              </button>
              <button
                onClick={() => scrollTo("features")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.04)", color: "white",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, cursor: "pointer",
                  fontSize: 15, fontWeight: 500, padding: "14px 28px", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Explore Features
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { main: "Arabic ✦ English", sub: "Bilingual Operations" },
                { main: "🇪🇬 Built in Egypt", sub: "For ambitious businesses" },
              ].map(b => (
                <div key={b.main} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10, padding: "8px 14px",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600 }}>{b.main}</span>
                  <span style={{ color: "#334155", fontSize: 11 }}>·</span>
                  <span style={{ color: "#64748B", fontSize: 12 }}>{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — animated browser mockup ── */}
          <div className="lp-hero-right">
            {/* Outer glow ring that pulses */}
            <div className="lp-mockup-glow" />

            {/* Floating wrapper */}
            <div className="lp-mockup-float">
              {/* Browser frame */}
              <div style={{
                background: "#0A1628",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                overflow: "hidden",
                position: "relative",
                boxShadow: `
                  0 0 0 1px rgba(37,99,235,0.15),
                  0 20px 60px rgba(0,0,0,0.7),
                  0 0 80px rgba(37,99,235,0.2),
                  inset 0 1px 0 rgba(255,255,255,0.08)
                `,
              }}>
                {/* Chrome bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 16px",
                  background: "linear-gradient(180deg, #0D1A2D 0%, #071020 100%)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}>
                  {/* macOS dots */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <span style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: "#FF5F57",
                      display: "block",
                      boxShadow: "0 0 4px rgba(255,95,87,0.6)",
                    }} />
                    <span style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: "#FFBD2E",
                      display: "block",
                      boxShadow: "0 0 4px rgba(255,189,46,0.5)",
                    }} />
                    <span style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: "#28C840",
                      display: "block",
                      boxShadow: "0 0 4px rgba(40,200,64,0.5)",
                    }} />
                  </div>

                  {/* URL bar */}
                  <div style={{
                    flex: 1, marginLeft: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6, height: 26,
                    display: "flex", alignItems: "center", padding: "0 10px",
                    gap: 6,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span style={{ fontSize: 11, color: "#64748B", letterSpacing: "0.01em" }}>
                      app.thespaceos.com
                    </span>
                  </div>
                </div>

                {/* Screenshot */}
                <img
                  src={HERO_IMG}
                  alt="The Space OS — Rooms & Sessions"
                  style={{ width: "100%", display: "block" }}
                  loading="eager"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* ── Layout ── */
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 46% 54%;
          gap: 56px;
          align-items: center;
          width: 100%;
        }
        .lp-hero-left { display: flex; flex-direction: column; }
        .lp-hero-right { position: relative; }

        /* ── Floating animation ── */
        @keyframes lp-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
        .lp-mockup-float {
          animation: lp-float 4.5s ease-in-out infinite;
          will-change: transform;
        }

        /* ── Glow pulse behind mockup ── */
        @keyframes lp-glow-pulse {
          0%   { opacity: 0.6; transform: scale(1); }
          50%  { opacity: 1;   transform: scale(1.08); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        .lp-mockup-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 85%;
          height: 70%;
          background: radial-gradient(ellipse at center, rgba(37,99,235,0.35) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: lp-glow-pulse 4.5s ease-in-out infinite;
        }
        .lp-hero-right > .lp-mockup-float {
          position: relative;
          z-index: 1;
        }

        /* ── Background glow pulse ── */
        @keyframes lp-bg-pulse {
          0%   { opacity: 0.7; }
          50%  { opacity: 1;   }
          100% { opacity: 0.7; }
        }
        .lp-glow-pulse {
          animation: lp-bg-pulse 6s ease-in-out infinite;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .lp-hero-grid { grid-template-columns: 48% 52%; gap: 40px; }
        }
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-hero-right { order: -1; max-width: 600px; margin: 0 auto; }
        }
        @media (max-width: 480px) {
          .lp-hero-right { max-width: 100%; }
        }
      `}</style>
    </section>
  );
}
