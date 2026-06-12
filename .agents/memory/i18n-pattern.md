---
name: i18n pattern
description: How AR/EN translation works — getT, useLang hook, dynamic labels rule; landing page uses LangProvider context
---

## Gaming-lounge / shared pattern

Translation lives in `src/lib/i18n.ts` as a `const translations = { ar: {...}, en: {...} }` object. `getT(lang)` returns a typed `t(key)` function.

`useLang()` hook (`src/hooks/use-language.tsx`) returns `{ t, dir, lang, toggleLang }`.
- `dir` is `"rtl"` for AR, `"ltr"` for EN — use `dir={dir}` on DialogContent, AlertDialogContent, and any element that was previously hardcoded `dir="rtl"`
- Always use dynamic `dir={dir}`, never hardcode `dir="rtl"` in page JSX

**Why:** Hardcoded `dir="rtl"` breaks layout when user switches to EN.

**How to apply:**
- For labels/maps that use `t()` values (e.g. payment method labels, action labels), define them INSIDE the component function body — not at module level — so they re-compute when lang changes
- `TranslationKey` type is auto-inferred from the `ar` object keys; add new keys to both `ar` and `en` sections simultaneously
- The `t()` function falls back to Arabic value, then to key string — so missing EN keys show Arabic gracefully

## Landing-page pattern (different — uses React context)

`LangProvider` context in `artifacts/landing-page/src/lib/lang-context.tsx` wraps the entire page tree in `LandingPage.tsx`. All sections use `useLangCtx()` — NOT `useLang()` (standalone hook is for gaming-lounge only).

`useLangCtx()` returns `{ lang, dir, t, setLang }`. Default lang is **`"ar"`**. localStorage key: `space_os_lang`.

Language switcher UI: segmented pill `[العربية | English]` — active pill `#2563EB`, inactive transparent/#64748B. Lives in Navbar (desktop + inside mobile drawer). Arrow icons flip per lang: `lang === "ar" ? <ArrowLeft /> : <ArrowRight />`. Phone/number inputs keep `direction: "ltr"` regardless.

Translation key naming: `section_concept` (e.g. `hero_sub1`, `strip_sessions`, `pss_card1_title`, `fc_product`, `fl_gaming`). New landing-page keys added: strip items, hero pills/paragraphs, social proof tabs, screenshot section, built-for cards, features grid, how-it-works steps, demo form labels/validation, footer columns/links.

New landing-page component checklist: `import { useLangCtx } from "@/lib/lang-context"` → destructure `{ t, dir, lang }` → apply `direction: dir` to root element → use `t("key")` for all text → never call `t()` at module level.
