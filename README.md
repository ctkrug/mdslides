# mdslides

[![CI](https://github.com/ctkrug/mdslides/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/mdslides/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Turn a Markdown file into a self-contained, themeable HTML slide deck — from the command line,
with no build step, no cloud service, and no lock-in.

## Why

Writing slides in Markdown is fast and version-controllable, but every existing tool either
wants you to run a dev server (reveal.js, Slidev), install a heavyweight framework, or accept a
proprietary format. `mdslides` does one thing: read a `.md` file, split it into slides, and emit
a single `.html` file you can open in a browser, email as an attachment, or drop on any static
host. No dependencies at presentation time.

```bash
npx mdslides talk.md -o talk.html
```

## Usage

```
mdslides <input.md> [options]

Options:
  -o, --output <path>  output HTML file path (default: <input>.html)
  -t, --theme <name>   default | dark | minimal (default: "default")
  --css <path>         custom CSS file layered on top of the theme
  --watch              rebuild the output whenever the input (or --css) changes
  --progress           show a progress bar reflecting position in the deck
  --no-counter         hide the "N / total" slide counter
```

See [`examples/demo.md`](examples/demo.md) for a sample deck you can build locally:

```bash
npm run build
node dist/cli.js examples/demo.md -o demo.html --theme dark
```

## How it works

Slides are separated by a horizontal rule (`---`) on its own line, the same convention used by
Marp, Slidy, and most Markdown slide tools — so existing decks mostly just work. `mdslides`
parses the Markdown into an AST, walks it slide-by-slide, and renders each slide into a themed
HTML template with inlined CSS and JS. The output is one flat file: no external assets, no
network requests, no build artifacts to manage.

## Features

- **Markdown → HTML deck** — `---` splits slides; standard Markdown (headings, lists, code
  blocks, images, tables, blockquotes, emphasis) renders as expected.
- **Self-contained output** — CSS and navigation JS are inlined, and local images are embedded
  as base64 data URIs, so the output is always a single portable file.
- **Themes** — a small set of built-in themes (`default`, `dark`, `minimal`) selectable via
  `--theme`, plus support for a custom CSS override via `--css`.
- **Keyboard + click navigation** — arrow keys, space, and click advance the deck; `f` toggles
  fullscreen; an optional progress bar and slide counter show position.
- **Speaker notes** — HTML comments (`<!-- note: ... -->`) become a notes panel toggled with `n`.
- **Code syntax highlighting** — fenced code blocks are highlighted at build time via
  `highlight.js`, so the output ships static spans and CSS, not a highlighter runtime.
- **Watch mode** — `--watch` rebuilds automatically whenever the source Markdown or `--css`
  file changes.
- **PDF export** — see [Exporting to PDF](#exporting-to-pdf) below.

## Exporting to PDF

Since a deck is one HTML file, printing it to PDF works with any headless Chrome/Chromium:

```bash
mdslides talk.md -o talk.html
google-chrome --headless --disable-gpu --print-to-pdf=talk.pdf --no-pdf-header-footer \
  --print-to-pdf-no-header file://$(pwd)/talk.html
```

Chrome's print dialog paginates the deck section by section, since each `.slide` fills the
viewport; for the best result, add a print stylesheet override via `--css` that sets each
`.slide` to `page-break-after: always` if the default pagination doesn't match slide boundaries.

## Stack

- **TypeScript** on Node.js — a static binary-free CLI, published as an npm package.
- **Parsing**: a hand-written, fence-aware line splitter finds slide boundaries (so a `---`
  inside a code block never splits a slide), then [`marked`](https://marked.js.org/) renders
  each slide's Markdown to HTML.
- **Templating**: a minimal in-repo template renderer — no heavyweight frontend framework, since
  output is static HTML.
- **Testing**: `vitest` for unit tests over the parser/renderer/CLI; CI runs lint + typecheck +
  tests on every push.

## Status

Core feature set implemented — see [`docs/VISION.md`](docs/VISION.md) for the design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for what's left.

## License

MIT — see [LICENSE](LICENSE).
