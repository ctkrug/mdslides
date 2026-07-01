# Contributing

## Setup

```bash
git clone https://github.com/ctkrug/mdslides.git
cd mdslides
npm install
```

Requires Node 18 or 20 (see `engines` in `package.json`).

## Commands

```bash
npm run dev -- talk.md -o talk.html   # run the CLI directly from src/ via tsx, no build step
npm run build                          # compile src/ -> dist/ with tsc
npm test                               # vitest run
npm run lint                           # eslint src test
```

Run `npm run build` before `npm test` — the CLI integration tests in
`test/cli-integration.test.ts` spawn the compiled `dist/cli.js` and skip themselves if it
doesn't exist yet, so a stale or missing build silently loses that coverage.

## Making a change

- See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the modules fit together and
  [`docs/VISION.md`](docs/VISION.md) for the design constraints (single-file output, no runtime
  dependencies in the generated deck) — most design questions are already answered there.
- Add or update tests alongside any behavior change; `npm test` and `npm run lint` should both
  be clean before opening a PR.
- Keep commits small and focused: one atomic change per commit, in the imperative mood (`add
  --units flag`, not `updated stuff`).

## Commit messages

```
<type>(<scope>): <imperative summary>

Optional body: what changed and why, in 1-3 lines, when the rationale
isn't obvious from the diff alone.
```

`type` is one of `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `ci`, `build`, `chore`,
`style`. Keep the subject line under ~70 characters with no trailing period.
