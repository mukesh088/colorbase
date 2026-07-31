import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = createPageMetadata({
  title: "Color Meaning Blog",
  description: "Explore the psychology and meaning of colors in design and branding.",
  path: "/color-meaning",
  keywords: ["color meaning", "color psychology", "brand colors meaning"],
});

const meanings = [
  { color: "Blue", hex: "#2563eb", meaning: "Trust, calm, professionalism — common in SaaS and finance." },
  { color: "Green", hex: "#16a34a", meaning: "Growth, nature, success — strong for eco and health brands." },
  { color: "Red", hex: "#dc2626", meaning: "Energy, urgency, passion — powerful for CTAs and alerts." },
  { color: "Orange", hex: "#ea580c", meaning: "Creativity, warmth, enthusiasm — friendly and approachable." },
  { color: "Purple", hex: "#7c3aed", meaning: "Imagination, luxury, wisdom — often used for premium products." },
  { color: "Yellow", hex: "#ca8a04", meaning: "Optimism, attention, clarity — great for highlights and warnings." },
];

export default function ColorMeaningPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Color Meaning", href: "/color-meaning" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Color Meaning</h1>
      <p className="mt-3 text-muted-foreground">
        Color psychology helps you choose palettes that match brand emotion and audience expectations.
      </p>
      <div className="mt-8 space-y-4">
        {meanings.map((item) => (
          <article key={item.color} className="glass flex gap-4 rounded-2xl border border-border/60 p-4">
            <div className="h-16 w-16 shrink-0 rounded-xl" style={{ backgroundColor: item.hex }} aria-hidden />
            <div>
              <h2 className="font-display text-xl font-semibold">{item.color}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.meaning}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
