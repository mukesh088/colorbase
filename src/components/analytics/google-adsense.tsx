import Script from "next/script";
import { ADSENSE_CLIENT_ID } from "@/lib/site-config";

/**
 * AdSense ownership verification + loader.
 * `beforeInteractive` injects a real <script> into the document so Google's
 * crawler can verify the site without waiting for client hydration.
 */
export function GoogleAdSense() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
