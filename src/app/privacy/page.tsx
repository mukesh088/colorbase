import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/layout/legal-page";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}. How we collect, use, and share information, including cookies, Google Analytics, and Google AdSense.`,
  path: "/privacy",
  keywords: ["privacy policy", "cookies", "adsense", "data protection"],
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy" updated="September 22, 2026">
      <p>
        This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
        collects, uses, and shares information when you visit{" "}
        <a href={SITE_URL}>{SITE_URL.replace(/^https?:\/\//, "")}</a> (the &quot;Site&quot;).
        By using the Site, you agree to this policy. If you do not agree, please do not use the Site.
      </p>

      <h2>1. Who we are</h2>
      <p>
        {SITE_NAME} provides free browser-based color, CSS, developer, and related tools.
        Contact:{" "}
        <a href={`mailto:${ORGANIZATION.email}`}>{ORGANIZATION.email}</a>.
      </p>

      <h2>2. Information we collect</h2>
      <h3>2.1 Information you provide</h3>
      <ul>
        <li>
          Contact form messages (name, email, and message content) when you write to us via{" "}
          <Link href="/contact">Contact</Link>.
        </li>
        <li>Any email you send to {ORGANIZATION.email}.</li>
      </ul>

      <h3>2.2 Information stored on your device</h3>
      <p>
        Many tools run in your browser. Preferences such as theme, recent colors, favorites, and
        similar settings may be stored locally (for example via <code>localStorage</code>). This
        data stays on your device unless you clear site data in your browser.
      </p>

      <h3>2.3 Automatically collected information</h3>
      <p>When you visit the Site, we and our partners may automatically collect:</p>
      <ul>
        <li>IP address, browser type, device type, and approximate location</li>
        <li>Pages viewed, referring URL, and approximate timestamps</li>
        <li>Cookie identifiers and similar technologies (see our <Link href="/cookies">Cookie Policy</Link>)</li>
      </ul>

      <h2>3. How we use information</h2>
      <ul>
        <li>To operate, maintain, and improve the Site and tools</li>
        <li>To respond to support or feedback requests</li>
        <li>To understand aggregate traffic and usage (analytics)</li>
        <li>To show advertisements (including personalized ads where permitted)</li>
        <li>To detect abuse, enforce our <Link href="/terms">Terms of Service</Link>, and protect the Site</li>
        <li>To comply with applicable law</li>
      </ul>

      <h2>4. Google Analytics</h2>
      <p>
        We use Google Analytics to measure site usage (for example page views). Google may set
        cookies and process usage data as described in{" "}
        <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
          Google&apos;s Privacy Policy
        </a>
        . You can learn more about Google Analytics cookies and opt-out options in Google&apos;s
        documentation.
      </p>

      <h2>5. Google AdSense and advertising</h2>
      <p>
        We use Google AdSense to display ads. Third-party vendors, including Google, use cookies to
        serve ads based on a user&apos;s prior visits to this Site or other websites. Google&apos;s
        use of advertising cookies enables it and its partners to serve ads based on your visits to
        this Site and/or other sites on the Internet.
      </p>
      <p>
        Users may opt out of personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">
          Google Ads Settings
        </a>
        . Alternatively, you can opt out of some third-party vendors&apos; use of cookies for
        personalized advertising at{" "}
        <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
          aboutads.info/choices
        </a>
        .
      </p>
      <p>
        For more information, see{" "}
        <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer" target="_blank">
          How Google uses cookies in advertising
        </a>
        .
      </p>

      <h2>6. Cookies and similar technologies</h2>
      <p>
        We and our partners use cookies and similar technologies for essential site functions,
        analytics, and advertising. Details are in our <Link href="/cookies">Cookie Policy</Link>.
        You can manage cookies through your browser settings and the opt-out links in our{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>7. Legal bases (EEA/UK users)</h2>
      <p>Where GDPR or UK GDPR applies, we rely on one or more of:</p>
      <ul>
        <li>
          <strong>Consent</strong> — for non-essential cookies and personalized advertising where
          required
        </li>
        <li>
          <strong>Legitimate interests</strong> — to operate and secure the Site, improve tools, and
          understand aggregate usage in a privacy-respecting way
        </li>
        <li>
          <strong>Contract / steps prior to contract</strong> — when you contact us for support
        </li>
        <li>
          <strong>Legal obligation</strong> — when we must retain or disclose information by law
        </li>
      </ul>

      <h2>8. Sharing of information</h2>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li>Service providers that help us host, analyze, or advertise on the Site (e.g. Google)</li>
        <li>Authorities when required by law or to protect rights and safety</li>
        <li>Successors in the event of a merger, acquisition, or asset transfer</li>
      </ul>

      <h2>9. Data retention</h2>
      <p>
        Local device data remains until you clear it. Contact emails and form messages are kept only
        as long as needed to respond and for legitimate business or legal purposes. Analytics and
        advertising partners retain data according to their own policies.
      </p>

      <h2>10. International transfers</h2>
      <p>
        Our hosting and partners may process data in countries outside your own (including the
        United States). Where required, appropriate safeguards are used by those providers.
      </p>

      <h2>11. Children&apos;s privacy</h2>
      <p>
        The Site is not directed to children under 13 (or the equivalent minimum age in your
        jurisdiction). We do not knowingly collect personal information from children. If you
        believe a child has provided us information, contact us and we will take appropriate steps.
      </p>

      <h2>12. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or restrict
        processing of your personal data, and to object or withdraw consent. To exercise these
        rights, email <a href={`mailto:${ORGANIZATION.email}`}>{ORGANIZATION.email}</a>. You may
        also lodge a complaint with your local data protection authority.
      </p>

      <h2>13. Security</h2>
      <p>
        We take reasonable technical and organizational measures to protect information. No method
        of transmission or storage is 100% secure.
      </p>

      <h2>14. Third-party links</h2>
      <p>
        The Site may link to third-party websites. Their privacy practices are their own; review
        their policies before providing information.
      </p>

      <h2>15. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at
        the top will change when we do. Continued use of the Site after changes means you accept the
        updated policy.
      </p>

      <h2>16. Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href={`mailto:${ORGANIZATION.email}`}>{ORGANIZATION.email}</a> or{" "}
        <Link href="/contact">Contact</Link>.
      </p>
    </LegalPage>
  );
}
