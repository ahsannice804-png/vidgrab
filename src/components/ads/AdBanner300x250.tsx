"use client";

import Script from "next/script";
import { IS_PRODUCTION } from "@/lib/features";

const ATOPTIONS = `atOptions = {
  'key' : '2e1ac3fe836b9e34b5572f243e3ffcb0',
  'format' : 'iframe',
  'height' : 250,
  'width' : 300,
  'params' : {}
};`;

const INVOKE_SRC =
  "https://www.highrevenueformat.com/2e1ac3fe836b9e34b5572f243e3ffcb0/invoke.js";

export default function AdBanner300x250() {
  if (!IS_PRODUCTION) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl justify-center px-4 py-4 sm:px-6">
      <div className="flex h-[250px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-lg bg-muted/30">
        <Script
          id="adsterra-300x250-options"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: ATOPTIONS }}
        />
        <Script id="adsterra-300x250-invoke" strategy="afterInteractive" src={INVOKE_SRC} />
      </div>
    </div>
  );
}