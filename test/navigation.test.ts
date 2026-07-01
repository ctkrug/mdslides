import { describe, expect, it, vi } from 'vitest';
import { createContext, runInContext } from 'node:vm';
import { navigationScript } from '../src/navigation.js';

interface FakeFragment {
  classList: { toggle: ReturnType<typeof vi.fn> };
}

interface FakeSlide {
  classList: { toggle: ReturnType<typeof vi.fn> };
  getAttribute: () => string;
  querySelectorAll: (selector: string) => FakeFragment[];
}

function makeSlide(fragmentCount = 0): FakeSlide {
  const fragments: FakeFragment[] = Array.from({ length: fragmentCount }, () => ({
    classList: { toggle: vi.fn() },
  }));
  return {
    classList: { toggle: vi.fn() },
    getAttribute: () => '',
    querySelectorAll: () => fragments,
  };
}

function runNavigation(slides: FakeSlide[], overrides: Partial<Record<string, unknown>> = {}) {
  const listeners: Record<string, (event: { key: string; target?: unknown }) => void> = {};
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

  return { listeners, documentElement: fakeDocument.documentElement, fakeDocument, slides };
}

describe('navigationScript fullscreen toggle', () => {
  it('requests fullscreen on "f" when not already fullscreen', () => {
    const { listeners, documentElement } = runNavigation([makeSlide(), makeSlide(), makeSlide()]);

    listeners.keydown({ key: 'f' });

    expect(documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('exits fullscreen on "f" when already fullscreen', () => {
    const { listeners, fakeDocument } = runNavigation([makeSlide(), makeSlide(), makeSlide()], {
      fullscreenElement: {},
    });

    listeners.keydown({ key: 'F' });

    expect(fakeDocument.exitFullscreen).toHaveBeenCalledTimes(1);
  });
});

describe('navigationScript incremental reveal', () => {
  it('reveals fragments one at a time before moving to the next slide', () => {
    const first = makeSlide(2);
    const second = makeSlide(0);
    const { listeners } = runNavigation([first, second]);

    listeners.keydown({ key: 'ArrowRight' });
    expect(first.querySelectorAll('.fragment')[0].classList.toggle).toHaveBeenLastCalledWith('visible', true);
    expect(second.classList.toggle).not.toHaveBeenCalledWith('active', true);

    listeners.keydown({ key: 'ArrowRight' });
    expect(first.querySelectorAll('.fragment')[1].classList.toggle).toHaveBeenLastCalledWith('visible', true);
    expect(second.classList.toggle).not.toHaveBeenCalledWith('active', true);

    listeners.keydown({ key: 'ArrowRight' });
    expect(second.classList.toggle).toHaveBeenCalledWith('active', true);
  });

  it('hides the last fragment before moving to the previous slide', () => {
    const first = makeSlide(1);
    const second = makeSlide(0);
    const { listeners } = runNavigation([first, second]);

    listeners.keydown({ key: 'ArrowRight' });
    listeners.keydown({ key: 'ArrowRight' });
    expect(second.classList.toggle).toHaveBeenCalledWith('active', true);

    listeners.keydown({ key: 'ArrowLeft' });
    expect(first.classList.toggle).toHaveBeenLastCalledWith('active', true);
    expect(first.querySelectorAll('.fragment')[0].classList.toggle).toHaveBeenLastCalledWith('visible', true);
  });
});
