"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkContrast, getTextColor } from "@/lib/colors/convert";
import { CopyButton } from "@/components/color/copy-button";

export function ContrastCheckerTool() {
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const result = useMemo(() => checkContrast(fg, bg), [fg, bg]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fg">Foreground (text)</Label>
            <div className="flex gap-2">
              <Input type="color" value={fg} className="h-10 w-14 p-1" onChange={(e) => setFg(e.target.value)} />
              <Input id="fg" value={fg} onChange={(e) => setFg(e.target.value)} />
              <CopyButton value={fg} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bg">Background</Label>
            <div className="flex gap-2">
              <Input type="color" value={bg} className="h-10 w-14 p-1" onChange={(e) => setBg(e.target.value)} />
              <Input id="bg" value={bg} onChange={(e) => setBg(e.target.value)} />
              <CopyButton value={bg} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border/60 p-3">
              <p className="text-muted-foreground">Contrast ratio</p>
              <p className="font-display text-3xl font-semibold">{result.ratio}:1</p>
              <Badge className="mt-2">{result.level}</Badge>
            </div>
            <div className="space-y-1 rounded-xl border border-border/60 p-3">
              <p>Normal AA: {result.normalAA ? "Pass" : "Fail"}</p>
              <p>Normal AAA: {result.normalAAA ? "Pass" : "Fail"}</p>
              <p>Large AA: {result.largeAA ? "Pass" : "Fail"}</p>
              <p>Large AAA: {result.largeAAA ? "Pass" : "Fail"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 rounded-2xl p-6" style={{ backgroundColor: bg, color: fg }}>
            <p className="text-3xl font-semibold">Large heading text</p>
            <p className="text-base">
              Body text preview for WCAG contrast checking. The quick brown fox jumps over the lazy dog.
            </p>
            <button
              type="button"
              className="rounded-lg px-4 py-2 font-medium"
              style={{ backgroundColor: fg, color: getTextColor(fg) }}
            >
              Sample button
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
