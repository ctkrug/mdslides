import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { embedImage } from '../src/images.js';

describe('embedImage', () => {
  it('inlines a local PNG as a base64 data URI', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-'));
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    writeFileSync(join(dir, 'logo.png'), pngBytes);

    const result = embedImage('logo.png', dir);
    expect(result).toBe(`data:image/png;base64,${pngBytes.toString('base64')}`);
  });

  it('leaves absolute http(s) URLs untouched', () => {
    expect(embedImage('https://example.com/a.png', '/tmp')).toBe('https://example.com/a.png');
    expect(embedImage('http://example.com/a.png', '/tmp')).toBe('http://example.com/a.png');
  });

  it('leaves existing data URIs untouched', () => {
    const dataUri = 'data:image/png;base64,AAAA';
    expect(embedImage(dataUri, '/tmp')).toBe(dataUri);
  });

  it('throws a clear error when the local image cannot be read', () => {
    expect(() => embedImage('missing.png', '/tmp')).toThrow(/Could not read image "missing.png"/);
  });

  it('leaves unrecognized extensions untouched', () => {
    expect(embedImage('script.js', '/tmp')).toBe('script.js');
  });

  it('resolves the MIME type case-insensitively for uppercase extensions', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mdslides-'));
    const jpgBytes = Buffer.from([0xff, 0xd8, 0xff]);
    writeFileSync(join(dir, 'photo.JPG'), jpgBytes);

    const result = embedImage('photo.JPG', dir);
    expect(result).toBe(`data:image/jpeg;base64,${jpgBytes.toString('base64')}`);
  });

  it('leaves a protocol-relative URL untouched', () => {
    expect(embedImage('//example.com/a.png', '/tmp')).toBe('//example.com/a.png');
  });
});
