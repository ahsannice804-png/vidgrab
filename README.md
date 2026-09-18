# Video Downloader

A production-ready video downloader website built with **Next.js** (App Router), **Tailwind CSS v4**, and **TypeScript**. Downloads YouTube videos, Instagram Reels/posts, TikTok and Facebook videos via [yt-dlp](https://github.com/yt-dlp/yt-dlp) + **ffmpeg**, featuring full SEO, dark mode, rate limiting, and AdSense-ready layout slots.

## Features

- YouTube videos (360p → 1080p), Instagram Reels/posts, TikTok and Facebook videos
- Async download pipeline: fetch info → pick quality → prepare → stream file
- Automatic video+audio merging with ffmpeg into MP4
- SEO: sitemap, robots.txt, OG image, JSON-LD (WebApplication, FAQPage, Breadcrumbs)
- Dark/light mode (CSS-driven, no flash)
- Token-bucket rate limiting per IP
- Config-driven branding & SEO (no code edits needed)

## Tech Stack

- Next.js 16 (App Router, Turbopack) + React 19
- Tailwind CSS v4 (`@tailwindcss/typography`, custom dark variant)
- TypeScript, Zod (API validation), ESLint flat config
- yt-dlp + ffmpeg as the download backend

## Requirements

- Node.js 20.9+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) on PATH
- [ffmpeg](https://ffmpeg.org/download.html) on PATH

## Local Development

```bash
npm install
cp .env.example .env.local   # adjust values as needed
npm run dev
```

Open http://localhost:3000.

## Environment Variables

See `.env.example` for the full list. Key ones:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:3000` | Canonical site URL (used by sitemap, robots, OG image) |
| `YTDLP_PATH` | `yt-dlp` | Path to the yt-dlp binary |
| `DOWNLOAD_DIR` | `./tmp/downloads` | Where finished files are stored before streaming (Vercel: `/tmp/downloads`) |
| `MAX_DOWNLOADS` | `3` | Concurrent download jobs (clamped to 1–4) |
| `NO_FFMPEG` | unset | Set to `1` to skip merging (progressive formats only) |
| `YOUTUBE_COOKIES_CONTENT` | unset | Netscape cookies.txt content for a logged-in YouTube session (writes a private temp file) |
| `FACEBOOK_COOKIES_CONTENT` | unset | Netscape cookies.txt content for a logged-in Facebook session (separate from the YouTube one) |

> Without yt-dlp/ffmpeg installed, the API returns a friendly `TOOLS_MISSING`
> error instead of crashing — the site still renders normally.

## VPS Deployment

1. **Install dependencies**
   ```bash
   apt update && apt install -y ffmpeg python3
   curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   chmod +x /usr/local/bin/yt-dlp
   yt-dlp -U   # keep fully updated (YouTube changes break old versions)
   ```

2. **Build & start**
   ```bash
   npm ci
   npm run build
   BASE_URL=https://yourdomain.com npm run start   # port 3000 by default
   ```

3. **Reverse proxy (Caddy example)** — terminates TLS and proxies to Next:
   ```
   yourdomain.com {
       reverse_proxy 127.0.0.1:3000
       encode gzip
   }
   ```
   Remember to set `BASE_URL` during `npm run build` so sitemap/robots/OG use your domain.

4. **Run as a service** with systemd (or pm2) and point `DOWNLOAD_DIR` at a
   persistent path. Files are streamed then auto-deleted; jobs expire after 10 minutes.

## Keeping yt-dlp up to date (platform extractors break regularly)

TikTok, YouTube, Instagram and Facebook change their page structure often, and
yt-dlp must be updated to follow. A broken extractor shows up in the API as:

```
ERROR: [TikTok] <video id>: Unexpected response from webpage request; please
report this issue on https://github.com/yt-dlp/yt-dlp/issues ...
```

The app surfaces this as *"This platform's downloader needs an update — please
try again later or contact support."* It is **not** the same as a deleted or
private video (those show different messages).

### Railway (production) — the 5-minute checklist

1. **Confirm it's an extractor break, not our code.** A yt-dlp line containing
   `please report this issue on github.com/yt-dlp` or *"Unexpected response from
   webpage request"* means upstream yt-dlp needs a newer version.

2. **Check the newest nightly.** Open
   https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest and note the
   tag. The Dockerfile (`ARG YTDLP_VERSION`) already defaults to `latest`, so
   every fresh build resolves the newest tag automatically — you should only need
   to trigger a new build.

3. **Verify the fix locally before redeploying.** Download the newest tag and
   run it against the failing URL:

   ```bash
   curl -L "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/<TAG>/yt-dlp" -o /tmp/yt-dlp
   chmod +x /tmp/yt-dlp
   python /tmp/yt-dlp --skip-download --dump-single-json --no-warnings "PASTE_FAILING_URL"
   ```

   A JSON dump from yt-dlp (with `title` and `formats`) means the fix is good.
   If it still errors, **no fix exists yet** — TikTok broke its page before
   yt-dlp caught up; wait for a newer nightly (or report it upstream at
   https://github.com/yt-dlp/yt-dlp/issues) before redeploying.

4. **Trigger a rebuild in Railway** (a push to `main`, or the redeploy button).
   Build logs print `Installing yt-dlp <tag>:` and the `yt-dlp --version` line —
   confirm the resolved tag is newer than the one that broke.

5. **Confirm in the runtime logs.** The first request after deploy logs
   `[ytdlp:path] resolved yt-dlp binary: /usr/local/bin/yt-dlp` and
   `[ytdlp:path] yt-dlp version: <tag>`, proving the new binary is running.

### Optional: keep it evergreen with no manual steps

Railway rebuilds only when `main` is pushed. If you want automatic updates:

- **VPS:** the install steps below already run `yt-dlp -U`, which self-updates
  every request — nothing to do.
- **Railway:** `latest` is only re-resolved on rebuild, so either push to `main`
  periodically, or add a GitHub Actions cron that pushes an empty commit to
  `main` nightly (Railway auto-deploys on push). This is optional — the manual
  checklist above covers the common case.

## Configuration (no-code edits)

- `config/site.json` — brand name, tagline, contact email, company attribution
- `config/seo.json` — per-page SEO: titles, descriptions, H1s, FAQ content

Changes to these files require `npm run build` (they are read at build time).

## AdSense / Monetization

Drag-and-drop ads are already in place via `src/components/AdSlot.tsx` (leaderboard
top + rectangle in content). Each page's `AdSlot` has an `id`/`class` hook — paste
your AdSense code where needed, or keep the placeholder slots.

## Project Layout

```
src/app/            Next.js routes (pages + API)
  api/info          POST  → fetch video metadata + quality options
  api/download      POST  → start async download job
  api/job/[id]      GET   → poll job status
  api/file/[id]     GET   → stream finished file
src/components/     UI (tool, header, footer, sections, ads, theme toggle)
src/lib/            core logic (yt-dlp wrapper, jobs, options, detection, rate limit)
config/             editable site + SEO JSON
```

## Scripts

```bash
npm run dev        # development server (Turbopack)
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint (flat config)
```

## Disclaimer / Legal

This tool is for downloading content you have the right to download. Respect
platform Terms of Service and copyright. Set `config/site.json` accordingly and
only use trademarks/thumbnails where permitted.