# mdslides demo

A Markdown file is a slide deck. This is the title slide.

<!-- note: pause here and let the title sink in -->

---

## Slides split on `---`

Anything between two horizontal rules is one slide: headings, lists,
tables, images — plain Markdown.

- fast to write
- easy to diff in git
- no build step to view

---

## Code blocks are highlighted

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

A `---` inside a fenced code block does **not** split the slide.

---

## Tables and blockquotes render too

| Theme     | Vibe                  |
| --------- | --------------------- |
| `default` | light, sans-serif     |
| `dark`    | dark, sans-serif      |
| `minimal` | light, serif, austere |

> A slide deck is a build artifact of a text file — not a hosted service.

---

<!-- incremental -->

## Build up a point gradually

- mark a slide `<!-- incremental -->`
- each arrow key / space / click reveals one more bullet
- going back re-reveals them, then steps back a slide

---

## That's it

Run:

```
mdslides demo.md -o demo.html --theme dark --progress
```

and open `demo.html` in any browser. Press `f` for fullscreen, `n` for speaker notes.
