import { TIKTOK_ENABLED } from "@/lib/features";

interface Feature {
  title: string;
  description: string;
  icon: "free" | "fast" | "quality" | "privacy" | "device" | "nofake";
}

const FEATURES: Feature[] = [
  {
    icon: "free",
    title: "Free, forever",
    description: "No paywall, no premium tier, no credit card. Download as much as you want.",
  },
  {
    icon: "fast",
    title: "Fast preparation",
    description: "Your download is prepared on a fast server and streamed straight to your device.",
  },
  {
    icon: "quality",
    title: "Real HD quality",
    description: TIKTOK_ENABLED
      ? "Up to 1080p HD for YouTube, best quality for TikTok and Facebook. We only offer qualities that actually exist for each video."
      : "Up to 1080p HD for YouTube and the best quality for Facebook. We only offer qualities that actually exist for each video.",
  },
  {
    icon: "privacy",
    title: "No sign-up",
    description: "We don\u2019t ask for an account, your email, or any personal details.",
  },
  {
    icon: "device",
    title: "Works everywhere",
    description: "Mobile, tablet and desktop. No app installation needed — it just works in your browser.",
  },
  {
    icon: "nofake",
    title: "No fake buttons",
    description: "Every button really works. No trap links disguised as downloads, ever.",
  },
];

function Icon({ icon }: { icon: Feature["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "free":
      return (
        <svg {...common}>
          <path d="M20 7L9 18l-5-5" />
          <path d="M14.5 6.5L20 12l-4 4" />
          <circle cx="6.5" cy="6.5" r="2.5" />
        </svg>
      );
    case "fast":
      return (
        <svg {...common}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "quality":
      return (
        <svg {...common}>
          <path d="M12 2l2.9 6.26L21.8 9l-5 4.84L18.24 21 12 17.27 5.76 21 7.2 13.84 2.2 9l6.9-.74L12 2z" />
        </svg>
      );
    case "privacy":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V6a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "device":
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "nofake":
      return (
        <svg {...common}>
          <path d="M12 3v11m0 0l-4-4m4 4l4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
  }
}

export default function WhyChooseUs() {
  return (
    <section className="border-y border-border bg-card" aria-labelledby="why">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h2 id="why" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why People Choose Us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            A downloader that respects you — and the reason most tools are slow is the reason we’re not.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="rounded-2xl border border-border bg-background p-5 transition-colors hover:border-violet-500/40 sm:p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
                <Icon icon={feature.icon} />
              </span>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}