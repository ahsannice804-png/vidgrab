# PROJECT OVERVIEW — VideosDownloader (Video Downloader)

**A complete technical reference for the online video downloader app.**

Version: 0.1.0 (package.json) · Last updated: September 19, 2026

---

## Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Features — Complete List](#3-features--complete-list)
4. [Project Structure](#4-project-structure)
5. [Environment Variables — Complete Reference Table](#5-environment-variables--complete-reference-table)
6. [How Cookies Work (YouTube & Facebook)](#6-how-cookies-work-youtube--facebook)
7. [The TikTok Situation](#7-the-tiktok-situation)
8. [Deployment — Local Dev](#8-deployment--local-dev)
9. [Deployment — Production (AWS EC2, Docker-based)](#9-deployment--production-aws-ec2-docker-based)
10. [Maintenance — Recurring Tasks](#10-maintenance--recurring-tasks)
11. [Legal / Compliance Notes](#11-legal--compliance-notes)
12. [Known Limitations / Honest Caveats](#12-known-limitations--honest-caveats)
13. [Version / Last Updated](#13-version--last-updated)

---

## 1. Project Overview

**What this software does.** `Video Downloader` is a free, no-sign-up, no-watermark online video downloader. A user pastes a link to a video on a supported platform, the app fetches the real metadata via yt-dlp, shows honest quality options with real file sizes, then prepares and serves the file for download — either through the server pipeline (live progress bar, server-side merging) or, when possible, a browser-native direct-URL download.

**Platform support (current):**
- **YouTube** — regular videos, Shorts, `youtu.be` links, `/embed`, `/live`, `/v` path links, mobile (`m.`/`music.`) hosts, `youtube-nocookie.com`.
- **Instagram** — Reels (`/reel`, `/reels`), posts (`/p`), TV clips (`/tv`).
- **Facebook** — `/watch?v=`, `video.php`, `photo.php`, `/reel`, page `/videos/`, `/share/`, `story.php?story_fbid=`, and `fb.watch` short links.
- **TikTok** — **currently disabled** via a feature flag due to an upstream yt-dlp extractor break (see [Section 7](#7-the-tiktok-situation)). The engine, URL detection, and API handling are all still in place and only need the flag flipped to restore the UI — yt-dlp has to be fixed first.

**Brand:** **VideosDownloader** — domain **videosdownloader.online** (`config/site.json` → brand; the live domain is wired via the `BASE_URL` env var, referenced in `SEO-STRATEGY.md`).

**Developer / operator:** **Xast Solutions** — contact `xastsolutions@gmail.com` (set in `config/site.json` as `email`/`company`).

**Core value proposition:**
- Free — no hidden fees, no premium tier.
- No sign-up / registration.
- No watermark (files come from the source platform's own streams).
- Up to **1080p HD** (YouTube) as a single MP4; Instagram/Facebook at whatever real resolutions they expose.
- **Real sizes, real buttons** — every quality card shows a genuine file-size estimate; no fake download buttons (a deliberate anti-pattern of this project).

**How the user flow works** (in one line): paste link → `POST /api/info` extracts metadata + quality options → tap a quality → either `POST /api/direct-url` (browser downloads the CDN URL directly when the format is a single muxed file) or `POST /api/download` (server queues an async job) → client polls `GET /api/job/:id` → file streams from `GET /api/file/:id` via a one-time tokenized URL.

---

## 2. Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend framework | **Next.js 16.3.5** (App Router, Turbopack) | Server-rendered for SEO; `next/font` (Inter) |
| UI language | **React 19.2.8** | Client components where interactivity is needed |
| Language | **TypeScript ~5** (strict mode) | `tsconfig.json` sets `strict: true`, path alias `@/* → ./src/*` |
| Styling | **Tailwind CSS v4** + `@tailwindcss/typography`, dark mode via `.dark` class | Custom variants in `src/app/globals.css`; theme toggle uses `prefers-color-scheme` + `localStorage`, no flash |
| Backend / API | **Next.js Route Handlers** under `src/app/api/*` | See §4. No database — state is a per-process in-memory job map |
| Video extraction engine | **yt-dlp** (Python) | Spawned as a subprocess via `node:child_process`. Pinned **nightly** zipapp in the Docker image (`/usr/local/bin/yt-dlp`); falls back to `yt-dlp-exec` bundle or PATH |
| Media merging / transcoding | **ffmpeg** | Merges split video+audio into MP4 (`--merge-output-format mp4 --remux-video mp4`) and re-encodes MP3 (libmp3lame, CBR, 44.1 kHz) |
| Bundled binaries | `yt-dlp-exec` ^1.0.2, `@ffmpeg-installer/ffmpeg` ^1.1.0 | `next.config.ts` keeps both external (`serverExternalPackages`) and traces their binaries into route handlers |
| Validation | None at runtime (custom checks in route handlers) | Note: README mentions Zod but the code uses hand-rolled `isRecord`/type checks |
| Linting / types / tests | ESLint 9 (flat config), `tsc --noEmit`, Node's built-in test runner | `npm run test` runs `node --test` against the pure-logic tests |
| Scripts | `dev`, `build`, `start`, `lint`, `typecheck`, `test` | `npm test` covers `detection.ts` + `errorClassifier.ts` |

**How yt-dlp is invoked** (`src/lib/ytdlp.ts`): the binary path is resolved by `getBin()` with a strict priority order:
1. **Production Linux** (`NODE_ENV=production` + `platform === "linux"`): hard-picks `/usr/local/bin/yt-dlp` — the pinned nightly baked into the Docker image, so nothing else can shadow it (`ytdlp.ts:284–398`).
2. `YTDLP_PATH` env override (`ytdlp.ts:400`).
3. The `yt-dlp-exec` bundled binary.
4. fallback `/bin: yt-dlp` on PATH.

On Vercel (`VERCEL === "1"`), binaries are copied to `/tmp` and `chmod 0755` because Serverless Functions strip exec permissions (`prepareBinary`, `ytdlp.ts:239–267`). Flag ordering: cookie flags (`--cookies <file>`) are always prepended to the spawned args (`ytdlp.ts:652`, `ytdlp.ts:988`).

**ffmpeg usage:**
- Merging two split streams (video-only DASH + audio) into one MP4 — all YouTube ≥480p needs this (≥360p mostly).
- Re-encoding audio to **MP3** at CBR 128/192/320 kbps (`convertToMp3`, `ytdlp.ts:1424`) — server-side, so the MP3 you get is real MP3, not a renamed M4A.

---

## 3. Features — Complete List

### Platform support

- **YouTube** (`src/lib/detection.ts`): watch URLs with `v=`, `youtu.be/ID`, `/shorts/`, `/embed/`, `/live/`, `/v/`, `m.`/`music.` subdomains, `youtube-nocookie.com`. Canonicalized to `https://www.youtube.com/watch?v=ID`.
- **Instagram**: `/reel`, `/reels`, `/p`, `/tv` (+ optional `/embed`). Canonicalized to `/reel/<id>/`.
- **Facebook**: `/watch?v=`, `/video.php?v=`, `/photo.php?v=`, `/reel/<id>`, `/page/videos/<id>`, `/share/v|r/<id>`, `/story.php?story_fbid=` and `fb.watch` — short/redirect links are passed through untouched so the download engine resolves them server-side.
- **TikTok** (engine present, UI disabled): `@user/video|photo/ID`, `vm.`/`vt.` short links, `/t/` short links — with an own short-link resolver (`resolveTikTokShortLink`) that follows redirects to a canonical URL so yt-dlp always gets the primary format.

### Video download with quality selection — real & dynamic, not fake

Quality options are computed **per video from live yt-dlp metadata** in `src/lib/options.ts` — nothing is hard-coded:

- **YouTube** (`resolveYouTube`): iterates target heights 360 → 480 → 720 → 1080 and picks the best *actually available* stream ≤ each height, labelled `360p` / `480p` / `720p HD` / `1080p HD`. A tier only exists if the video really offers it.
  - These are **real formats**: size comes from yt-dlp's `filesize`/`filesize_approx`, or a bitrate×duration estimate, or is anchored to a same-height sibling of the same encode (`siblingSizedBytes`).
  - Prefers **segmented HLS over throttled direct-DASH** for speed; at ≤360p prefers YouTube's single-file progressive format (no merge needed).
  - Split streams carry an `altFormatId` (the HLS/DASH sibling) so at download time the server speed-probes both and downloads whichever is faster right now (`optimizeFormatExpression`, `ytdlp.ts:1648`).
- **Instagram** (`resolveInstagram`): Instagram exposes one progressive stream, so the UI shows **exactly one** honest card (`1080p HD` / `720p HD` / `480p` / `360p`, or `Best Quality`).
- **Facebook** (`resolveFacebook`): deduplicates by `format_id`, picks the best variant per real height present in the metadata (SD/HD/UHD), and shows **one honest card per resolution that actually exists** — nothing fabricated.
- **Audio-only (MP3)** (`resolveYouTubeAudio`): three tiers — **Standard (128 kbps) / High (192) / Best (320)** — but a tier is **only offered when the source audio genuinely carries ~90%+ of that bitrate** (`srcKbps >= tier.kbps * 0.9`), so a fake "320kbps" never dangles under a 128k track. 128k is always achievable (true transcoding). Instagram gets **no** MP3 tier (single muxed stream, no standalone audio).

### Audio-only (MP3) extraction

The Audio tab requests `POST /api/download` with `mode:"audio"`. The server downloads the best standalone audio stream, then **re-encodes to CBR MP3 with ffmpeg** (`-acodec libmp3lame -b:a <kbps>k -ar 44100`). Because it's CBR, the final size exactly matches the size shown on the card (`kbps × 1000 × duration / 8`). MP3 mode always runs through the server pipeline (a raw CDN URL would hand the browser an M4A/Opus source, not the promised MP3).

### Download pipeline (async)

`src/lib/jobs.ts` implements an in-memory queue + worker pool:
- Job lifecycle: `queued → preparing → ready | error`, optionally a `preparing` phase with live progress (`downloading video/audio`, `merging audio & video`, `converting to MP3`).
- `MAX_DOWNLOADS` concurrent workers (clamped 1–4, default **3**).
- Each job is protected by a **random 16-byte token**; `GET /api/job/:id?token=` and `GET /api/file/:id?token=` reject wrong/missing tokens.
- Files are staged in `DOWNLOAD_DIR` (`./tmp/downloads` locally, `/tmp/downloads` on Vercel), streamed with `Content-Disposition: attachment`, then **auto-deleted**. Jobs expire after **35 minutes**; a sweeper runs every 30 minutes; leftover `.part`/`.ytdl`/`.temp` files are purged on boot.
- Progress is **monotonic by construction**: computed from bytes-on-disk vs. expected total (a high-water mark), clamped to 99% until truly ready, so the bar never freezes early or goes backwards (HLS per-line percentages are unreliable).

### Direct-URL fast path

For formats that are a single muxed file and don't need merging (e.g. some YouTube progressive), the client calls `POST /api/direct-url` first. The server runs `yt-dlp --get-url -f <expr>` and returns the time-limited CDN URL(s); the browser downloads it directly at full bandwidth, bypassing server load. HLS `.m3u8` manifests are filtered out (browsers can't save those). Instagram/TikTok/Facebook are intentionally excluded from this path so users see the consistent live progress bar.

### Rate limiting / abuse protection

An **in-memory token-bucket rate limiter keyed by client IP** (`src/lib/rateLimit.ts`), with per-route quotas:

| Route | Window | Max requests |
| --- | --- | --- |
| `POST /api/info` | 60 s | 20 |
| `POST /api/direct-url` | 60 s | 20 |
| `POST /api/download` | 10 min | 8 |

Exceeding the limit returns `429` with code `RATE_LIMITED` and a `retryAfter` value. Client IP is derived from `x-forwarded-for` (first entry) / `x-real-ip`. **Note:** in-memory means this protects a single server process only (see §12).

Plus: strict URL detection (only `http:`/`https:` links that match a platform regex), sanitised filenames (illegal chars stripped, capped at 80 chars), and one-time tokenized download URLs.

### Error handling categories (exact messages)

All failures resolve to exactly one of 16 buckets (union defined in `src/lib/errorClassifier.ts`, user copy in `src/lib/errorCodes.ts`). What the user sees (`ERROR_MESSAGES`):

| Code | Message shown to user |
| --- | --- |
| `INVALID_URL` | "That doesn't look like a valid link. Please paste a full YouTube, Instagram or Facebook URL." |
| `UNSUPPORTED_PLATFORM` | "We currently support YouTube videos, Instagram Reels/posts and Facebook videos." |
| `WRONG_PLATFORM` | "This link belongs to a different platform. Paste the correct link for the page you're on." |
| `PRIVATE` | "This video is private — only the owner can access it." |
| `LOGIN_REQUIRED` | "This video requires login access and can't be downloaded." |
| `RESTRICTED` | "This video is age-restricted or region-locked, so we can't download it." |
| `UNAVAILABLE` | "This video is unavailable right now. It may have been removed or is still processing." |
| `NOT_FOUND` | "We couldn't find this content. It may have been deleted or the link is incomplete." |
| `TIMEOUT` | "The request took too long. Please try again — servers may be busy right now." |
| `TOOLS_MISSING` | "The download engine isn't ready yet. Please try again in a few minutes." |
| `DOWNLOAD_FAILED` | "The download failed. Please try again, or pick a different quality." |
| `RATE_LIMITED` | "You've made a few requests too quickly. Please wait a moment and try again." |
| `NETWORK_ERROR` | "We couldn't reach the video's servers right now. This is usually temporary — please try again in a moment." |
| `EXTRACTOR_ERROR` | "We couldn't process this video right now. Please try again, or try pasting the link in a different format." |
| `EXTRACTOR_OUTDATED` | "This platform's downloader needs an update — please try again later or contact support." |
| `INTERNAL` | "Something went wrong on our side. Please try again in a moment." |

The classifier (`classifyYtDlpError`) maps raw yt-dlp **stderr** to these buckets via ordered regex matchers — e.g. `private video` → `PRIVATE`, `you must log in to continue` → `LOGIN_REQUIRED` (checked *before* the restricted rules), `confirm you're not a bot` / `age-restricted` → `RESTRICTED`, `unexpected response from ... webpage request` → `EXTRACTOR_OUTDATED`, `HTTP Error 429` → `RATE_LIMITED`, `HTTP Error 5xx`/DNS/`socket hang up` → `NETWORK_ERROR`, etc. Ordering matters: network matchers run before "video unavailable" matchers so a transport hiccup is never reported as a deleted video. When there's zero stderr it returns `INTERNAL` (never fabricates "deleted").

### SEO features

- **Per-platform landing pages**: `/youtube-video-downloader`, `/instagram-reels-downloader`, `/facebook-video-downloader` (+ `/tiktok-video-downloader` when enabled), each with its own title/description/H1/subtitle from `config/seo.json`, canonical tags and OG tags.
- **Sitemap** (`src/app/sitemap.ts`): `/sitemap.xml` with all pages, per-page `lastModified`/`changeFrequency`/`priority` (TikTok entry auto-dropped while disabled). Built from `BASE_URL`.
- **robots.txt** (`src/app/robots.ts`): allows `/`, disallows `/api/` and `/tmp/`, points at sitemap + host.
- **Structured data (JSON-LD)**: `WebApplication` (price "0") + `FAQPage` on home and every tool page; `BreadcrumbList` on tool pages; `<script type="application/ld+json">` injected via `JsonLd.tsx`.
- **Open Graph / Twitter cards**: `1200×630` OG image (`/opengraph-image` generated by `src/app/opengraph-image.tsx`), `summary_large_image`.
- **Edit-content-without-code**: defines `config/site.json` and `config/seo.json`; a default `getHomeSeo()` swaps the home SEO copy to the three-platform version while TikTok is off.
- **README/SEO-STRATEGY targets**: `BASE_URL=https://videosdownloader.online` baked at build time so sitemap/canonical/OG resolve to the real domain.

### Other UI features

- Dark/light theme toggle with no-flash script (`ThemeToggle.tsx` + `THEME_INIT_SCRIPT` in layout).
- Mobile-first responsive layout; sticky header with mobile menu; footer with Tools/Company/Legal nav.
- **AdSlots**: reserved, clearly-labelled placeholder ad zones (`AdSlot.tsx`) — empty by design; never placed next to the download button (trust + AdSense policy).
- Trust badges, "how it works", "why choose us", FAQ accordion components.

---

## 4. Project Structure

```
.
├── AGENTS.md                     # Next.js agent rules marker (auto-maintained by next dev)
├── AWS_EC2_DEPLOYMENT_GUIDE.md   # Step-by-step EC2 deploy guide (systemd + nginx + certbot)
├── SEO-STRATEGY.md               # SEO plan for videosdownloader.online
├── CLAUDE.md                     # Claude agent notes (historical)
├── Dockerfile                    # Production image (see §9)
├── README.md                     # Public readme / quick start + env table + yt-dlp checklist
├── PROJECT_OVERVIEW.md           # THIS FILE
├── config/
│   ├── site.json                 # Brand: name, tagline, description, email, company, OG image, lang/locale
│   └── seo.json                  # Per-page title/description/H1/subtitle (home, youtube, instagram, tiktok, facebook, privacy, terms, contact, about)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # BACKEND — Route Handlers
│   │   │   ├── info/route.ts       # POST: detect platform + getVideoInfo → quality options
│   │   │   ├── download/route.ts   # POST: validate request → create async job → 202 {jobId, token}
│   │   │   ├── job/[id]/route.ts   # GET: poll job status (token required)
│   │   │   ├── file/[id]/route.ts  # GET: stream finished file (token required, single-use)
│   │   │   └── direct-url/route.ts # POST: return CDN URL(s) for browser-native download
│   │   ├── page.tsx              # Home: hero + DownloadTool + SEO content + FAQ
│   │   ├── youtube-video-downloader/page.tsx
│   │   ├── instagram-reels-downloader/page.tsx
│   │   ├── facebook-video-downloader/page.tsx
│   │   ├── tiktok-video-downloader/page.tsx   # exists but hidden while flag is false
│   │   ├── about/ contact/ privacy-policy/ terms-of-service/
│   │   ├── layout.tsx            # Root layout: metadata, fonts, theme script, Header/Footer
│   │   ├── sitemap.ts            # /sitemap.xml
│   │   ├── robots.ts             # /robots.txt
│   │   ├── opengraph-image.tsx   # Dynamic 1200×630 OG image
│   │   ├── icon.svg / globals.css
│   ├── lib/                      # CORE LOGIC (framework-free where possible → unit-tested)
│   │   ├── detection.ts          # URL→platform parser (regex + canonicalization)
│   │   ├── ytdlp.ts              # Engine: binary resolution, getVideoInfo, runDownload, MP3 conversion, speed probing, direct URLs, cookie resolution
│   │   ├── options.ts            # Quality-option builders + yt-dlp format expressions
│   │   ├── jobs.ts               # In-memory job queue, worker pool, sweeper, DOWNLOAD_DIR
│   │   ├── errorClassifier.ts    # stderr → ApiErrorCode (ordered regex matchers)
│   │   ├── errorCodes.ts         # ApiErrorCode re-export + user-facing ERROR_MESSAGES
│   │   ├── features.ts           # NEXT_PUBLIC_TIKTOK_ENABLED flag + platform copy
│   │   ├── site.ts               # SiteConfig + getBaseUrl()/absoluteUrl() from BASE_URL
│   │   ├── seo.ts                # Read-only SEO-layer accessor (config-driven copy)
│   │   ├── schema.ts             # Minimal schema.org TS types
│   │   ├── types.ts              # Shared types (QualityOption, VideoMeta, InfoResult, JobSnapshot…)
│   │   ├── format.ts             # formatBytes/Duration/Views, sanitizeFilename
│   │   ├── rateLimit.ts          # In-memory token-bucket limiter + getClientIp
│   │   ├── detection.test.ts     # Node test runner tests for URL detection
│   │   └── errorClassifier.test.ts # Node test runner tests for error classification
│   └── components/               # UI
│       ├── DownloadTool.tsx      # The interactive tool (paste→options→download)
│       ├── ProgressCard.tsx      # Live progress + success/confetti state
│       ├── page-ui.tsx           # PageHeader, Prose, simpleMetadata helpers
│       ├── JsonLd.tsx / FAQSection.tsx / HowItWorks.tsx / WhyChooseUs.tsx / TrustBadges.tsx
│       ├── Header.tsx / Footer.tsx / Logo.tsx / ThemeToggle.tsx / Spinner.tsx / AdSlot.tsx
├── next.config.ts               # serverExternalPackages, file-tracing includes, image domains
├── tsconfig.json                # strict TS, @/* path alias
├── eslint.config.mjs / postcss.config.mjs / next-env.d.ts
├── public/                      # static assets (robots.txt placeholder etc.)
└── package.json / package-lock.json
```

**Notes:**
- There is **no database** — all job state is an in-memory `Map` in `src/lib/jobs.ts`. Restarting the server drops queued/running jobs (files already `ready` are lost). This is by design; see §12.
- `.env.example` is **referenced** by the README and the AWS guide but does **not exist** in the repo — the env table in §5 is the authoritative list.

---

## 5. Environment Variables — Complete Reference Table

Everything the app reads from `process.env` (grep-verified):

### Secrets (do NOT expose publicly)

| Variable | Type | Example | Purpose | Code |
| --- | --- | --- | --- | --- |
| `YOUTUBE_COOKIES_CONTENT` | secret | Netscape cookies.txt content (multi-line) | Logged-in YouTube session for bypassing bot/age checks on datacenter IPs. Written once per process to a `0600` temp file and passed to yt-dlp via `--cookies`. Never logged. | `src/lib/ytdlp.ts:483, 515` |
| `YOUTUBE_COOKIES_PATH` | secret | `/run/secrets/yt-cookies.txt` | Alternative: absolute path of a cookies.txt file baked/mounted into the container (checked with `existsSync`). Takes priority over `_CONTENT`. | `src/lib/ytdlp.ts:487–493` |
| `FACEBOOK_COOKIES_CONTENT` | secret | Netscape cookies.txt content (multi-line) | Same, but for facebook.com sessions (kept strictly separate from YouTube cookies). | `src/lib/ytdlp.ts:561, 593` |
| `FACEBOOK_COOKIES_PATH` | secret | `/run/secrets/fb-cookies.txt` | Alternative path form for Facebook cookies. | `src/lib/ytdlp.ts:565–571` |

> ⚠️ **Important**: the names are `YOUTUBE_COOKIES_CONTENT` / `FACEBOOK_COOKIES_CONTENT` (or `_PATH`) — **not** `YOUTUBE_COOKIES` / `FACEBOOK_COOKIES`. Setting the wrong name means cookies are silently ignored and "age-restricted / region-locked" errors return. Full explanation in [§6](#6-how-cookies-work-youtube--facebook).

### Configuration (public / not sensitive)

| Variable | Type | Default | Purpose | Code |
| --- | --- | --- | --- | --- |
| `BASE_URL` | config | `http://localhost:3000` | Absolute canonical URL; drives sitemap, robots, canonical/OG tags, JSON-LD. Must be the real domain at **build** time in production. Trailing slashes stripped. | `src/lib/site.ts:36` · Docker `ARG BASE_URL` (`Dockerfile:84`) |
| `NEXT_PUBLIC_TIKTOK_ENABLED` | config | `false` (unset) | Feature flag: `"true"` re-enables the TikTok UI everywhere (nav, homepage card, FAQ, tool page, sitemap). Inlined into the client bundle at **build** time, so must be set before `next build`. | `src/lib/features.ts:18` · Docker `ARG` (`Dockerfile:100`) |
| `YTDLP_PATH` | config | `yt-dlp` (or bundle) | Path to the yt-dlp binary (custom/local deploys). A set-but-missing path logs a warning and falls back. In production Linux the Docker nightly `/usr/local/bin/yt-dlp` hard-overrides this. | `src/lib/ytdlp.ts:400` |
| `FFMPEG_PATH` | config | bundled / `ffmpeg` | Path to ffmpeg. | `src/lib/ytdlp.ts:442` |
| `DOWNLOAD_DIR` | config | `./tmp/downloads` | Where finished files are staged before streaming. On Vercel always `/tmp/downloads` (read-only task dir). Point at a persistent path with headroom in production. | `src/lib/jobs.ts:44–49` |
| `MAX_DOWNLOADS` | config | `3` | Max concurrent download jobs (clamped 1–4). Keep 3 on t3.medium. | `src/lib/jobs.ts:50` |
| `NO_FFMPEG` | config | unset | `"1"` disables merging/MP3 conversion (progressive formats only). `NO_FFMPEG=0` keeps it enabled. | `src/lib/ytdlp.ts:450–454` |
| `NO_BACKEND` | config | unset | `"1"` makes `/api/info` and `/api/direct-url` throw `TOOLS_MISSING` (used for frontend-only environments). | `src/lib/ytdlp.ts:816, 1758` |
| `VERCEL` | config | unset | `"1"` switches on serverless workarounds: binaries staged to `/tmp` with +x; forced `DOWNLOAD_DIR=/tmp/downloads`. | `src/lib/ytdlp.ts:239` · `src/lib/jobs.ts:45` |
| `NODE_ENV` | config | unset (dev) | `"production"` triggers the production-Linux yt-dlp path resolution and is set by the Dockerfile runtime stage. | `src/lib/ytdlp.ts:288` · `Dockerfile:109` |
| `PORT` | config | `3000` | `next start` honours it (Railway and the systemd service set it explicitly). | Dockerfile comment · AWS guide §9 |

### Build args (Docker only, not runtime env)

| Arg | Default | Purpose |
| --- | --- | --- |
| `YTDLP_VERSION` | `latest` | Resolves the newest yt-dlp nightly tag at build time from the GitHub API (`YTDLP_FALLBACK_VERSION=2026.09.16.232951` used if the API is unreachable). The Dockerfile prints `Installing yt-dlp <tag>:` / `yt-dlp --version` in build logs. |
| `BASE_URL` | `http://localhost:3000` | Baked into the image at build for sitemap/OG. |
| `NEXT_PUBLIC_TIKTOK_ENABLED` | `false` | Baked into the client bundle at build. |

**Classify as SECRET:** the four cookie vars. Everything else is non-sensitive configuration. Never commit `.env*` (`.gitignore` already excludes them).

---

## 6. How Cookies Work (YouTube & Facebook)

**Why cookies are needed.** Cloud/datacenter IPs (Railway, AWS EC2, etc.) get flagged by Google/YouTube as bots — YouTube then shows *"age-restricted"*, *"restricted"*, "sign in to confirm you're not a bot" or region-lock messages **even for normal public videos**, and yt-dlp fails. A cookies file from a logged-in YouTube browser session tells the extractor "this is a real user", bypassing the bot check. Facebook similarly demands signed-in sessions for many public videos (login walls). Everything is resolved in `src/lib/ytdlp.ts`:
- `resolveYtCookiesFlags()` (`ytdlp.ts:479`) and `resolveFacebookCookiesFlags()` (`ytdlp.ts:557`) read the env vars, write the content to a **private `0600` temp file** under `os.tmpdir()` (`yt-cookies-<pid>.txt` / `fb-cookies-<pid>.txt`), and return `["--cookies", <path>]`.
- `resolveCookiesFlagsFor(url)` (`ytdlp.ts:619`) picks which cookie set applies: **Facebook cookies only for `facebook.com`/`fb.watch` URLs, YouTube cookies only for YouTube URLs**, and nothing for other platforms — the two sessions never mix.
- The flags are prepended to every yt-dlp spawn: `runYtDlp` (`ytdlp.ts:652`) and `runDownload` (`ytdlp.ts:988`).
- **Cookie data is never logged or echoed** into error output. Both resolvers cache their result per process so the temp file is written once.

**Format.** Netscape `cookies.txt`, **multi-line** — the raw exported file, e.g.:
```text
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	3197078400	LOGIN_INFO	<value>
```
Do **not** paste a single cookie from DevTools; export the whole file.

**How to export fresh cookies (browser extension method):**
1. In Chrome, install **"Get cookies.txt LOCALLY"**.
2. Log into YouTube (and separately Facebook) in that browser — an account that isn't age-restricted.
3. Export cookies for `youtube.com` → `/tmp/youtube_cookies.txt`, and for `facebook.com` → `/tmp/fb_cookies.txt`.
4. Load them into the app as env vars:

```bash
export YOUTUBE_COOKIES_CONTENT="$(cat /tmp/youtube_cookies.txt)"
export FACEBOOK_COOKIES_CONTENT="$(cat /tmp/fb_cookies.txt)"
```

(or `.env.local`, or Docker `-e` / `--env-file`, or a mounted file via the `_PATH` vars — see §9).

**How often to refresh.** Google/Facebook session cookies typically live a few weeks but can be invalidated much sooner (password change, security event, "we've detected unusual activity", new device). **Rule of thumb: refresh at least monthly, or immediately whenever "age-restricted / region-locked" / `LOGIN_REQUIRED` errors reappear.** After updating the env vars you must restart the process/container — the flags are cached per process (`ytCookiesFlags` / `facebookCookiesFlags`), so a running instance keeps whatever it resolved on boot.

**Where to set them in production** — anywhere the runtime env can hold them: Railway service variables, the EC2 `.env.local` (systemd setup), or `docker run -e` / `--env-file` / mounted secrets (Docker setup).

---

## 7. The TikTok Situation

- **Status: DISABLED.** The default is `NEXT_PUBLIC_TIKTOK_ENABLED !== "true"` → `TIKTOK_ENABLED = false` (`src/lib/features.ts:18`).
- **Why:** the **upstream yt-dlp TikTok extractor is temporarily broken** (yt-dlp issue **#17604**). TikTok changes its page/JS-challenge faster than yt-dlp's solver is updated; the failure signature is `unexpected response from webpage request`, which this app surfaces honestly as `EXTRACTOR_OUTDATED` ("This platform's downloader needs an update"), deliberately *not* as "video removed".
- **What's disabled:** only the **UI/user-facing** surfaces — nav link, homepage tool card + FAQ, the input placeholder copy, the `/tiktok-video-downloader` page, and the sitemap entry. The engine is **not** removed:
  - YouTube detection of TikTok URLs still works (`detection.ts` `TIKTOK_*` regexes);
  - the TikTok short-link resolver and canonicalization still run;
  - the client also blocks pasting a TikTok link client-side with a friendly *"TikTok support is temporarily unavailable…"* message (`DownloadTool.tsx:103–109`).
- **To re-enable once the extractor is fixed:**
  1. Confirm yt-dlp handles TikTok again (see the verify command in §10).
  2. Set `NEXT_PUBLIC_TIKTOK_ENABLED=true` in the environment **before** `next build` (it's inlined into the client bundle), or pass the Docker build arg `--build-arg NEXT_PUBLIC_TIKTOK_ENABLED=true`.
  3. For local dev, add `NEXT_PUBLIC_TIKTOK_ENABLED=true` to `.env.local` and restart `next dev`/`next build`.
  4. Rebuild & redeploy. All UI surfaces, the `/tiktok-video-downloader` page, homepage FAQ, and sitemap entry reappear automatically — **flipping this one value is the only change needed.**

---

## 8. Deployment — Local Dev

Requirements: **Node.js 20.9+**, and **ffmpeg** (`NO_FFMPEG=1` disables merging/MP3 if you must go without). Local yt-dlp comes from the `yt-dlp-exec` npm package; a system `yt-dlp` on PATH is used as a fallback.

```bash
npm install
cp .env.example .env.local    # NOTE: this file is currently MISSING from the repo —
                              # create it from the table in §5 (BASE_URL, YTDLP_PATH, etc.)
npm run dev                   # http://localhost:3000 (Turbopack dev server)
```

Other scripts:
```bash
npm run build        # production build (bakes BASE_URL + NEXT_PUBLIC_TIKTOK_ENABLED)
npm run start        # serve the production build (port 3000 / $PORT)
npm run lint         # ESLint (flat config)
npm run typecheck    # tsc --noEmit
npm test             # node --test src/lib/detection.test.ts src/lib/errorClassifier.test.ts
```

A useful env for a quick local run:
```bash
BASE_URL=http://localhost:3000 npm run dev
```

If you want to exercise the cookies path locally: install the Git Bash or use PowerShell `$(Get-Content -Raw ...)` to build `YOUTUBE_COOKIES_CONTENT`.

---

## 9. Deployment — Production (AWS EC2, Docker-based)

> Full step-by-step (launching t3.medium, Ubuntu 24.04, security groups, Elastic IP, upload the code, systemd service, nginx + certbot, hardening, troubleshooting) lives in **`AWS_EC2_DEPLOYMENT_GUIDE.md`**. This section is a concise map + the Docker path.

### The stacks available

1. **Docker-based (this is the Dockerfile's purpose).** Single image containing Node 20, Python 3, ffmpeg, a pinned **yt-dlp nightly** zipapp (`ARG YTDLP_VERSION=latest` resolved at build), and the production Next.js build. `CMD ["npm","run","start"]`, `EXPOSE 3000`.
2. **Bare-metal / systemd path** (what `AWS_EC2_DEPLOYMENT_GUIDE.md` documents): install Node/python/ffmpeg/yt-dlp, `npm ci && npm run build`, run `npm start` under systemd, put nginx (or Caddy) in front.

### The Docker path in one page

**Build the image** (from the repo root):
```bash
docker build -t video-downloader \
  --build-arg BASE_URL=https://videosdownloader.online \
  --build-arg NEXT_PUBLIC_TIKTOK_ENABLED=false \
  .
```
Build logs should show `Installing yt-dlp <tag>:` and `yt-dlp --version` — verify a recent nightly tag.

**Run it** — always pass the runtime vars explicitly (a mounted `.env` file won't feed `process.env` automatically since Next loads env at process start):
```bash
docker run -d --name video-downloader --restart unless-stopped \
  -p 3000:3000 \
  -e "BASE_URL=https://videosdownloader.online" \
  -e "PORT=3000" \
  -e "MAX_DOWNLOADS=3" \
  -e "YOUTUBE_COOKIES_CONTENT=$(cat /tmp/youtube_cookies.txt)" \
  -e "FACEBOOK_COOKIES_CONTENT=$(cat /tmp/fb_cookies.txt)" \
  video-downloader
```

**Prefer `/` without shell-quoting pain when cookie values are huge? Mount files and use the `_PATH` vars** (the code checks `existsSync` first — cleanest and survives restarts):
```bash
docker run -d --name video-downloader --restart unless-stopped \
  -p 3000:3000 \
  -v /data/cookies/youtube.txt:/run/secrets/yt-cookies.txt:ro \
  -v /data/cookies/facebook.txt:/run/secrets/fb-cookies.txt:ro \
  -e "YOUTUBE_COOKIES_PATH=/run/secrets/yt-cookies.txt" \
  -e "FACEBOOK_COOKIES_PATH=/run/secrets/fb-cookies.txt" \
  -e "BASE_URL=https://videosdownloader.online" \
  -e "PORT=3000" \
  video-downloader
```
Alternatives: an `--env-file .env` that contains all vars (including the multi-line cookie content), or `.env.local` copied into `/app` before `npm run start` (systemd path).

### EC2 specifics (the short version)

- **Instance**: single **t3.medium** (2 vCPU / 4 GB) — the app is single-instance by design (in-memory jobs + local temp files). Ubuntu Server 24.04 LTS, **30 GB gp3** EBS. Security group: SSH from your IP only, HTTP 80 + HTTPS 443 open; **never expose port 3000** (proxy it).
- **Elastic IP**: allocate and associate one so the public address (and your domain's `A` record) never changes on stop/start. ~$3.60/mo.
- **Reverse proxy / TLS**: the guide uses **nginx + Certbot** (or the README's 3-line **Caddy** alternative, which auto-issues TLS):
  ```
  videosdownloader.online {
      reverse_proxy 127.0.0.1:3000
      encode gzip
  }
  ```
- **Cookie tip**: AWS/EC2 datacenter IPs are exactly the ones YouTube flags — set the cookies vars (see §6) or expect `RESTRICTED` errors on YouTube. This is the single most common production failure.
- **Backup**: there's **no database**. The only state worth backing up is the cookie/secret env — stash a copy privately (e.g. AWS SSM Parameter Store SecureString).

### Scaling

Single-instance by design → **scale vertically**: t3.medium → t3.large (raise `MAX_DOWNLOADS=4`) → m6i.xlarge; then only if you truly outgrow it, move to a Redis+S3 shared-queue architecture (a bigger project).

---

## 10. Maintenance — Recurring Tasks

### The yt-dlp update checklist (platform extractors break regularly)

YouTube, Instagram, Facebook and TikTok change their pages often; yt-dlp must be updated to follow. A break looks like *"Unexpected response from webpage request"* in the API and surfaces to users as **`EXTRACTOR_OUTDATED`** ("This platform's downloader needs an update").

1. **Confirm it's an extractor break, not our code.** The yt-dlp stderr contains `please report this issue on github.com/yt-dlp` or *"Unexpected response from webpage request"*. (Note: this exact phrase can also be a TikTok login-wall → the classifier distinguishes.)
2. **Check the newest nightly**: https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest. The Dockerfile already defaults to `latest` (resolved at build time), so usually you only need to **rebuild** — no code change. Bare-metal: re-run the install block or `sudo yt-dlp -U`.
3. **Verify the fix before redeploying**:
   ```bash
   curl -L "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/<TAG>/yt-dlp" -o /tmp/yt-dlp
   chmod +x /tmp/yt-dlp
   python /tmp/yt-dlp --skip-download --dump-single-json --no-warnings "PASTE_FAILING_URL"
   ```
   A JSON dump with `title` and `formats` = fixed. If it still errors, **no fix exists yet** — wait for a newer nightly (or report it upstream at the yt-dlp issue tracker).
4. **Rebuild & redeploy** (docker build / systemd: `npm ci && npm run build && systemctl restart video-downloader`).
5. **Confirm in the runtime logs**: the first request logs `[ytdlp:path] resolved yt-dlp binary: /usr/local/bin/yt-dlp` and `[ytdlp:path] yt-dlp version: <tag>`.

**Optional evergreen path**: bare-metal `yt-dlp -U` self-updates on every call; with Docker, `latest` is only re-resolved on rebuild, so push to `main` periodically or add a CI cron empty-commit → redeploy.

### Cookie refresh process

- Export fresh cookies from a logged-in browser session every few weeks and when errors return (see §6).
- After changing the vars, **restart the process/container** (cookie flags are cached per process at first yt-dlp call).

### Monitoring

- App logs: `journalctl -u video-downloader -f` (systemd) or `docker logs -f video-downloader` (Docker) — watch for `[download:error]`, `[ytdlp:error]` lines (these include `code` + full stderr) and `EXTRACTOR_OUTDATED`.
- Web traffic: `tail -f /var/log/nginx/access.log /var/log/nginx/error.log`.
- Resources: `htop` / `free -m` during downloads; watch disk of `DOWNLOAD_DIR` (`df -h`).
- Cost: AWS Cost Anomaly Detection + CloudWatch Billing alarm.
- First-request sanity lines to look for: `[ytdlp:path] resolved yt-dlp binary: …` and `[ytdlp:path] yt-dlp version: …`.

---

## 11. Legal / Compliance Notes

**What's in place** (all from `src/app/terms-of-service/page.tsx` and `privacy-policy/page.tsx`):
- **Terms of Service**: the service is *"as is"*; users may only download content they own, have permission to save, or that's openly licensed; intended for **personal, non-commercial** use; users are solely responsible for their use; rate limits may block abusers.
- **Copyright / takedowns**: the service is positioned as *not hosting* files — it downloads publicly-exposed links the user provides and never stores/redistributes content. A copyright holder can email **xastsolutions@gmail.com** with the exact URLs and ownership details; the operator reviews each request and may block offending content.
- **Privacy policy**: no tracking cookies, no analytics, no accounts; only data needed to deliver the file; contact for data questions.
- **Branding on the live site**: Footer states "Download only content you have the right to save… does not host any videos".

**What it is NOT:** this is **not** a registered legal DMCA agent or a formal legal entity — it is an email-based request process operated by Xast Solutions. Copyright handling is a manual review pending process, not a statutory DMCA registration. The trademark line in the footer notes YouTube/Instagram/TikTok/Facebook names belong to their owners and are used only to describe compatibility.

---

## 12. Known Limitations / Honest Caveats

- **Rate limiting is in-memory** (`src/lib/rateLimit.ts`): the token-bucket map lives inside a single Node process. It protects **one instance only** and won't coordinate across multiple servers (or across multiple replicas of the same server). Scaling horizontally to a load balancer without moving limits to Redis will let limits be bypassed and won't pool quotas.
- **All job state is in-memory too** (`src/lib/jobs.ts`): restarting the server kills queued/running jobs and ready-but-uncollected files. No persistence by design.
- **TikTok is currently disabled** (upstream yt-dlp #17604). There is no TikTok URL surface until both yt-dlp is fixed *and* `NEXT_PUBLIC_TIKTOK_ENABLED=true` is built.
- **Datacenter IP flagging**: without fresh cookies, YouTube (and sometimes Facebook) restrict or bot-flag requests from Railway/AWS IPs ("age-restricted", "confirm you're not a bot", login walls). Cookies fix most cases but are a moving target and expire in weeks.
- **Browser-native downloads only work for direct, single-file formats** — HLS manifests (`.m3u8`) are filtered out of `/api/direct-url`; merged 1080p and MP3 always go through the server pipeline.
- **No audio MP3 for Instagram** (single muxed stream, no standalone track) — by design, but notably different from YouTube/Facebook.
- **720p+ on YouTube requires ffmpeg**; `NO_FFMPEG=1` silently downgrades to progressive formats only (and disables MP3).
- **Single concurrency ceiling**: `MAX_DOWNLOADS` clamped to 1–4; heavy parallel 1080p encodes on a t3.medium will eat CPU/RAM (2 GB swap is recommended at build time; `MemoryMax=3G` in the systemd unit).
- **`.env.example` is missing from the repo** even though README/AWS guide reference it — create it from the table in §5 if you want the documented `cp .env.example .env.local` flow to work.
- **Age-restricted/private content cannot be downloaded** — intentionally (mapped to `PRIVATE`/`RESTRICTED` errors), and cookies should never be abused to bypass actual age gates.
- **Upstream instability**: yt-dlp extractors are a permanently-moving target; expect periodic `EXTRACTOR_OUTDATED` maintenance (see §10).
- **Historical agent docs** (`CLAUDE.md`, `AGENTS.md`) exist for the next-dev/agent toolchain — not runtime features.

---

## 13. Version / Last Updated

- **App version**: `0.1.0` (`package.json`).
- **Stack versions at time of writing**: Next.js 16.3.5, React 19.2.8, Tailwind v4, yt-dlp nightly via Docker `ARG YTDLP_VERSION=latest` (fallback build `2026.09.16.232951`).
- **Repo status**: single commit `8ca79cd Add SEO strategy, AWS deployment guide, and latest updates`.
- **This file last updated**: **September 19, 2026**.

**Maintenance rule for this document:** update this file whenever major features, infrastructure, or platform-support changes land — new platforms, re-enabling TikTok, moving off the in-memory architecture, TLS/proxy changes, new env vars, or behavior changes in the download pipeline. Keep the env table in §5 in sync with the code (grep for `process.env` to verify); it is the single most-frequented section.