import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "download-instagram-videos-mobile",
  title: "How to Download Instagram Videos on iPhone and Android",
  description:
    "Save Instagram Reels and video posts to an iPhone or Android phone step by step, avoid the in-app browser trap, and get the videos into your gallery.",
  category: "instagram",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/instagram-reels-downloader",
  related: ["save-instagram-reels-without-watermark", "find-downloaded-videos", "copy-video-link-guide"],
  body: `
Almost everyone who downloads Instagram videos does it on a phone, which makes sense: that's where Instagram lives. It's also where things go sideways, because phones hide files away, Instagram's built-in browser blocks downloads, and iPhone and Android handle saved videos in completely different ways.

This guide is split by phone. Both sections start from the same place: you're looking at a Reel or video post you want to keep.

## Before you start: which videos work

- **Reels** from public accounts: yes.
- **Video posts** (the ones that appear in the grid) from public accounts: yes.
- **Stories and Highlights:** not supported.
- **Anything from a private account:** no. Those videos aren't publicly available.
- **Live videos while they're live:** no.

Carousel posts that mix several photos and videos can be hit-and-miss, since the tool is built around a single video per link. If one doesn't come through, the Reel-style posts are the reliable ones.

## On iPhone

### Step 1: copy the link

1. Open the Reel or post in the Instagram app.
2. Tap the **paper-plane share icon** under the video (on Reels it's on the right side).
3. In the share sheet, tap **Copy link**. You'll see a brief "Link copied" message.

### Step 2: open the downloader in Safari, not inside Instagram

This is where most iPhone attempts fail. If you tap a link *inside* Instagram, say in someone's bio or a DM, it opens in Instagram's own built-in browser. That browser often won't save files. Instead:

1. Leave Instagram and open **Safari** from your home screen.
2. Go to the [Instagram Reel downloader](/instagram-reels-downloader).
3. Tap the input box, tap **Paste**, and wait a few seconds for the preview.

### Step 3: download and move to Photos

1. Tap the download option.
2. Safari asks whether you want to download the file. Tap **Download**.
3. When the blue arrow in the address bar finishes, tap it and then tap the file.
4. With the video open, tap the **Share** icon and choose **Save Video**.

Now it's in Photos. Until you do step 4, it only lives in **Files > Downloads**, which is why people often think the download failed.

> [!TIP]
> Chrome on iPhone works too, but downloads land in a Chrome folder inside the Files app (**Files > On My iPhone > Chrome**). Safari is simpler.

## On Android

### Step 1: copy the link

1. Open the Reel or post in Instagram.
2. Tap the **paper-plane share icon**.
3. Tap **Copy link**.

### Step 2: open the downloader in Chrome

Same rule as iPhone: avoid Instagram's built-in browser. Open **Chrome**, Samsung Internet or Firefox yourself, then:

1. Go to the [Instagram Reel downloader](/instagram-reels-downloader).
2. Long-press the input box and tap **Paste**.
3. Wait for the preview, then tap the download option.

### Step 3: find it in your gallery

Chrome shows a notification when the download finishes. The MP4 is saved in the **Download** folder on your phone's internal storage. Google Photos and Samsung Gallery usually show videos from that folder automatically, sometimes after a short delay. If you don't see it:

- Open **Files by Google** (or **My Files** on Samsung) and tap **Downloads**.
- In Google Photos, tap **Library**, then look for the **Download** folder under "Photos on device". You may need to turn on backup or visibility for that folder.

[Finding downloaded videos](/blog/find-downloaded-videos) goes through every device in detail if the file seems to have vanished.

## Errors you might see and what they mean

**"That doesn't look like a valid link."** You probably copied a profile link (\`instagram.com/username\`) or a link with extra text attached. Copy the link again from the share sheet of the specific Reel.

**"This video requires login access."** The account is private, or the owner has restricted the post. There's nothing a downloader can do about that, and that's by design.

**"This link belongs to a different platform."** You pasted a YouTube or Facebook link into the Instagram page. Use the [home page downloader](/), which detects the platform automatically.

**The download button does nothing.** You're almost certainly inside Instagram's in-app browser. Open Safari or Chrome directly and try again.

## Saving data on mobile

Reels are short, so the files are small. A typical 30-second Reel is a few megabytes. Even so, if you're saving a lot of them on mobile data:

- The preview shows the file size before you download.
- Downloads are prepared on our server, so your phone only downloads the finished file once.
- Long video posts, like full IGTV-era uploads, can be much bigger. Check the size first.

## Want only the audio?

Instagram is a common place to discover music and voice-overs. Our tool saves Instagram videos as MP4; if you want the sound on its own, [saving Instagram Reel audio as MP3](/blog/instagram-reel-audio-mp3) explains the options, including Instagram's own **Save audio** feature and converting the MP4 on your phone or computer.

And if you specifically care about keeping the video clean of Instagram's bouncing logo, [saving Reels without a watermark](/blog/save-instagram-reels-without-watermark) explains where that watermark comes from.

## Saving several Reels in a row

If you're collecting a batch, say all the recipes from one creator or every clip from an event, a bit of rhythm makes it painless:

1. Keep Instagram and your browser both open, and move between them with the app switcher instead of closing either.
2. Copy a Reel's link, switch to the browser, paste, download, and switch back.
3. Clear the downloader's input box by selecting the old link and pasting over it, so you don't need to reload the page between Reels.

On iPhone, each video still needs the **Save Video** step to reach Photos. You can do them all at the end: open **Files > Downloads**, tap the three-dot menu and choose **Select**, pick the videos, tap the **Share** icon and then **Save Videos**.

## On an iPad

iPads work like iPhones, with one difference: Safari on iPad shows the desktop version of websites by default. Everything works the same way. If Instagram's share sheet looks different, look for **Copy link** among the icons along the bottom.

## Before you save

Keep videos you made, videos the creator has said you can download, and content you have permission to use. If you share a saved Reel anywhere, credit the original account.
`,
  faq: [
    {
      question: "Why won't Instagram videos download on my iPhone?",
      answer:
        "Usually because the downloader was opened inside Instagram's in-app browser, which blocks file downloads. Copy the Reel link, then open Safari yourself and paste it there.",
    },
    {
      question: "Where do downloaded Instagram videos go on Android?",
      answer:
        "Into the Download folder on internal storage. Open Files by Google or My Files and tap Downloads, or look for the Download folder in your gallery app.",
    },
    {
      question: "Can I download Instagram Stories?",
      answer:
        "No. The tool supports Reels and video posts from public accounts. Stories and Highlights aren't supported.",
    },
    {
      question: "Do I need to log in to Instagram to download a Reel?",
      answer:
        "No. Public Reels download without any login. A site that asks for your Instagram password is a red flag.",
    },
  ],
};
