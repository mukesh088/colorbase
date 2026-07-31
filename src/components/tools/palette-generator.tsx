"use client";

import { useState } from "react";
import { Dice5, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ColorSwatch } from "@/components/color/color-swatch";
import { CopyButton } from "@/components/color/copy-button";
import { generateHarmony, normalizeHex, randomHex } from "@/lib/colors/convert";
import { exportPalette } from "@/lib/colors/export";
import type { ExportFormat } from "@/types/color";

export function PaletteGeneratorTool({ randomOnly = false }: { randomOnly?: boolean }) {
  const [base, setBase] = useState("#0ea5e9");
  const [harmony, setHarmony] = useState("analogous");
  const [palette, setPalette] = useState(() =>
    randomOnly
      ? ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"]
      : generateHarmony("#0ea5e9", "analogous")
  );

  const regenerate = () => {
    if (randomOnly) {
      setPalette(Array.from({ length: 5 }, () => randomHex()));
    } else {
      setPalette(generateHarmony(normalizeHex(base), harmony));
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/palette-generator?colors=${palette.map((c) => c.slice(1)).join("-")}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{randomOnly ? "Random Palette" : "Harmony Generator"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          {!randomOnly && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="base">Base color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="base"
                    value={base}
                    className="h-10 w-14 p-1"
                    onChange={(e) => setBase(e.target.value)}
                  />
                  <Input value={base} onChange={(e) => setBase(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Harmony</Label>
                <Select
                  value={harmony}
                  onValueChange={(v) => {
                    setHarmony(v);
                    setPalette(generateHarmony(normalizeHex(base), v));
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complementary">Complementary</SelectItem>
                    <SelectItem value="analogous">Analogous</SelectItem>
                    <SelectItem value="triadic">Triadic</SelectItem>
                    <SelectItem value="tetradic">Tetradic</SelectItem>
                    <SelectItem value="split-complementary">Split complementary</SelectItem>
                    <SelectItem value="monochromatic">Monochromatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <Button type="button" onClick={regenerate}>
            <Dice5 /> Generate
          </Button>
          <Button type="button" variant="outline" onClick={share}>
            <Share2 /> Share
          </Button>
          <Select
            onValueChange={(format) =>
              exportPalette(
                palette.map((hex) => ({ hex })),
                format as ExportFormat
              )
            }
          >
            <SelectTrigger className="w-40" aria-label="Export format">
              <Download className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              {["json", "css", "scss", "tailwind", "svg", "swift", "flutter", "android"].map((f) => (
                <SelectItem key={f} value={f}>
                  {f.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {palette.map((hex) => (
          <div key={hex} className="space-y-2">
            <ColorSwatch hex={hex} size="lg" />
            <CopyButton value={hex} label={hex} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
