/**
 * Plain-text helpers shared by the blog renderer, the TOC and word counts.
 * Kept free of React so they can run in tests and scripts too.
 */

/** Strips the inline Markdown used in article bodies down to plain text. */
export function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

/** URL-safe heading id: "Why 1080p fails?" -> "why-1080p-fails". */
export function slugify(text: string): string {
  return stripInline(text)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Visible words in a Markdown body (syntax characters excluded). */
export function countWords(markdown: string): number {
  const plain = stripInline(markdown)
    .replace(/^\s*(#{2,3}|>\s*\[![A-Z]+\]|>|-|\d+\.)\s*/gm, "")
    .replace(/\|/g, " ")
    .replace(/^[\s:-]+$/gm, "");
  return plain.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

/** Reading time at ~220 words per minute, never less than one minute. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

export interface TocEntry {
  id: string;
  text: string;
}

/** Table of contents built from the article's H2 headings. */
export function extractToc(markdown: string): TocEntry[] {
  return markdown
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) => {
      const text = stripInline(line.replace(/^##\s+/, "").trim());
      // The TOC numbers its own entries, so drop "1. " style prefixes here.
      return { id: slugify(text), text: text.replace(/^\d+\.\s+/, "") };
    });
}
