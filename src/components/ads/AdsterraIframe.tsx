"use client";

import { useEffect, useRef } from "react";

interface AdsterraIframeProps {
  adKey: string;
  width: number;
  height: number;
}

/**
 * Adsterra iframe banner. Adsterra's invoke.js inserts its iframe next to the
 * <script> tag that loaded it, so the scripts are appended inside this slot
 * (next/script would hoist them to the end of <body>, dropping the banner
 * below the footer, outside its labelled container).
 */
export default function AdsterraIframe({ adKey, width, height }: AdsterraIframeProps) {
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const options = document.createElement("script");
    options.text = `atOptions = { 'key': '${adKey}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {} };`;
    const invoke = document.createElement("script");
    invoke.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`;
    slot.append(options, invoke);
    return () => slot.replaceChildren();
  }, [adKey, width, height]);

  return (
    <div
      ref={slotRef}
      className="flex max-w-full items-center justify-center overflow-hidden"
      style={{ width, minHeight: height }}
    />
  );
}
