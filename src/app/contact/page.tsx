import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Contact the colorBase team with feedback or support requests.",
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
        Send feedback or support requests. You can also email{" "}
        <a href="mailto:hello@colorbase.in" className="text-primary underline-offset-4 hover:underline">
          hello@colorbase.in
        </a>
        .
      </p>
      <ContactForm />
    </div>
  );
}
