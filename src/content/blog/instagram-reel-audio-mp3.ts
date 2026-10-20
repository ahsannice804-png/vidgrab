import type { Article } from "@/lib/blog/types";

export const article: Article = {
  slug: "instagram-reel-audio-mp3",
  title: "How to Save Instagram Reel Audio as MP3",
  description:
    "Four honest ways to keep the sound from an Instagram Reel: Instagram's Save audio feature, finding the original track, and converting a downloaded Reel to MP3.",
  category: "instagram",
  published: "2026-10-20",
  updated: "2026-10-20",
  tool: "/instagram-reels-downloader",
  related: ["youtube-to-mp3-guide", "mp4-vs-mp3-vs-webm", "download-instagram-videos-mobile"],
  body: `
You hear a sound on a Reel and want to keep it. Maybe it's a song you can't identify, a voice-over you want to use in your own Reel, or a recording of yourself you posted months ago and no longer have. What you should do depends a lot on which of those it is, so this guide starts with the question rather than the tool.

Let's be upfront about one thing: our [Instagram Reel downloader](/instagram-reels-downloader) saves Reels as MP4 video. It doesn't offer a one-click MP3 for Instagram the way our YouTube and Facebook tools do. Below are the routes that actually work, including how to turn that MP4 into an MP3 in a couple of minutes.

## First, what do you need the audio for?

- **To use the sound in your own Reel:** use Instagram's **Save audio**. No file needed.
- **To listen to the song:** find the original track. It will sound far better than a Reel rip.
- **To keep a voice-over, speech or your own recording as a file:** download the Reel and convert it.
- **To edit the audio:** download the Reel and convert at a decent bitrate.

## Option 1: Instagram's "Save audio"

Every Reel shows its sound at the bottom of the screen, either a song title or "Original audio" with the creator's name.

1. Tap the audio name at the bottom of the Reel.
2. This opens the audio page, which lists other Reels using the same sound.
3. Tap **Save audio** (shown as a bookmark-style button on the audio page; the exact placement moves between app versions).
4. When you create a Reel later, open the music picker and look in **Saved**.

This doesn't give you a file. It's a bookmark that only works inside Instagram, which is exactly what you want if your goal is to make a Reel with that sound. Instagram also handles the music licensing for sounds used this way, which a downloaded MP3 doesn't.

## Option 2: find the original track

If the sound is a commercial song, the audio page usually names the track and artist. Many audio pages link out to streaming services. If it says "Original audio", the creator may have a link in their bio, or a quick search for the lyrics will often find it.

A song from Spotify, Apple Music or a purchase will sound much better than anything extracted from a Reel. Instagram's audio is compressed for phone speakers, and it often has the creator talking over it.

## Option 3: download the Reel and convert it to MP3

For voice-overs, speeches, recordings of your own and audio that only exists on Instagram, this is the way.

### Step 1: get the MP4

1. In Instagram, tap the **paper-plane share icon** on the Reel and then **Copy link**.
2. Paste the link into the [Instagram Reel downloader](/instagram-reels-downloader) and save the MP4.

If you need help on a phone, [downloading Instagram videos on iPhone and Android](/blog/download-instagram-videos-mobile) walks through each step.

### Step 2: convert it

Pick whichever matches your device.

**On iPhone: the Shortcuts app.** Apple's free Shortcuts app has an **Encode Media** action with an **Audio Only** switch.

1. Open **Shortcuts**, tap **+**, and add the **Encode Media** action.
2. Tap the arrow on the action and turn on **Audio Only**.
3. Add a **Save File** action after it.
4. Run the shortcut from the Share menu on your video.

The result is an M4A (AAC) file rather than an MP3. It plays everywhere an iPhone user is likely to need it, and it's generally a better-quality format at the same size.

**On Windows, Mac or Linux: VLC.** The free VLC player can convert files.

1. Open VLC and choose **Media > Convert / Save** (on Mac, **File > Convert / Stream**).
2. Add the downloaded MP4 and click **Convert / Save**.
3. Under **Profile**, pick **Audio - MP3**.
4. Choose where to save the file, give it a name ending in \`.mp3\`, and click **Start**.

**On any computer: FFmpeg.** If you're comfortable with a command line, one line does it:

\`ffmpeg -i reel.mp4 -vn -c:a libmp3lame -b:a 192k reel.mp3\`

The \`-vn\` drops the video, and \`-b:a 192k\` sets a 192 kbps bitrate.

**In Audacity.** Audacity can open MP4 files once its FFmpeg import library is installed. Open the Reel, trim the bit you need, and use **File > Export Audio** to save it as MP3. This is the best route if you want to cut out a specific part.

> [!TIP]
> Which bitrate? For speech, 128 kbps is plenty. For music, 192 kbps. Going higher than that rarely helps with Reel audio, because the source is already compressed. [Our YouTube MP3 guide](/blog/youtube-to-mp3-guide) explains why bigger numbers don't always mean better sound.

## Option 4: Android converter apps

Plenty of Android apps convert video to MP3. If you go this route, choose one with a good review history, and be wary of any converter that asks for access to your contacts, messages or accounts. A converter needs access to the video file and nothing else.

## A quick format note

MP3 is the most compatible format, but it isn't the only one. M4A from the iPhone shortcut plays in Apple Music, VLC, Windows Media Player and nearly every Android music app. If you're unsure which to use, [MP4 vs MP3 vs WebM](/blog/mp4-vs-mp3-vs-webm) breaks down where each format makes sense.

## Name and tag the file

Converted files tend to end up with names like \`reel_123456.mp3\`, which means nothing a week later. Rename it to something you'll recognise, including the creator's handle. If it's going into a music library, add tags too: on Windows, right-click the MP3, choose **Properties > Details** and fill in the title and artist; on a Mac, Apple Music's **Get Info** panel does the same job. Tags are what music apps display, so a tagged file is much easier to find later.

## Sounds have owners too

Music in Reels is licensed to Instagram for use inside Instagram, not for you to keep as a file. Original audio belongs to the person who recorded it. Extract audio from Reels you made, or ones where the creator has given permission, and use the original track through a proper service for everything else.
`,
  faq: [
    {
      question: "Can I download Instagram Reel audio as an MP3 directly on this site?",
      answer:
        "Not directly. The Instagram tool saves Reels as MP4. You can convert that MP4 to MP3 with VLC, Audacity or FFmpeg on a computer, or to M4A with the Shortcuts app on iPhone.",
    },
    {
      question: "Where does Instagram's Save audio put the sound?",
      answer:
        "It saves a bookmark inside Instagram, not a file. You'll find it in the music picker under Saved when you create a Reel.",
    },
    {
      question: "What bitrate should I use when converting a Reel to MP3?",
      answer:
        "128 kbps for speech and 192 kbps for music. Higher settings make bigger files without adding detail, because Instagram's audio is already compressed.",
    },
    {
      question: "Why does the converted audio sound worse than the song on Spotify?",
      answer:
        "Reel audio is compressed for phone speakers and often mixed with talking. The original track from a streaming service or a purchase will always sound better.",
    },
  ],
};
