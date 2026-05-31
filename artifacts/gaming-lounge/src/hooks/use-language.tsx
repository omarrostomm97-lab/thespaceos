import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, getT, type TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  dir: "rtl",
  toggleLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("gl-lang") as Lang) ?? "ar";
    } catch {
      return "ar";
    }
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", dir);
    root.setAttribute("lang", lang);
    try {
      localStorage.setItem("gl-lang", lang);
    } catch {}
  }, [lang, dir]);

  const toggleLang = () =>
    setLang(prev => (prev === "ar" ? "en" : "ar"));

  const t = getT(lang);

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
