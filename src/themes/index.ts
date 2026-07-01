import type { ThemeName } from '../types.js';
import { defaultTheme } from './default.js';
import { darkTheme } from './dark.js';
import { minimalTheme } from './minimal.js';

const THEMES: Record<ThemeName, string> = {
  default: defaultTheme,
  dark: darkTheme,
  minimal: minimalTheme,
};

export function getTheme(name: ThemeName): string {
  const css = THEMES[name];
  if (!css) {
    throw new Error(`Unknown theme "${name}". Available themes: ${Object.keys(THEMES).join(', ')}`);
  }
  return css;
}
