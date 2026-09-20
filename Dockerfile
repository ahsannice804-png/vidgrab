# ------------------------------------------------------------------
# Video Downloader
# Docker image for the Railway staging/review deployment.
#
# The app's download engine shells out to `yt-dlp` (a Python zipapp)
# and `ffmpeg`, so the image installs python3, pip and ffmpeg, then
# downloads a pinned yt-dlp nightly zipapp. Next.js is built with
# `npm ci` + `next build` and started in production mode.
#
# Node base image: package.json does not declare `engines`; the Next.js
# package itself requires Node >= 20.9.0 (see node_modules/next/package.json),
# so we pin the Node 20 Debian (bookworm) LTS image.
# ------------------------------------------------------------------

FROM node:20-bookworm-slim

# System dependencies required at runtime by the download engine:
#   - python3 : executes the yt-dlp binary (a self-contained Python zipapp)
#   - python3-pip : general Python tooling (yt-dlp itself is installed
#       below as a pinned zipapp, not via pip)
#   - python-is-python3 : provides the `python` command (symlinked to python3) —
#       required by node-gyp/native modules during `npm ci`
#   - ffmpeg  : merges separate video+audio streams into MP4 and re-encodes
#               MP3 audio (the app falls back to PATH when no FFMPEG_PATH is set)
#   - curl    : handy for health checks / debugging
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python-is-python3 \
        ffmpeg \
        curl \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------------
# yt-dlp (nightly, auto-updating)
#
# The TikTok extractor depends on yt-dlp's JS-challenge solver, which
# is iterated in the nightly builds well ahead of stable (the latest
# stable, 2026.08.19, fails with "Unexpected response from webpage
# request"). We install yt-dlp as a self-contained Python zipapp and
# point YTDLP_PATH at it so it takes priority over the yt-dlp-exec
# node_module bundle (a stale stable release) and any PATH-provided
# yt-dlp.
#
# YTDLP_VERSION defaults to "latest": the newest nightly-build tag is
# resolved from the GitHub API at build time, so every fresh build
# automatically picks up extractor fixes the moment they are published
# (no manual version bump needed). To pin an exact build instead, pass
# `docker build --build-arg YTDLP_VERSION=2026.09.16.232951`.
# Releases: https://github.com/yt-dlp/yt-dlp-nightly-builds/releases
# ------------------------------------------------------------------
ARG YTDLP_VERSION=latest
# Used only when "latest" cannot be resolved (GitHub API unreachable at
# build time) so the build never fails.
ARG YTDLP_FALLBACK_VERSION=2026.09.16.232951
RUN TAG="$YTDLP_VERSION"; \
    if [ "$TAG" = "latest" ]; then \
      TAG=""; \
      TAG=$(curl -fsSL --retry 3 --retry-delay 2 \
            "https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/latest" \
            | python3 -c "import json, sys; print(json.load(sys.stdin).get('tag_name', ''))") || true; \
      if [ -z "$TAG" ]; then \
        echo "WARN: could not resolve 'latest' nightly; falling back to ${YTDLP_FALLBACK_VERSION}"; \
        TAG="$YTDLP_FALLBACK_VERSION"; \
      fi; \
    fi; \
    echo "Installing yt-dlp ${TAG}:"; \
    curl -fL --retry 3 --retry-delay 2 \
        -o /usr/local/bin/yt-dlp \
        "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/${TAG}/yt-dlp" \
    && chmod +x /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --version

# Force every yt-dlp spawn (info, direct-url, downloads) to use the pinned
# nightly above, overriding the yt-dlp-exec bundle and PATH.
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

ENV NEXT_TELEMETRY_DISABLED=1

# Sitemap / canonical / Open Graph URLs are baked at build time from BASE_URL.
# Defaults to the production domain so a plain build produces correct SEO URLs.
# For a staging/review build, override explicitly:
# `docker build --build-arg BASE_URL=https://<staging-host>`.
ARG BASE_URL=https://videosdownloader.online
ENV BASE_URL=$BASE_URL

WORKDIR /app

# Install dependencies (installs devDependencies too, required by `next build`).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project (see .dockerignore for exclusions).
COPY . .

# Feature flags are inlined into the client bundle at build time, so they must
# be present during `next build`. TikTok is hidden by default while its upstream
# yt-dlp extractor is broken; build with NEXT_PUBLIC_TIKTOK_ENABLED=true (or set
# it in Railway's service variables) to restore the TikTok UI.
ARG NEXT_PUBLIC_TIKTOK_ENABLED=false
ENV NEXT_PUBLIC_TIKTOK_ENABLED=$NEXT_PUBLIC_TIKTOK_ENABLED

# Build the production bundle.
RUN npm run build

# NODE_ENV is set only for the runtime stage: leaving it unset during `npm ci`
# ensures devDependencies (incl. @tailwindcss/postcss) are installed for the
# build, while `next start` runs in production mode.
ENV NODE_ENV=production

# Railway injects its own PORT at runtime; `next start` honours it and
# otherwise defaults to 3000. EXPOSE is documentation for Railway's port
# detection (do not hard-code ENV PORT or Railway's value would be ignored).
EXPOSE 3000

CMD ["npm", "run", "start"]