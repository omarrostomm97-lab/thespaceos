---
name: Card system
description: How cards are styled — plain div, shadow-only depth, no HeroUI wrapper
---

Card component (`src/components/ui/card.tsx`) is a plain `div` with class `card-base`. No HeroUI wrapper. No explicit CSS border.

**Why:** HeroUI's Card component applies its own white/grey border via its internal styles that fights against custom className overrides, causing the "grey frame" artifact. Plain div + box-shadow gives full control.

**How to apply:**
- `.card-base` in `@layer utilities` applies `box-shadow: var(--card-shadow)`
- `--card-shadow` defined in `:root` (dark default), `.dark`, and `.light` blocks of `index.css`
- Dark: deep drop shadow + inset rgba(255,255,255,0.06) ring instead of a real border
- Light: soft drop shadow + inset rgba(0,0,0,0.07) ring
- Pages can add `border-s-4 border-s-primary` etc. on top — real border classes coexist with the shadow ring
