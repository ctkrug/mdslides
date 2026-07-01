export const darkTheme = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #10131a;
  color: #e8eaf0;
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
.slide h1 { font-size: 2.75rem; margin-bottom: 0.5em; color: #ffffff; }
.slide h2 { font-size: 2.1rem; color: #ffffff; }
.slide a { color: #7db4ff; }
.slide pre {
  background: #05070c;
  color: #d7dbe3;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}
.slide code { font-family: "SFMono-Regular", Consolas, monospace; }
.slide blockquote {
  margin: 0.5em 0;
  padding: 0.25em 1.25em;
  border-left: 4px solid #3a4150;
  color: #a9b0bd;
  font-style: italic;
}
.slide ul ul, .slide ol ol, .slide ul ol, .slide ol ul { margin: 0.2em 0; }
.slide table { border-collapse: collapse; margin: 0.5em 0; }
.slide th, .slide td { border: 1px solid #2a2f3a; padding: 0.4em 0.8em; text-align: left; }
.slide th { background: #1a1e27; font-weight: 600; }
.hljs-comment, .hljs-quote { color: #5c6470; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #ff7edb; }
.hljs-string, .hljs-attr { color: #ffd479; }
.hljs-number, .hljs-built_in { color: #7ee787; }
.hljs-title, .hljs-title.function_ { color: #7db4ff; }
.hljs-type, .hljs-class .hljs-title { color: #56d4c7; }
.slide-counter {
  position: fixed;
  bottom: 1rem;
  right: 1.25rem;
  font-size: 0.85rem;
  color: #666f80;
}
`;
