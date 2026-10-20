import type { BlogCategory } from "./types";

/**
 * Category metadata. Lives apart from src/lib/blog/index.ts so client
 * components can import it without bundling every article body.
 */
export const CATEGORIES: Array<{ id: BlogCategory; label: string }> = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "formats", label: "Formats & Quality" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "guides", label: "Guides" },
];

export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<BlogCategory, string>;
