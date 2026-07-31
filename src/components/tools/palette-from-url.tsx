"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorSwatch } from "@/components/color/color-swatch";
import { TRENDING_PALETTES } from "@/lib/colors/palettes";

export function PaletteFromUrlTool() {
  const [url, setUrl] = useState("https://example.com");
  const [colors, setColors] = useState(TRENDING_PALETTES[0].colors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Palette From URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com"
            aria-label="Website URL"
          />
          <Button
            type="button"
            onClick={() => {
              // Client-side demo: deterministic palette derived from URL hash
              const hash = Array.from(url).reduce((a, c) => a + c.charCodeAt(0), 0);
              setColors(TRENDING_PALETTES[hash % TRENDING_PALETTES.length].colors);
              toast.success("Palette generated from URL seed");
            }}
          >
            Extract
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Generates an inspiration palette seeded from the URL. For production scraping, connect a server-side fetch API.
        </p>
        <div className="grid gap-3 sm:grid-cols-5">
          {colors.map((hex) => (
            <ColorSwatch key={hex} hex={hex} size="lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
