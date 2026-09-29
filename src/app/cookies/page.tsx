import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/layout/legal-page";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description: `Cookie policy for ${SITE_NAME}. How we and partners use cookies for essentials, analytics, and advertising (including Google AdSense).`,
  path: "/cookies",
  keywords: ["cookie policy", "cookies", "adsense cookies", "consent"],
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" path="/cookies" updated="September 22, 2026">
      <p>
        This Cookie Policy explains how {SITE_NAME} ({SITE_URL.replace(/^https?:\/\//, "")}) uses
        cookies and similar technologies. It should be read with our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. Similar technologies include local
        storage, pixels, and scripts that store or read identifiers. They help websites remember
        preferences, measure traffic, and show ads.
      </p>

      <h2>2. How we use cookies</h2>
      <h3>2.1 Essential / functional</h3>
      <ul>
        <li>Remember theme (light/dark/system) and UI preferences</li>
        <li>Store tool settings, recent colors, or favorites in local storage</li>
        <li>Security and basic site operation</li>
      </ul>

      <h3>2.2 Analytics</h3>
      <p>
        We use Google Analytics cookies/identifiers to understand how visitors use the Site (for
        example pages viewed). See{" "}
        <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
          Google&apos;s Privacy Policy
        </a>
        .
      </p>

      <h3>2.3 Advertising</h3>
      <p>
        We use Google AdSense and related advertising cookies to serve and measure ads, including
        personalized ads where allowed. Google and partners may collect information about your
        visits to this and other sites. Learn more:{" "}
        <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer" target="_blank">
          How Google uses cookies in advertising
        </a>
        .
      </p>

      <h2>3. Cookie categories</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Purpose</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Essential</td>
            <td>Site function &amp; preferences</td>
            <td>Theme, local tool data</td>
          </tr>
          <tr>
            <td>Analytics</td>
            <td>Usage measurement</td>
            <td>Google Analytics (_ga, and similar)</td>
          </tr>
          <tr>
            <td>Advertising</td>
            <td>Show &amp; measure ads</td>
            <td>Google AdSense / DoubleClick cookies</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Your choices</h2>
      <ul>
        <li>Block or delete cookies in your browser settings</li>
        <li>
          Opt out of personalized Google ads at{" "}
          <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">
            Google Ads Settings
          </a>
        </li>
        <li>
          Industry opt-out:{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
            aboutads.info/choices
          </a>
        </li>
      </ul>
      <p>
        Blocking some cookies may affect Site features or ad relevance. Essential storage needed for
        basic operation may still be used.
      </p>

      <h2>5. Managing cookies</h2>
      <p>
        You can clear cookies and site data in your browser at any time, or use the Google and
        industry opt-out links above. Contact us if you have questions about how cookies are used
        on this Site.
      </p>

      <h2>6. More information</h2>
      <p>
        Privacy details: <Link href="/privacy">Privacy Policy</Link>. Questions:{" "}
        <a href={`mailto:${ORGANIZATION.email}`}>{ORGANIZATION.email}</a>.
      </p>
    </LegalPage>
  );
}
