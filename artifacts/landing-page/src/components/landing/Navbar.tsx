import { useState, useEffect } from "react";
import { Menu, X, ArrowLeft, ArrowRight } from "lucide-react";
import { useLangCtx } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

export function Navbar() {
  const { lang, dir, t, setLang } = useLangCtx();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const NAV_LINKS = [
    { labelKey: "nav_product" as const, id: "features" },
    { labelKey: "nav_built_for" as const, id: "solutions" },
    { labelKey: "nav_demo" as const, id: "demo" },
  ];

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

  const LangSwitcher = ({ mobile }: { mobile?: boolean }) => (
    <div style={{
      display: "flex",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: 2,
      flexShrink: 0,
      ...(mobile ? { width: "100%", justifyContent: "center" } : {}),
    }}>
      {(["ar", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: mobile ? "8px 0" : "5px 11px",
            borderRadius: 6,
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s ease",
            background: lang === l ? "#2563EB" : "transparent",
            color: lang === l ? "white" : "#64748B",
            letterSpacing: "0.02em",
            ...(mobile ? { flex: 1 } : {}),
          }}
        >
          {l === "ar" ? "العربية" : "English"}
        </button>
      ))}
    </div>
  );

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(5,11,24,0.96)" : "#050B18",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.3s ease",
      direction: dir,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* Logo */}
          <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <img
              src={`${import.meta.env.BASE_URL}the-space-os-logo-transparent.png`}
              alt="The Space OS"
              style={{ height: 52, width: "auto", filter: "brightness(0) invert(1)" }}
            />
          </a>

          {/* Desktop Nav Links */}
          <div className="lp-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_LINKS.map(item => (
              <a key={item.id} href={`#${item.id}`}
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
                {t(item.labelKey)}
              </a>
            ))}
          </div>

          {/* Desktop Right — Switcher + Login + CTA */}
          <div className="lp-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LangSwitcher />
            <a href="/login"
              style={{ color: "#94A3B8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 12px", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
            >{t("nav_login")}</a>
            <a href="#demo" onClick={e => { e.preventDefault(); scrollTo("demo"); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#2563EB", color: "white", borderRadius: 24, textDecoration: "none",
                fontSize: 14, fontWeight: 700, padding: "9px 20px",
                transition: "background 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}
            >
              {t("nav_request_demo")}
              {lang === "ar"
                ? <ArrowLeft size={13} strokeWidth={2.5} />
                : <ArrowRight size={13} strokeWidth={2.5} />}
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
          {NAV_LINKS.map(item => (
            <a key={item.id} href={`#${item.id}`}
              onClick={e => { e.preventDefault(); scrollTo(item.id); }}
              style={{
                display: "block", textDecoration: "none",
                color: isActive(item.id) ? "white" : "#94A3B8",
                fontWeight: isActive(item.id) ? 600 : 500,
                fontSize: 15, padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {t(item.labelKey)}
            </a>
          ))}
          <a href="/login"
            style={{
              display: "block", color: "#94A3B8", fontSize: 15, padding: "14px 0",
              textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >{t("nav_login")}</a>
          <div style={{ margin: "16px 0" }}>
            <LangSwitcher mobile />
          </div>
          <a href="#demo" onClick={e => { e.preventDefault(); scrollTo("demo"); }}
            style={{
              display: "block", marginTop: 8, width: "100%", background: "#2563EB", color: "white",
              textDecoration: "none", borderRadius: 12, textAlign: "center",
              fontSize: 15, fontWeight: 700, padding: "14px",
            }}
          >{t("nav_request_demo")} {lang === "ar" ? "←" : "→"}</a>
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
