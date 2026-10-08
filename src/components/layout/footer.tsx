import Link from "next/link";
import { SUPPORT_EMAIL, SITE_NAME, SITE_NAME_DISPLAY, SITE_PROMISE, formatBusinessAddress } from "@/lib/site-config";

const FOOTER_GROUPS = [
  {
    title: "Colors",
    links: [
      { href: "/colors", label: "Color library" },
      { href: "/color-names", label: "Color names" },
      { href: "/colors/family/blue", label: "Families" },
      { href: "/palette-library", label: "Palettes" },
      { href: "/explore-colors", label: "Explore HEX" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/color-picker", label: "Color picker" },
      { href: "/palette-generator", label: "Palette generator" },
      { href: "/contrast-checker", label: "Contrast checker" },
      { href: "/tools/harmony-studio", label: "Harmony studio" },
      { href: "/tools", label: "All tools" },
    ],
  },
  {
    title: "Color Codes",
    links: [
      { href: "/color-codes", label: "Color codes" },
      { href: "/color-codes/minecraft", label: "Minecraft" },
      { href: "/color-codes/roblox", label: "Roblox" },
      { href: "/colors/flat-ui", label: "Flat UI" },
      { href: "/color-atlas", label: "Color atlas" },
    ],
  },
  {
    title: "Design Systems",
    links: [
      { href: "/colors/tailwind", label: "Tailwind" },
      { href: "/colors/material", label: "Material" },
      { href: "/colors/bootstrap", label: "Bootstrap" },
      { href: "/colors/css", label: "CSS named" },
      { href: "/brands", label: "Brands" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learning", label: "Guides" },
      { href: "/learn/color-codes", label: "Color codes 101" },
      { href: "/blog", label: "Blog" },
      { href: "/ai-color-copilot", label: "AI Copilot" },
      { href: "/developers", label: "Developers" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto overflow-hidden bg-[var(--footer)] pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] pt-12 text-[var(--footer-foreground)] sm:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(236,72,153,0.12), transparent 32%), radial-gradient(circle at 88% 8%, rgba(168,85,247,0.1), transparent 30%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-3 xl:grid-cols-7 lg:px-6">
        <div className="sm:col-span-2 xl:col-span-2">
          <p className="font-display text-xl font-semibold tracking-[-0.04em] text-white">{SITE_NAME_DISPLAY}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">{SITE_PROMISE}</p>
          <p className="mt-4 text-sm text-zinc-400">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-white">
              {SUPPORT_EMAIL}
            </a>
            <br />
            {formatBusinessAddress()}
          </p>
        </div>
        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-sm font-semibold text-white">{group.title}</p>
            <ul className="space-y-1 text-sm text-zinc-400">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative mx-auto mt-10 flex max-w-7xl flex-col items-center gap-3 border-t border-white/10 px-3 pt-6 sm:px-4 lg:px-6">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-zinc-500">
          <li>
            <Link href="/privacy" className="hover:text-zinc-200">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-zinc-200">
              Terms
            </Link>
          </li>
          <li>
            <Link href="/cookies" className="hover:text-zinc-200">
              Cookies
            </Link>
          </li>
          <li>
            <Link href="/disclaimer" className="hover:text-zinc-200">
              Disclaimer
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-zinc-200">
              Contact
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-zinc-200">
              About
            </Link>
          </li>
        </ul>
        <p className="text-center text-xs text-zinc-500">© 2026 {SITE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
