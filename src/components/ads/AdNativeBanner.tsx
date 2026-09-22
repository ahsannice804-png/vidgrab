"use client";

import Script from "next/script";
import { IS_PRODUCTION } from "@/lib/features";

const CONTAINER_ID = "container-5448f26478ee5355b43d925dd8a0aeed";
const INVOKE_SRC =
  "https://pl31424814.profitableratecpmnetwork.com/5448f26478ee5355b43d925dd8a0aeed/invoke.js";

export default function AdNativeBanner() {
  if (!IS_PRODUCTION) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl justify-center px-4 py-4 sm:px-6">
      <div
        id={CONTAINER_ID}
        className="flex w-full max-w-full items-center justify-center overflow-hidden"
      />
      <Script id="adsterra-native-invoke" strategy="afterInteractive" src={INVOKE_SRC} />
    </div>
  );
}