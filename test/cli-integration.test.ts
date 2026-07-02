import { describe, expect, it } from 'vitest';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const CLI_PATH = resolve(__dirname, '../dist/cli.js');

function makeDeckDir(markdown: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'mdslides-cli-'));
  writeFileSync(join(dir, 'deck.md'), markdown, 'utf8');
  return dir;
}

function waitFor(predicate: () => boolean, timeoutMs = 8000): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const start = Date.now();
    const check = (): void => {
      if (predicate()) {
        resolvePromise();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('timed out waiting for condition'));
        return;
      }
      setTimeout(check, 25);
    };
    check();
  });
}

describe.skipIf(!existsSync(CLI_PATH))('mdslides CLI (built)', () => {
  it('reports its version with --version', async () => {
    const { stdout } = await execFileAsync(process.execPath, [CLI_PATH, '--version']);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

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

  it('supports --progress and --no-counter', async () => {
    const dir = makeDeckDir('# One');
    const outPath = join(dir, 'deck.html');

    await execFileAsync(process.execPath, [
      CLI_PATH,
      join(dir, 'deck.md'),
      '-o',
      outPath,
      '--progress',
      '--no-counter',
    ]);

    const html = readFileSync(outPath, 'utf8');
    expect(html).toContain('class="progress-track"');
    expect(html).not.toContain('<div class="slide-counter">');
  });

  it('exits non-zero with a clear message for a missing input file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-cli-'));
    const missing = join(dir, 'missing.md');

    await expect(execFileAsync(process.execPath, [CLI_PATH, missing])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(`Cannot find Markdown file "${missing}"`),
    });
  });

  it('embeds a locally referenced image relative to the input file, not the cwd', async () => {
    const dir = makeDeckDir('![logo](img/logo.png)');
    mkdirSync(join(dir, 'img'));
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    writeFileSync(join(dir, 'img', 'logo.png'), pngBytes);
    const outPath = join(dir, 'deck.html');

    await execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '-o', outPath], { cwd: tmpdir() });

    const html = readFileSync(outPath, 'utf8');
    expect(html).toContain(`data:image/png;base64,${pngBytes.toString('base64')}`);
  });

  it('appends a custom CSS file on top of the theme', async () => {
    const dir = makeDeckDir('# One');
    const cssPath = join(dir, 'custom.css');
    writeFileSync(cssPath, '.slide { color: hotpink; }', 'utf8');
    const outPath = join(dir, 'deck.html');

    await execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '-o', outPath, '--css', cssPath]);

    const html = readFileSync(outPath, 'utf8');
    expect(html).toContain('.slide { color: hotpink; }');
  });

  it('exits non-zero with a clear message for a missing --css file', async () => {
    const dir = makeDeckDir('# One');
    const missingCss = join(dir, 'missing.css');

    await expect(
      execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '--css', missingCss]),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(`Cannot find CSS file "${missingCss}"`),
    });
  });

  it('exits non-zero with a clear message when the output directory does not exist', async () => {
    const dir = makeDeckDir('# One');
    const outPath = join(dir, 'missing-dir', 'deck.html');

    await expect(execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '-o', outPath])).rejects.toMatchObject(
      {
        code: 1,
        stderr: expect.stringContaining(`Cannot write output file "${outPath}": containing directory does not exist`),
      },
    );
  });

  it('exits non-zero with a clear message when the output path is a directory', async () => {
    const dir = makeDeckDir('# One');
    const outDir = join(dir, 'deck-output');
    mkdirSync(outDir);

    await expect(
      execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '-o', outDir]),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(`Cannot write output file "${outDir}": it is a directory`),
    });
  });

  it('exits non-zero with a clear message when --css points at a directory', async () => {
    const dir = makeDeckDir('# One');
    const cssDir = join(dir, 'styles');
    mkdirSync(cssDir);

    await expect(
      execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md'), '--css', cssDir]),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(`Expected CSS file "${cssDir}" to be a file, but it is a directory`),
    });
  });

  it('exits non-zero with a clear message for empty input', async () => {
    const dir = makeDeckDir('');

    await expect(execFileAsync(process.execPath, [CLI_PATH, join(dir, 'deck.md')])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('No slides found'),
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

  it('rebuilds the output when --watch is set and the source changes', async () => {
    const dir = makeDeckDir('# One');
    const mdPath = join(dir, 'deck.md');
    const outPath = join(dir, 'deck.html');

    const child = spawn(process.execPath, [CLI_PATH, mdPath, '-o', outPath, '--watch']);
    try {
      await waitFor(() => existsSync(outPath) && readFileSync(outPath, 'utf8').includes('One'));

      // fs.watch registration on a freshly spawned process can lag slightly behind
      // the "watching" log, so retry the write a few times if the first is missed.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        writeFileSync(mdPath, '# Two', 'utf8');
        try {
          await waitFor(() => readFileSync(outPath, 'utf8').includes('Two'), 1000);
          break;
        } catch {
          if (attempt === 4) {
            throw new Error('output was never rebuilt after the source changed');
          }
        }
      }

      const html = readFileSync(outPath, 'utf8');
      expect(html).toContain('Two');
    } finally {
      child.kill();
    }
  }, 15000);

  it('logs and survives a transient empty file under --watch, then recovers', async () => {
    const dir = makeDeckDir('# One');
    const mdPath = join(dir, 'deck.md');
    const outPath = join(dir, 'deck.html');

    const child = spawn(process.execPath, [CLI_PATH, mdPath, '-o', outPath, '--watch']);
    let stderr = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    try {
      await waitFor(() => existsSync(outPath) && readFileSync(outPath, 'utf8').includes('One'));

      for (let attempt = 0; attempt < 5; attempt += 1) {
        writeFileSync(mdPath, '', 'utf8');
        try {
          await waitFor(() => stderr.includes('No slides found'), 1000);
          break;
        } catch {
          if (attempt === 4) {
            throw new Error('empty-file rebuild never logged the expected error');
          }
        }
      }

      expect(child.exitCode).toBeNull();

      for (let attempt = 0; attempt < 5; attempt += 1) {
        writeFileSync(mdPath, '# Recovered', 'utf8');
        try {
          await waitFor(() => readFileSync(outPath, 'utf8').includes('Recovered'), 1000);
          break;
        } catch {
          if (attempt === 4) {
            throw new Error('output was never rebuilt after content was restored');
          }
        }
      }

      const html = readFileSync(outPath, 'utf8');
      expect(html).toContain('Recovered');
    } finally {
      child.kill();
    }
  }, 15000);
});
