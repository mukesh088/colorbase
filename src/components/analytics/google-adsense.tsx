import Script from "next/script";
import { ADSENSE_CLIENT_ID } from "@/lib/site-config";

/**
 * AdSense loader. Ownership is verified by the meta tag in the root layout.
 * The script loads after the page is idle so it does not block first paint.
 */
export function GoogleAdSense() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
