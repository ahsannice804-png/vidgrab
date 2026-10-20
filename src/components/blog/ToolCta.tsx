import Link from "next/link";
import { TOOL_LABEL } from "@/lib/blog";
import type { ToolPath } from "@/lib/blog/types";

const BLURB: Record<ToolPath, string> = {
  "/": "Paste a YouTube, Instagram or Facebook link and pick a quality. No sign-up, no app.",
  "/youtube-video-downloader":
    "Paste a YouTube or Shorts link, choose 360p to 1080p or MP3, and save the file. No sign-up.",
  "/instagram-reels-downloader":
    "Paste a public Reel or post link and save the original MP4. No login, no watermark.",
  "/facebook-video-downloader":
    "Paste a public Facebook video, reel or fb.watch link and save it as MP4 or MP3.",
};

export default function ToolCta({ tool }: { tool: ToolPath }) {
  return (
    <aside
      className="relative mt-12 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-card to-indigo-500/5 p-6 sm:p-8"
      aria-label="Try the tool"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
        Try the tool
      </p>
      <p className="mt-2 text-xl font-bold tracking-tight text-foreground">{TOOL_LABEL[tool]}</p>
      <p className="mt-2 max-w-lg text-[15px] leading-7 text-muted">{BLURB[tool]}</p>
      <Link
        href={tool}
        className="btn-glow mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:brightness-110"
      >
        Open the {tool === "/" ? "downloader" : TOOL_LABEL[tool].replace(/ (Video|Reel) Downloader$/, " downloader")}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </aside>
  );
}
