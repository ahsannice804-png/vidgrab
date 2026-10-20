import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "find-downloaded-videos",
  title: "How to Find Downloaded Videos on iPhone, Android and Windows",
  description:
    "The download finished but the video isn't in your gallery. Where Safari, Chrome and Edge actually save files on iPhone, Android, Windows and Mac, and how to move them.",
  category: "guides",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/",
  related: ["download-youtube-videos-iphone-android-pc", "download-instagram-videos-mobile", "video-file-size-guide"],
  body: `
"It said the download finished, but there's nothing in my photos." We hear some version of this every week. In almost every case the file is sitting exactly where the browser put it; it just isn't where you expected. Phones in particular keep browser downloads separate from the camera roll.

Find your device below.

## iPhone and iPad

### Where Safari puts downloads

Safari saves files to the **Files** app, not to Photos.

1. Open the **Files** app (the blue folder icon).
2. Tap **Browse** at the bottom.
3. Open **iCloud Drive > Downloads** or **On My iPhone > Downloads**. Which one depends on your settings.

The quicker route: while still in Safari, tap the **download arrow** in the address bar right after the download finishes. It lists recent downloads; tap one to open it, or tap the magnifying glass next to it to jump to it in Files.

To check or change where downloads go, open **Settings > Apps > Safari > Downloads** (on iOS 17 and earlier, it's **Settings > Safari > Downloads**).

> [!TIP]
> If downloads go to iCloud Drive and your iCloud storage is full, they can fail or stay as cloud placeholders. Switching the location to **On My iPhone** avoids that.

### Moving a video into Photos

1. Open the video in Files.
2. Tap the **Share** icon (the square with an arrow).
3. Tap **Save Video**.

It now appears in Photos under **Recents**, by the date you saved it, not the date it was filmed. If you scroll to the date the video was originally made, you won't find it there.

### Chrome or Firefox on iPhone

These browsers keep their own folder: **Files > On My iPhone > Chrome** (or **Firefox**). In Chrome you can also tap the three-dot menu, then **Downloads**.

### MP3 files on iPhone

Audio files can't go into Photos. Open them from Files, or share them into an app that accepts audio files, like VLC for Mobile or a podcast app that supports imports.

## Android

### The Download folder

Almost every Android browser saves to the **Download** folder on internal storage. To get there:

- **Files by Google:** open it and tap **Downloads** on the Browse screen.
- **Samsung My Files:** open it and tap **Downloads** under Categories, or **Internal storage > Download**.
- **Chrome:** tap the three-dot menu, then **Downloads**. Tap a file to open it, or long-press for options.

### Why it might not show in your gallery

Google Photos and Samsung Gallery scan the Download folder, but not always immediately, and Google Photos lists it separately:

- In **Google Photos**, tap **Library** (or **Collections** in newer versions). Under **Photos on device** or **On this device**, look for a **Download** folder.
- In **Samsung Gallery**, tap **Albums**; there's usually a **Download** album.

If it's still missing, restarting the gallery app, or the phone, usually makes it rescan.

### Downloads on an SD card

If you've set your browser to save to an SD card, the path will be something like **SD card > Download**. File apps show the card as a separate location.

## Windows

### The usual place

Every browser on Windows defaults to your **Downloads** folder:

1. Open **File Explorer** (the folder icon on the taskbar, or **Windows key + E**).
2. Click **Downloads** in the left sidebar.
3. Sort by **Date modified** (click the column heading) so the newest file is at the top.

### From the browser

- **Chrome and Edge:** press **Ctrl+J** for the downloads list, then click **Show in folder**.
- **Firefox:** press **Ctrl+Shift+Y**, or click the download arrow in the toolbar, then the folder icon next to the file.

### If it's not in Downloads

Your browser may be set to save somewhere else, or to ask each time. Check:

- **Chrome:** **Settings > Downloads > Location**
- **Edge:** **Settings > Downloads > Location**
- **Firefox:** **Settings > General > Files and Applications > Downloads**

Still can't find it? Type part of the video's name into the search box on the taskbar. Downloaded files are named after the video title, so search for a distinctive word from it.

## Mac

Downloads go to the **Downloads** folder in your home folder. Find it in the **Finder** sidebar, or click the Downloads stack on the right side of the Dock. In Safari, click the downloads arrow in the toolbar and then the magnifying glass next to a file.

## When the file isn't anywhere

If you've checked all of the above and the file truly isn't there, the download probably didn't complete. Common reasons:

- **You left the page before the file was handed to the browser.** The progress card has to finish preparing first.
- **Your storage was full.** The browser may stop silently. [How much storage a video takes](/blog/video-file-size-guide) helps you plan.
- **The prepared file expired.** Our server keeps finished files only briefly, roughly half an hour, then deletes them. Paste the link into the [video downloader](/) again and start over.
- **You were inside an app's built-in browser**, like Instagram's or Facebook's, which often blocks downloads. Open Safari or Chrome directly and try again.

For complete step-by-step downloading on each device, see [downloading YouTube videos on iPhone, Android and PC](/blog/download-youtube-videos-iphone-android-pc) or [downloading Instagram videos on mobile](/blog/download-instagram-videos-mobile).

## Chromebook

On a Chromebook, open the **Files** app from the launcher and click **Downloads** in the left sidebar. Chrome's downloads list (**Ctrl+J**) also has a **Show in folder** link. If your Chromebook is set to save to Google Drive, look under **Google Drive > My Drive** in the same Files app.

## Renaming so you can find things later

Files are named after the video title, which can be long, full of emoji, or identical to another download. When you save something you'll want again, rename it straight away to something you'd search for, like \`2026 school concert - year 4.mp4\`. Putting the year or a date at the start also keeps folders in a sensible order.

## If you found it but it won't play

Occasionally a downloaded video is right where it should be but won't open, or plays sound with a black screen. That's usually the device's built-in player not supporting the video codec inside the file. The free VLC player, available for iPhone, Android, Windows and Mac, plays almost anything. If you need the video in your phone's gallery app, try downloading it again at a lower quality, which is more often encoded in the widely supported H.264 format.

## Keeping things tidy

Downloads folders fill up fast. Once you've moved a video into your gallery or into a proper folder, delete the copy in Downloads. And as always, keep only the videos you have a right to save.
`,
  faq: [
    {
      question: "Where do downloaded videos go on iPhone?",
      answer:
        "Safari saves them to the Files app, in Downloads under iCloud Drive or On My iPhone. To add one to Photos, open it in Files, tap Share and choose Save Video.",
    },
    {
      question: "Why isn't my downloaded video in Google Photos?",
      answer:
        "Google Photos shows the Download folder separately under Library, in the On this device section. It can also take a minute to appear.",
    },
    {
      question: "How do I open the downloads list in Chrome?",
      answer:
        "Press Ctrl+J on Windows. On Android or iPhone, tap the three-dot menu and choose Downloads.",
    },
    {
      question: "My download finished but the file is missing. What happened?",
      answer:
        "Most often it's in a different folder than expected. If it truly isn't anywhere, the download didn't complete, usually because of full storage, leaving the page early, or an in-app browser blocking it.",
    },
  ],
};
