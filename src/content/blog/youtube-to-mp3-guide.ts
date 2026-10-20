import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "youtube-to-mp3-guide",
  title: "How to Convert a YouTube Video to MP3",
  description:
    "Turn a YouTube video into an MP3 file, choose between 128, 192 and 320 kbps without fooling yourself about quality, and fix the usual problems with audio downloads.",
  category: "youtube",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/youtube-video-downloader",
  related: ["mp4-vs-mp3-vs-webm", "instagram-reel-audio-mp3", "video-file-size-guide"],
  body: `
Most people who want an MP3 from YouTube are after something specific: a lecture to listen to on a walk, a podcast episode that's only published as video, a practice track for a band rehearsal, a recording of their own talk. The video part is dead weight in all of those cases. An hour of audio is a fraction of the size of an hour of video, and it plays in a car stereo, a cheap MP3 player or any music app.

## The short version

1. Copy the YouTube link (the **Share** button, then **Copy link**).
2. Paste it into the [YouTube video downloader](/youtube-video-downloader).
3. When the preview loads, switch from the **Video** tab to the **Audio** tab.
4. Pick an MP3 option: **Standard** (128 kbps), **High** (192 kbps) or **Best** (320 kbps), whichever are offered.
5. Wait for the conversion to finish, then save the file.

That's it. The rest of this article is about choosing the right option and understanding what's happening, because the bitrate menu is where most people make the wrong call.

## What actually happens during the conversion

YouTube doesn't store MP3s. Its audio is kept in a separate stream, usually in a format called Opus (inside a WebM file) or AAC (inside an M4A file). When you choose an MP3 option, our server fetches that audio stream, then re-encodes it to MP3 at the bitrate you picked using FFmpeg. The file you receive is a standard constant-bitrate MP3, which is why its size can be predicted exactly before you start: bitrate × length.

The important consequence is that **converting can't add quality that wasn't there**. YouTube's own audio for most videos sits somewhere around 128 to 160 kbps in Opus or AAC. Encoding that to a 320 kbps MP3 gives you a bigger file, not a better-sounding one.

## Which bitrate should you choose?

That's why the tool only offers higher tiers when the source audio carries close to that bitrate. If you see only **Standard**, it's because a higher number would be an empty promise for that particular video.

| Option | Bitrate | Size per hour | Good for |
| --- | --- | --- | --- |
| Standard | 128 kbps | about 58 MB | Speech, lectures, podcasts, audiobooks |
| High | 192 kbps | about 86 MB | Music on headphones or a car stereo |
| Best | 320 kbps | about 144 MB | Music where the source audio supports it |

The sizes come straight from the arithmetic: 128 kilobits per second × 3,600 seconds ÷ 8 bits per byte is 57.6 megabytes.

Some practical rules:

- **Talking, not music?** Take 128 kbps. Speech sounds identical at higher rates, and a three-hour lecture series stays a manageable size.
- **Music, and High is offered?** Take 192 kbps. On earbuds and in a car, it's very hard to tell from the original.
- **Best is offered and you're archiving music?** 320 kbps is the safe ceiling, at about two and a half times the size of Standard.

> [!NOTE]
> If you plan to edit the audio, for example cutting a clip in Audacity or GarageBand, start from the highest option offered. Every time an MP3 is edited and saved again it loses a little more detail.

## MP3 or keep it as MP4?

Sometimes you don't need to convert at all. A music video saved as MP4 already contains the audio, and phones play MP4 audio fine in the background in some apps. MP3 wins when:

- the device only understands MP3 (older car stereos, some USB players)
- you want the smallest possible file for long recordings
- you're adding it to a music library like Apple Music, Windows Media Player or a DJ app

If you want to understand the trade-offs between the containers in more depth, [MP4 vs MP3 vs WebM](/blog/mp4-vs-mp3-vs-webm) goes through each one.

## Common problems

### "No MP3 audio could be extracted from this video"

Very rarely a video has no separate audio track, or the audio stream is unavailable. Try the video option instead; the MP4 will still have sound.

### The conversion takes longer than a video download

It does. The tool has to fetch the audio and then encode it, and encoding a two-hour recording takes real processing time. You'll see the progress move through the stages. Leave the tab open until it finishes.

### The MP3 is quieter than the video on YouTube

YouTube normalises loudness during playback, turning loud videos down so everything sounds roughly even. The downloaded file has the original level. Most music apps have a "sound check" or volume-levelling setting that does the same job.

### Song titles and album art are missing

The file name comes from the video title, but MP3 tags like artist and album aren't filled in. Apps like Mp3tag (Windows) or the **Get Info** panel in Apple Music let you add them yourself.

## Where the file ends up

Same place as any other download: **Files > Downloads** on iPhone, the **Download** folder on Android, and your user **Downloads** folder on Windows and Mac. On iPhone, an MP3 won't go into the Photos app; open it from Files, or import it into a music or podcast app that accepts files. [Finding downloaded videos](/blog/find-downloaded-videos) has the exact paths.

## Keeping just the part you need

Often you don't want the whole thing: one answer from a two-hour interview, a single song from a live set, the first ten minutes of a lecture. You have two good options.

**Trim after downloading.** On a computer, the free editor Audacity opens MP3 files directly. Select the part you want, then use **File > Export Audio** and choose to export only the selection. On iPhone, GarageBand can import an MP3 from Files, and you can trim the region and share it back out. On Android, many file managers and music editors offer a simple trim.

**Check for chapters first.** Long YouTube videos often have chapters, shown as segments on the progress bar and listed in the description with timestamps. Write down the start and end times of the part you want before you download, so finding it in an editor takes seconds instead of a lot of scrubbing.

One thing to avoid: trimming and re-saving the same MP3 over and over. Each save re-compresses it a little. Do your trims from the original download, not from a copy you've already trimmed.

## Music and rights

Ripping audio is where copyright questions come up most often, because so much of what's on YouTube is commercial music. Convert recordings you own, ones the creator has released for free download, or public-domain and Creative Commons material that allows it. For commercial songs, a streaming service or a purchase is the honest route, and it pays the artist.
`,
  faq: [
    {
      question: "Is a 320 kbps MP3 from YouTube better than 128 kbps?",
      answer:
        "Only if the source audio has that much detail to begin with. YouTube audio for most videos is around 128 to 160 kbps, so converting to 320 kbps mostly makes a bigger file. That's why higher options only appear when the source supports them.",
    },
    {
      question: "How big is an MP3 of a one-hour YouTube video?",
      answer:
        "About 58 MB at 128 kbps, 86 MB at 192 kbps and 144 MB at 320 kbps. The size is bitrate multiplied by length, so it can be predicted exactly.",
    },
    {
      question: "Why does the audio conversion take longer than downloading the video?",
      answer:
        "The server has to fetch the audio stream and then re-encode it to MP3. Encoding takes processing time, especially for recordings that are an hour or longer.",
    },
    {
      question: "Can I convert a whole playlist to MP3 at once?",
      answer:
        "No. The tool works one video at a time. Paste each video's link separately and convert them one after another.",
    },
  ],
};
