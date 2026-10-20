import Link from "next/link";

/** `mp3` hides the MP3 badge on tools that don't offer audio-only output (Instagram). */
export default function TrustBadges({ mp3 = true }: { mp3?: boolean }) {
  const badges = [
    { label: "100% Free", icon: "check" },
    { label: "No account", icon: "check" },
    { label: "No watermark", icon: "check" },
    { label: "Up to 1080p", icon: "check" },
    ...(mp3 ? [{ label: "MP3 audio too", icon: "music" }] : []),
  ] as const;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label="Trust signals">
      {badges.map((badge) => (
        <li key={badge.label} className="flex items-center gap-1.5 text-xs font-medium text-muted">
          {badge.icon === "music" ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          {badge.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <Link href="/privacy-policy" className="underline-offset-2 hover:underline">
          Private by design
        </Link>
      </li>
    </ul>
  );
}