#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import { Command } from 'commander';
import { buildDeck } from './index.js';
import type { ThemeName } from './types.js';

const THEME_NAMES: ThemeName[] = ['default', 'dark', 'minimal'];

function isThemeName(value: string): value is ThemeName {
  return (THEME_NAMES as string[]).includes(value);
}

function deriveTitle(inputPath: string): string {
  return basename(inputPath, extname(inputPath));
}

async function run(inputPath: string, opts: { output?: string; theme: string; css?: string }): Promise<void> {
  if (!isThemeName(opts.theme)) {
    throw new Error(`Invalid --theme "${opts.theme}". Choose one of: ${THEME_NAMES.join(', ')}`);
  }

  const markdown = await readFile(inputPath, 'utf8');
  const customCss = opts.css ? await readFile(opts.css, 'utf8') : undefined;
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

const program = new Command();

program
  .name('mdslides')
  .description('Turn a Markdown file into a self-contained HTML slide deck')
  .argument('<input>', 'path to the source Markdown file')
  .option('-o, --output <path>', 'output HTML file path')
  .option('-t, --theme <name>', `theme to use (${THEME_NAMES.join(', ')})`, 'default')
  .option('--css <path>', 'path to a custom CSS file to append to the theme')
  .action((input: string, opts: { output?: string; theme: string; css?: string }) => {
    run(input, opts).catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
  });

program.parse();
