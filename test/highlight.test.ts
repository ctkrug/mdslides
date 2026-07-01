import { describe, expect, it } from 'vitest';
import { highlightCode } from '../src/highlight.js';

describe('highlightCode', () => {
  it('highlights code using an explicit language', () => {
    const result = highlightCode('const x: number = 1;', 'ts');
    expect(result.language).toBe('ts');
    expect(result.html).toContain('hljs-keyword');
  });

  it('falls back to auto-detection when no language is given', () => {
    const result = highlightCode('def greet(name):\n    return f"hi {name}"');
    expect(result.language).not.toBe('');
    expect(result.html.length).toBeGreaterThan(0);
  });

  it('falls back to auto-detection for an unrecognized language tag', () => {
    const result = highlightCode('some plain text', 'not-a-real-language');
    expect(result.html.length).toBeGreaterThan(0);
  });
});
