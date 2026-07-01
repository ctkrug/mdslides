import { describe, expect, it } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const CLI_PATH = resolve(__dirname, '../dist/cli.js');

function makeDeckDir(markdown: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'mdslides-cli-'));
  writeFileSync(join(dir, 'deck.md'), markdown, 'utf8');
  return dir;
}

describe.skipIf(!existsSync(CLI_PATH))('mdslides CLI (built)', () => {
  it('writes a self-contained HTML deck for valid input', async () => {
    const dir = makeDeckDir('# One\n\n---\n\n# Two');
    const outPath = join(dir, 'deck.html');

    const { stdout } = await execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '-o', outPath]);

    expect(stdout).toContain('Wrote');
    const html = readFileSync(outPath, 'utf8');
    expect(html).toContain('<section class="slide active"');
    expect((html.match(/<section class="slide/g) ?? []).length).toBe(2);
  });

  it('applies the requested theme', async () => {
    const dir = makeDeckDir('# One');
    const outPath = join(dir, 'deck.html');

    await execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '-o', outPath, '--theme', 'dark']);

    const html = readFileSync(outPath, 'utf8');
    expect(html).toContain('#10131a');
  });

  it('exits non-zero with a clear message for a missing input file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-cli-'));
    const missing = join(dir, 'missing.md');

    await expect(execFileAsync(process.execPath, [CLI_PATH, missing])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(`Cannot find Markdown file "${missing}"`),
    });
  });

  it('exits non-zero with a clear message for an invalid theme', async () => {
    const dir = makeDeckDir('# One');

    await expect(
      execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '--theme', 'neon']),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Invalid --theme "neon"'),
    });
  });
});
