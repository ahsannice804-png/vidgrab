# SEO Strategy — VideosDownloader (videosdownloader.online)

Goal: rank #1 for high-intent video-downloader keywords and monetize with AdSense.
This document explains the positioning, the SEO already built into the repo, what
still needs to happen, and the honest reality of winning this niche.

---

## 1. Positioning & brand

- **Domain:** videosdownloader.online
- **Brand (title-brand pairing):** `VideosDownloader` — set in `config/site.json`.
- Position against competitors on **trust**: "No fake download buttons. No
  watermark. No sign-up. Free." That difference is our E-E-A-T story and the
  strongest, most defensible on-page narrative we own. Competitors rank via
  hundreds of ad-hoc pages and aggressive link building; we win by being the
  *honest* tool Google and users can recommend.
- **One-tool-per-platform architecture is already correct.** Google ranks
  dedicated pages above generic "video downloader" hubs for platform queries
  ("youtube video downloader", "instagram reels downloader", "facebook video
  downloader"). Do not collapse these pages.

## 2. Keyword strategy

Write each page to answer one primary intention, then layer secondary + long-tail.

| Page | Primary keyword | Secondary | Long-tail (FAQ/PAA targets) |
| --- | --- | --- | --- |
| `/` | free video downloader | video downloader online, mp4 video downloader | is it free to download videos, do I need an app, is it legal |
| `/youtube-video-downloader` | youtube video downloader | youtube to mp4, download youtube videos 1080p | download youtube shorts, youtube video downloader phone, 1080p download time |
| `/instagram-reels-downloader` | instagram reels downloader | save reels, insta reel downloader | download reels without watermark, do I need an instagram account |
| `/facebook-video-downloader` | facebook video downloader | download facebook videos, fb video downloader | fb.watch link, download facebook reels, private video? |
| `/tiktok-video-downloader` | tiktok video downloader | tiktok no watermark (after re-enable) | download tiktok without watermark |

- Do **not** target TikTok keywords while `NEXT_PUBLIC_TIKTOK_ENABLED` is false —
  the extractor is broken (yt-dlp #17604) and rank + traffic to a broken tool
  kills trust, CTR and AdSense quality. Re-enable SEO the day support returns.
- High-intent head terms ("youtube to mp4") should eventually get their own
  page or be the H1 of the YouTube page; avoid splitting the two pages' intent.

## 3. On-page SEO — already implemented ✅

- Per-page `title` (≤60 chars in SERP), `description`, `h1`, `subtitle` —
  edited to keyword-front-loaded final copy in `config/seo.json`.
- Canonical links, OpenGraph/Twitter cards, auto OG image (`/opengraph-image`).
- JSON-LD: `WebApplication` + `FAQPage` + `BreadcrumbList` on every tool page
  (home: `WebApplication` + `FAQPage`). FAQ questions double as PAA targets.
- `sitemap.ts` + `robots.ts` with `/api/` disallowed (keeps serverless routes
  out of the index). TikTok page auto-excluded while disabled.
- Keyword meta (`src/app/layout.tsx`) expanded to pin intent.
- Semantic HTML: single `h1`, real `h2`/`h3`, `aria` labels, Skip-to-content.

**Rule going forward:** title = primary keyword + differentiator + brand, ≤60
chars. Description = keyword + benefit + trust signal, ≤155 chars. One H1 per
page. Never let a quality heading or FAQ question drift from a real query people
type — every heading is a chance to appear in People Also Ask.

## 4. Technical SEO — deployment checklist for videosdownloader.online

1. **Set `BASE_URL` at build time** — this is *required*, not optional:
   ```
   BASE_URL=https://videosdownloader.online npm run build && npm run start
   ```
   Canonical tags, sitemap.xml, robots host, and OG URLs all inherit it.
   Verify live: `https://videosdownloader.online/sitemap.xml` and
   `https://videosdownloader.online/robots.txt`.
2. **HTTPS everywhere** — Caddy/Let's Encrypt on the VPS; force redirect
   `http://` and `www.` to `https://videosdownloader.online` (or 301 `www` one
   way only). Pick ONE canonical host and stick to it.
3. **Core Web Vitals** — the app is lightweight (no image dependencies on
   homepage, static pre-render, CSS-driven dark mode). Keep server responses
   fast (yt-dlp jobs are async via `/api/job/[id]` polling — never block the
   page render). Check PageSpeed Insights after deploy; target 90+ mobile.
4. **Index checks** — submit sitemap in Google Search Console + Bing Webmaster.
   Confirm the 4 tool pages, `/`, About/Contact show as indexed; `/api/` and
   `/tmp/` never do.
5. **Monitoring** — yt-dlp extractors break constantly. A broken tool silently
   destroys rankings (bounce → no win in PAA). Use the error-classifier logs to
   alert on `EXTRACTOR_OUTDATED` type errors and re-deploy quickly.
6. **No hreflang** needed yet (single English market fits global + India).

## 5. Content plan (authority + long-tail) — do these, in this order

1. **"How to" pillar articles** (one per platform, internal-linked from tool
   pages): "How to download YouTube videos on iPhone/Android/PC", "How to save
   Instagram Reels without watermark", "How to download Facebook videos from a
   phone". Each targets 5–10 long-tail queries and feeds authority into the tool
   pages.
2. **Comparison/glossary pages** near-term: "YouTube to MP4 vs MP3", "Reels vs
   TikTok — what's the difference" only if you can add real value. Otherwise
   focus on #1.
3. **Refresh cadence:** update the articles when platforms change their sharing
   UX; Google rewards freshness signals in this space.
4. Keep all content genuinely helpful — thin doorway content on this topic is
   the #1 reason Google demotes downloader sites.

## 6. Link building & authority (the real ranking lever)

Copy alone cannot outrank the niche leaders — links and trust will. In order of
risk/reward:

1. **Programmatic/outreach for honest reviews:** product-listing sites and
   "best video downloader" roundups (e.g., niche directories) — pitch the
   "no fake buttons" differentiator.
2. **Social sharing of the tool:** Reddit (r/... where allowed), Twitter/X,
   YouTube Shorts of the tool itself, Pinterest/Tumblr pins of step-by-step
   guides. Every share is a potential contextual backlink.
3. **Guest articles / tool roundups** on tech blogs (3–5 authority backlinks).
4. **No pay-per-link schemes.** They're how downloader sites get deindexed.
5. **Brand signal:** consistent `VideosDownloader` naming across profiles;
   register the brand on GSC + socials so the brand terms rank narratively.

Expect: 6–12 months of consistent content + links before head terms move; the
long-tail/pages will rank earlier.

## 7. Structured data — next opportunities

- Add `Organization` + `WebSite` (+ `SearchAction` is not applicable — a tool,
  not a search engine for your own site) to the home page for brand entity
  building.
- When How-it-works articles exist, add `HowTo` schema on those posts.
- Keep `FAQPage` — it's compliant here because every question is rendered
  visibly on the page (already true — matches Google's guidance).
- **Do not** fabricate `AggregateRating`/`Review` markup — it risks manual
  action and an AdSense ban.

## 8. Trust, E-E-A-T & legal (AdSense-critical)

- Downloader niches attract copyright scrutiny. Keep the existing disclaimer
  prominent (Terms page + footer). Sentence stays: "Download only content you
  have the right to save."
- Never imply we own or rebroadcast content; always "fetch the original MP4"
  wording (already in copy).
- Add real **About/Contact** (done) and keep the email responsive. Privacy
  policy must name any cookies/ads vendors (AdSense) so the July-onward EU/GDPR
  consent rules are covered before you monetize.
- AdSense: current `AdSlot` layout (leaderboard top + in-article rectangle) is
  exactly what Google checks — ads clearly separated from the tool, no ad
  density spikes. Keep it that way.

## 9. Analytics & measurement

- **Google Search Console** — verify today. Track: indexed pages, impressions,
  avg CTR, WTA ("free video downloader", "youtube video downloader", "instagram
  reels downloader") plus the long-tail streak. Aggregated once a week.
- **GA4** — conversion goal = successful download jobs. Watch post-download
  behavior: users who download and stay → pages to strengthen.
- **Bing Webmaster** — free 10–20% slice, mostly India/D/UK traffic.
- **Goals:** month 1–3 = long-tail impressions + indexing; month 3–6 = page-1
  long-tail + tool page top-10 for secondary; month 6–18 = head-term top-5 and
  #1 for at least one branded/platform term. #1 overall in this niche is the
  outcome of the content + links program, not a single-page change.

## 10. What I need from you

1. `BASE_URL=https://videosdownloader.online` at build → verify sitemap/robots.
2. Register the site in Google Search Console + Bing Webmaster Tools.
3. Decide the 301 rule: `www` → apex (or apex → `www`).
4. Confirm the contact email (`xastsolutions@gmail.com`) is monitored.
5. Keep yt-dlp current (README: Railway 5-minute checklist) — freshness is SEO.

## 11. Reality check (honest)

"Rank #1 on Google" for *video downloader* means beating sites with 10+ years
of authority and tens of thousands of links. What's achievable and what this
plan optimizes for: **#1–3 for the branded + long-tail terms in ~3–9 months,
top-5 on the tool pages, and a top-10 → #1 trajectory on head terms via the
content + link program.** The reputation edge ("no fake buttons") is the wedge
no big competitor can copy overnight — lean into it in every sentence.