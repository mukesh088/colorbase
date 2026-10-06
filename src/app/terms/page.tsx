import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/layout/legal-page";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: `Terms of Service for using ${SITE_NAME} tools and website.`,
  path: "/terms",
  keywords: ["terms of service", "terms and conditions", "user agreement"],
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" path="/terms" updated="October 6, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of {SITE_NAME} at{" "}
        <a href={SITE_URL}>{SITE_URL.replace(/^https?:\/\//, "")}</a> (the &quot;Site&quot;). By
        accessing or using the Site, you agree to these Terms and our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.
        If you do not agree, do not use the Site.
      </p>

      <h2>1. The service</h2>
      <p>
        {SITE_NAME} offers free online tools and content related to colors, CSS, development,
        utilities, and similar topics. Features may change, be limited, or be discontinued at any
        time without notice.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be able to form a binding contract in your jurisdiction. If you use the Site on
        behalf of an organization, you represent that you have authority to bind that organization.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Site for unlawful, harmful, or fraudulent purposes</li>
        <li>Attempt to disrupt, overload, scrape abusively, or reverse engineer the Site</li>
        <li>Interfere with security, accounts, or other users</li>
        <li>Upload malware or attempt unauthorized access to systems or data</li>
        <li>Misrepresent your identity or affiliation</li>
        <li>Use automated means in a way that harms Site availability or violates these Terms</li>
        <li>Violate applicable advertising, copyright, or privacy laws</li>
      </ul>

      <h2>4. User content and exports</h2>
      <p>
        Colors, code, palettes, text, and other outputs you generate with our tools remain yours to
        use, subject to third-party rights (for example brand colors or trademarks belonging to
        others). You are responsible for how you use exports and for ensuring your use is lawful.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        The Site&apos;s branding, design, software, and original content are owned by {SITE_NAME} or
        its licensors. You may not copy, redistribute, or exploit the Site itself except as allowed
        by law or with our prior written permission. Tool outputs you create are addressed in
        section 4.
      </p>

      <h2>6. Advertising</h2>
      <p>
        The Site may display third-party advertisements, including Google AdSense. Ads are provided
        by third parties and may use cookies as described in our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.
        We are not responsible for advertiser products, claims, or destinations.
      </p>

      <h2>7. Third-party services and links</h2>
      <p>
        The Site may integrate or link to third-party services (for example analytics, ads, or
        social profiles). Those services are governed by their own terms and policies.
      </p>

      <h2>8. Disclaimer of warranties</h2>
      <p>
        THE SITE AND ALL TOOLS, CONTENT, AND OUTPUTS ARE PROVIDED &quot;AS IS&quot; AND &quot;AS
        AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. We do not
        warrant that the Site will be uninterrupted, error-free, or free of harmful components, or
        that results from tools will meet your requirements.
      </p>
      <p>
        See also our <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, {SITE_NAME} AND ITS OPERATORS SHALL NOT BE LIABLE
        FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY
        LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SITE. OUR TOTAL LIABILITY
        FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SITE SHALL NOT EXCEED ONE HUNDRED US DOLLARS
        (USD $100) OR THE AMOUNT YOU PAID US (IF ANY) IN THE TWELVE MONTHS BEFORE THE CLAIM,
        WHICHEVER IS GREATER.
      </p>

      <h2>10. Indemnity</h2>
      <p>
        You agree to defend and indemnify {SITE_NAME} and its operators from claims, damages, and
        expenses (including reasonable legal fees) arising from your misuse of the Site, your
        content, or your violation of these Terms or applicable law.
      </p>

      <h2>11. Privacy</h2>
      <p>
        Our handling of information is described in the <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may suspend or terminate access to the Site at any time, including for suspected
        violations of these Terms. Provisions that by their nature should survive (including
        disclaimers and limitations) will survive termination.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these Terms by posting a revised version on this page. The &quot;Last
        updated&quot; date will change when we do. Continued use after changes constitutes
        acceptance.
      </p>

      <h2>14. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable in India, without regard to conflict-of-law
        rules, unless mandatory consumer protections in your country require otherwise. Courts in
        India shall have exclusive jurisdiction, subject to those mandatory protections.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms go to our mailbox at{" "}
        <a href={`mailto:${ORGANIZATION.email}`}>{ORGANIZATION.email}</a>. Address: Lalpur, Ranchi
        834001, Jharkhand, India. You can also use <Link href="/contact">Contact</Link>.
      </p>
    </LegalPage>
  );
}
