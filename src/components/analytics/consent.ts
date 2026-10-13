export const CONSENT_STORAGE_KEY = "cb-consent";

export type ConsentChoice = "granted" | "denied";

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage can be blocked; the choice then applies to this page view only.
  }
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  // gtag.js only processes `arguments` objects, so push one rather than an array.
  const gtag =
    w.gtag ??
    function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}
