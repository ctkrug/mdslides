import { describe, expect, it } from 'vitest';
import { buildDeck } from '../src/index.js';

describe('buildDeck', () => {
  it('rejects empty input instead of emitting a deck with zero slides', () => {
    expect(() => buildDeck('', { theme: 'default', title: 'Deck' })).toThrow(/No slides found/);
  });

  it('rejects input that is only whitespace and separators', () => {
    expect(() => buildDeck('\n\n---\n\n   \n', { theme: 'default', title: 'Deck' })).toThrow(/No slides found/);
  });

  it('builds a deck for valid input', () => {
    const html = buildDeck('# One', { theme: 'default', title: 'Deck' });
    expect(html).toContain('<section class="slide active"');
  });
});
