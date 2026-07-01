import hljs from 'highlight.js';

export interface HighlightResult {
  /** Highlighted code as HTML with `hljs-*` span classes, ready to inline. */
  html: string;
  /** The language used for highlighting, or `plaintext` when none was detected. */
  language: string;
}

/**
 * Highlights a fenced code block at build time using highlight.js, so the
 * generated deck only ships static `<span class="hljs-...">` markup and CSS
 * — no highlighter runtime ships to the browser.
 */
export function highlightCode(code: string, lang?: string): HighlightResult {
  if (lang && hljs.getLanguage(lang)) {
    const { value } = hljs.highlight(code, { language: lang });
    return { html: value, language: lang };
  }
  const { value, language } = hljs.highlightAuto(code);
  return { html: value, language: language ?? 'plaintext' };
}
