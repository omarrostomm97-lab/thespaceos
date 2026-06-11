import { Linkedin } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "https://thespaceos.com/pricing" },
      { label: "Updates", href: "https://thespaceos.com/updates" },
      { label: "Changelog", href: "https://thespaceos.com/changelog" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Gaming Lounges", href: "#solutions" },
      { label: "Coworking", href: "#solutions" },
      { label: "Cafés", href: "#solutions" },
      { label: "Restaurants", href: "#solutions" },
      { label: "Other Businesses", href: "#solutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "https://thespaceos.com/about" },
      { label: "Careers", href: "https://thespaceos.com/careers" },
      { label: "Partners", href: "https://thespaceos.com/partners" },
      { label: "Contact Us", href: "#demo" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "https://thespaceos.com/help" },
      { label: "Documentation", href: "https://thespaceos.com/docs" },
      { label: "Blog", href: "https://thespaceos.com/blog" },
      { label: "Status", href: "https://status.thespaceos.com" },
    ],
  },
];

export function FooterSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  function handleLink(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href.slice(1));
    }
  }

  return (
    <footer
      style={{ background: "#050B18", borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 40px" }}>

        {/* Top row */}
        <div className="lp-footer-top">

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, background: "#2563EB", borderRadius: 8,
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, padding: 7, flexShrink: 0,
              }}>
                {[1, 1, 1, 0.45].map((op, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 2, opacity: op }} />
                ))}
              </div>
              <span style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>
                The Space OS
              </span>
            </div>

            <p style={{ color: "#334155", fontSize: 13, lineHeight: 1.65, maxWidth: 240, marginBottom: 24 }}>
              The Space OS is an operations platform for modern businesses that demand total control.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href="https://linkedin.com/company/thespaceos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{
                  width: 34, height: 34, borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "#475569", textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "white";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#475569";
                }}
              >
                <Linkedin size={15} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 style={{
                color: "white", fontSize: 13, fontWeight: 700,
                marginBottom: 16, letterSpacing: "0.01em",
              }}>
                {col.title}
              </h4>
              <ul style={{
                listStyle: "none", padding: 0,
                display: "flex", flexDirection: "column", gap: 11,
              }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={e => handleLink(e, link.href)}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{
                        color: "#475569", fontSize: 13, textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          marginTop: 48, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexWrap: "wrap",
          justifyContent: "space-between", alignItems: "center", gap: 14,
        }}>
          {/* Built in Egypt badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "5px 12px",
            }}>
              <span style={{ fontSize: 15 }}>🇪🇬</span>
              <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 500 }}>Built in Egypt</span>
            </div>
          </div>

          <p style={{ color: "#334155", fontSize: 12 }}>
            © 2026 The Space OS. All rights reserved.
          </p>

          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Privacy Policy", href: "https://thespaceos.com/privacy" },
              { label: "Terms of Service", href: "https://thespaceos.com/terms" },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#334155", fontSize: 12, textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .lp-footer-top {
          display: grid;
          grid-template-columns: 1.6fr repeat(4, 1fr);
          gap: 40px;
        }
        @media (max-width: 1024px) {
          .lp-footer-top { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 640px) {
          .lp-footer-top { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
        @media (max-width: 400px) {
          .lp-footer-top { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
