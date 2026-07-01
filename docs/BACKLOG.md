# Backlog

High-level epic/story breakdown for build runs beyond the initial scaffold. The scaffold already
ships a working parser → renderer → CLI pipeline with three themes and basic navigation; this
backlog is what's left to reach the "v1 done" bar in [`VISION.md`](VISION.md).

## Epic 1 — Rendering fidelity

- [x] Embed local images referenced from Markdown (`![alt](./img.png)`) as base64 data URIs so
      decks with images stay a single portable file.
- [x] Add language-aware syntax highlighting to fenced code blocks without adding a runtime JS
      dependency to the generated output (highlight at build time, ship only static spans/CSS).
- [x] Extend theme CSS to cover tables, blockquotes, and nested lists, which currently fall back
      to browser defaults.

## Epic 2 — CLI & developer experience

- [ ] Add a `--watch` flag that rebuilds the output file whenever the source Markdown changes.
- [x] Add clear, actionable error messages and non-zero exit codes for common failures (missing
      input file, invalid `--theme` value, unreadable `--css` path).
- [ ] Publish `mdslides` to npm under the `ctkrug` account and verify `npx mdslides <file>` works
      from a completely clean environment.

## Epic 3 — Presentation features

- [ ] Add an optional progress bar and a toggle for showing/hiding the slide counter.
- [ ] Add a fullscreen toggle bound to a keyboard shortcut.
- [ ] Document a PDF export recipe (headless Chrome print-to-PDF against the generated HTML) in
      the README.
- [ ] Add an incremental-reveal syntax for list items (e.g. a slide-level flag that reveals
      bullets one keypress at a time) for presenters who build up a point gradually.

## Epic 4 — Quality & polish

- [x] Add CLI-level integration tests that run the built `dist/cli.js` against fixture Markdown
      files in a temp directory and assert on the emitted HTML.
- [ ] Add a `CONTRIBUTING.md` covering local setup, the test/lint commands, and the commit style.
- [ ] Add a short usage GIF or screenshot to the README showing a themed deck in a browser.
- [ ] Tag and publish a `v1.0.0` release once the above epics are complete, with a changelog
      summarizing the feature set.
