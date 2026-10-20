import test from "node:test";
import assert from "node:assert/strict";

import { ARTICLES } from "../../content/blog/index.ts";
import { countWords, extractToc } from "./text.ts";

const EXPECTED_SLUGS = [
  "download-youtube-videos-iphone-android-pc",
  "download-youtube-shorts",
  "youtube-to-mp3-guide",
  "youtube-playlist-download-guide",
  "download-long-youtube-videos",
  "save-instagram-reels-without-watermark",
  "download-instagram-videos-mobile",
  "instagram-reel-audio-mp3",
  "download-facebook-videos-fb-watch",
  "download-facebook-reels",
  "facebook-video-private-login-explained",
  "video-quality-360p-720p-1080p",
  "mp4-vs-mp3-vs-webm",
  "video-file-size-guide",
  "video-download-slow-fixes",
  "why-video-downloads-fail",
  "copy-video-link-guide",
  "find-downloaded-videos",
  "how-video-downloaders-work",
  "is-downloading-videos-legal",
];

/** Site routes an article may link to besides other articles. */
const SITE_ROUTES = new Set([
  "/",
  "/youtube-video-downloader",
  "/instagram-reels-downloader",
  "/facebook-video-downloader",
  "/blog",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
]);

/** Template phrases the writing brief rules out. */
const BANNED = [
  "in today's digital age",
  "in conclusion",
  "unlock the power",
  "seamless",
  "game-changer",
  "game changer",
  "delve",
];

const slugs = new Set(ARTICLES.map((a) => a.slug));

function internalLinks(body: string): string[] {
  return [...body.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]);
}

test("publishes exactly the 20 briefed articles with unique slugs", () => {
  assert.equal(ARTICLES.length, EXPECTED_SLUGS.length);
  assert.equal(slugs.size, ARTICLES.length);
  assert.deepEqual([...slugs].sort(), [...EXPECTED_SLUGS].sort());
});

for (const article of ARTICLES) {
  test(`article ${article.slug}`, () => {
    const words = countWords(article.body);
    assert.ok(words >= 1000 && words <= 1400, `body is ${words} words`);

    assert.ok(!/^#\s/m.test(article.body), "body must not contain its own H1");
    assert.ok(extractToc(article.body).length >= 4, "needs at least four H2 sections");

    assert.ok(article.faq.length >= 3 && article.faq.length <= 4, "3-4 FAQ entries");
    assert.ok(
      article.description.length >= 110 && article.description.length <= 170,
      `description is ${article.description.length} chars`,
    );

    const links = internalLinks(article.body);
    for (const href of links) {
      if (href.startsWith("/blog/")) {
        assert.ok(slugs.has(href.slice(6)), `broken article link ${href}`);
      } else {
        assert.ok(SITE_ROUTES.has(href), `unknown internal link ${href}`);
      }
    }
    assert.ok(links.includes(article.tool), `links to its tool page ${article.tool}`);
    const articleLinks = new Set(
      links.filter((h) => h.startsWith("/blog/") && h !== `/blog/${article.slug}`),
    );
    assert.ok(articleLinks.size >= 2, "links to at least two related articles");

    for (const slug of article.related) {
      assert.ok(slugs.has(slug) && slug !== article.slug, `bad related slug ${slug}`);
    }

    const text = `${article.title} ${article.body} ${article.faq.map((f) => f.answer).join(" ")}`;
    const lower = text.toLowerCase();
    for (const phrase of BANNED) {
      assert.ok(!lower.includes(phrase), `contains banned phrase "${phrase}"`);
    }
    assert.ok(!/tiktok/i.test(text), "TikTok is disabled and must not be mentioned");
    assert.match(article.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.updated >= article.published);
  });
}
