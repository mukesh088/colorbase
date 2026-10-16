"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/color/copy-button";
import type { GradientStop, GradientType } from "@/types/color";
import { readHexColor } from "@/lib/colors/tool-links";

export function GradientGenerator({ defaultType = "linear" }: { defaultType?: GradientType }) {
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
    <div className="gradient-tool-layout grid gap-6 lg:grid-cols-2">
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
              <GradientStopRow
                key={i}
                stop={stop}
                index={i}
                canRemove={stops.length > 2}
                onChange={(value) =>
                  setStops(stops.map((entry, index) => (index === i ? value : entry)))
                }
                onRemove={() => setStops(stops.filter((_, index) => index !== i))}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setStops([...stops, { color: "#ffffff", position: 50 }])}
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
            className="border-border/50 h-56 rounded-2xl border"
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

function GradientStopRow({
  stop,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  stop: GradientStop;
  index: number;
  canRemove: boolean;
  onChange: (stop: GradientStop) => void;
  onRemove: () => void;
}) {
  const [color, setColor] = useState(stop.color);
  const [position, setPosition] = useState(String(stop.position));
  const [error, setError] = useState("");
  useEffect(() => {
    setColor(stop.color);
    setPosition(String(stop.position));
    setError("");
  }, [stop.color, stop.position]);
  const applyColor = () => {
    const valid = readHexColor(color);
    if (valid) {
      onChange({ ...stop, color: valid });
      setColor(valid);
      setError("");
    } else setError("Use a 3 or 6 digit HEX color.");
  };
  const applyPosition = () => {
    const value = Number(position);
    if (position.trim() && Number.isFinite(value) && value >= 0 && value <= 100) {
      onChange({ ...stop, position: value });
      setError("");
    } else setError("Position must be between 0% and 100%.");
  };
  return (
    <div className="gradient-stop-row">
      <Input
        type="color"
        aria-label={`Stop ${index + 1} color picker`}
        value={stop.color}
        onChange={(event) => onChange({ ...stop, color: event.target.value })}
      />
      <Input
        aria-label={`Stop ${index + 1} HEX`}
        value={color}
        onChange={(event) => setColor(event.target.value)}
        onBlur={applyColor}
        onKeyDown={(event) => {
          if (event.key === "Enter") applyColor();
        }}
      />
      <Input
        type="number"
        aria-label={`Stop ${index + 1} position`}
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(event.target.value)}
        onBlur={applyPosition}
        onKeyDown={(event) => {
          if (event.key === "Enter") applyPosition();
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove stop ${index + 1}`}
        disabled={!canRemove}
        onClick={onRemove}
      >
        <Trash2 size={13} />
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
