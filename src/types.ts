export interface Slide {
  /** Raw Markdown source for this slide, excluding the `---` separator. */
  markdown: string;
  /** Speaker notes extracted from `<!-- note: ... -->` comments, if any. */
  notes: string[];
  /** Whether `<!-- incremental -->` marked this slide's list items to reveal one at a time. */
  incremental: boolean;
}

export type ThemeName = 'default' | 'dark' | 'minimal';

export interface BuildOptions {
  /** Theme to embed in the generated deck. */
  theme: ThemeName;
  /** Path to a custom CSS file whose contents are appended after the theme. */
  customCss?: string;
  /** Title used for the `<title>` tag of the generated HTML document. */
  title: string;
  /** Directory used to resolve relative image paths, for embedding as data URIs. */
  baseDir?: string;
  /** Shows a progress bar reflecting position in the deck. Defaults to false. */
  showProgress?: boolean;
  /** Shows the "N / total" slide counter. Defaults to true. */
  showCounter?: boolean;
}
