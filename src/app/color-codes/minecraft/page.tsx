import type { Metadata } from "next";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorReferenceTable } from "@/components/color-codes/reference-table";
import { MinecraftPreview } from "@/components/color-codes/minecraft-preview";
import { minecraftRows, MINECRAFT_FORMATS } from "@/lib/data/color-codes/minecraft";
import { CopyButton } from "@/components/color/copy-button";

export const metadata: Metadata = createPageMetadata({
  title: "Minecraft Color Codes — Chat, MOTD & HEX",
  description:
    "Legacy Minecraft § chat codes, MOTD sequences, HEX, RGB, and HSL in a searchable table with a live text preview.",
  path: "/color-codes/minecraft",
  keywords: ["minecraft color codes", "minecraft chat colors", "motd color codes", "section sign color"],
});

export default function MinecraftColorCodesPage() {
  const rows = minecraftRows();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
    { name: "Minecraft", href: "/color-codes/minecraft" },
  ];
  const faqs = [
    {
      question: "What is a Minecraft color code?",
      answer:
        "Legacy Java chat uses the section sign (§) plus a hex digit 0–9 or a–f. Many server MOTD files write the same code as a Unicode escape such as \\u00A7c.",
    },
    {
      question: "Does this page cover a specific Minecraft version?",
      answer:
        "No. These are the widely published 16 legacy colors. Newer JSON/MiniMessage formats exist; this table is the classic § palette only.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow="Game reference"
        title="Minecraft Color Codes"
        description="Legacy Java chat and MOTD color codes with matching HEX values. ColorBase does not claim compatibility with a specific game version — this is the classic 16-color § palette used in chat, signs, and many server MOTD files."
        aside={
          <RelatedCodeLinks
            items={[
              { href: "/color-codes/bukkit", label: "Bukkit ChatColor" },
              { href: "/color-codes/roblox", label: "Roblox BrickColor" },
              { href: "/color-codes/common", label: "Common CSS colors" },
              { href: "/learn/color-codes", label: "How HEX works" },
            ]}
          />
        }
      >
        <MinecraftPreview />
        <div className="mt-8">
          <ColorReferenceTable
            rows={rows}
            columns={[
              { id: "name", header: "Name" },
              { id: "chat", header: "Chat Code", copy: true, mono: true },
              { id: "motd", header: "MOTD Code", copy: true, mono: true },
              { id: "hex", header: "HEX", copy: true, mono: true },
              { id: "rgb", header: "RGB", copy: true, mono: true },
              { id: "hsl", header: "HSL", copy: true, mono: true },
            ]}
            searchPlaceholder="Search name, § code, or HEX…"
          />
        </div>
        <AdReserve />
        <section className="mt-8 overflow-hidden rounded-2xl border border-border/70">
          <div className="border-b border-border/60 px-4 py-3">
            <h2 className="font-display text-lg font-semibold">Format codes</h2>
            <p className="text-sm text-muted-foreground">These change style, not hue.</p>
          </div>
          <ul className="divide-y divide-border/60">
            {MINECRAFT_FORMATS.map((f) => (
              <li key={f.chat} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  {f.name} <span className="font-mono text-muted-foreground">{f.chat}</span>
                </span>
                <span className="text-muted-foreground">{f.note}</span>
                <CopyButton value={f.chat} label="Chat" size="sm" className="h-8 px-2 text-[11px]" />
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-8 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-lg font-semibold text-foreground">How Minecraft color codes work</h2>
          <p>
            The section sign (`§`) is a formatting prefix. `§cHello` paints the following text in the red
            from this table (`#FF5555`). `§r` resets color and style. Many plugins also accept `&c` as an
            alias — see the Bukkit page for ChatColor enum names.
          </p>
          <p>
            MOTD strings in `server.properties` often cannot contain a raw `§`, so operators write the
            Unicode escape shown in the MOTD column. HEX, RGB, and HSL here are conversions of the same
            8-bit RGB triples; they are not separate official Minecraft color spaces.
          </p>
        </section>
      </ColorCodePageShell>
    </>
  );
}
