import type { Metadata } from "next";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorReferenceTable } from "@/components/color-codes/reference-table";
import { bukkitRows } from "@/lib/data/color-codes/bukkit";

export const metadata: Metadata = createPageMetadata({
  title: "Bukkit Color Codes — ChatColor, MOTD & HEX",
  description:
    "Bukkit and Spigot ChatColor enums with § and & chat codes, MOTD sequences, HEX, and RGB for plugin developers.",
  path: "/color-codes/bukkit",
  keywords: ["bukkit color codes", "spigot chatcolor", "minecraft plugin colors"],
});

export default function BukkitColorCodesPage() {
  const rows = bukkitRows();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
    { name: "Bukkit", href: "/color-codes/bukkit" },
  ];
  const faqs = [
    {
      question: "What is ChatColor in Bukkit?",
      answer:
        "org.bukkit.ChatColor is an enum that maps names like RED to the same 16 Minecraft legacy colors. Plugins often translate &c in config files into §c at runtime.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow="Plugin reference"
        title="Bukkit Color Codes"
        description="ChatColor enum names for Bukkit, Spigot, and Paper plugins. Colors match the Minecraft legacy palette. HEX and RGB are calculated from those RGB triples."
        aside={
          <RelatedCodeLinks
            items={[
              { href: "/color-codes/minecraft", label: "Minecraft § codes" },
              { href: "/developers", label: "Developer exports" },
              { href: "/learn/color-codes", label: "Color code basics" },
            ]}
          />
        }
      >
        <ColorReferenceTable
          rows={rows}
          columns={[
            { id: "name", header: "Name" },
            { id: "enumName", header: "ChatColor", copy: true, mono: true },
            { id: "chat", header: "Chat Code", copy: true, mono: true },
            { id: "amp", header: "& alias", copy: true, mono: true },
            { id: "motd", header: "MOTD Code", copy: true, mono: true },
            { id: "hex", header: "HEX", copy: true, mono: true },
            { id: "rgb", header: "RGB", copy: true, mono: true },
          ]}
          searchPlaceholder="Search ChatColor, §, &, or HEX…"
        />
        <AdReserve />
        <section className="mt-8 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="font-display text-lg font-semibold text-foreground">Using ChatColor in plugins</h2>
          <p>
            Prefer `ChatColor.RED + "Warning"` or MiniMessage/Adventure components in modern Paper APIs.
            Config files still commonly store `&cWarning&r`. Translate `&` to `§` only for the 16 color
            digits and the six format codes (`k`–`o`, `r`). Do not treat `&` inside URLs as a color prefix.
          </p>
          <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-4 font-mono text-xs">{`player.sendMessage(ChatColor.GREEN + "Ready " + ChatColor.WHITE + "to play");
// config.yml style: "&aReady &fto play"`}</pre>
        </section>
      </ColorCodePageShell>
    </>
  );
}
