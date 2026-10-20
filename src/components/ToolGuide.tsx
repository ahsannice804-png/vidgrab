import type { ReactNode } from "react";

/**
 * Long-form help content shown under a tool (how it works, supported links,
 * quality advice, troubleshooting). Plain JSX children styled as prose so the
 * copy stays readable in both themes.
 */
export default function ToolGuide({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  return (
    <section
      className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16"
      aria-labelledby={labelledBy}
    >
      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-bold prose-h3:mt-8 prose-h3:text-lg prose-h3:font-semibold prose-p:leading-7 prose-p:text-muted prose-a:font-medium prose-a:text-violet-600 prose-a:underline-offset-2 dark:prose-a:text-violet-400 prose-strong:text-foreground prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-zinc-800 prose-li:leading-7 prose-li:text-muted">
        {children}
      </div>
    </section>
  );
}
