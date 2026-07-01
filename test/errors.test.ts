import { describe, expect, it } from 'vitest';
import { CliError, toCliFileError, toCliWriteError } from '../src/errors.js';

function errnoError(code: string): NodeJS.ErrnoException {
  const error = new Error(code) as NodeJS.ErrnoException;
  error.code = code;
  return error;
}

describe('toCliFileError', () => {
  it('produces a clear message for a missing file', () => {
    const result = toCliFileError(errnoError('ENOENT'), 'talk.md', 'Markdown file');
    expect(result).toBeInstanceOf(CliError);
    expect(result.message).toBe('Cannot find Markdown file "talk.md"');
  });

  it('produces a clear message when the path is a directory', () => {
    const result = toCliFileError(errnoError('EISDIR'), 'talk.md', 'Markdown file');
    expect(result.message).toBe('Expected Markdown file "talk.md" to be a file, but it is a directory');
  });

  it('produces a clear message for a permission error', () => {
    const result = toCliFileError(errnoError('EACCES'), 'talk.md', 'CSS file');
    expect(result.message).toBe('Permission denied reading CSS file "talk.md"');
  });

  it('falls back to the underlying message for unrecognized errors', () => {
    const result = toCliFileError(new Error('disk exploded'), 'talk.md', 'Markdown file');
    expect(result.message).toBe('Could not read Markdown file "talk.md": disk exploded');
  });
});

describe('toCliWriteError', () => {
  it('produces a clear message when the output directory does not exist', () => {
    const result = toCliWriteError(errnoError('ENOENT'), 'out/deck.html');
    expect(result).toBeInstanceOf(CliError);
    expect(result.message).toBe('Cannot write output file "out/deck.html": containing directory does not exist');
  });

  it('produces a clear message when the output path is a directory', () => {
    const result = toCliWriteError(errnoError('EISDIR'), 'deck.html');
    expect(result.message).toBe('Cannot write output file "deck.html": it is a directory');
  });

  it('produces a clear message for a permission error', () => {
    const result = toCliWriteError(errnoError('EACCES'), 'deck.html');
    expect(result.message).toBe('Permission denied writing output file "deck.html"');
  });

  it('falls back to the underlying message for unrecognized errors', () => {
    const result = toCliWriteError(new Error('disk full'), 'deck.html');
    expect(result.message).toBe('Could not write output file "deck.html": disk full');
  });
});
