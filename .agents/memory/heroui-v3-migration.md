---
name: HeroUI v3 Migration Lessons
description: Key facts and constraints discovered during shadcn/ui → HeroUI v3 migration for gaming-lounge artifact
---

# HeroUI v3 Migration — Key Facts

## No HeroUIProvider
HeroUI v3 has **no `HeroUIProvider`** exported. Dark mode is purely CSS-class-based — add `dark` class to `<html>`. No wrapper component needed.

**Why:** HeroUI v3 is headless (built on react-aria-components). Configuration is via CSS vars and class tokens, not a React context provider.

## CSS Import
Import HeroUI styles via `@heroui/styles/css` (maps to `./dist/index.css`). The path `@heroui/styles` alone or `./dist/heroui.min.css` may be blocked by package exports.

## Compound Component Exports
HeroUI v3 exports compound components. Confirmed working:
- `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`
- `Switch`, `SwitchControl`, `SwitchThumb`, `SwitchContent`, `SwitchIcon`
- `Chip`, `ChipLabel`
- `Skeleton`
- `Separator`

Switch uses react-aria props: `isSelected`, `isDisabled`, `onChange`.

## Complex Components — Keep Radix UI
Dialog, AlertDialog, Select — their HeroUI v3 API (Modal/ModalDialog/ModalBody patterns, react-aria Select) is too different from shadcn's API. Keeping Radix UI wrappers is the right pragmatic choice.

**How to apply:** When migrating components, prioritize visually-simple components (Card, Badge, Skeleton, Switch, Separator) with HeroUI. Leave complex interactive components (Dialog, Select, Combobox) on Radix UI.

## Vite Cache Issues
After swapping HeroUI component names, Vite caches stale bundles. If runtime errors persist after code fixes, restart the workflow to clear Vite's dep optimization cache.
