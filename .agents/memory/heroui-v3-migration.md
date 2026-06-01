---
name: HeroUI v3 Migration Lessons
description: Key facts and constraints for the shadcn/ui → HeroUI v3 migration in gaming-lounge
---

# HeroUI v3 Migration — Key Facts

## No HeroUIProvider
HeroUI v3 exports no `HeroUIProvider`. Dark mode is CSS-class-based (`dark` on `<html>`).
Use `I18nProvider locale="ar-AE"` from `@heroui/react` (re-exports react-aria-components) for RTL.

**Why:** HeroUI v3 is headless (react-aria based). Config is via CSS tokens and class, not React context.

## CSS Import
`import "@heroui/styles/css"` — maps to `./dist/index.css`. Do not use `@heroui/styles` alone.

## displayName on HeroUI Component Aliases
Do NOT do `const Foo = HeroUIComponent; Foo.displayName = "Foo"` — TS2339 since the exported
types don't declare that property. Instead, wrap: `const Foo = ({ children, ...p }) => <HeroUIComponent {...p}>{children}</HeroUIComponent>`.

**Why:** Assigning .displayName to HeroUI function refs causes compile errors.

## Modal / Dialog Pattern
`ModalRoot` accepts `isOpen`/`onOpenChange` (react-aria DialogTrigger props).
AlertDialog: `isDismissable={false}` on `ModalBackdrop`.
Structure: `ModalRoot > ModalBackdrop > ModalContainer > ModalDialog > content + ModalCloseTrigger`

### ModalBackdrop is transparent by default — ALWAYS keep the CSS fix
`.modal__backdrop` has `fixed inset-0 z-50` but zero background. Only the `--opaque`/`--blur`
modifier classes apply `bg-backdrop` → `var(--color-backdrop)`, which requires HeroUIProvider.
**Fix already in `index.css`:**
```css
.modal__backdrop, .alert-dialog__backdrop { background-color: rgba(0,0,0,0.65); }
```
Do NOT remove this — every dialog/modal will show a fully transparent backdrop without it.

## Select Pattern
`SelectRoot` uses `selectedKey`/`onSelectionChange`. Map from shadcn: `value → selectedKey`,
`onValueChange → v => String(v)`. Items: `SelectPopover > ListBox > ListBoxItem id={value}`.

## Input + Validation (isInvalid / errorMessage)
Wrap in `TextField` from `@heroui/react` (which wraps react-aria's TextField for context).
Then `Input` from `@heroui/react` inside picks up the isInvalid state automatically.
Use `FieldError` from `@heroui/react` to render the message.
**Important:** Fall back to native `<input>` when no isInvalid/errorMessage props are passed —
avoids breaking the hundreds of call sites that don't need validation context.

## Toaster: Use Sonner
Pages already import `toast` from `sonner`. Replace Radix-based `toaster.tsx` by
importing `Toaster` from `@/components/ui/sonner` in App.tsx. Use `theme="dark"` directly
(no next-themes needed — app always uses html.dark class).

## Label
HeroUI exports `Label` from `@heroui/react`. Replaces `@radix-ui/react-label`.
Wrap it with the same cva/cn API for drop-in shadcn compatibility.

## Packages Removed (migrated to HeroUI)
`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-select`,
`@radix-ui/react-switch`, `@radix-ui/react-separator`, `@radix-ui/react-tabs`,
`@radix-ui/react-label`.

## Vite Cache
After swapping HeroUI component names, restart workflow to clear Vite's dep optimization cache.
