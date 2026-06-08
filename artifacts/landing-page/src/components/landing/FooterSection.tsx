import type { TranslationKey } from "@/lib/i18n";

interface FooterSectionProps {
  t: (key: TranslationKey) => string;
  lang: string;
  toggleLang: () => void;
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function FooterSection({ t, lang, toggleLang }: FooterSectionProps) {
  const links = [
    { label: t("footer_features"), href: "#features" },
    { label: t("footer_built_for"), href: "#built-for" },
    { label: t("footer_how"), href: "#how-it-works" },
    { label: t("footer_demo"), href: "#demo" },
  ];

  const socials = [
    { icon: <XIcon />, href: "https://twitter.com/thespaceos", label: "X / Twitter" },
    { icon: <LinkedInIcon />, href: "https://linkedin.com/company/thespaceos", label: "LinkedIn" },
    { icon: <InstagramIcon />, href: "https://instagram.com/thespaceos", label: "Instagram" },
  ];

  return (
    <footer
      style={{ backgroundColor: "#0b1120", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      className="pb-20 sm:pb-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Top row: brand + links + actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
                  <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
                  <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
                  <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
                </svg>
              </div>
              <span
                className="font-bold text-white text-base"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}
              >
                The Space OS
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.32)", maxWidth: "200px" }}>
              {t("footer_tagline")}
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 md:pt-0.5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors duration-200 hover:text-blue-400"
                style={{ color: "rgba(255,255,255,0.42)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social icons + lang toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                {s.icon}
              </a>
            ))}
            <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <button
              onClick={toggleLang}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.42)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {lang === "en" ? "عربي" : "English"}
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-xs px-3 py-1 rounded-full"
            style={{ color: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {t("footer_copyright")}
          </p>
          <p className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.28)" }}>
            {t("footer_made_in")}
          </p>
        </div>
      </div>
    </footer>
  );
}
