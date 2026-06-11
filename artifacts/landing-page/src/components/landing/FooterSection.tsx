import { Linkedin } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Updates", "Changelog"],
  },
  {
    title: "Solutions",
    links: ["Gaming Lounges", "Coworking", "Cafés", "Restaurants", "Other Businesses"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Partners", "Contact Us"],
  },
  {
    title: "Resources",
    links: ["Help Center", "Documentation", "Blog", "Status"],
  },
];

export function FooterSection() {
  return (
    <footer style={{
      background: "#050B18", borderTop: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 40px" }}>

        {/* Top row */}
        <div className="lp-footer-top">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, background: "#2563EB", borderRadius: 8,
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 7, flexShrink: 0,
              }}>
                {[1, 1, 1, 0.45].map((op, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 2, opacity: op }} />
                ))}
              </div>
              <span style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>The Space OS</span>
            </div>
            <p style={{ color: "#334155", fontSize: 13, lineHeight: 1.6, maxWidth: 220, marginBottom: 20 }}>
              The Space OS is an operations platform for modern businesses that demand total control.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { href: "https://linkedin.com/company/thespaceos", label: "LinkedIn", icon: <Linkedin size={15} /> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#475569", textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#475569"; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: "0.01em" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" onClick={e => e.preventDefault()}
                      style={{ color: "#475569", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Built in Egypt */}
          <div>
            <h4 style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Built in Egypt</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 20 }}>🇪🇬</div>
              <span style={{ color: "#475569", fontSize: 12, lineHeight: 1.5 }}>
                Proudly supporting businesses locally and regionally.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <p style={{ color: "#334155", fontSize: 12 }}>© 2026 The Space OS. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service"].map(link => (
              <a key={link} href="#" onClick={e => e.preventDefault()}
                style={{ color: "#334155", fontSize: 12, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
              >{link}</a>
            ))}
          </div>
        </div>

      </div>
      <style>{`
        .lp-footer-top {
          display: grid;
          grid-template-columns: 1.4fr repeat(4, 1fr) 1.2fr;
          gap: 40px;
        }
        @media (max-width: 1024px) { .lp-footer-top { grid-template-columns: 1fr 1fr 1fr; gap: 32px; } }
        @media (max-width: 640px) { .lp-footer-top { grid-template-columns: 1fr 1fr; gap: 28px; } }
        @media (max-width: 400px) { .lp-footer-top { grid-template-columns: 1fr; } }
      `}</style>
    </footer>
  );
}
