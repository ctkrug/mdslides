export { parseSlides } from './parser.js';
export { renderDeck } from './render.js';
export { getTheme } from './themes/index.js';
export type { Slide, ThemeName, BuildOptions } from './types.js';

import { parseSlides } from './parser.js';
import { renderDeck } from './render.js';
import type { BuildOptions } from './types.js';

/** Converts Markdown source directly into a rendered HTML deck. */
export function buildDeck(markdown: string, options: BuildOptions): string {
  const slides = parseSlides(markdown);
  if (slides.length === 0) {
    throw new Error('No slides found — the input is empty or contains only blank separators');
  }
  return renderDeck(slides, options);
}
