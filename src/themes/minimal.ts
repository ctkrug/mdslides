export const minimalTheme = `
body {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  background: #ffffff;
  color: #111111;
}
.slide {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 10vh 14vw;
  display: none;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
}
.slide.active {
  display: flex;
}
.slide h1 { font-size: 2.4rem; font-weight: normal; margin-bottom: 0.6em; }
.slide h2 { font-size: 1.8rem; font-weight: normal; }
.slide pre {
  background: #f2f2f2;
  color: #111111;
  padding: 1em;
  border: 1px solid #ddd;
  overflow-x: auto;
}
.slide code { font-family: Menlo, Consolas, monospace; }
.hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #a626a4; }
.hljs-string, .hljs-attr { color: #50a14f; }
.hljs-number, .hljs-built_in { color: #986801; }
.hljs-title, .hljs-title.function_ { color: #4078f2; }
.hljs-type, .hljs-class .hljs-title { color: #0184bc; }
.slide-counter {
  position: fixed;
  bottom: 1rem;
  right: 1.25rem;
  font-size: 0.8rem;
  color: #999;
}
`;
