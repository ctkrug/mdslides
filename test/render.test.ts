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
});
