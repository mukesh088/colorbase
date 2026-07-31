"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkContrast } from "@/lib/colors/convert";
import { Badge } from "@/components/ui/badge";

export function TypographyPairingTool() {
  const [bg, setBg] = useState("#0f172a");
  const [heading, setHeading] = useState("#f8fafc");
  const [body, setBody] = useState("#cbd5e1");
  const headingContrast = useMemo(() => checkContrast(heading, bg), [heading, bg]);
  const bodyContrast = useMemo(() => checkContrast(body, bg), [body, bg]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Typography Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label>Background</Label><Input value={bg} onChange={(e) => setBg(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Heading</Label><Input value={heading} onChange={(e) => setHeading(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Body</Label><Input value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <p className="text-sm">Heading contrast: <Badge>{headingContrast.level}</Badge></p>
          <p className="text-sm">Body contrast: <Badge>{bodyContrast.level}</Badge></p>
        </CardContent>
      </Card>
      <div className="rounded-2xl p-8" style={{ backgroundColor: bg }}>
        <h3 className="font-display text-3xl font-semibold" style={{ color: heading }}>
          Design with readable type
        </h3>
        <p className="mt-4 text-base leading-7" style={{ color: body }}>
          Pair heading and body colors against your background to keep interfaces accessible and elegant.
        </p>
      </div>
    </div>
  );
}
