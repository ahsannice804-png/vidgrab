import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "video-file-size-guide",
  title: "How Much Storage Does a Downloaded Video Take? File Size by Quality and Length",
  description:
    "Estimate the size of a downloaded video before you hit the button: the simple bitrate formula, typical ranges for 360p to 1080p and MP3, and why sizes vary so much.",
  category: "formats",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/",
  related: ["video-quality-360p-720p-1080p", "download-long-youtube-videos", "mp4-vs-mp3-vs-webm"],
  body: `
"Storage almost full" is the message that ends more downloads than any error. It shows up halfway through a long video, or after you've saved forty Reels and wonder where 3 GB went. A little arithmetic before you download avoids most of that, and the arithmetic is simpler than it looks.

## The one formula you need

Every video and audio stream has a **bitrate**, the amount of data per second, usually measured in megabits per second (Mbps) for video and kilobits per second (kbps) for audio.

**File size = bitrate × length ÷ 8**

The "÷ 8" converts bits to bytes. A few handy conversions:

- 1 Mbps for one minute = **7.5 MB**
- 1 Mbps for one hour = **450 MB**
- 128 kbps for one hour = **about 58 MB**

So a video streaming at 2 Mbps for 30 minutes is about 2 × 7.5 × 30 = 450 MB. Add a little for the audio track and you have your estimate.

## Typical sizes by quality

Platforms set bitrates differently, and a single platform varies it from video to video depending on the content. These ranges are rough, worked out from bitrates commonly used for web video, and they're useful for planning, not for exact predictions.

| Quality | Typical video bitrate | Per minute | Per hour |
| --- | --- | --- | --- |
| 360p | 0.4 – 1 Mbps | 3 – 7.5 MB | 180 – 450 MB |
| 480p | 0.8 – 1.5 Mbps | 6 – 11 MB | 360 – 675 MB |
| 720p | 1.2 – 3 Mbps | 9 – 22 MB | 0.55 – 1.35 GB |
| 1080p | 2 – 5 Mbps | 15 – 37 MB | 0.9 – 2.25 GB |
| MP3 128 kbps | n/a | about 1 MB | about 58 MB |
| MP3 192 kbps | n/a | about 1.4 MB | about 86 MB |
| MP3 320 kbps | n/a | about 2.4 MB | about 144 MB |

The audio inside an MP4 typically adds about 1 MB per minute on top of the video figures.

> [!TIP]
> You don't have to guess on our site. When you paste a link into the [video downloader](/), every quality option shows its real size, taken from the platform's own data where it's available. Use the table above for planning; trust the number on the button for the actual download.

## Why two videos the same length can differ by 5×

Modern video compression doesn't store every frame in full. It stores what *changes* between frames. That makes the content itself the biggest factor in size.

**Cheap to store:**
- a person talking in front of a plain wall
- a slideshow or a screen recording of a document
- animation with flat colours
- a static image with a podcast playing over it

**Expensive to store:**
- sport, dancing, anything with lots of motion
- water, rain, snow, confetti, leaves in wind
- handheld footage that shakes
- film grain or noisy low-light video

A ten-minute podcast with a static image at 1080p can be smaller than a ten-minute football highlight at 720p.

The codec matters too. Newer codecs like VP9 and AV1 need noticeably less data than the older H.264 for similar quality. Which one you end up with depends on what the platform serves.

## Some real-world planning

**A two-hour lecture for your phone.** At 360p, roughly 0.4 to 0.9 GB. At 1080p, perhaps 2 to 4.5 GB, mostly wasted on a lecture hall. If you only need to listen, an MP3 at 128 kbps is about 115 MB. [Downloading long YouTube videos](/blog/download-long-youtube-videos) has more on handling recordings this size.

**Fifty Instagram Reels.** Reels are short, typically 15 to 90 seconds, and Instagram compresses them heavily. Each one is usually a handful of megabytes; fifty might be a few hundred megabytes in total.

**A one-hour concert to watch on the TV.** 1080p, and plan for one to two and a half gigabytes. Worth it for this one.

**A music video you only want to hear.** A four-minute song as a 192 kbps MP3 is about 5.8 MB, compared with perhaps 60 to 150 MB for the 1080p video.

## Checking how much space you have

- **iPhone:** **Settings > General > iPhone Storage**. The bar at the top shows what's used and free.
- **Android:** **Settings > Storage** (on Samsung, **Settings > Battery and device care > Storage**).
- **Windows:** open **File Explorer**, then **This PC**. Each drive shows a bar with free space.
- **Mac:** **Apple menu > System Settings > General > Storage**.

Leave some headroom. Phones slow down and apps misbehave when storage is nearly full, and many downloads need temporary space while they're being written.

## Getting space back

Downloads pile up quietly. Every so often:

- Delete videos you've already watched from your **Downloads** folder. On iPhone, they're in **Files > Downloads**, which isn't cleared when you delete the copy in Photos.
- If you saved a video into your gallery, the original download is a duplicate; delete one of them.
- Move archives to a computer or an external drive.

Not sure where your downloads ended up? [Finding downloaded videos](/blog/find-downloaded-videos) lists the folders on each device.

## How far a mobile data plan goes

If you're downloading on mobile data, the same arithmetic tells you how much of your allowance a download will eat. With a 5 GB monthly plan:

- One hour of 1080p video can use somewhere between a fifth and nearly half of it.
- The same hour at 480p uses roughly a tenth.
- Ten hours of podcasts as 128 kbps MP3s use about 0.6 GB.

Streaming a video and downloading it use about the same data at the same quality, so the real saving comes from downloading once on Wi-Fi and watching offline later. If you'll watch something more than once, or on a flight, download it at home.

## Why the final file can differ slightly from the estimate

Even the size shown on the download button can be a little off from the file you end up with. When a platform reports an exact size for each stream, the estimate is very close. When it doesn't, the size has to be calculated from the average bitrate, and a video with a quiet first half and a busy second half won't match that average perfectly. Merging picture and sound into one MP4 also adds a small amount of overhead. Differences of a few percent are normal and nothing to worry about.

## Choosing quality with size in mind

When storage is tight, the best saving is to download at the quality you'll actually notice, not the highest available. [360p vs 720p vs 1080p](/blog/video-quality-360p-720p-1080p) helps you decide, and [MP4 vs MP3 vs WebM](/blog/mp4-vs-mp3-vs-webm) covers when audio alone is enough.

Whatever you download, keep it to content you own or have permission to save.
`,
  faq: [
    {
      question: "How big is a 1-hour 1080p video?",
      answer:
        "Usually somewhere between about 0.9 and 2.25 GB, depending on the platform and how much motion the video has. The downloader shows the real size before you start.",
    },
    {
      question: "How do I calculate video file size?",
      answer:
        "Multiply the bitrate by the length in seconds and divide by 8. One megabit per second works out to about 7.5 MB per minute or 450 MB per hour.",
    },
    {
      question: "Why is a short video sometimes bigger than a long one?",
      answer:
        "Content matters more than length. Fast motion, water, crowds and shaky footage need far more data than a person talking in front of a plain background.",
    },
    {
      question: "How much space does an MP3 take?",
      answer:
        "About 1 MB per minute at 128 kbps, 1.4 MB at 192 kbps and 2.4 MB at 320 kbps.",
    },
  ],
};
