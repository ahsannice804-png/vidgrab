interface FaqItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FaqItem[];
  title?: string;
}

export default function FAQSection({ items, title = "Frequently Asked Questions" }: FAQSectionProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20" aria-labelledby="faq">
      <div className="text-center">
        <h2 id="faq" className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Short, honest answers to the questions people ask the most.
        </p>
      </div>
      <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-border bg-card px-5 py-4 open:bg-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted transition-transform group-open:rotate-45"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}