import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TranslationKey } from "@/lib/i18n";

interface NavbarProps {
  t: (key: TranslationKey) => string;
  lang: string;
  toggleLang: () => void;
  appLoginUrl?: string;
}

export function Navbar({ t, lang, toggleLang, appLoginUrl = "/gaming-lounge/" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = [
    { key: "nav_product" as TranslationKey, href: "#product" },
    { key: "nav_built_for" as TranslationKey, href: "#built-for" },
    { key: "nav_features" as TranslationKey, href: "#features" },
    { key: "nav_how_it_works" as TranslationKey, href: "#how-it-works" },
    { key: "nav_demo" as TranslationKey, href: "#demo" },
  ];

  const logoColor = scrolled ? "text-slate-900" : "text-white";
  const linkColor = scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white";
  const langBtnColor = scrolled ? "text-slate-600 hover:bg-slate-100" : "text-white/75 hover:bg-white/10";
  const loginBtnColor = scrolled
    ? "border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600"
    : "border-white/25 text-white/80 hover:border-white/50";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar-scrolled" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.95" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.95" />
              </svg>
            </div>
            <span className={`font-grotesk font-bold text-base tracking-tight transition-colors duration-300 ${logoColor}`}>
              The Space OS
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${linkColor}`}
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggleLang}
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 ${langBtnColor}`}
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>
            <a
              href={appLoginUrl}
              className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors duration-200 ${loginBtnColor}`}
            >
              {t("nav_login")}
            </a>
            <a
              href="#demo"
              className={`text-sm font-semibold px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 ${scrolled ? "" : "shadow-[0_2px_12px_rgba(59,130,246,0.3)]"}`}
            >
              {t("nav_request_demo")}
            </a>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggleLang}
              className={`text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-colors duration-200 ${langBtnColor}`}
            >
              {lang === "en" ? "ع" : "EN"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/[0.98] backdrop-blur-xl border-t border-slate-100"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  {t(link.key)}
                </a>
              ))}
              <div className="pt-3 pb-1 border-t border-slate-100 space-y-2 mt-2">
                <a
                  href={appLoginUrl}
                  className="block w-full text-center px-4 py-2.5 text-sm font-medium border border-slate-200 text-slate-700 rounded-xl hover:border-blue-400 transition-colors"
                >
                  {t("nav_login")}
                </a>
                <a
                  href="#demo"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {t("nav_request_demo")}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
