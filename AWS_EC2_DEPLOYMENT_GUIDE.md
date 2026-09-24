# AWS EC2 Deployment Guide — Video Downloader (Next.js + yt-dlp + ffmpeg)

Deploy the video downloader on a single **t3.medium** EC2 instance (2 vCPU / 4 GB RAM).
This app is designed to run as **one instance** — download jobs are held in memory
and temp files on disk, so scale `t3.medium` up vertically later instead of adding
a second instance.

> Estimated cost: **~$30/mo** for the instance + ~$3.50/mo for a 30 GB gp3 EBS volume
> + ~$3.60/mo for one Elastic IP (pay-as-you-go pricing, us-east-1).

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Launch the EC2 instance](#2-launch-the-ec2-instance)
3. [Reserve an Elastic IP (static address)](#3-reserve-an-elastic-ip-static-address)
4. [Connect to the server (from Windows)](#4-connect-to-the-server-from-windows)
5. [Install the software stack](#5-install-the-software-stack)
6. [Get the code onto the server](#6-get-the-code-onto-the-server)
7. [Configure the app (environment)](#7-configure-the-app-environment)
8. [Build the production bundle](#8-build-the-production-bundle)
9. [Run it as a systemd service](#9-run-it-as-a-systemd-service)
10. [Reverse proxy + TLS (nginx + Certbot)](#10-reverse-proxy--tls-nginx--certbot)
11. [Verify downloads work end-to-end](#11-verify-downloads-work-end-to-end)
12. [Basic hardening](#12-basic-hardening)
13. [Monitoring, backups & troubleshooting](#13-monitoring-backups--troubleshooting)
14. [Scaling when traffic grows](#14-scaling-when-traffic-grows)

---

## 1. Prerequisites

- An AWS account with permission to launch EC2.
- A domain name (optional but recommended) pointing at your future Elastic IP, e.g.
  an `A` record for `yourdomain.com`.
- **Windows 10/11** (you are on Windows) — OpenSSH client (`ssh`/`scp`) is built in.

---

## 2. Launch the EC2 instance

1. Open **EC2 → Instances → Launch instance** (us-east-1 or your preferred region).

2. **Name**: `video-downloader`.

3. **AMI**: select **Ubuntu Server 24.04 LTS (HVM, SSD)** — `ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*`, **64-bit (x86)**.

4. **Instance type**: `t3.medium` (2 vCPU, 4 GB RAM).

5. **Key pair**: click *Create new key pair* →
   - Name: `video-downloader-key`
   - Type: RSA
   - Save the downloaded `video-downloader-key.pem` to `C:\Users\ITW\Documents\video-downloader\` (it is already git-ignored via `*.pem`). **Never share this file.**

6. **Network settings** → *Edit*, create a security group named `video-downloader-sg` with these inbound rules:

   | Type | Protocol | Port | Source |
   | --- | --- | --- | --- |
   | SSH | TCP | 22 | your home IP only (e.g. `203.0.113.10/32`) |
   | HTTP | TCP | 80 | 0.0.0.0/0 |
   | HTTPS | TCP | 443 | 0.0.0.0/0 |

   > Do **not** open port 3000 to the world — nginx will proxy it locally.

7. **Configure storage**: set **30 GB gp3** (delete-on-termination stays checked). 30 GB is plenty; finished files are streamed then auto-deleted, and jobs expire after 35 minutes.

8. Click **Launch instance**. Wait ~1 min for status **2/2 checks passed**.

---

## 3. Reserve an Elastic IP (static address)

A plain public IP changes on every stop/start. Reserve a fixed one:

1. **EC2 → Elastic IPs → Allocate Elastic IP address** → **Allocate** (leave defaults).
2. Select the new IP → **Actions → Associate Elastic IP address** → pick your instance → **Associate**.
3. Update your domain's `A` record to this IP.

---

## 4. Connect to the server (from Windows)

Open **PowerShell** on your PC:

```powershell
ssh -i "C:\Users\ITW\Documents\video-downloader\video-downloader-key.pem" ubuntu@<ELASTIC_IP>
```

First connection security warning: type `yes`. You'll get a `ubuntu@ip-...` shell.

If the key is rejected, fix the permissions on Windows so OpenSSH accepts it:

```powershell
icacls "C:\Users\ITW\Documents\video-downloader\video-downloader-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

---

## 5. Install the software stack

Run all of this over your SSH session. The app shells out to **yt-dlp** (a Python
zipapp) and **ffmpeg**, and needs **Node.js 20.9+**.

```bash
sudo apt-get update && sudo apt-get upgrade -y

# --- Core system packages ------------------------------------------------
sudo apt-get install -y ca-certificates curl gnupg git build-essential \
    python3 python3-pip python-is-python3 ffmpeg

# --- Node.js 20 LTS (NodeSource) -----------------------------------------
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # expect v20.x
npm -v

# --- yt-dlp (pinned nightly zipapp) --------------------------------------
# Nightly builds carry extractor fixes (esp. TikTok) well before stable.
# Get the newest nightly tag:
TAG=$(curl -fsSL --retry 3 "https://api.github.com/repos/yt-dlp/yt-dlp-nightly-builds/releases/latest" \
      | python3 -c "import json,sys; print(json.load(sys.stdin)['tag_name'])")
echo "Installing yt-dlp nightly $TAG"
sudo curl -fL --retry 3 -o /usr/local/bin/yt-dlp \
  "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/${TAG}/yt-dlp"
sudo chmod +x /usr/local/bin/yt-dlp
yt-dlp --version   # e.g. 2026.x.y.xxxxxx

# --- nginx (reverse proxy / TLS) -----------------------------------------
sudo apt-get install -y nginx

# --- Optional but recommended: 2 GB swap (aids next build + encodes) -----
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

> **Keep yt-dlp updated.** YouTube/Instagram/Facebook/TikTok break extractors
> regularly. Re-run the `TAG`/`curl` block above (or `sudo yt-dlp -U` if you used
> stable) whenever you see *"This platform's downloader needs an update"* in the app.

---

## 6. Get the code onto the server

Two options — pick one.

### Option A — upload from this PC (no repo on GitHub, easiest for you)

From **PowerShell on your PC** (not in the SSH session — open a fresh window),
`scp` the whole project up. Exclude the heavy/local dirs with a tar first so you
don't copy `node_modules` or `.next`:

```powershell
# from C:\Users\ITW\Documents\video-downloader
ssh -i .\video-downloader-key.pem ubuntu@<ELASTIC_IP> "mkdir -p /opt"
tar --exclude=node_modules --exclude=.next --exclude=tmp --exclude=.git -cf - . |
  ssh -i .\video-downloader-key.pem ubuntu@<ELASTIC_IP> "tar -xf - -C /opt && mv /opt/$(Get-ChildItem -Name | Select-Object -First 1 | Out-String).Trim()" 2>$null
```

> If the one-liner above trips you up, fall back to plain transfer:
> ```powershell
> scp -i .\video-downloader-key.pem -r .\src .\config .\public .\package.json .\package-lock.json .\next.config.ts .\tsconfig.json .\eslint.config.mjs .\postcss.config.mjs .\next-env.d.ts .env.example ubuntu@<ELASTIC_IP>:/tmp/app/
> ```
> then on the server: `sudo mkdir -p /opt/video-downloader && sudo mv /tmp/app/* /tmp/app/.* /opt/video-downloader/ 2>/dev/null; true`

### Option B — git clone (if the project is pushed to GitHub)

```bash
sudo mkdir -p /opt && sudo chown $USER /opt
git clone https://github.com/<you>/video-downloader.git /opt/video-downloader
```

Then make `/opt/video-downloader` writable by your user:

```bash
sudo chown -R $USER:$USER /opt/video-downloader
cd /opt/video-downloader
```

---

## 7. Configure the app (environment)

Create the production env file. **Never commit it** (`.gitignore` already ignores
`.env*`). See `.env.example` for the full documented list.

```bash
cd /opt/video-downloader
cat > .env.local <<'EOF'
# Your public site URL — REQUIRED. Baked into sitemap/canonical/OG at build time.
BASE_URL=https://yourdomain.com

# yt-dlp binary we installed above:
YTDLP_PATH=/usr/local/bin/yt-dlp

# Where finished files are staged before streaming (10+ GB headroom):
DOWNLOAD_DIR=/opt/video-downloader/tmp/downloads

# Concurrent download jobs (clamped to 1-4). Keep 3 on t3.medium.
MAX_DOWNLOADS=3

# Keep merging/MP3 conversion enabled:
NO_FFMPEG=0

# NODE_ENV alternative for next start:
NODE_ENV=production
EOF
```

### Feature flag — TikTok (must be set BEFORE `npm run build`)

`NEXT_PUBLIC_TIKTOK_ENABLED` is inlined into the client bundle at build time.
Leave it off unless you need TikTok:

```bash
# To ENABLE the TikTok UI: export NEXT_PUBLIC_TIKTOK_ENABLED=true before building.
# To keep it hidden: set false/omit it before building.
export NEXT_PUBLIC_TIKTOK_ENABLED=false
```

### YouTube / Facebook cookies (IMPORTANT on AWS)

AWS datacenter IPs get flagged by YouTube (videos appear *"age-restricted"*,
*"restricted"*, or hit bot checks) even for normal public videos. Bypass this by
providing cookies from a logged-in browser session:

1. In Chrome install **"Get cookies.txt LOCALLY"** and export cookies for youtube.com
   (and separately for facebook.com if you hit login walls).
2. Add the whole file content to `.env.local` as a single env var (newlines kept):

```bash
# Append to .env.local:
cat >> .env.local <<'EOF'
YOUTUBE_COOKIES_CONTENT=$(cat /tmp/youtube_cookies.txt)
FACEBOOK_COOKIES_CONTENT=$(cat /tmp/fb_cookies.txt)
EOF
```

The app writes these to private temp files (0600) at runtime and never logs them.
If you can't produce cookies, set nothing — the tool still works, just less
reliably for YouTube on AWS IPs.

---

## 8. Build the production bundle

`next build` needs devDependencies (Tailwind), so install with `npm ci` (uses the
lockfile for reproducible installs):

```bash
cd /opt/video-downloader
npm ci
npm run build
```

`BASE_URL` and the TikTok flag above must already be set — sitemap/robots/OG are
baked during this step. Do not run `npm run dev` here; we want the production
server. If the build dies with an OOM error, add the swap from step 5 and retry.

Optional but recommended: smoke-test before wiring the service:

```bash
BASE_URL=https://yourdomain.com npm run start   # Ctrl+C after a successful boot
```

You should see `[ytdlp:path] resolved yt-dlp binary: /usr/local/bin/yt-dlp` and a
version line on the first request.

---

## 9. Run it as a systemd service

Create a service so the app auto-starts and restarts:

```bash
sudo tee /etc/systemd/system/video-downloader.service >/dev/null <<'EOF'
[Unit]
Description=Video Downloader (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/video-downloader
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
# Avoid OOM-killing the app under heavy downloads:
MemoryMax=3G

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now video-downloader
sudo systemctl status video-downloader   # active (running)

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000   # expect 200
journalctl -u video-downloader -f                                  # watch logs
```

> `package.json` has no `engines`; npm warns if the shell's node differs from the
> system node — verify with `npm start -- --help` if worried. `next start` serves
> on port 3000 by default; the service pins `PORT=3000` explicitly.

---

## 10. Reverse proxy + TLS (nginx + Certbot)

Next.js serves on 127.0.0.1:3000. Put nginx in front for HTTP/HTTPS:

> Use the versioned, complete config in **`deploy/nginx-videosdownloader.conf`** and
> adapt the domain (and any differing cert paths). It enforces the canonical host
> (`https://videosdownloader.online`, no `www`): all `http://` and `https://www.`
> requests 301 to the apex with the full path + query preserved, using `$request_uri`.

```bash
sudo tee /etc/nginx/sites-available/video-downloader >/dev/null <<'EOF'
# HTTP -> HTTPS, straight to the canonical apex host (single hop).
# Preserves the complete path and query string via $request_uri.
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

# HTTPS canonical host (apex). Serves the Next.js app.
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # Client uploads can be large (job polling bodies are small; keep sane limits)
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;      # long downloads stream through here
    }
}

# HTTPS "www" -> canonical apex 301 (same SAN certificate serves both names).
server {
    listen 443 ssl http2;
    server_name www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://yourdomain.com$request_uri;
}
EOF

sudo ln -s /etc/nginx/sites-available/video-downloader /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Issue a free TLS certificate. Request both hostnames so the single SAN
certificate covers apex **and** `www` (the redirect block above reuses it):

```bash
sudo apt-get install -y certbot python3-certbot-nginx
# Run this AFTER nginx is serving the site config (certbot injects its ssl
# lines into the apex 443 block and creates the live/<domain>/ cert paths
# that the www block above references).
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com   # follow the prompts
```

Verify canonical-host redirects from the edge:

```bash
curl -I http://yourdomain.com/            # 301 -> https://yourdomain.com/
curl -I http://www.yourdomain.com/        # 301 -> https://yourdomain.com/
curl -I https://www.yourdomain.com/       # 301 -> https://yourdomain.com/
curl -I https://yourdomain.com/           # 200
```

Verify from your browser: `https://yourdomain.com` loads and the padlock shows.

> Prefer Caddy instead? The README's VPS section shows a 3-line Caddyfile that
> also auto-issues TLS.

---

## 11. Verify downloads work end-to-end

1. Open `https://yourdomain.com`, paste a YouTube URL, wait for the preview card.
2. Pick **Video + 720p/1080p** → **Download**. Watch the progress card reach
   "Download Ready!" and the file save.
3. Now switch to the **Audio** tab → pick a bitrate → **Download**. Confirm the MP3
   downloads *after* the video download completed (this validates the Audio-tab fix
   still behaves in production).
4. Repeat with an Instagram reel and a Facebook video URL.
5. Watch the logs during a download:

```bash
journalctl -u video-downloader -f
```

You should see the `GET /api/info`, `POST /api/download` (202), repeated
`GET /api/job/<id>` polls, and the `[ytdlp:path] resolved yt-dlp binary` /
`version` lines on first contact.

6. Check disk usage — files are streamed then auto-deleted:

```bash
df -h /opt/video-downloader/tmp/downloads
```

---

## 12. Basic hardening

```bash
# Firewall (keep SSH to your IP only)
sudo apt-get install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status

# Basic intrusion prevention (optional)
sudo apt-get install -y fail2ban

# Keep the OS patched (monthly is fine)
sudo unattended-upgrades --dry-run   # already enabled on Ubuntu LTS by default
```

- Don't expose port 3000 to the internet (nginx proxies it).
- Keep `video-downloader-key.pem` off the server and out of git.
- The built-in token-bucket rate limiting already protects `/api/*` — no extra app
  work needed.

---

## 13. Monitoring, backups & troubleshooting

### Monitoring
- `journalctl -u video-downloader -f` — app logs (rors, job polls, yt-dlp output).
- `sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log` — web traffic.
- `htop` / `free -m` during a download to watch CPU/RAM on the t3.medium.
- Cost: enable **AWS Cost Anomaly Detection** + a **CloudWatch Billing** alarm so
  you're warned if spend spikes.

### Backups
- The app has **no database** — state is in-memory jobs + short-lived temp files.
  The only thing worth backing up is `/opt/video-downloader/.env.local`
  (cookies/secrets). Stash a copy in a private place (AWS SSM Parameter Store
  SecureString, or your own password manager).
- For image: **Volume snapshot** via AWS Backup (optional, cheap, supports recovery).

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| App loads but downloads fail with "tools missing" | Install `python3` + `ffmpeg` (step 5), restart: `sudo systemctl restart video-downloader` |
| YouTube videos flagged age/region restricted | Set `YOUTUBE_COOKIES_CONTENT` (step 7) — AWS IPs are rate-limited/flogged by Google; cookies fix it |
| "This platform's downloader needs an update" | `yt-dlp` extractor broke → re-run the yt-dlp install block (nightly) |
| `next build` out-of-memory | Ensure the 2 GB swap from step 5 exists, or build with `NODE_OPTIONS=--max-old-space-size=2048` |
| Site down after redeploy | Check `sudo systemctl status video-downloader`, then `curl http://127.0.0.1:3000`; is `.env.local` present? |
| User reports HTTP 429 | Built-in rate limiting (per IP) — legit. Adjust the limiter config in `src/lib/` if too aggressive |

---

## 14. Scaling when traffic grows

This app is **single-instance by design** (in-memory job map, local temp files).
Scale vertically, not horizontally:

1. **t3.medium (now)** — fine for your first handful of users.
2. **t3.large / m6i.large (2 vCPU / 8 GB)** — stop the instance in the EC2 console,
   *Actions → Instance settings → Change instance type*, start it again. Raise
   `MAX_DOWNLOADS=4` in `.env.local`.
3. **m6i.xlarge / c6i.2xlarge (4 vCPU / 8-16 GB)** — when wait times for 1080p
   encodes grow. Add EBS storage as `DOWNLOAD_DIR` temp needs grow.
4. **Still not enough?** That means moving to a spot-fleet + shared job/queue
   architecture (Redis + S3) — a bigger project; don't go there until you must.

---

*Tip after deploying: kill `npm run dev`, keep only the systemd service running.
For code updates, `git pull` (or re-`scp`), re-run `npm ci && npm run build`,
then `sudo systemctl restart video-downloader` — and re-check `.env.local` still
has `BASE_URL` before the build step.*