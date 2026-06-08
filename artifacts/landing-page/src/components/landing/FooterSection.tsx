import type { TranslationKey } from "@/lib/i18n";

interface FooterSectionProps {
  t: (key: TranslationKey) => string;
  lang: string;
  toggleLang: () => void;
}

export function FooterSection({ t, lang, toggleLang }: FooterSectionProps) {
  const links = [
    { label: t("footer_features"), href: "#features" },
    { label: t("footer_built_for"), href: "#built-for" },
    { label: t("footer_how"), href: "#how-it-works" },
    { label: t("footer_demo"), href: "#demo" },
  ];

  return (
    <footer style={{ backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + slogan */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="4" stroke="white" strokeWidth="1.5" />
                  <path d="M9 2V1M9 17V16M2 9H1M17 9H16M4.2 4.2L3.5 3.5M14.5 14.5L13.8 13.8M13.8 4.2L14.5 3.5M3.5 14.5L4.2 13.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span
                className="font-bold text-white text-base"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                The Space OS
              </span>
            </div>
            <p className="text-xs text-center md:text-start" style={{ color: "rgba(255,255,255,0.35)" }}>
              {t("footer_slogan")}
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors duration-200 hover:text-blue-400"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Lang toggle + social */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {lang === "en" ? "عربي" : "English"}
            </button>
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {t("footer_copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
