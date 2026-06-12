import { useState, useEffect } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";

const NAV_ANCHOR_LINKS = [
  { label: "المنتج", id: "features" },
  { label: "الحلول", id: "solutions" },
  { label: "المميزات", id: "features" },
  { label: "تجربة مجانية", id: "demo" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sectionIds = ["features", "solutions", "demo"];
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const isActive = (id: string) => activeSection === id;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(5,11,24,0.96)" : "#050B18",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.3s ease",
      direction: "rtl",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* Logo */}
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src={`${import.meta.env.BASE_URL}the-space-os-logo-transparent.png`}
              alt="The Space OS"
              style={{ height: 52, width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </a>

          {/* Desktop Nav */}
          <div className="lp-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_ANCHOR_LINKS.map(item => (
              <a key={item.label} href={`#${item.id}`}
                onClick={e => { e.preventDefault(); scrollTo(item.id); }}
                style={{
                  display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
                  color: isActive(item.id) ? "white" : "#94A3B8",
                  fontSize: 14, fontWeight: isActive(item.id) ? 600 : 500,
                  padding: "8px 14px 6px", borderRadius: 8,
                  borderBottom: isActive(item.id) ? "2px solid #2563EB" : "2px solid transparent",
                  background: "none", cursor: "pointer", fontFamily: "inherit",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = isActive(item.id) ? "white" : "#94A3B8")}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="lp-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/login"
              style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 12px", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >تسجيل الدخول</a>
            <a href="#demo" onClick={e => { e.preventDefault(); scrollTo("demo"); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#2563EB", color: "white", borderRadius: 24, textDecoration: "none",
                fontSize: 14, fontWeight: 700, padding: "9px 20px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}
            >
              احجز عرض تجريبي <ArrowLeft size={13} strokeWidth={2.5} />
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="lp-nav-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 8 }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: "#0A1628", borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 24px 24px",
        }}>
          {NAV_ANCHOR_LINKS.map(item => (
            <a key={item.label + item.id} href={`#${item.id}`}
              onClick={e => { e.preventDefault(); scrollTo(item.id); }}
              style={{
                display: "block", textDecoration: "none",
                color: isActive(item.id) ? "white" : "#94A3B8",
                fontWeight: isActive(item.id) ? 600 : 500,
                fontSize: 15, padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {item.label}
            </a>
          ))}
          <a href="/login"
            style={{
              display: "block", color: "#94A3B8", fontSize: 15, padding: "14px 0",
              textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >تسجيل الدخول</a>
          <a href="#demo" onClick={e => { e.preventDefault(); scrollTo("demo"); }}
            style={{
              display: "block", marginTop: 16, width: "100%", background: "#2563EB", color: "white",
              textDecoration: "none", borderRadius: 12, textAlign: "center",
              fontSize: 15, fontWeight: 700, padding: "14px",
            }}
          >احجز عرض تجريبي ←</a>
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
