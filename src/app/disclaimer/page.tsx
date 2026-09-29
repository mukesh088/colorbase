import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/layout/legal-page";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Disclaimer",
  description: `Disclaimer for ${SITE_NAME} tools, content, brand colors, and advertising.`,
  path: "/disclaimer",
  keywords: ["disclaimer", "as is", "no warranty"],
});

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" path="/disclaimer" updated="September 22, 2026">
      <p>
        The information and tools on {SITE_NAME} ({SITE_URL.replace(/^https?:\/\//, "")}) are
        provided for general informational and utility purposes only.
      </p>

      <h2>1. No professional advice</h2>
      <p>
        Content on the Site is not legal, financial, medical, accessibility certification, or other
        professional advice. Always verify color contrast, brand guidelines, and technical outputs
        for your own projects and compliance needs.
      </p>

      <h2>2. Accuracy of tools and data</h2>
      <p>
        We strive for useful converters, generators, and libraries, but values (HEX, RGB, HSL,
        contrast ratios, brand palettes, etc.) may contain errors or become outdated. Brand colors
        and logos referenced on the Site belong to their respective owners and are provided for
        educational/reference purposes; trademark owners are not affiliated with {SITE_NAME} unless
        stated otherwise.
      </p>

      <h2>3. &quot;As is&quot; service</h2>
      <p>
        The Site is provided &quot;as is&quot; without warranties of any kind. See our{" "}
        <Link href="/terms">Terms of Service</Link> for full warranty and liability terms.
      </p>

      <h2>4. External links and ads</h2>
      <p>
        Third-party links and advertisements (including Google AdSense) may appear on the Site. We
        do not control and are not responsible for third-party content, products, privacy practices,
        or availability.
      </p>

      <h2>5. User responsibility</h2>
      <p>
        You are solely responsible for how you use tool outputs in production apps, print, branding,
        or commercial work, including checking licenses, trademarks, and accessibility requirements.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions: <a href={`mailto:${ORGANIZATION.email}`}>{ORGANIZATION.email}</a> ·{" "}
        <Link href="/contact">Contact</Link> · <Link href="/privacy">Privacy</Link> ·{" "}
        <Link href="/terms">Terms</Link>.
      </p>
    </LegalPage>
  );
}
