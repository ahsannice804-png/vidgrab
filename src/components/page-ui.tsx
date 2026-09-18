import type { Metadata } from "next";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pt-14 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-3 text-base text-muted">{subtitle}</p>}
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-zinc max-w-none pb-20 dark:prose-invert prose-headings:mt-10 prose-headings:text-xl prose-headings:font-bold prose-p:my-3 prose-p:leading-7 prose-p:text-muted prose-a:text-violet-600 prose-li:leading-7 prose-li:text-muted">
      {children}
    </div>
  );
}

export function simpleMetadata(title: string, description: string): Metadata {
  return { title, description };
}