#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import { Command } from 'commander';
import { buildDeck } from './index.js';
import type { ThemeName } from './types.js';
import { CliError, toCliFileError } from './errors.js';
import { watchFiles } from './watch.js';

const THEME_NAMES: ThemeName[] = ['default', 'dark', 'minimal'];

function isThemeName(value: string): value is ThemeName {
  return (THEME_NAMES as string[]).includes(value);
}

function deriveTitle(inputPath: string): string {
  return basename(inputPath, extname(inputPath));
}

async function readInput(inputPath: string): Promise<string> {
  try {
    return await readFile(inputPath, 'utf8');
  } catch (error) {
    throw toCliFileError(error, inputPath, 'Markdown file');
  }
}

async function readCustomCss(cssPath: string): Promise<string> {
  try {
    return await readFile(cssPath, 'utf8');
  } catch (error) {
    throw toCliFileError(error, cssPath, 'CSS file');
  }
}

interface CliOptions {
  output?: string;
  theme: string;
  css?: string;
  watch?: boolean;
}

async function build(inputPath: string, opts: CliOptions): Promise<void> {
  if (!isThemeName(opts.theme)) {
    throw new CliError(`Invalid --theme "${opts.theme}". Choose one of: ${THEME_NAMES.join(', ')}`);
  }

  const markdown = await readInput(inputPath);
  const customCss = opts.css ? await readCustomCss(opts.css) : undefined;
  const html = buildDeck(markdown, {
    theme: opts.theme,
    customCss,
    title: deriveTitle(inputPath),
    baseDir: dirname(resolve(inputPath)),
  });

  const outputPath = opts.output ?? `${basename(inputPath, extname(inputPath))}.html`;
  await writeFile(outputPath, html, 'utf8');
  console.log(`Wrote ${outputPath}`);
}

async function run(inputPath: string, opts: CliOptions): Promise<void> {
  await build(inputPath, opts);

  if (opts.watch) {
    const watchedPaths = [inputPath, ...(opts.css ? [opts.css] : [])];
    console.log('Watching for changes... (Ctrl+C to stop)');
    watchFiles(watchedPaths, () => {
      build(inputPath, opts).catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
      });
    });
    await new Promise<void>(() => {});
  }
}

const program = new Command();

program
  .name('mdslides')
  .description('Turn a Markdown file into a self-contained HTML slide deck')
  .argument('<input>', 'path to the source Markdown file')
  .option('-o, --output <path>', 'output HTML file path')
  .option('-t, --theme <name>', `theme to use (${THEME_NAMES.join(', ')})`, 'default')
  .option('--css <path>', 'path to a custom CSS file to append to the theme')
  .option('--watch', 'rebuild the output whenever the input Markdown (or --css) changes')
  .action((input: string, opts: CliOptions) => {
    run(input, opts).catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
  });

program.parse();
