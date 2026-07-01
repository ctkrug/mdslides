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

## Planned features

- **Markdown → HTML deck** — `---` splits slides; standard Markdown (headings, lists, code
  blocks, images, tables, emphasis) renders as expected.
- **Self-contained output** — CSS and navigation JS are inlined into the single output file.
- **Themes** — a small set of built-in themes (`default`, `dark`, `minimal`) selectable via
  `--theme`, plus support for a custom CSS override.
- **Keyboard + click navigation** — arrow keys, space, click-to-advance, and a slide counter.
- **Speaker notes** — HTML comments (`<!-- note: ... -->`) become a notes panel toggled with `n`.
- **Code syntax highlighting** — fenced code blocks get language-aware highlighting baked into
  the output, no runtime dependency.
- **PDF export path** — documented recipe (headless Chrome print) for turning a deck into a PDF.

## Stack

- **TypeScript** on Node.js — a static binary-free CLI, published as an npm package.
- **Markdown AST**: [`unified`](https://unifiedjs.com/)/`remark` for parsing, so slide-splitting
  and rendering operate on a real AST instead of regex-punching Markdown.
- **Templating**: a minimal in-repo template renderer — no heavyweight frontend framework, since
  output is static HTML.
- **Testing**: `vitest` for unit tests over the parser/renderer; CI runs lint + typecheck + tests
  on every push.

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## License

MIT — see [LICENSE](LICENSE).
