import Link from "next/link";
import type { ToolDefinition } from "@/types/tools";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null;
  return (
    <section className="mt-12" aria-labelledby="related-tools-heading">
      <h2 id="related-tools-heading" className="mb-4 font-display text-xl font-semibold">
        Related Tools
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}`} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
