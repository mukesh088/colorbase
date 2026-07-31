"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkContrast, mixColors, normalizeHex } from "@/lib/colors/convert";
import { Badge } from "@/components/ui/badge";

export function AccessibilityCheckerTool() {
  const [fg, setFg] = useState("#334155");
  const [bg, setBg] = useState("#f8fafc");
  const result = useMemo(() => checkContrast(fg, bg), [fg, bg]);
  const suggestion = useMemo(() => {
    if (result.normalAA) return null;
    return mixColors(normalizeHex(fg), "#000000", 0.35);
  }, [fg, result.normalAA]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Checker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Text color</Label>
            <Input value={fg} onChange={(e) => setFg(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Background</Label>
            <Input value={bg} onChange={(e) => setBg(e.target.value)} />
          </div>
          <Badge>{result.level} · {result.ratio}:1</Badge>
          {suggestion && (
            <p className="text-sm text-muted-foreground">
              Suggested darker text for AA: <strong>{suggestion}</strong>
            </p>
          )}
        </CardContent>
      </Card>
      <div className="rounded-2xl border border-border/60 p-8" style={{ backgroundColor: bg, color: fg }}>
        <h3 className="text-2xl font-semibold">Readable sample</h3>
        <p className="mt-3 text-base leading-relaxed">
          Check whether this text meets WCAG accessibility guidelines for contrast.
        </p>
      </div>
    </div>
  );
}
