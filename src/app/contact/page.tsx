import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactDetails } from "@/components/layout/contact-details";
import { ContactForm } from "@/components/forms/contact-form";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: `Contact colorBase at ${SUPPORT_EMAIL}. Lalpur, Ranchi 834001, Jharkhand, India.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Send feedback or support requests. Your query is delivered to our mailbox at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <ContactDetails className="mt-5 rounded-2xl border border-border/60 bg-background/80 p-4" />
      <ContactForm />
    </div>
  );
}
