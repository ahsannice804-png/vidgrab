import AdsterraIframe from "./AdsterraIframe";
import { IS_PRODUCTION } from "@/lib/features";

export default function AdBanner300x250() {
  if (!IS_PRODUCTION) return null;

  return (
    <aside aria-label="Advertisement" className="mx-auto my-6 flex w-full max-w-4xl flex-col items-center border-y border-border px-4 py-4 sm:px-6">
      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted">Advertisement</p>
      <AdsterraIframe adKey="2e1ac3fe836b9e34b5572f243e3ffcb0" width={300} height={250} />
    </aside>
  );
}
