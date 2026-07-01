# Vision

## The problem

Writing a slide deck in Markdown is the fastest way to draft a talk: no mouse, diffable in git,
editable in any text editor. But every popular tool built on this idea turns the *output* into a
new dependency:

- **reveal.js / Slidy** — you get an HTML/CSS/JS framework's worth of files, or you point people
  at a hosted viewer.
- **Slidev** — genuinely excellent, but it's a Vue-powered dev server; sharing a deck means
  running `slidev build` and shipping a whole SPA, or exporting to PDF and losing interactivity.
- **Marp** — closest in spirit, but its CLI output still pulls in a themable-but-opaque asset
  pipeline, and customizing beyond the built-in themes means learning Marp's plugin system.

None of them optimize for the common case: *I wrote a Markdown file, I want one HTML file I can
email, put on a USB stick, or drop in any static folder, and it should just work when
double-clicked.*

## Who it's for

Developers, engineers, and technical speakers who already think in Markdown and want a slide
deck as a build artifact of a text file — not a hosted service, not a SaaS account, not a
framework to learn. The target user runs one CLI command before a talk and gets a file they can
hand to a conference's A/V laptop without wondering if it has internet access.

## The core idea

`mdslides <file.md>` parses the file into a real Markdown AST, splits it into slides on `---`
horizontal rules, renders each slide's Markdown to HTML, and stitches the results into **one
HTML document** with the theme CSS and navigation JS inlined. No `<link>`, no `<script src>`, no
build directory to zip up — the single file *is* the deck.

## Key design decisions

- **Single output file, always.** Every asset (CSS, JS) is inlined at render time. This is the
  non-negotiable constraint that shapes everything else — it rules out shipping web fonts,
  external icon sets, or a plugin system that loads scripts at runtime.
- **`---` as the slide delimiter**, matching Marp/Slidy convention, so existing Markdown decks
  are mostly portable into `mdslides` without rewriting.
- **A real Markdown parser, not regex.** Slide splitting has to distinguish a `---` that's a
  slide break from one sitting inside a fenced code block (a very common false positive when a
  slide is showing a YAML file or a Markdown example). The splitter is fence-aware; rendering
  itself uses a standard Markdown-to-HTML library rather than hand-rolled parsing.
- **Themes are data, not plugins.** A theme is a CSS string selected by name (`default`, `dark`,
  `minimal`). Anyone can override further with `--css path/to/override.css` layered on top —
  no theme API to implement, no JS to write to reskin a deck.
- **Zero runtime dependencies in the output.** The navigation script (arrow keys, click-to-advance,
  a notes toggle) is hand-written vanilla JS, not a bundled framework, so the output file's size
  and behavior don't depend on what's fashionable in frontend tooling this year.
- **CLI-first, library-second.** `buildDeck()` is exported so the same logic is embeddable (e.g.
  a VS Code extension or a watch-mode wrapper later), but the primary interface is the command
  line — no config file is required to get a deck out of a Markdown file.

## What "v1 done" looks like

- `mdslides talk.md` produces a single valid HTML file that opens correctly in a modern browser
  with no network access, showing the first slide.
- Arrow keys / space / click advance and go back through slides; a counter shows position.
- All three built-in themes render distinctly and correctly; `--css` successfully layers a
  custom override on top of any of them.
- Fenced code blocks retain syntax structure and are readable; a `---` inside a fence never
  splits a slide.
- Speaker notes written as `<!-- note: ... -->` show up in a notes panel toggled with `n` and
  never leak into the visible slide body.
- The published npm package runs via `npx mdslides` without a prior local install.
- CI is green on Node 18 and 20 for every push: lint, typecheck/build, and the test suite.
