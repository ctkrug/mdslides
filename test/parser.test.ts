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

  it('collects multiple note comments on the same slide in order', () => {
    const slides = parseSlides('# One\n\n<!-- note: first -->\n\nBody\n\n<!-- note: second -->');
    expect(slides[0].notes).toEqual(['first', 'second']);
    expect(slides[0].markdown).toBe('# One\n\n\n\nBody');
  });

  it('drops empty slides produced by leading/trailing separators', () => {
    const slides = parseSlides('---\n\n# One\n\n---');
    expect(slides).toHaveLength(1);
    expect(slides[0].markdown).toBe('# One');
  });

  it('marks a slide incremental from a leading <!-- incremental --> comment', () => {
    const slides = parseSlides('<!-- incremental -->\n\n# One\n\n- a\n- b');
    expect(slides[0].incremental).toBe(true);
    expect(slides[0].markdown).not.toContain('incremental');
    expect(slides[0].markdown).toBe('# One\n\n- a\n- b');
  });

  it('defaults incremental to false when no marker is present', () => {
    const slides = parseSlides('# One\n\n- a\n- b');
    expect(slides[0].incremental).toBe(false);
  });

  it('does not treat a mid-slide mention of the marker as the flag', () => {
    const slides = parseSlides('# One\n\n<!-- incremental -->\n\n- a\n- b');
    expect(slides[0].incremental).toBe(false);
    expect(slides[0].markdown).toContain('<!-- incremental -->');
  });

  it('leaves a literal mention of the marker syntax in body text untouched', () => {
    const slides = parseSlides(
      '<!-- incremental -->\n\n- mark a slide `<!-- incremental -->`\n- another point',
    );
    expect(slides[0].incremental).toBe(true);
    expect(slides[0].markdown).toBe('- mark a slide `<!-- incremental -->`\n- another point');
  });
});
