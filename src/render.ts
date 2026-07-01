import { Marked } from 'marked';
import type { BuildOptions, Slide } from './types.js';
import { getTheme } from './themes/index.js';
import { navigationScript } from './navigation.js';
import { embedImage } from './images.js';
import { highlightCode } from './highlight.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createRenderer(baseDir: string): Marked {
  const instance = new Marked();
  instance.use({
    renderer: {
      image(href: string, title: string | null, text: string) {
        const src = embedImage(href, baseDir);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${src}" alt="${escapeHtml(text)}"${titleAttr} />`;
      },
      code(code: string, infostring: string | undefined) {
        const lang = infostring?.trim().split(/\s+/)[0] || undefined;
        const { html, language } = highlightCode(code, lang);
        return `<pre><code class="hljs language-${language}">${html}</code></pre>`;
      },
    },
  });
  return instance;
}

function renderSlide(slide: Slide, index: number, marked: Marked): string {
  const html = marked.parse(slide.markdown, { async: false }) as string;
  const notesAttr = escapeHtml(slide.notes.join('\n'));
  const activeClass = index === 0 ? ' active' : '';
  return `  <section class="slide${activeClass}" data-notes="${notesAttr}">\n${html}\n  </section>`;
}

/** Renders a full set of slides into a single self-contained HTML document. */
export function renderDeck(slides: Slide[], options: BuildOptions): string {
  const theme = getTheme(options.theme);
  const customCss = options.customCss ? `\n${options.customCss}\n` : '';
  const marked = createRenderer(options.baseDir ?? process.cwd());
  const body = slides.map((slide, index) => renderSlide(slide, index, marked)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
  <style>${theme}${customCss}
.notes-panel {
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 30vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  white-space: pre-wrap;
}
.notes-panel.visible { display: block; }
  </style>
</head>
<body>
${body}
  <div class="slide-counter"></div>
  <div class="notes-panel"></div>
  <script>${navigationScript}</script>
</body>
</html>
`;
}
