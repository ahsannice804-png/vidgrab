import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "download-youtube-videos-iphone-android-pc",
  title: "How to Download YouTube Videos on iPhone, Android and PC",
  description:
    "Device-by-device steps for saving a YouTube video as an MP4 on iPhone, Android and Windows or Mac, plus where the file ends up and how to get it into your gallery.",
  category: "youtube",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/youtube-video-downloader",
  related: [
    "copy-video-link-guide",
    "find-downloaded-videos",
    "video-quality-360p-720p-1080p",
  ],
  body: `
The download itself is the easy part. What trips most people up is everything around it: copying the right link out of the YouTube app, the browser prompt that appears on a phone, and then figuring out where the file actually went. The steps are slightly different on every device, so this guide walks through each one separately. Skip to the section for the phone or computer you are holding.

Before any of that, a quick word on the official route. If you pay for YouTube Premium, the **Download** button under a video saves it for offline viewing inside the YouTube app. That copy can't be moved, edited or played anywhere else, which is why people look for an MP4 file instead. If you just want to watch on a flight, Premium is the simplest option. If you need an actual file, keep reading.

## What you need before you start

- The video's link. Any normal YouTube address works: a \`youtube.com/watch?v=\` link, a short \`youtu.be\` link, a Shorts link or a link copied from the mobile app with \`?si=\` on the end.
- A browser. Safari on iPhone, Chrome on Android, and any modern browser on a computer. No app or extension is needed.
- Some free space. A 10-minute video at 1080p is often somewhere between 100 and 300 MB, so check your storage if your phone is nearly full.

If you are not sure how to get the link out of the app, our guide on [how to copy a video link](/blog/copy-video-link-guide) shows the exact buttons on each platform.

## On iPhone or iPad

Safari has been able to download files directly since iOS 13, so you don't need a third-party "downloader app" from the App Store. Most of those are wrappers around a website anyway, often with more ads.

1. Open the video in the YouTube app, tap **Share** under the player, then tap **Copy link**.
2. Open Safari and go to the [YouTube video downloader](/youtube-video-downloader). Tap the input box and choose **Paste**.
3. Wait a few seconds for the preview. You'll see the title, the length and a list of qualities with their real file sizes.
4. Tap the quality you want. When it's ready, Safari shows a small prompt asking whether you want to download the file. Tap **Download**.
5. Tap the blue arrow icon in Safari's address bar to watch progress. When it finishes, tap the file to open it.

The file is now in the **Files** app, inside the **Downloads** folder. It is not in your Photos library yet, and that's the part that confuses most iPhone users.

### Moving the video into Photos

Open **Files**, go to **Downloads**, and tap the video. Tap the **Share** icon in the bottom-left corner and choose **Save Video**. It now appears in Photos like anything you recorded yourself. You can delete the copy in Files afterwards to free up space.

> [!TIP]
> If you can't find the Downloads folder, check **Settings > Apps > Safari > Downloads** (on older iOS versions, **Settings > Safari > Downloads**). It tells you whether Safari saves to iCloud Drive or to On My iPhone.

## On Android

Android is more relaxed about files, so there are fewer extra steps.

1. In the YouTube app, tap **Share** below the video and pick **Copy link**.
2. Open Chrome (or Samsung Internet, Firefox or whatever you use) and go to the [YouTube downloader](/youtube-video-downloader). Long-press the input box and tap **Paste**.
3. Choose a quality from the list once the preview loads.
4. Chrome shows a download notification at the bottom of the screen. Tap **Open** when it finishes, or pull down the notification shade later.

The file lands in the **Download** folder on your internal storage. Most gallery apps, including Google Photos, pick up videos from that folder automatically within a minute or so. If yours doesn't, open the **Files by Google** app, tap **Downloads**, and the video will be at the top of the list.

> [!NOTE]
> Some phones ask the first time you download whether Chrome may save files. Allow it, otherwise the download silently fails.

## On Windows or Mac

A computer is the most comfortable place to do this, especially for long videos.

1. Copy the address from your browser's address bar while the video is open, or right-click the video and choose **Copy video URL**.
2. Open the [YouTube video downloader](/youtube-video-downloader) in a new tab and paste the link with **Ctrl+V** (Windows) or **Cmd+V** (Mac).
3. Pick a quality. The file is prepared on our server and then handed to your browser.
4. Press **Ctrl+J** in Chrome or Edge (**Option+Cmd+L** in Chrome or Safari on a Mac) to open the downloads list, then click **Show in folder**.

By default everything goes to the **Downloads** folder in your user account. On a Mac that's the Downloads stack in the Dock.

## Which quality to pick on each device

The quality list only shows options that really exist for that video, from 360p up to 1080p HD. A rough way to decide:

- **Phone screen, saving space:** 480p or 720p. On a six-inch display, most people can't tell 720p from 1080p.
- **Laptop or tablet:** 720p is fine; 1080p if the video has small text, like a coding tutorial or a slide deck.
- **TV or projector:** 1080p, always.

If you only want the sound, switch to the **Audio** tab and choose an MP3 option instead. There's a fuller breakdown in [360p vs 720p vs 1080p](/blog/video-quality-360p-720p-1080p).

## Why 1080p sometimes takes longer

YouTube stores its higher-quality versions as two separate streams: one with the picture and one with the sound. A player in your browser plays them together without you noticing. A downloader has to fetch both and join them into a single MP4, which our server does with FFmpeg before the file reaches you. That extra merge step is why 1080p of a long video can sit on "preparing" for a while, while 360p of the same video starts almost immediately.

## When it doesn't work

A few situations will stop a download, and none of them are fixable from your side:

- **Private videos** are visible only to the uploader and people they invited.
- **Age-restricted videos** need a signed-in account, which we don't use.
- **Members-only or paid videos** are behind a subscription.
- **Region-locked videos** aren't served to the region our server is in.

You'll get a clear message rather than a broken file. If the error says something else, or the download stalls, [why video downloads fail](/blog/why-video-downloads-fail) covers the less obvious causes. And if the file downloaded but you can't find it, [where downloaded videos go](/blog/find-downloaded-videos) has the folder paths for each device.

## A note on what you download

Save videos you made yourself, videos the creator has said you may download, or material under an open license. For anything else, ask the creator first. A download tool makes copying easy; it doesn't change who owns the video.
`,
  faq: [
    {
      question: "Do I need to install an app to download YouTube videos on my phone?",
      answer:
        "No. Safari on iPhone and Chrome on Android can both download files directly. Paste the link into the downloader in your browser, pick a quality and the MP4 is saved to your phone.",
    },
    {
      question: "Why is my downloaded YouTube video not in the iPhone Photos app?",
      answer:
        "Safari saves downloads to the Files app, in the Downloads folder. Open the video there, tap the Share icon and choose Save Video to copy it into Photos.",
    },
    {
      question: "Is the YouTube Premium download the same as an MP4 file?",
      answer:
        "No. Premium downloads stay inside the YouTube app and can only be watched there. They are not files you can move, edit or play in another player.",
    },
    {
      question: "Can I download a YouTube video in 4K?",
      answer:
        "Our tool currently tops out at 1080p HD. For phones, laptops and most TVs viewed from a normal distance, 1080p is plenty.",
    },
  ],
};
