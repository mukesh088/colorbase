"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hslToRgb, rgbToHex } from "@/lib/colors/convert";
import { ColorSwatch } from "@/components/color/color-swatch";

export function ColorWheelTool() {
  const [hue, setHue] = useState(200);
  const [sat, setSat] = useState(80);
  const [light, setLight] = useState(50);
  const hex = useMemo(
    () => rgbToHex(hslToRgb({ h: hue, s: sat, l: light })),
    [hue, sat, light]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Color Wheel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="relative mx-auto h-56 w-56 rounded-full border border-border/50"
            style={{
              background:
                "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
            }}
            role="img"
            aria-label="Color wheel"
          >
            <div
              className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg"
              style={{ backgroundColor: hex }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hue: {hue}°</Label>
            <Slider min={0} max={360} value={[hue]} onValueChange={([n]) => setHue(n)} />
          </div>
          <div className="space-y-1.5">
            <Label>Saturation: {sat}%</Label>
            <Slider min={0} max={100} value={[sat]} onValueChange={([n]) => setSat(n)} />
          </div>
          <div className="space-y-1.5">
            <Label>Lightness: {light}%</Label>
            <Slider min={0} max={100} value={[light]} onValueChange={([n]) => setLight(n)} />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <ColorSwatch hex={hex} name="Selected" size="lg" />
        <Input readOnly value={hex} aria-label="Selected HEX" />
      </div>
    </div>
  );
}
