import { useState, useEffect } from "react";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const S = {
    nav: {
      position: "fixed" as const, top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(5,11,24,0.96)" : "#050B18",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.3s ease",
    },
    inner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 },
    logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
    logoBox: {
      width: 34, height: 34, background: "#2563EB", borderRadius: 8,
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 7, flexShrink: 0,
    },
    logoCell: (op: number) => ({ background: "white", borderRadius: 2, opacity: op }),
    logoText: { color: "white", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" },
    navLinks: { display: "flex", alignItems: "center", gap: 2 },
    navBtn: {
      display: "flex", alignItems: "center", gap: 4,
      background: "none", border: "none", cursor: "pointer",
      color: "#94A3B8", fontSize: 14, fontWeight: 500,
      padding: "8px 14px", borderRadius: 8, fontFamily: "inherit",
    },
    right: { display: "flex", alignItems: "center", gap: 8 },
    loginLink: { color: "#94A3B8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 12px" },
    ctaBtn: {
      display: "flex", alignItems: "center", gap: 6,
      background: "#2563EB", color: "white", border: "none", borderRadius: 24, cursor: "pointer",
      fontSize: 14, fontWeight: 600, padding: "9px 20px", fontFamily: "inherit",
    },
    hamburger: { background: "none", border: "none", color: "white", cursor: "pointer", padding: 8 },
    mobileMenu: {
      background: "#0A1628", borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "12px 24px 24px",
    },
    mobileLinkBtn: {
      display: "block", width: "100%", textAlign: "left" as const,
      background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer", color: "#94A3B8", fontSize: 15, fontWeight: 500,
      padding: "14px 0", fontFamily: "inherit",
    },
    mobileCta: {
      marginTop: 16, width: "100%", background: "#2563EB", color: "white",
      border: "none", borderRadius: 12, cursor: "pointer",
      fontSize: 15, fontWeight: 600, padding: "14px", fontFamily: "inherit",
    },
  };

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <div style={S.row}>
          {/* Logo */}
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={S.logo}>
            <div style={S.logoBox}>
              {[1, 1, 1, 0.4].map((op, i) => <div key={i} style={S.logoCell(op)} />)}
            </div>
            <span style={S.logoText}>The Space OS</span>
          </a>

          {/* Desktop Nav */}
          <div style={S.navLinks} className="lp-nav-desktop">
            {[
              { label: "Product", dropdown: true },
              { label: "Solutions", dropdown: true },
              { label: "Features", id: "features" },
              { label: "Demo", id: "demo" },
            ].map(item => (
              <button key={item.label}
                onClick={() => item.id && scrollTo(item.id)}
                style={S.navBtn}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
              >
                {item.label}
                {item.dropdown && <ChevronDown size={13} strokeWidth={2.5} />}
              </button>
            ))}
          </div>

          {/* Desktop Right */}
          <div style={S.right} className="lp-nav-desktop">
            <a href="/gaming-lounge/login" style={S.loginLink}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >Login</a>
            <button onClick={() => scrollTo("demo")} style={S.ctaBtn}
              onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}
            >Request a Demo <ArrowRight size={13} strokeWidth={2.5} /></button>
          </div>

          {/* Mobile toggle */}
          <button className="lp-nav-mobile" onClick={() => setMobileOpen(!mobileOpen)} style={S.hamburger}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={S.mobileMenu}>
          {["Features", "Demo"].map(label => (
            <button key={label} onClick={() => scrollTo(label.toLowerCase())} style={S.mobileLinkBtn}>{label}</button>
          ))}
          <a href="/gaming-lounge/login" style={{ display: "block", color: "#94A3B8", fontSize: 15, padding: "14px 0", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Login</a>
          <button onClick={() => scrollTo("demo")} style={S.mobileCta}>Request a Demo →</button>
        </div>
      )}

      <style>{`
        .lp-nav-desktop { display: flex !important; }
        .lp-nav-mobile { display: none !important; }
        @media (max-width: 768px) {
          .lp-nav-desktop { display: none !important; }
          .lp-nav-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
