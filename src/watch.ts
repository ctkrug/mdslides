import { watch } from 'node:fs';

export interface WatchHandle {
  close(): void;
}

/**
 * Watches the given file paths and invokes `onChange` (debounced) whenever
 * any of them changes. Multiple rapid events collapse into a single call.
 */
export function watchFiles(paths: string[], onChange: () => void, debounceMs = 50): WatchHandle {
  let timer: NodeJS.Timeout | undefined;

  const trigger = (): void => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(onChange, debounceMs);
  };

  const watchers = paths.map((path) => watch(path, trigger));

  return {
    close(): void {
      if (timer) {
        clearTimeout(timer);
      }
      watchers.forEach((watcher) => watcher.close());
    },
  };
}
