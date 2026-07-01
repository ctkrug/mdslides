import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { watchFiles } from '../src/watch.js';

function waitFor(predicate: () => boolean, timeoutMs = 2000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = (): void => {
      if (predicate()) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('timed out waiting for condition'));
        return;
      }
      setTimeout(check, 20);
    };
    check();
  });
}

describe('watchFiles', () => {
  it('invokes the callback when a watched file changes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-watch-'));
    const file = join(dir, 'deck.md');
    writeFileSync(file, '# One', 'utf8');

    let calls = 0;
    const handle = watchFiles([file], () => {
      calls += 1;
    });

    try {
      writeFileSync(file, '# Two', 'utf8');
      await waitFor(() => calls > 0);
      expect(calls).toBeGreaterThan(0);
    } finally {
      handle.close();
    }
  });

  it('debounces rapid successive changes into a single callback', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-watch-'));
    const file = join(dir, 'deck.md');
    writeFileSync(file, '# One', 'utf8');

    let calls = 0;
    const handle = watchFiles([file], () => {
      calls += 1;
    }, 100);

    try {
      writeFileSync(file, '# Two', 'utf8');
      writeFileSync(file, '# Three', 'utf8');
      writeFileSync(file, '# Four', 'utf8');
      await new Promise((r) => setTimeout(r, 300));
      expect(calls).toBe(1);
    } finally {
      handle.close();
    }
  });
});
