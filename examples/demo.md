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

## That's it

Run:

```
mdslides demo.md -o demo.html --theme dark
```

and open `demo.html` in any browser.
