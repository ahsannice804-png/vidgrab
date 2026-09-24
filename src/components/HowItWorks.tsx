import { TIKTOK_ENABLED } from "@/lib/features";

interface Step {
  title: string;
  description: string;
  icon: "paste" | "select" | "download";
}

const STEPS: Step[] = [
  {
    icon: "paste",
    title: "Paste your link",
    description: TIKTOK_ENABLED
      ? "Copy a YouTube, Instagram, TikTok or Facebook video link and paste it in the box above."
      : "Copy a YouTube, Instagram or Facebook video link and paste it in the box above.",
  },
  {
    icon: "select",
    title: "Pick a quality",
    description:
      "We fetch the video instantly and show real sizes — choose the quality you want.",
  },
  {
    icon: "download",
    title: "Download the file",
    description: "Your video is prepared as an MP4 — no sign-up, no watermarks.",
  },
];

function Icon({ icon }: { icon: Step["icon"] }) {
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
  if (icon === "paste") {
    return (
      <svg {...common}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      </svg>
    );
  }
  if (icon === "select") {
    return (
      <svg {...common}>
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="how-it-works">
      <div className="text-center">
        <h2 id="how-it-works" className="text-2xl font-bold tracking-tight sm:text-3xl">
          How It Works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Three steps to your file.
        </p>
      </div>
      <ol className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative">
            <span
              className="absolute -top-1 right-0 hidden text-6xl font-black text-zinc-100 dark:text-zinc-800 sm:block"
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
              <Icon icon={step.icon} />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}