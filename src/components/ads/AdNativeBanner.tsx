"use client";

import Script from "next/script";
import { IS_PRODUCTION } from "@/lib/features";

const CONTAINER_ID = "container-5448f26478ee5355b43d925dd8a0aeed";
const INVOKE_SRC =
  "https://pl31424814.profitableratecpmnetwork.com/5448f26478ee5355b43d925dd8a0aeed/invoke.js";

export default function AdNativeBanner() {
  if (!IS_PRODUCTION) return null;

  return (
    <aside aria-label="Advertisement" className="mx-auto my-6 flex w-full max-w-4xl flex-col items-center border-y border-border px-4 py-4 sm:px-6">
      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted">Advertisement</p>
      <div
        id={CONTAINER_ID}
        className="flex w-full max-w-full items-center justify-center overflow-hidden"
      />
      <Script id="adsterra-native-invoke" strategy="afterInteractive" src={INVOKE_SRC} />
    </aside>
  );
}