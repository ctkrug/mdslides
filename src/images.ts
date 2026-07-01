import { readFileSync } from 'node:fs';
import { extname, isAbsolute, resolve } from 'node:path';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function isRemote(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith('data:');
}

/**
 * Resolves a Markdown image `src` against the source file's directory and
 * inlines it as a base64 data URI, so the rendered deck stays one portable
 * file. Remote URLs and existing data URIs are left untouched.
 */
export function embedImage(src: string, baseDir: string): string {
  if (isRemote(src)) {
    return src;
  }

  const ext = extname(src).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) {
    return src;
  }

  const path = isAbsolute(src) ? src : resolve(baseDir, src);
  let data: string;
  try {
    data = readFileSync(path).toString('base64');
  } catch {
    throw new Error(`Could not read image "${src}" (resolved to "${path}")`);
  }
  return `data:${mime};base64,${data}`;
}
