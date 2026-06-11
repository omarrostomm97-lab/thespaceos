const HERO_IMG = `${import.meta.env.BASE_URL}hero-rooms.png`;

export function HeroSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section style={{
      background: "#050B18",
      minHeight: "100vh",
      paddingTop: 64,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Glow blobs */}
      <div style={{
        position: "absolute", top: -120, left: -80, width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, right: -60, width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div className="lp-hero-grid">

          {/* Left */}
          <div className="lp-hero-left">
            <h1 style={{
              fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 800,
              lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 24, color: "white",
            }}>
              One System.<br />
              <span style={{ color: "#2563EB" }}>Total Control.</span>
            </h1>

            <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7, marginBottom: 12, maxWidth: 480 }}>
              The Space OS is the all-in-one operations platform for gaming lounges, coworking spaces,
              cafés, restaurants, and other physical businesses.
            </p>
            <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
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
                  padding: "13px 24px", fontFamily: "inherit",
                  boxShadow: "0 4px 24px rgba(37,99,235,0.35)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
                onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}
              >
                Request a Demo →
              </button>
              <button
                onClick={() => scrollTo("features")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "transparent", color: "white",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer",
                  fontSize: 15, fontWeight: 500, padding: "13px 24px", fontFamily: "inherit",
                  transition: "background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                Explore Features
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { main: "Arabic ✦ English", sub: "Bilingual Operations" },
                { main: "Built in Egypt", sub: "For ambitious businesses" },
              ].map(b => (
                <div key={b.main} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "8px 14px",
                }}>
                  <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{b.main}</span>
                  <span style={{ color: "#475569", fontSize: 12 }}>·</span>
                  <span style={{ color: "#64748B", fontSize: 12 }}>{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — browser frame */}
          <div className="lp-hero-right">
            <div style={{
              background: "#0A1628",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              boxShadow: "0 0 80px rgba(37,99,235,0.3), 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
            }}>
              {/* Window chrome */}
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 14px",
                background: "#071020",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E", display: "block" }} />
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840", display: "block" }} />
                <div style={{
                  flex: 1, marginLeft: 8, background: "rgba(255,255,255,0.05)",
                  borderRadius: 5, height: 22, display: "flex", alignItems: "center", padding: "0 10px",
                }}>
                  <span style={{ fontSize: 10, color: "#475569" }}>app.thespaceos.com</span>
                </div>
              </div>
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

      <style>{`
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 52% 48%;
          gap: 48px;
          align-items: center;
        }
        .lp-hero-left { display: flex; flex-direction: column; }
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-hero-right { order: -1; }
        }
      `}</style>
    </section>
  );
}
