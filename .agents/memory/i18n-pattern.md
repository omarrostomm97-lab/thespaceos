---
name: i18n pattern
description: How AR/EN translation works — getT, useLang hook, dynamic labels rule
---

Translation lives in `src/lib/i18n.ts` as a `const translations = { ar: {...}, en: {...} }` object. `getT(lang)` returns a typed `t(key)` function.

`useLang()` hook (`src/hooks/use-language.tsx`) returns `{ t, dir, lang, toggleLang }`.
- `dir` is `"rtl"` for AR, `"ltr"` for EN — use `dir={dir}` on DialogContent, AlertDialogContent, and any element that was previously hardcoded `dir="rtl"`
- Always use dynamic `dir={dir}`, never hardcode `dir="rtl"` in page JSX

**Why:** Hardcoded `dir="rtl"` breaks layout when user switches to EN.

**How to apply:**
- For labels/maps that use `t()` values (e.g. payment method labels, action labels), define them INSIDE the component function body — not at module level — so they re-compute when lang changes
- `TranslationKey` type is auto-inferred from the `ar` object keys; add new keys to both `ar` and `en` sections simultaneously
- The `t()` function falls back to Arabic value, then to key string — so missing EN keys show Arabic gracefully
