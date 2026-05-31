---
name: HeroUI v3 Migration Lessons
description: Key facts and constraints discovered during shadcn/ui → HeroUI v3 migration for gaming-lounge artifact
---

# HeroUI v3 Migration — Key Facts

## No HeroUIProvider
HeroUI v3 has **no `HeroUIProvider`** exported. Dark mode is purely CSS-class-based — add `dark` class to `<html>`. Use `I18nProvider locale="ar-AE"` from `@heroui/react` (re-exported from react-aria-components) for RTL/locale support.

**Why:** HeroUI v3 is headless (built on react-aria-components). Configuration is via CSS vars and class tokens, not a React context provider.

## CSS Import
Import HeroUI styles via `@heroui/styles/css` (maps to `./dist/index.css`). The path `@heroui/styles` alone or `./dist/heroui.min.css` may be blocked by package exports.

## Compound Component Exports
HeroUI v3 exports compound components. All confirmed working from `@heroui/react`:
- `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`
- `Switch`, `SwitchControl`, `SwitchThumb`, `SwitchContent`, `SwitchIcon` — react-aria props: `isSelected`, `isDisabled`, `onChange`
- `Chip`, `ChipLabel`
- `Skeleton`
- `Separator`
- `ModalRoot`, `ModalTrigger`, `ModalBackdrop`, `ModalContainer`, `ModalDialog`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalHeading`, `ModalCloseTrigger` — for Dialog/AlertDialog wrappers
- `Select` (SelectRoot), `SelectTrigger`, `SelectValue`, `SelectIndicator`, `SelectPopover` — for Select wrapper
- `ListBox`, `ListBoxItem` — used inside SelectPopover for options
- `I18nProvider` — locale/RTL support, wrap entire app with `locale="ar-AE"`

## Modal/Dialog Pattern
ModalRoot accepts `isOpen`/`onOpenChange` as props (passed through to react-aria's DialogTrigger). AlertDialog uses `isDismissable={false}` on ModalBackdrop.

Structure: `ModalRoot > ModalBackdrop > ModalContainer > ModalDialog > {content} + ModalCloseTrigger`

**How to apply:** Dialog.tsx and AlertDialog.tsx wrappers expose the same shadcn API (open/onOpenChange/DialogContent/etc.) but use HeroUI Modal internally.

## Select Pattern
SelectRoot accepts `selectedKey`/`onSelectionChange`. Map from shadcn API: `value → selectedKey`, `onValueChange → onSelectionChange(key => String(key))`. Items use `ListBox > ListBoxItem id={value}` inside `SelectPopover`.

## Packages Removed (migrated away)
Removed from devDependencies: `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-select`, `@radix-ui/react-switch`, `@radix-ui/react-separator`, `@radix-ui/react-tabs`.

## Vite Cache Issues
After swapping HeroUI component names, Vite caches stale bundles. If runtime errors persist after code fixes, restart the workflow to clear Vite's dep optimization cache.
