import Link from "next/link";
import type { ReactNode } from "react";
import { slugify } from "./text";

/**
 * Tiny, dependency-free renderer for the Markdown dialect used in
 * src/content/blog. It only supports what the articles need, which keeps the
 * output predictable and the bundle free of a Markdown library.
 */

type CalloutKind = "TIP" | "NOTE" | "WARNING";

type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "callout"; kind: CalloutKind; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    const callout = trimmed.match(/^>\s*\[!(TIP|NOTE|WARNING)\]\s*(.*)$/);
    if (callout) {
      const parts = [callout[2]];
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        parts.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "callout",
        kind: callout[1] as CalloutKind,
        text: parts.filter(Boolean).join(" "),
      });
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i].trim();
        if (!/^\|[\s:|-]+\|$/.test(row)) rows.push(splitRow(row));
        i++;
      }
      const [head, ...body] = rows;
      blocks.push({ type: "table", head: head ?? [], rows: body });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "steps", items });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Paragraph: consecutive non-empty lines that don't start another block.
    const parts: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{2,3}\s|>|\||-\s|\d+\.\s)/.test(lines[i].trim())
    ) {
      parts.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: parts.join(" ") });
  }

  return blocks;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-foreground dark:bg-zinc-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const cls =
        "font-medium text-violet-600 underline decoration-violet-600/30 underline-offset-2 transition-colors hover:decoration-violet-600 dark:text-violet-400";
      return href.startsWith("/") ? (
        <Link key={i} href={href} className={cls}>
          {label}
        </Link>
      ) : (
        <a key={i} href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const CALLOUT_STYLE: Record<CalloutKind, { label: string; box: string; badge: string }> = {
  TIP: {
    label: "Tip",
    box: "border-emerald-500/30 bg-emerald-500/5",
    badge: "text-emerald-700 dark:text-emerald-300",
  },
  NOTE: {
    label: "Note",
    box: "border-sky-500/30 bg-sky-500/5",
    badge: "text-sky-700 dark:text-sky-300",
  },
  WARNING: {
    label: "Warning",
    box: "border-amber-500/40 bg-amber-500/5",
    badge: "text-amber-700 dark:text-amber-300",
  },
};

function CalloutIcon({ kind }: { kind: CalloutKind }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-4 w-4",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "TIP") {
    return (
      <svg {...common}>
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    );
  }
  if (kind === "WARNING") {
    return (
      <svg {...common}>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

export function ArticleBody({ markdown }: { markdown: string }) {
  const blocks = parseBlocks(markdown);
  return (
    <div className="article-body text-[17px] leading-[1.75] text-zinc-700 sm:text-[18px] dark:text-zinc-300">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2": {
            const id = slugify(block.text);
            return (
              <h2
                key={i}
                id={id}
                className="mt-12 scroll-mt-24 text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-[1.7rem]"
              >
                {renderInline(block.text)}
              </h2>
            );
          }
          case "h3":
            return (
              <h3
                key={i}
                id={slugify(block.text)}
                className="mt-8 scroll-mt-24 text-xl font-semibold leading-snug text-foreground"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="mt-5">
                {renderInline(block.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="mt-5 space-y-2.5 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                      aria-hidden="true"
                    />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={i} className="mt-6 space-y-4">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-violet-500/30"
                      aria-hidden="true"
                    >
                      {j + 1}
                    </span>
                    <span className="pt-0.5 text-[16px] leading-7 sm:text-[17px]">
                      <span className="sr-only">Step {j + 1}: </span>
                      {renderInline(item)}
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "callout": {
            const style = CALLOUT_STYLE[block.kind];
            return (
              <aside
                key={i}
                className={`mt-6 rounded-2xl border p-4 sm:p-5 ${style.box}`}
                aria-label={style.label}
              >
                <p
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${style.badge}`}
                >
                  <CalloutIcon kind={block.kind} />
                  {style.label}
                </p>
                <p className="mt-2 text-[16px] leading-7">{renderInline(block.text)}</p>
              </aside>
            );
          }
          case "table":
            return (
              <div
                key={i}
                className="mt-6 overflow-x-auto rounded-2xl border border-border"
              >
                <table className="w-full min-w-[480px] border-collapse text-left text-[15px]">
                  <thead className="bg-card">
                    <tr>
                      {block.head.map((cell, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="border-b border-border px-4 py-3 font-semibold text-foreground"
                        >
                          {renderInline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-b border-border last:border-0">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-3 align-top leading-6">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
