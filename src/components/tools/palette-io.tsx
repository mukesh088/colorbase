"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorSwatch } from "@/components/color/color-swatch";
import { exportPalette } from "@/lib/colors/export";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import type { ExportFormat } from "@/types/color";

export function PaletteIO({ mode }: { mode: "export" | "import" }) {
  const [text, setText] = useState("#0ea5e9\n#14b8a6\n#f59e0b\n#ef4444\n#8b5cf6");
  const [qr, setQr] = useState<string | null>(null);

  const colors = text
    .split(/[\s,]+/)
    .map((c) => c.trim())
    .filter(Boolean)
    .filter(isValidHex)
    .map((c) => ({ hex: normalizeHex(c) }));

  const generateQr = async () => {
    const url = `${window.location.origin}/palette-import?colors=${colors.map((c) => c.hex.slice(1)).join("-")}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 280, margin: 1 });
    setQr(dataUrl);
    toast.success("QR code generated");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "export" ? "Export Palette" : "Import Palette"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            aria-label="Palette colors"
            placeholder="Paste HEX colors separated by new lines or commas"
          />
          <div className="flex flex-wrap gap-2">
            {mode === "export" && (
              <Select
                onValueChange={(format) =>
                  exportPalette(colors, format as ExportFormat)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Download as…" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "json",
                    "css",
                    "scss",
                    "tailwind",
                    "bootstrap",
                    "android",
                    "swift",
                    "flutter",
                    "react-native",
                    "figma",
                    "svg",
                    "ase",
                  ].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="button" variant="outline" onClick={generateQr}>
              Generate QR code
            </Button>
          </div>
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Palette share QR code" className="rounded-xl border border-border/50" width={280} height={280} />
          )}
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {colors.map((c) => (
          <ColorSwatch key={c.hex} hex={c.hex} size="lg" />
        ))}
      </div>
    </div>
  );
}
