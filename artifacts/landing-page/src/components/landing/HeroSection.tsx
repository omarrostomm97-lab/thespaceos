const HERO_IMG = `${import.meta.env.BASE_URL}hero-dashboard.png`;

export function HeroSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      style={{
        background:
          "linear-gradient(160deg, #040C1B 0%, #050B18 50%, #040C1B 100%)",
        minHeight: "90vh",
        paddingTop: 64,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)
        `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      {/* Glow — left */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "-8%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Glow — right, animated */}
      <div
        className="lp-glow-pulse"
        style={{
          position: "absolute",
          top: "0%",
          right: "-6%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "64px 32px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="lp-hero-grid">
          {/* ── Left column ── */}
          <div className="lp-hero-left">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.25)",
                borderRadius: 20,
                padding: "5px 14px",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "block",
                  boxShadow: "0 0 8px rgba(37,99,235,0.9)",
                }}
              />
              <span
                style={{
                  color: "#93C5FD",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                The All-in-One Operations Platform
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(44px, 5.5vw, 70px)",
                fontWeight: 800,
                lineHeight: 1.03,
                letterSpacing: "-0.04em",
                marginBottom: 24,
                color: "white",
              }}
            >
              One System.
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Total Control.
              </span>
            </h1>

            <p
              style={{
                fontSize: 16,
                color: "#94A3B8",
                lineHeight: 1.75,
                marginBottom: 10,
                maxWidth: 470,
              }}
            >
              The Space OS is the all-in-one operations platform for gaming
              lounges, coworking spaces, cafés, restaurants, and modern
              businesses.
            </p>
            <p
              style={{
                fontSize: 15,
                color: "#64748B",
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 470,
              }}
            >
              Manage sessions, orders, staff, shifts, payments, inventory, and
              reports — all from one powerful system.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              <button
                onClick={() => scrollTo("demo")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "14px 28px",
                  fontFamily: "inherit",
                  boxShadow: "0 4px 32px rgba(37,99,235,0.45)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1D4ED8";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 40px rgba(37,99,235,0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2563EB";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 32px rgba(37,99,235,0.45)";
                }}
              >
                Request a Demo →
              </button>
              <button
                onClick={() => scrollTo("features")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "14px 28px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              >
                Explore Features
              </button>
            </div>

            {/* Trust pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                "🌐 Arabic + English",
                "🇪🇬 Built in Egypt",
                "🔒 Secure & reliable",
                "🏢 Multi-location ready",
              ].map((p) => (
                <span
                  key={p}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 20,
                    padding: "6px 13px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right column — animated browser mockup ── */}
          <div className="lp-hero-right">
            <div className="lp-mockup-glow" />
            <div className="lp-mockup-float">
              <div
                style={{
                  background: "#0A1628",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: `
                  0 0 0 1px rgba(37,99,235,0.15),
                  0 24px 80px rgba(0,0,0,0.7),
                  0 0 100px rgba(37,99,235,0.18),
                  inset 0 1px 0 rgba(255,255,255,0.08)
                `,
                }}
              >
                {/* Chrome bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    background:
                      "linear-gradient(180deg, #0D1A2D 0%, #071020 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
                      <span
                        key={i}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: c,
                          display: "block",
                          boxShadow: `0 0 5px ${c}88`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 10px",
                      gap: 6,
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2.5"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontSize: 11, color: "#64748B" }}>
                      www.thespaceos.com
                    </span>
                  </div>
                </div>
                <img
                  src={HERO_IMG}
                  alt="The Space OS — Command Center Dashboard"
                  style={{ width: "100%", display: "block" }}
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 44% 56%;
          gap: 56px;
          align-items: center;
          width: 100%;
        }
        .lp-hero-left { display: flex; flex-direction: column; }
        .lp-hero-right { position: relative; }

        @keyframes lp-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
        .lp-mockup-float {
          animation: lp-float 4.5s ease-in-out infinite;
          will-change: transform;
          position: relative;
          z-index: 1;
        }

        @keyframes lp-glow-pulse {
          0%   { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
          50%  { opacity: 0.9;  transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
        }
        .lp-mockup-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 90%; height: 75%;
          background: radial-gradient(ellipse at center, rgba(37,99,235,0.3) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: lp-glow-pulse 4.5s ease-in-out infinite;
        }

        @keyframes lp-bg-pulse {
          0%   { opacity: 0.6; }
          50%  { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .lp-glow-pulse { animation: lp-bg-pulse 6s ease-in-out infinite; }

        @media (max-width: 1024px) {
          .lp-hero-grid { grid-template-columns: 48% 52%; gap: 40px; }
        }
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-hero-right { order: -1; max-width: 580px; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}
