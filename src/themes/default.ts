export const defaultTheme = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f7f7f8;
  color: #1a1a1a;
}
.slide {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 8vh 10vw;
  display: none;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
}
.slide.active {
  display: flex;
}
.slide h1 { font-size: 2.75rem; margin-bottom: 0.5em; }
.slide h2 { font-size: 2.1rem; }
.slide pre {
  background: #1e1e1e;
  color: #e6e6e6;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}
.slide code { font-family: "SFMono-Regular", Consolas, monospace; }
.slide blockquote {
  margin: 0.5em 0;
  padding: 0.25em 1.25em;
  border-left: 4px solid #c8c8cc;
  color: #55565c;
  font-style: italic;
}
.slide ul ul, .slide ol ol, .slide ul ol, .slide ol ul { margin: 0.2em 0; }
.slide table { border-collapse: collapse; margin: 0.5em 0; }
.slide th, .slide td { border: 1px solid #d5d5d8; padding: 0.4em 0.8em; text-align: left; }
.slide th { background: #ececf0; font-weight: 600; }
.hljs-comment, .hljs-quote { color: #8a8a8a; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #c586c0; }
.hljs-string, .hljs-attr { color: #ce9178; }
.hljs-number, .hljs-built_in { color: #b5cea8; }
.hljs-title, .hljs-title.function_ { color: #dcdcaa; }
.hljs-type, .hljs-class .hljs-title { color: #4ec9b0; }
.slide-counter {
  position: fixed;
  bottom: 1rem;
  right: 1.25rem;
  font-size: 0.85rem;
  color: #888;
}
`;
