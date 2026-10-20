import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "video-quality-360p-720p-1080p",
  title: "360p vs 720p vs 1080p: Which Video Quality Should You Download?",
  description:
    "What 360p, 480p, 720p and 1080p actually mean, when the difference is visible and when it isn't, and a simple way to choose the right quality for each video.",
  category: "formats",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/",
  related: ["video-file-size-guide", "mp4-vs-mp3-vs-webm", "download-youtube-shorts"],
  body: `
Most people pick the biggest number on the list and move on. That's not a bad instinct, but it's often wasteful. A cooking video you'll watch once on your phone doesn't need the same quality as a clip you're going to edit and project on a wall. Choosing well saves storage, mobile data and waiting time, and in a lot of cases you won't see any difference at all.

## What the numbers mean

The "p" number is the height of the picture in pixels, for a normal widescreen (16:9) video. The width follows from that.

| Name | Size (W × H) | Pixels in each frame | Common label |
| --- | --- | --- | --- |
| 360p | 640 × 360 | about 0.23 million | Low |
| 480p | 854 × 480 | about 0.41 million | SD |
| 720p | 1280 × 720 | about 0.92 million | HD |
| 1080p | 1920 × 1080 | about 2.07 million | Full HD |

Each step up is a bigger jump than it looks. 1080p has more than twice the pixels of 720p and about nine times as many as 360p.

The "p" stands for *progressive*, meaning every line of each frame is drawn at once. It's a leftover from the days of interlaced TV, and you can ignore it.

## Resolution isn't the whole story

Two 720p files can look very different. What matters as much as resolution is **bitrate**, the amount of data spent describing each second of video. A 720p video at a healthy bitrate looks crisp; the same resolution starved of bitrate turns into blocks during fast motion.

That's why a 1080p video of confetti falling can look worse than a 720p video of someone talking at a desk. Busy scenes, like water, crowds, sports and fireworks, need far more data to look clean than static ones.

Platforms choose the bitrate, not you. When you pick a quality in a downloader, you're picking one of the versions the platform already stored. You can't add quality that isn't there.

## When you'll actually notice the difference

Screen size and viewing distance decide this more than anything.

**On a phone,** the jump from 360p to 480p is obvious, from 480p to 720p is noticeable on text and faces, and from 720p to 1080p is subtle for most people at arm's length. Small text in a screen recording is the exception, where 1080p really helps.

**On a laptop or tablet,** 720p is comfortable for most things. 1080p becomes clearly better for anything with fine detail: slides, code, landscapes.

**On a TV or projector,** 1080p is the one to get. Anything less looks soft once it's stretched across a big screen.

## A quick way to decide

Ask yourself two questions.

**Where will I watch it?** Phone: 480p or 720p. Laptop: 720p. TV: 1080p.

**What's in it?** Talking heads, podcasts, lectures: drop a level. Text on screen, fast motion, nature, anything you'll edit: go up a level.

So a lecture you'll watch on your phone: 360p or 480p. A coding tutorial on your laptop: 1080p, because the code needs to be readable. A family video you'll show on the TV at a birthday: 1080p.

> [!TIP]
> If you're editing a clip, always download the highest quality available. Every edit and re-export loses a little detail, and starting high leaves room for that.

## Vertical videos read differently

Shorts, Reels and other vertical videos turn the picture on its side. A full-HD vertical video is 1080 pixels wide and 1920 tall. Different apps label that differently, some by the width, some by the height, so the label on a button isn't always a reliable guide. [Downloading YouTube Shorts in full quality](/blog/download-youtube-shorts) explains how to check what you actually got.

## Why the option you want sometimes isn't there

Downloaders can only offer what the platform has stored. Some reasons you might not see 1080p:

- **It was uploaded at a lower resolution.** A video filmed at 720p will never have a 1080p version.
- **It's old.** Older uploads were often processed only up to 480p or 720p.
- **The platform keeps fewer versions.** Instagram usually stores one version per Reel. Facebook typically stores SD and HD.
- **It's still processing.** Right after upload, YouTube makes the lower qualities first and adds HD later.

Our tools only list qualities that actually exist for the video, with their real file sizes. If 1080p isn't shown, it isn't available for that video. We don't upscale a lower version and label it 1080p, which some sites do.

## What about 4K?

Our tools go up to 1080p HD. 4K (2160p) has four times the pixels of 1080p and files to match, often several gigabytes for a short video. Unless you're editing professionally or watching on a large 4K TV up close, 1080p is the sensible ceiling for downloads.

## The cost side: storage

Higher quality means bigger files, roughly doubling with each step. For a typical ten-minute video:

- 360p: tens of megabytes
- 720p: often around 100 MB
- 1080p: often 150 to 300 MB

Content matters a lot here too: a static slideshow compresses far better than a football match. The exact numbers, and how to estimate them yourself, are in [how much storage a downloaded video takes](/blog/video-file-size-guide). If you only need the sound, MP3 is much smaller again; [MP4 vs MP3 vs WebM](/blog/mp4-vs-mp3-vs-webm) explains the options.

## Frame rate: the other number

Some videos run at 30 frames per second, others at 60. Gaming videos, sport and some vlogs are often filmed at 60fps, which makes motion look smoother. When a platform stores a video at 60fps, it needs noticeably more data than the same resolution at 30fps, so expect a larger file.

You can't choose the frame rate directly in most downloaders, ours included; you get what the platform serves for each quality. If a video looked silky-smooth when you watched it, expect bigger files at the higher qualities. For talking-head content, frame rate makes almost no visible difference.

## Try it

Paste any YouTube, Instagram or Facebook link into the [video downloader](/) and you'll see every available quality with its real size before you commit to anything. Just remember to keep to videos you're allowed to save: your own, ones the creator has offered for download, or openly licensed ones.
`,
  faq: [
    {
      question: "Is 720p good enough for a phone?",
      answer:
        "For most videos, yes. On a phone screen, the difference between 720p and 1080p is subtle unless the video has small text or very fine detail.",
    },
    {
      question: "Why is 1080p not available for some videos?",
      answer:
        "The platform only stores qualities up to what was uploaded, and older or still-processing videos may have fewer versions. Our tool only lists qualities that genuinely exist.",
    },
    {
      question: "Does downloading at a higher quality than the original improve it?",
      answer:
        "No. A video uploaded at 720p can't become sharper. Tools that offer a 1080p version of a 720p video are upscaling it, which makes the file bigger without adding detail.",
    },
    {
      question: "Which quality should I choose for editing?",
      answer:
        "The highest one available. Every edit and export loses some detail, so starting from the best source gives the best result.",
    },
  ],
};
