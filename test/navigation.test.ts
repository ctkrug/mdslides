import { describe, expect, it, vi } from 'vitest';
import { createContext, runInContext } from 'node:vm';
import { navigationScript } from '../src/navigation.js';

function makeSlide(): { classList: { toggle: ReturnType<typeof vi.fn> }; getAttribute: () => string } {
  return {
    classList: { toggle: vi.fn() },
    getAttribute: () => '',
  };
}

function runNavigation(overrides: Partial<Record<string, unknown>> = {}) {
  const listeners: Record<string, (event: { key: string; target?: unknown }) => void> = {};
  const slides = [makeSlide(), makeSlide(), makeSlide()];
  const documentElement = { requestFullscreen: vi.fn() };
  const fakeDocument = {
    querySelectorAll: () => slides,
    querySelector: () => null,
    documentElement,
    fullscreenElement: null as unknown,
    exitFullscreen: vi.fn(),
    addEventListener: (type: string, handler: (event: { key: string; target?: unknown }) => void) => {
      listeners[type] = handler;
    },
    ...overrides,
  };

  const context = createContext({ document: fakeDocument, Array, Math, console });
  runInContext(navigationScript, context);

  return { listeners, documentElement: fakeDocument.documentElement, fakeDocument };
}

describe('navigationScript fullscreen toggle', () => {
  it('requests fullscreen on "f" when not already fullscreen', () => {
    const { listeners, documentElement } = runNavigation();

    listeners.keydown({ key: 'f' });

    expect(documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('exits fullscreen on "f" when already fullscreen', () => {
    const { listeners, fakeDocument } = runNavigation({ fullscreenElement: {} });

    listeners.keydown({ key: 'F' });

    expect(fakeDocument.exitFullscreen).toHaveBeenCalledTimes(1);
  });
});
