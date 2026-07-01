export interface Slide {
  /** Raw Markdown source for this slide, excluding the `---` separator. */
  markdown: string;
  /** Speaker notes extracted from `<!-- note: ... -->` comments, if any. */
  notes: string[];
}

export type ThemeName = 'default' | 'dark' | 'minimal';

export interface BuildOptions {
  /** Theme to embed in the generated deck. */
  theme: ThemeName;
  /** Path to a custom CSS file whose contents are appended after the theme. */
  customCss?: string;
  /** Title used for the `<title>` tag of the generated HTML document. */
  title: string;
}
