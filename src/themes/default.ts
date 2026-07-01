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
.slide-counter {
  position: fixed;
  bottom: 1rem;
  right: 1.25rem;
  font-size: 0.85rem;
  color: #888;
}
`;
