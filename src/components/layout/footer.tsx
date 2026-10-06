import Link from "next/link";
import { SUPPORT_EMAIL, SITE_NAME, formatBusinessAddress } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border/50 bg-background py-8 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] sm:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-7xl gap-6 px-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-4 lg:px-6">
        <div>
          <p className="font-display text-lg font-semibold">
            <span className="bg-gradient-to-r from-rose-600 to-fuchsia-500 bg-clip-text text-transparent">
              {SITE_NAME}
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Free modern color tools for designers and developers. Visit colorbase.in.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">
              {SUPPORT_EMAIL}
            </a>
            <br />
            {formatBusinessAddress()}
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Our Tools</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <Link href="/ai-color-copilot" className="font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400">
                Copilot
              </Link>
            </li>
            <li><Link href="/tools" className="hover:text-foreground">All tools</Link></li>
            <li><Link href="/tools?category=css-generators" className="hover:text-foreground">CSS Tools</Link></li>
            <li><Link href="/contrast-checker" className="hover:text-foreground">Contrast</Link></li>
            <li><Link href="/palette-generator" className="hover:text-foreground">Palettes</Link></li>
            <li><Link href="/unix-timestamp-converter" className="hover:text-foreground">Unix time</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Libraries</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/colors" className="hover:text-foreground">Color Library</Link></li>
            <li><Link href="/brands" className="hover:text-foreground">Brand Colors</Link></li>
            <li><Link href="/gradient-library" className="hover:text-foreground">Gradients</Link></li>
            <li><Link href="/palette-library" className="hover:text-foreground">Palettes</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Company</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/learning" className="hover:text-foreground">Learning</Link></li>
            <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center gap-3 px-3 sm:px-4 lg:px-6">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
          <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
          <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
          <li><Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link></li>
          <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
        </ul>
        <p className="text-center text-xs text-muted-foreground">
          © 2026 {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
