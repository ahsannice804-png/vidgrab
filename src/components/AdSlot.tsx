interface AdSlotProps {
  slot?: string;
  label?: string;
  className?: string;
}

/**
 * Reserved, clearly-labelled ad placement zone.
 * Empty on purpose — wire AdSense / ad network code here later.
 * Never place these next to the download button (protects trust + AdSense policy).
 */
export default function AdSlot({ slot, label = "Advertisement", className = "" }: AdSlotProps) {
  return (
    <div
      className={`relative flex min-h-20 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-card px-4 py-5 sm:min-h-24 sm:px-6 sm:py-8 ${className}`}
      aria-label={label}
      data-ad-slot={slot}
    >
      <div className="text-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          {label}
        </span>
        <p className="mt-1 text-xs text-muted">Ad space — reserved</p>
      </div>
    </div>
  );
}