import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for colorBase.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Privacy", href: "/privacy" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          We respect your privacy. Color tools run primarily in your browser. Recent colors and
          favorites are stored locally on your device via localStorage.
        </p>
        <p>
          We may use privacy-friendly analytics (Vercel Analytics) to understand aggregate usage.
          We do not sell personal data.
        </p>
        <p>Contact us at hello@colorbase.in for privacy questions.</p>
      </div>
    </div>
  );
}
