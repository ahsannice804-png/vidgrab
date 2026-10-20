import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "download-facebook-videos-fb-watch",
  title: "How to Download Facebook Videos from fb.watch and Share Links",
  description:
    "Facebook hands out at least half a dozen kinds of video links. Which ones work, how to get a usable link from the app, and how to save the video as MP4 or MP3.",
  category: "facebook",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/facebook-video-downloader",
  related: ["download-facebook-reels", "facebook-video-private-login-explained", "copy-video-link-guide"],
  body: `
Facebook is the messiest of the big platforms when it comes to links. The same video can show up as a \`fb.watch\` short link, a \`facebook.com/share/v/\` link, a \`/watch/?v=\` link, a page's \`/videos/\` link or an old \`video.php\` address, depending on whether you copied it from the app, the website, Messenger or a friend's WhatsApp message.

The good news is that all of those lead to the same place. This guide explains what each link type is, how to get one that works, and what to do when the one you have doesn't.

## The link types you'll run into

| Link looks like | Where it comes from |
| --- | --- |
| \`fb.watch/AbCdEf123/\` | Older **Share > Copy link** in the app and website |
| \`facebook.com/share/v/AbC123/\` | Newer **Share > Copy link** for videos |
| \`facebook.com/share/r/AbC123/\` | Newer **Share > Copy link** for Reels |
| \`facebook.com/watch/?v=1234567890\` | Opening a video from the Video tab on desktop |
| \`facebook.com/PageName/videos/1234567890/\` | A video opened from a Page |
| \`facebook.com/reel/1234567890\` | A Reel opened on desktop |
| \`facebook.com/video.php?v=1234567890\` | Old-style links, still around in older posts |

The [Facebook video downloader](/facebook-video-downloader) accepts all of these, including the \`m.facebook.com\` mobile versions. Short links like \`fb.watch\` and \`/share/v/\` are redirects; the tool follows the redirect to the real video before fetching it, so you don't have to open them first.

## Getting a link from the Facebook app

1. Find the video in your feed, on a Page, or in the Video tab.
2. Tap **Share** under the video. (On Reels, the share arrow is on the right side.)
3. In the share sheet, tap **Copy link**. Depending on your app version you'll get an \`fb.watch\` or \`/share/v/\` link; either is fine.

If you only see options to share to your feed or in Messenger, swipe the row of options sideways or look for **More options**; **Copy link** is usually there.

## Getting a link on a computer

1. Click the video so it opens on its own, rather than playing in the feed.
2. Copy the address from the browser bar. It should contain \`/watch/\`, \`/videos/\` or \`/reel/\` followed by a long number.
3. Alternatively, click the three-dot menu on the post and choose **Copy link**.

> [!TIP]
> Don't copy the address while the video is playing inside your news feed. That gives you a link to the feed (\`facebook.com/\`) or a post, not the video. Open the video first, then copy.

## Downloading the video

1. Paste your link into the [Facebook video downloader](/facebook-video-downloader).
2. Wait for the preview with the title and length.
3. Choose a quality. Facebook usually stores a few versions, typically standard definition and HD, sometimes higher. The tool only lists the sizes that actually exist for that video, with real file sizes.
4. Or switch to the **Audio** tab to save just the sound as an MP3.
5. Save the file. On iPhone it lands in **Files > Downloads**; on Android in the **Download** folder.

## Links that look right but don't work

**Links to a post, not a video.** A link like \`facebook.com/permalink.php?story_fbid=...\` points at a post. If the post contains a video, open the video itself (click it so it plays full-size) and copy that link instead.

**Links to a group.** \`facebook.com/groups/...\` links point to a group, and videos in private groups can only be seen by members. More on that in [why some Facebook videos can't be downloaded](/blog/facebook-video-private-login-explained).

**Links pasted from Messenger or WhatsApp with extra text.** When people share links in chats, the message sometimes includes the post text or a preview. Make sure you copy only the address, starting with \`https://\`.

**Links with tracking parameters.** Bits like \`?mibextid=...\` or \`&rdid=...\` on the end are added by the app for analytics. They're harmless and you can leave them.

## What about quality?

Facebook's quality options depend on what the uploader sent and how Facebook processed it. A video shot on a recent phone and posted by a Page often has HD available. A video re-uploaded several times, or posted years ago, may only exist in standard definition. If you only see one option, that's all Facebook has.

Some rough guidance:

- **SD** is fine for a phone screen and keeps files small.
- **HD** is worth it for laptops, TVs or anything you'll edit.

There's a longer explanation in [360p vs 720p vs 1080p](/blog/video-quality-360p-720p-1080p).

## Reels are slightly different

Facebook Reels use their own link format (\`/reel/\` or \`/share/r/\`) and are vertical. They download the same way, but there are a few quirks worth knowing about, covered in [how to download Facebook Reels](/blog/download-facebook-reels).

## Your own Facebook videos

If you uploaded the video yourself, you don't need any of the above. Open the video on Facebook, tap or click the three-dot menu on the post, and choose **Download video**. You get the file straight from Facebook. To get everything at once, Facebook's **Download your information** tool in **Accounts Center** can export all the videos you've posted.

## Live videos

A live broadcast can't be downloaded while it's still running, because the file isn't finished yet. When the broadcast ends, Facebook turns it into a normal video on the Page or profile. Give it time to finish processing, especially if the stream was long, then copy the link from the replay and download it like any other video.

## Downloading on a computer vs a phone

Both work the same way. On a phone, the thing to watch is where you open the downloader: tapping a link inside the Facebook app opens Facebook's built-in browser, which often won't save files. Open Safari or Chrome yourself and paste the link there. On a computer, large HD videos are easier to manage, and the file appears in your **Downloads** folder straight away.

## If the preview shows the wrong video

Now and then the preview shows a different video from the one you meant. That usually happens when the link points at a post rather than a single video, for example a post containing several clips, or a shared post that wraps someone else's video. Go back to Facebook, tap the exact video so it opens full-screen on its own, and copy the link from there. The preview title and length are a quick way to confirm you've got the right one before downloading anything.

## Keep it fair

Facebook is full of videos people posted for friends and family. Download your own videos, videos a Page or creator has said can be shared, and anything you have permission to keep. Just because a video is public doesn't mean it's free to reuse.
`,
  faq: [
    {
      question: "Do fb.watch links work for downloading?",
      answer:
        "Yes. fb.watch links are short redirects to the real video. Paste them as they are and the tool follows the redirect before downloading.",
    },
    {
      question: "What is a facebook.com/share/v/ link?",
      answer:
        "It's the newer format Facebook uses when you tap Share and then Copy link on a video. It works the same way as fb.watch, as a redirect to the actual video.",
    },
    {
      question: "Why does my Facebook link say it's not a video?",
      answer:
        "You probably copied a link to a post, group or the news feed rather than the video. Open the video so it plays on its own, then copy that link.",
    },
    {
      question: "Can I download Facebook video audio only?",
      answer:
        "Yes. After pasting the link, switch to the Audio tab and pick an MP3 option.",
    },
  ],
};
