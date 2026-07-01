import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseSlides } from '../src/parser.js';
import { renderDeck } from '../src/render.js';

describe('renderDeck', () => {
  it('renders one .slide section per slide, marking the first active', () => {
    const slides = parseSlides('# One\n\n---\n\n# Two');
    const html = renderDeck(slides, { theme: 'default', title: 'Deck' });

    expect(html).toContain('<title>Deck</title>');
    expect((html.match(/class="slide active"/g) ?? []).length).toBe(1);
    expect((html.match(/<section class="slide/g) ?? []).length).toBe(2);
  });

  it('embeds the requested theme and an optional custom CSS override', () => {
    const slides = parseSlides('# One');
    const html = renderDeck(slides, {
      theme: 'dark',
      title: 'Deck',
      customCss: '.slide { color: red; }',
    });

    expect(html).toContain('#10131a');
    expect(html).toContain('.slide { color: red; }');
  });

  it('rejects an unknown theme name', () => {
    const slides = parseSlides('# One');
    expect(() => renderDeck(slides, { theme: 'neon' as never, title: 'Deck' })).toThrow(/Unknown theme/);
  });

  it('escapes speaker notes placed in the data-notes attribute', () => {
    const slides = parseSlides('# One\n\n<!-- note: use "quotes" & <tags> -->');
    const html = renderDeck(slides, { theme: 'default', title: 'Deck' });

    expect(html).toContain('data-notes="use &quot;quotes&quot; &amp; &lt;tags&gt;"');
  });

  it('embeds a locally referenced image as a base64 data URI', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-'));
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    writeFileSync(join(dir, 'logo.png'), pngBytes);

    const slides = parseSlides('![a logo](logo.png)');
    const html = renderDeck(slides, { theme: 'default', title: 'Deck', baseDir: dir });

    expect(html).toContain(`data:image/png;base64,${pngBytes.toString('base64')}`);
  });

  it('highlights fenced code blocks using the fence language tag', () => {
    const slides = parseSlides('```ts\nconst x: number = 1;\n```');
    const html = renderDeck(slides, { theme: 'default', title: 'Deck' });

    expect(html).toContain('class="hljs language-ts"');
    expect(html).toContain('hljs-keyword');
  });

  it('embeds theme rules for tables and blockquotes', () => {
    const slides = parseSlides('# One');
    const html = renderDeck(slides, { theme: 'default', title: 'Deck' });

    expect(html).toContain('.slide table {');
    expect(html).toContain('.slide blockquote {');
  });

  it('omits the progress bar by default and includes it when requested', () => {
    const slides = parseSlides('# One');

    const withoutProgress = renderDeck(slides, { theme: 'default', title: 'Deck' });
    expect(withoutProgress).not.toContain('class="progress-track"');

    const withProgress = renderDeck(slides, { theme: 'default', title: 'Deck', showProgress: true });
    expect(withProgress).toContain('class="progress-track"');
    expect(withProgress).toContain('class="progress-bar"');
  });

  it('shows the slide counter by default and hides it when disabled', () => {
    const slides = parseSlides('# One');

    const withCounter = renderDeck(slides, { theme: 'default', title: 'Deck' });
    expect(withCounter).toContain('<div class="slide-counter">');

    const withoutCounter = renderDeck(slides, { theme: 'default', title: 'Deck', showCounter: false });
    expect(withoutCounter).not.toContain('<div class="slide-counter">');
  });
});
