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

function makeUiElement(): { textContent: string; style: { width: string }; classList: { toggle: ReturnType<typeof vi.fn> } } {
  return { textContent: '', style: { width: '' }, classList: { toggle: vi.fn() } };
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

  it('does not move before the first slide or past the last slide', () => {
    const only = makeSlide();
    const { listeners } = runNavigation([only]);

    expect(() => listeners.keydown({ key: 'ArrowLeft' })).not.toThrow();
    expect(() => listeners.keydown({ key: 'ArrowRight' })).not.toThrow();
    expect(only.classList.toggle).toHaveBeenCalledWith('active', true);
    expect(only.classList.toggle).not.toHaveBeenCalledWith('active', false);
  });
});

describe('navigationScript notes panel', () => {
  it('toggles the "visible" class on "n"', () => {
    const notesPanel = { classList: { toggle: vi.fn() }, contains: vi.fn(() => false) };
    const { listeners } = runNavigation([makeSlide(), makeSlide()], {
      querySelector: (selector: string) => (selector === '.notes-panel' ? notesPanel : null),
    });

    listeners.keydown({ key: 'N' });

    expect(notesPanel.classList.toggle).toHaveBeenCalledWith('visible');
  });
});

describe('navigationScript click navigation', () => {
  it('advances the deck on a click outside the notes panel', () => {
    const second = makeSlide();
    const { listeners } = runNavigation([makeSlide(), second]);

    listeners.click({ key: '', target: {} });

    expect(second.classList.toggle).toHaveBeenCalledWith('active', true);
  });

  it('does not advance when the click lands inside the notes panel', () => {
    const target = {};
    const notesPanel = { classList: { toggle: vi.fn() }, contains: vi.fn(() => true) };
    const second = makeSlide();
    const { listeners } = runNavigation([makeSlide(), second], {
      querySelector: (selector: string) => (selector === '.notes-panel' ? notesPanel : null),
    });

    listeners.click({ key: '', target });

    expect(second.classList.toggle).not.toHaveBeenCalledWith('active', true);
  });
});

describe('navigationScript counter and progress bar', () => {
  it('updates the slide counter text and progress bar width when advancing', () => {
    const counter = makeUiElement();
    const progressBar = makeUiElement();
    const { listeners } = runNavigation([makeSlide(), makeSlide()], {
      querySelector: (selector: string) => {
        if (selector === '.slide-counter') return counter;
        if (selector === '.progress-bar') return progressBar;
        return null;
      },
    });

    expect(counter.textContent).toBe('1 / 2');
    expect(progressBar.style.width).toBe('0%');

    listeners.keydown({ key: 'ArrowRight' });

    expect(counter.textContent).toBe('2 / 2');
    expect(progressBar.style.width).toBe('100%');
  });
});
