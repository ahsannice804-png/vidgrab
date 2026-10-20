import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "copy-video-link-guide",
  title: "How to Copy a Video Link from YouTube, Instagram and Facebook",
  description:
    "Exactly where the Copy link button is in the YouTube, Instagram and Facebook apps and websites, what a good video link looks like, and the links that won't work.",
  category: "guides",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/",
  related: ["download-youtube-videos-iphone-android-pc", "download-facebook-videos-fb-watch", "why-video-downloads-fail"],
  body: `
It sounds too basic to need a guide. But "invalid link" is the most common error on any download site, and nearly every time, the cause is the link: a profile instead of a video, a post instead of the clip inside it, or a chunk of message text pasted along with the address.

Each app hides its **Copy link** option in a slightly different place, and the website versions differ again from the apps. Here's where to find it on each one, and how to check you've got the right thing before you paste.

## What a good video link looks like

A link that will work points at **one specific video** and starts with \`https://\`. Some examples:

| Platform | Good link (one video) | Not a video link |
| --- | --- | --- |
| YouTube | \`youtube.com/watch?v=aBcDeFgHiJk\` | \`youtube.com/@channelname\` |
| YouTube | \`youtu.be/aBcDeFgHiJk\` | \`youtube.com/playlist?list=...\` |
| YouTube | \`youtube.com/shorts/abc123XYZ_0\` | \`youtube.com/feed/subscriptions\` |
| Instagram | \`instagram.com/reel/C1a2B3c4D5e/\` | \`instagram.com/username/\` |
| Instagram | \`instagram.com/p/C1a2B3c4D5e/\` | \`instagram.com/stories/username/\` |
| Facebook | \`fb.watch/aBcD123/\` | \`facebook.com/groups/...\` |
| Facebook | \`facebook.com/share/v/AbC123/\` | \`facebook.com/PageName\` |
| Facebook | \`facebook.com/reel/1234567890\` | \`facebook.com/\` (the feed) |

Extra bits on the end, like \`?si=...\` from YouTube or \`?igsh=...\` from Instagram, are tracking codes. They don't need removing.

## YouTube

### In the app (iPhone and Android)

1. Open the video.
2. Tap **Share** in the row of buttons under the player. (On a Short, the **Share** arrow is on the right side.)
3. Tap **Copy link**.

### In a browser

- Click the video so it's playing, then copy the address from the address bar. Or:
- Click **Share** under the video, then **Copy**. Or:
- Right-click the video player itself and choose **Copy video URL**.

> [!TIP]
> If you click **Share** while the video is paused partway through, YouTube offers a **Start at** box. Leave it unticked; a timestamp is harmless but unnecessary.

## Instagram

### In the app

1. Open the Reel or video post.
2. Tap the **paper-plane share icon**. On Reels it's on the right side; on feed posts it's under the photo or video.
3. Tap **Copy link** in the row of options at the bottom of the share sheet.

### In a browser

1. Click the post so it opens on its own.
2. Click the three-dot **...** menu in the top-right of the post.
3. Click **Copy link**. Or copy the address bar, which should contain \`/reel/\` or \`/p/\`.

Stories and Highlights have their own links, but they're not supported by our tool. For Reels, the [Instagram Reel downloader](/instagram-reels-downloader) is the right page.

## Facebook

### In the app

1. Find the video and tap **Share** under it. (On Reels, the share arrow is on the right side.)
2. Tap **Copy link**. If you only see sharing destinations, scroll the row of options sideways; **Copy link** is among them.

You'll get either an \`fb.watch\` link or a \`facebook.com/share/v/\` (or \`/share/r/\` for Reels) link. Both work.

### In a browser

1. Click the video so it opens in the video viewer, not playing inside the feed.
2. Copy the address. It should contain \`/watch\`, \`/videos/\` or \`/reel/\`.
3. Or click the three-dot menu on the post and choose **Copy link**.

[Downloading Facebook videos from fb.watch and share links](/blog/download-facebook-videos-fb-watch) explains every Facebook link format in detail.

## Pasting the link

On a **phone**, tap and hold inside the input box until **Paste** appears, then tap it. On iPhone, you may see a prompt asking whether the browser can paste from another app; tap **Allow Paste**.

On a **computer**, click the box and press **Ctrl+V** on Windows or **Cmd+V** on a Mac.

## Links shared in chats and emails

Links that come to you in WhatsApp, Messenger, Telegram or email often arrive wrapped in other text: the caption, the sender's message, a preview title. If you copy the whole message, the downloader sees text it can't use.

Instead:

- **On a phone:** tap the link itself to open it in the app it belongs to, then use that app's **Share > Copy link**. Or long-press just the link and choose **Copy link** (not **Copy**, which may copy the whole message).
- **On a computer:** right-click the link and choose **Copy link address**.

## Quick check before you paste

Look at what you copied. If it:

- starts with \`https://\`
- names the right platform
- has a video ID in it, like \`watch?v=\`, \`/shorts/\`, \`/reel/\`, \`/p/\`, \`fb.watch\` or \`/share/v/\`

then it's a good link. Paste it into the [video downloader](/) and you'll see a preview within a few seconds. If you still get an error, [why video downloads fail](/blog/why-video-downloads-fail) explains each message. For a complete walkthrough on your device, see [downloading YouTube videos on iPhone, Android and PC](/blog/download-youtube-videos-iphone-android-pc).

## Videos embedded on other websites

News sites, blogs and school pages often embed YouTube or Facebook videos in their articles. The page's address won't work in a downloader, because it points to the article, not the video. To get the video's own link:

- **YouTube embeds:** right-click the video and choose **Copy video URL**. Or click the YouTube logo in the corner of the player, which opens the video on youtube.com, and copy the address from there.
- **Facebook embeds:** click the post's timestamp or the Facebook logo to open the original post, then open the video and copy its link.
- **Instagram embeds:** click **View on Instagram** or the post itself, then copy the link from the address bar.

## Videos from Google search results

When a video appears in Google search results, the result usually links to the platform. On a computer, right-click the result's title and choose **Copy link address**. On a phone, long-press it and choose **Copy link address**. Check that what you copied starts with the platform's address and not \`google.com/url?\`. If it starts with Google, open the result first and copy the address from there.

## If there's no Share button

Sometimes the **Share** or **Copy link** option simply isn't there. On Facebook and Instagram, that usually means the post's audience is limited, for example to friends or close friends, and the platform doesn't let it be shared outside that circle. A video like that generally can't be downloaded either, because it isn't public. [Why some Facebook videos can't be downloaded](/blog/facebook-video-private-login-explained) explains the audience settings behind this.

## And once you have the link

A link makes a video easy to fetch; it doesn't make it yours. Download what you made, what you've been given permission to keep, or what the creator has shared openly.
`,
  faq: [
    {
      question: "Why does the downloader say my link is invalid?",
      answer:
        "Usually because the link points to a profile, channel, playlist, group or the feed rather than one video, or because extra message text was copied with it. Copy the link from the video's Share button.",
    },
    {
      question: "Do I need to remove ?si= or ?igsh= from the end of a link?",
      answer:
        "No. Those are sharing and tracking parameters added by the apps. The link works with or without them.",
    },
    {
      question: "How do I copy a link from a WhatsApp message without the extra text?",
      answer:
        "Long-press the link itself and choose Copy link, or tap it to open the video in its app and use Share > Copy link from there.",
    },
    {
      question: "Can I paste a YouTube channel or playlist link?",
      answer:
        "No. The tool needs a link to a single video. Open the video you want and copy its link.",
    },
  ],
};
