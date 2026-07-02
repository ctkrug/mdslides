# Design — Deckhand landing page

The product is a CLI, so there is no web app to style. This file governs the **landing page**
(`site/index.html`) and the product's visual identity (wordmark, README). One brand, one palette.

## 1. Aesthetic direction

**Paper-and-ink, editorial.** Deckhand turns a text file into a deck you can *carry* — so the page
reads like fine print collateral, not a SaaS dashboard: warm paper stock, ink-dark type, a single
confident vermilion accent, and a characterful display serif over a clean sans. Deliberately light
and tactile, the opposite of the default "dark cards + neon accent" dev-tool look.

## 2. Tokens

| Token            | Value                                             |
| ---------------- | ------------------------------------------------- |
| `--paper` (bg)   | `#f4efe4` warm paper                              |
| `--surface`      | `#fbf8f1` raised card                             |
| `--panel`        | `#eae1d0` inset panel / code source              |
| `--ink`          | `#211d17` primary text                           |
| `--muted`        | `#6d6559` secondary text                         |
| `--accent`       | `#c8492f` vermilion (mark, links, CTA)           |
| `--support`      | `#24756e` deep teal (secondary highlights)       |
| display font     | **Fraunces** (serif) — wordmark + headings        |
| UI font          | **Inter** (sans) — body + UI, system fallbacks    |
| type scale       | 1.25 ratio (16 · 20 · 25 · 31 · 39 · 49px)        |
| spacing unit     | 8px scale (4 / 8 / 16 / 24 / 40 / 64)             |
| radius           | 12px (cards), 8px (buttons, code)                |
| shadow           | `0 1px 2px rgba(33,29,23,.06), 0 14px 34px rgba(33,29,23,.10)` |
| motion           | 160ms ease-out (hover/press)                     |

Text contrast: `--ink` on `--paper` clears 4.5:1. The rendered-slide sample keeps the tool's own
**dark** theme colors (`#10131a` bg, `#ffffff` heading) so visitors see the real output, not the
page's palette.

## 3. Layout intent

- **Hero (desktop 1440):** two columns. Left — wordmark, benefit headline, one-line subhead, the
  `npx` install command, and the primary CTA. Right — the **signature showcase**: a paper card of
  Markdown source with an arrow into a rendered slide sitting on top of a slight paper *stack*, so
  the deck reads as a physical artifact. The showcase owns the majority of the fold.
- **Phone (390):** one column. Headline, subhead, install, CTA, then the showcase stacked source-
  above-slide. No horizontal scroll, no marooned widgets.
- Below the fold: a three-item **benefit row** (editorial, ruled, numbered — never emoji cards),
  an install + usage block, and a footer with the GitHub CTA and MIT note.

## 4. Signature detail

The **deck stack**: the sample slide renders as the top sheet of a short offset stack of paper,
with a soft warm shadow, lifting slightly on hover. It states the whole pitch in one image — your
Markdown becomes one tangible deck.

## 5. Ship gate (D4)

Landing page only (no game, no interactive app). Must pass: hero fills the fold and is composed at
390 / 768 / 1440; the CTA and any control have hover/focus-visible/active states; the wordmark uses
the display serif; no system-font-only text, no unstyled buttons, no emoji-card feature row, no pure
`#000`/`#fff` surfaces; page and README read as one brand.
