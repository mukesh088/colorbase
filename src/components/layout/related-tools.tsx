import Link from "next/link";
import { ArrowUpRight, Palette } from "lucide-react";
import type { ToolDefinition } from "@/types/tools";
import { CATEGORY_LABELS } from "@/lib/tools-registry";
import { TOOL_ICONS } from "@/lib/nav";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null;
  return (
    <section className="tool-related" aria-labelledby="related-tools-heading">
      <div className="tool-section-heading">
        <div>
          <p>THE NEXT STEP IN YOUR WORKFLOW</p>
          <h2 id="related-tools-heading">Keep your ideas moving.</h2>
        </div>
        <Link href="/tools">
          Explore all tools <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="tool-related-grid">
        {tools.map((tool) => {
          const Icon = TOOL_ICONS[tool.icon] ?? Palette;
          return (
            <Link key={tool.slug} href={`/${tool.slug}`} className="tool-related-card">
              <div>
                <span className="tool-related-icon">
                  <Icon size={17} />
                </span>
                <span>{CATEGORY_LABELS[tool.category]}</span>
                <ArrowUpRight size={15} />
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <span className="tool-related-action">
                Open tool <span>↗</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
