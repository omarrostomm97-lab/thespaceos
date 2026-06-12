import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Lang, getT } from "./i18n";

interface LangCtxValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: ReturnType<typeof getT>;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangCtxValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("space_os_lang");
      if (stored === "ar" || stored === "en") return stored as Lang;
    } catch {}
    return "ar";
  });

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("space_os_lang", lang);
    } catch {}
  }, [lang]);

  const t = getT(lang);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  return (
    <LangContext.Provider value={{ lang, dir, t, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLangCtx() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLangCtx must be used inside LangProvider");
  return ctx;
}
