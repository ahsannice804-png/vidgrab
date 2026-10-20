/**
 * Prints each blog article's slug and body word count.
 * Run with: node scripts/blog-wordcount.ts
 */
import { ARTICLES } from "../src/content/blog/index.ts";
import { countWords } from "../src/lib/blog/text.ts";

let total = 0;
for (const a of ARTICLES) {
  const words = countWords(a.body);
  total += words;
  const flag = words < 1000 || words > 1400 ? "  <-- outside 1000-1400" : "";
  console.log(`${String(words).padStart(5)}  ${a.slug}${flag}`);
}
console.log(`${String(total).padStart(5)}  total (${ARTICLES.length} articles)`);
