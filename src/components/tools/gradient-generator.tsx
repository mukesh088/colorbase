"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/color/copy-button";
import type { GradientStop, GradientType } from "@/types/color";

export function GradientGenerator({
  defaultType = "linear",
}: {
  defaultType?: GradientType;
}) {
  const [type, setType] = useState<GradientType>(defaultType);
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: "#0ea5e9", position: 0 },
    { color: "#14b8a6", position: 100 },
  ]);

  const css = useMemo(() => {
    const stopCss = stops
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopCss})`;
    if (type === "radial") return `radial-gradient(circle at center, ${stopCss})`;
    return `conic-gradient(from ${angle}deg at center, ${stopCss})`;
  }, [type, angle, stops]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as GradientType)}>
              <SelectTrigger aria-label="Gradient type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
                <SelectItem value="conic">Conic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(type === "linear" || type === "conic") && (
            <div className="space-y-1.5">
              <Label>Angle: {angle}°</Label>
              <Slider min={0} max={360} value={[angle]} onValueChange={([n]) => setAngle(n)} />
            </div>
          )}
          <div className="space-y-3">
            {stops.map((stop, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-2">
                <Input
                  type="color"
                  value={stop.color}
                  aria-label={`Stop ${i + 1} color`}
                  className="h-10 w-12 p-1"
                  onChange={(e) => {
                    const next = [...stops];
                    next[i] = { ...stop, color: e.target.value };
                    setStops(next);
                  }}
                />
                <Input
                  value={stop.color}
                  onChange={(e) => {
                    const next = [...stops];
                    next[i] = { ...stop, color: e.target.value };
                    setStops(next);
                  }}
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => {
                    const next = [...stops];
                    next[i] = { ...stop, position: Number(e.target.value) };
                    setStops(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={stops.length <= 2}
                  onClick={() => setStops(stops.filter((_, idx) => idx !== i))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setStops([...stops, { color: "#ffffff", position: 50 }])
              }
            >
              Add stop
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="h-56 rounded-2xl border border-border/50"
            style={{ background: css }}
            role="img"
            aria-label="Gradient preview"
          />
          <div className="space-y-1.5">
            <Label>CSS</Label>
            <div className="flex gap-2">
              <Input readOnly value={`background: ${css};`} />
              <CopyButton value={`background: ${css};`} label="CSS" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
