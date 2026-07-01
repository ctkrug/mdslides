import { describe, expect, it } from 'vitest';
import { parseSlides } from '../src/parser.js';

describe('parseSlides', () => {
  it('splits on a horizontal rule that sits on its own line', () => {
    const slides = parseSlides('# One\n\n---\n\n# Two');
    expect(slides).toHaveLength(2);
    expect(slides[0].markdown).toBe('# One');
    expect(slides[1].markdown).toBe('# Two');
  });

  it('ignores horizontal rules inside fenced code blocks', () => {
    const slides = parseSlides('# One\n\n```\na\n---\nb\n```\n\n---\n\n# Two');
    expect(slides).toHaveLength(2);
    expect(slides[0].markdown).toContain('---');
  });

  it('extracts speaker notes from HTML comments', () => {
    const slides = parseSlides('# One\n\n<!-- note: say hi -->\n\nBody text');
    expect(slides).toHaveLength(1);
    expect(slides[0].notes).toEqual(['say hi']);
    expect(slides[0].markdown).not.toContain('note:');
  });

  it('drops empty slides produced by leading/trailing separators', () => {
    const slides = parseSlides('---\n\n# One\n\n---');
    expect(slides).toHaveLength(1);
    expect(slides[0].markdown).toBe('# One');
  });
});
