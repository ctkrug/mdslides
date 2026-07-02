import type { Slide } from './types.js';

const SLIDE_BREAK = /^-{3,}\s*$/;
const FENCE = /^(`{3,}|~{3,})/;
const NOTE_COMMENT = /<!--\s*note:\s*([\s\S]*?)-->/gi;
const LEADING_INCREMENTAL_COMMENT = /^<!--\s*incremental\s*-->\s*/i;

/**
 * Splits a Markdown document into slides on horizontal rules (`---` on their
 * own line), ignoring rules that appear inside fenced code blocks so that
 * code samples containing `---` are never mistaken for slide breaks.
 */
export function parseSlides(source: string): Slide[] {
  const lines = source.split(/\r?\n/);
  const chunks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  let fenceChar = '';
  let fenceLength = 0;

  for (const line of lines) {
    const fenceMatch = line.match(FENCE);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceChar = marker[0];
        fenceLength = marker.length;
      } else if (marker[0] === fenceChar && marker.length >= fenceLength) {
        // CommonMark only closes a fence on a marker of the same character
        // that is at least as long as the opener, so a shorter nested
        // fence (e.g. a ``` shown inside a ```` block) doesn't close it early.
        inFence = false;
      }
      current.push(line);
      continue;
    }

    if (!inFence && SLIDE_BREAK.test(line)) {
      chunks.push(current.join('\n'));
      current = [];
      continue;
    }

    current.push(line);
  }
  chunks.push(current.join('\n'));

  return chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map(toSlide);
}

function toSlide(markdown: string): Slide {
  const notes: string[] = [];
  const withoutNotes = markdown.replace(NOTE_COMMENT, (_match, note: string) => {
    notes.push(note.trim());
    return '';
  });

  // Only a marker leading the slide is treated as the incremental flag, so
  // mentioning the literal `<!-- incremental -->` syntax elsewhere in a
  // slide's body (e.g. as documentation text) is left untouched.
  const trimmed = withoutNotes.trimStart();
  const leadingMatch = trimmed.match(LEADING_INCREMENTAL_COMMENT);
  const body = leadingMatch ? trimmed.slice(leadingMatch[0].length) : withoutNotes;

  return { markdown: body.trim(), notes, incremental: leadingMatch !== null };
}
