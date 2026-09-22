"use client";

import Script from "next/script";
import { IS_PRODUCTION } from "@/lib/features";

const ATOPTIONS = `atOptions = {
  'key' : '7909f2a54f5ff4387680dd9c4a57270c',
  'format' : 'iframe',
  'height' : 90,
  'width' : 728,
  'params' : {}
};`;

const INVOKE_SRC =
  "https://www.highrevenueformat.com/7909f2a54f5ff4387680dd9c4a57270c/invoke.js";

export default function AdBanner728x90() {
  if (!IS_PRODUCTION) return null;

  return (
    <div className="mx-auto hidden w-full max-w-4xl justify-center px-4 py-4 sm:px-6 md:flex">
      <div className="flex max-w-full items-center justify-center overflow-hidden">
        <Script
          id="adsterra-728x90-options"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: ATOPTIONS }}
        />
        <Script id="adsterra-728x90-invoke" strategy="afterInteractive" src={INVOKE_SRC} />
      </div>
    </div>
  );
}