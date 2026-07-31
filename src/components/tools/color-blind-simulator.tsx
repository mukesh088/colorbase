"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simulateColorBlind, normalizeHex } from "@/lib/colors/convert";
import { ColorSwatch } from "@/components/color/color-swatch";

const TYPES = [
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
  "protanomaly",
  "deuteranomaly",
  "tritanomaly",
] as const;

export function ColorBlindSimulator() {
  const [hex, setHex] = useState("#ef4444");
  const [type, setType] = useState<string>("protanopia");
  const simulated = useMemo(
    () => simulateColorBlind(normalizeHex(hex), type),
    [hex, type]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={hex} className="h-10 w-14 p-1" onChange={(e) => setHex(e.target.value)} />
              <Input value={hex} onChange={(e) => setHex(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Vision type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch hex={normalizeHex(hex)} name="Original" size="lg" />
        <ColorSwatch hex={simulated} name="Simulated" size="lg" />
      </div>
    </div>
  );
}
