import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "download-youtube-shorts",
  title: "How to Download YouTube Shorts in Full Quality",
  description:
    "Why screen-recorded Shorts look soft, how vertical resolution really works, and how to save a YouTube Short as a clean MP4 and check the quality you actually got.",
  category: "youtube",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/youtube-video-downloader",
  related: [
    "video-quality-360p-720p-1080p",
    "copy-video-link-guide",
    "download-youtube-videos-iphone-android-pc",
  ],
  body: `
The usual way people save a Short is the screen recorder. It works, sort of. You get the progress bar, the like button, the caption text and whatever notification arrived halfway through, all baked into the picture. Compression on top of compression also makes fine detail go mushy, and the audio picks up a slight delay on some phones.

Downloading the actual file avoids all of that. You get the video exactly as YouTube serves it, without the app's buttons painted over it. Here's how to do that properly, and how to make sure the quality is what you expected.

## Shorts are just vertical videos

There's nothing technically special about a Short. It's a regular YouTube video with a vertical or square shape, and since October 2024 it can run for up to three minutes instead of the old 60-second limit. Each one has the same kind of 11-character ID as any other video, which is why a Shorts link works in any tool that handles YouTube.

All of these point to the same kind of content and all of them work:

- \`youtube.com/shorts/VIDEO_ID\`, the address you see in a desktop browser
- \`youtube.com/shorts/VIDEO_ID?si=...\`, the link the mobile app copies when you tap Share
- \`youtube.com/watch?v=VIDEO_ID\`, the same Short opened as a normal video

You don't need to clean up the \`?si=\` part. It's a tracking parameter the app adds, and it doesn't affect the download.

## Saving a Short step by step

1. In the YouTube app, open the Short and tap the **Share** arrow on the right-hand side, then **Copy link**. On a computer, copy the address from the browser bar.
2. Go to the [YouTube video downloader](/youtube-video-downloader) and paste the link.
3. Wait for the preview. You'll see the thumbnail, the length and the available qualities with their sizes.
4. Pick the highest option in the list unless you're short on space. Shorts are short, so even the top quality is usually a small file.
5. Save the MP4. On iPhone it goes to **Files > Downloads**; on Android it goes to the **Download** folder.

If you'd rather keep only the sound, say a voice-over or a snippet of a song you have permission to use, switch to the **Audio** tab before choosing. [Converting YouTube to MP3](/blog/youtube-to-mp3-guide) explains what the bitrate options mean.

## What "full quality" means for a vertical video

Resolution names like 720p and 1080p were invented for widescreen TV, where the number describes the height of a horizontal picture. A 1080p widescreen video is 1920 pixels wide and 1080 tall.

Turn that picture on its side and the numbers swap. A full-HD Short is **1080 pixels wide and 1920 tall**. Some apps describe that as 1080p because of the width; some tools label it by the 1920 height; some label quality tiers by height alone, which can make a vertical video look like it's in a lower tier than it really is. The label on the button is less reliable than the actual dimensions of the file.

Here's how the common vertical sizes line up:

| Vertical size (W × H) | Equivalent widescreen name | Good for |
| --- | --- | --- |
| 1080 × 1920 | 1080p / Full HD | Re-editing, big screens |
| 720 × 1280 | 720p / HD | Watching on a phone |
| 480 × 854 | 480p | Saving space |
| 360 × 640 | 360p | Previews, slow connections |

Not every Short exists at the top size. YouTube only keeps versions up to what the creator uploaded, so a Short filmed and exported at 720 × 1280 will never be available at 1080 × 1920, no matter which tool you use. That's also why the quality list changes from one Short to the next.

## Check what you actually downloaded

It takes ten seconds and saves a lot of guessing:

- **iPhone:** after saving the video to Photos, open it and swipe up (or tap the **i** button). The info panel shows the dimensions, like 720 × 1280.
- **Android:** in Google Photos, open the video and swipe up for details. Samsung Gallery shows it under the three-dot menu, then **Details**.
- **Windows:** right-click the file, choose **Properties**, then the **Details** tab and look at **Frame width** and **Frame height**.
- **Mac:** select the file in Finder and press **Cmd+I**. **More Info** lists the dimensions.

If the width is 1080, you have the full-HD version. If it's 720 or less, that's either the best YouTube had or a lower option was picked. Try again with the top option to be sure.

> [!TIP]
> Re-uploading a Short to another app? Start from the largest file you can get. Every platform re-compresses on upload, and starting from a soft copy makes the second compression look much worse.

## Things that go wrong with Shorts

**The link opens the Shorts feed instead of one video.** This happens if you copy the address while swiping through the feed on desktop. Pause on the Short you want and copy again; the address should end in that Short's ID.

**The audio is missing from a remix.** Some Shorts use a sound that the creator doesn't own and YouTube later mutes it. The download reflects what YouTube is serving now, so a muted Short downloads muted.

**"This video is unavailable."** The Short was deleted, made private, or is blocked in the region our server is in. [Why video downloads fail](/blog/why-video-downloads-fail) explains each of those messages.

**It looks blurry on a TV.** A 720 × 1280 vertical video is about the same pixel count as standard HD, stretched across a big screen with black bars on both sides. That's normal for vertical content; there's no extra detail to recover.

## If the Short is yours

Downloading your own Short from the public page works, but there's a better source. YouTube Studio keeps your uploads available to you: open **YouTube Studio**, go to **Content**, switch to the **Shorts** tab, hover over the Short, open the three-dot **Options** menu and choose **Download**. The YouTube Studio phone app doesn't offer this, so use a computer.

Better still, check the place you edited it. CapCut, InShot, the Shorts camera and similar apps usually keep a copy of the export on your phone, and that's the version before YouTube's compression. If you're re-posting the same clip to Instagram or another platform, start from that file rather than from a download.

## Respect the people who make them

Shorts are often made by small creators who depend on views. Save the ones you have the right to keep: your own uploads, Shorts the creator has offered for reuse, or ones you have permission to use, and credit the creator if you share anything onward.
`,
  faq: [
    {
      question: "Can I download a YouTube Short without the like and comment buttons on it?",
      answer:
        "Yes. Downloading the file gives you the video itself, so none of the app's buttons, captions or progress bar are in the picture. Those only appear when you screen-record.",
    },
    {
      question: "Why does my downloaded Short say 720p when it looked sharp in the app?",
      answer:
        "On a phone screen, 720 × 1280 looks very sharp. It's also possible YouTube only has the Short at that size because that's what the creator uploaded. Check the file's dimensions to see exactly what you have.",
    },
    {
      question: "Do Shorts links with ?si= in them work?",
      answer:
        "Yes. The ?si= part is a sharing parameter the YouTube app adds when you copy a link. It doesn't need to be removed.",
    },
    {
      question: "Can I download a Short as audio only?",
      answer:
        "Yes. After pasting the link, switch to the Audio tab and pick an MP3 option. Only bitrates the source audio can genuinely support are shown.",
    },
  ],
};
