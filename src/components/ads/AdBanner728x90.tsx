import AdsterraIframe from "./AdsterraIframe";
import { IS_PRODUCTION } from "@/lib/features";

export default function AdBanner728x90() {
  if (!IS_PRODUCTION) return null;

  return (
    <aside aria-label="Advertisement" className="mx-auto my-6 hidden w-full max-w-4xl flex-col items-center border-y border-border px-4 py-4 sm:px-6 md:flex">
      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted">Advertisement</p>
      <AdsterraIframe adKey="7909f2a54f5ff4387680dd9c4a57270c" width={728} height={90} />
    </aside>
  );
}
