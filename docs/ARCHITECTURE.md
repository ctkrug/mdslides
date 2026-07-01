# Architecture

A map of the codebase for anyone picking this project up cold. See [`VISION.md`](VISION.md) for
*why* it's built this way and [`BACKLOG.md`](BACKLOG.md) for what's left.

## Data flow

```
Markdown file
     │  readFile (cli.ts)
     ▼
parseSlides()          src/parser.ts    → Slide[] (markdown, notes, incremental)
     │
     ▼
renderDeck()            src/render.ts    → one HTML string
     │  per slide: marked.parse() with custom image/code/listitem renderers
     ▼
writeFile()             cli.ts           → self-contained .html file
```

`buildDeck()` in `src/index.ts` composes `parseSlides` + `renderDeck` and is the library entry
point; `src/cli.ts` is a thin wrapper that adds file I/O, flag parsing, error messages, and
`--watch`.

## Modules

- **`src/types.ts`** — shared types: `Slide`, `ThemeName`, `BuildOptions`.
- **`src/parser.ts`** — splits Markdown into slides on a `---` line, tracking fence state
  (`` ``` ``/`~~~`) so a `---` inside a code block never splits a slide. Also strips
  `<!-- note: ... -->` into `Slide.notes` and detects a leading `<!-- incremental -->` comment
  into `Slide.incremental`.
- **`src/render.ts`** — turns `Slide[]` into the final HTML document. Builds one `Marked`
  instance per deck with three renderer overrides:
  - `image` → resolves relative `src` via `src/images.ts#embedImage` (base64 data URI).
  - `code` → highlights via `src/highlight.ts#highlightCode` (highlight.js, build-time only).
  - `listitem` → appends `class="fragment"` when the current slide is `incremental` (a mutable
    closure variable set before each `marked.parse()` call, since marked's renderer API is
    stateless per call).
  Also emits the inline `<style>` block (theme CSS + notes-panel/progress-bar/fragment rules not
  tied to any one theme) and the `<script>` tag embedding `navigationScript` verbatim.
- **`src/images.ts`** — `embedImage(src, baseDir)`: resolves a relative path against the source
  file's directory and reads it into a `data:` URI; passes through remote URLs and existing data
  URIs unchanged.
- **`src/highlight.ts`** — `highlightCode(code, lang)`: wraps `highlight.js`, using the fence's
  language when known and falling back to auto-detection otherwise.
- **`src/themes/*.ts`** — one exported CSS string per theme (`default`, `dark`, `minimal`),
  registered in `src/themes/index.ts#getTheme`. Each theme file owns its own palette for
  headings, code blocks, tables/blockquotes/lists, and `.hljs-*` syntax-highlight colors.
- **`src/navigation.ts`** — `navigationScript`: a plain-JS string (not compiled, since it runs in
  the *generated deck's* browser context, not this package's Node runtime) embedded verbatim.
  Handles arrow/space/click advance, the `n` notes-panel toggle, the `f` fullscreen toggle, the
  progress bar, and fragment-by-fragment reveal (`advance()`/`retreat()` step through
  `.fragment` elements on the current slide before changing slides).
- **`src/watch.ts`** — `watchFiles(paths, onChange, debounceMs)`: thin `fs.watch` wrapper that
  debounces bursts of change events into one callback.
- **`src/errors.ts`** — `CliError` (a message-is-already-user-facing error) and
  `toCliFileError()`, which maps Node `ENOENT`/`EISDIR`/`EACCES` into plain-English messages.
- **`src/cli.ts`** — Commander-based entry point; `package.json#bin` maps the `mdslides` command
  to the compiled `dist/cli.js`. Validates `--theme`, reads the input Markdown and optional
  `--css`, calls `buildDeck()`, writes the output, and — if `--watch` is set — re-runs the build
  on every change via `watchFiles()`. `buildDeck()` itself rejects input that parses to zero
  slides (empty file, or only blank separators) rather than emitting a deck that would crash its
  own navigation script in the browser.

## Testing

`vitest` (see `vitest.config.ts`, `test/**/*.test.ts`). Notable patterns:

- Pure unit tests for `parser`, `images`, `highlight`, `errors`, most of `render`.
- **`test/navigation.test.ts`** runs `navigationScript` inside a `node:vm` context against a
  hand-built fake `document`, since the script targets a browser DOM but the test suite runs in
  Node — no jsdom/browser dependency needed for this level of coverage.
- **`test/cli-integration.test.ts`** spawns the *built* `dist/cli.js` (`node:child_process`)
  against fixture Markdown in a temp dir and asserts on the emitted HTML/exit code/stderr; it
  `describe.skipIf`s itself when `dist/cli.js` doesn't exist yet, so `vitest run` still works
  before the first `npm run build`. The `--watch` case retries its triggering write a few times,
  since a freshly spawned child's `fs.watch` registration can lag its first "watching" log line.

## Running it

```bash
npm install
npm run build   # tsc -p tsconfig.json → dist/
npm test        # vitest run (build first for the CLI integration tests to run, not skip)
npm run lint    # eslint src test
node dist/cli.js examples/demo.md -o demo.html --theme dark
```

`npm run dev` runs the CLI directly from TypeScript source via `tsx`, without a build step.
