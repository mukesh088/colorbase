import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Terms of service for colorBase.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Terms", href: "/terms" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          colorBase is provided free of charge, as-is, without warranties. Use tools and
          exports at your own discretion.
        </p>
        <p>
          Do not abuse the service or attempt to disrupt availability. Content you generate remains
          yours.
        </p>
      </div>
    </div>
  );
}
