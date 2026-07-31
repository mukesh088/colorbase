"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/color/copy-button";

type CssTool =
  | "box-shadow"
  | "glass"
  | "neomorphism"
  | "button"
  | "radius"
  | "clip"
  | "transform"
  | "animation"
  | "css-color";

export function CssGeneratorTool({ tool }: { tool: CssTool }) {
  const [color, setColor] = useState("#0ea5e9");
  const [x, setX] = useState(8);
  const [y, setY] = useState(8);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(40);
  const [radius, setRadius] = useState(16);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(100);

  const css = useMemo(() => {
    switch (tool) {
      case "box-shadow":
        return `box-shadow: ${x}px ${y}px ${blur}px ${spread}px rgba(0,0,0,${opacity / 100});`;
      case "glass":
        return `background: rgba(255,255,255,${opacity / 100});\nbackdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255,255,255,0.3);\nborder-radius: ${radius}px;`;
      case "neomorphism":
        return `background: #e0e5ec;\nborder-radius: ${radius}px;\nbox-shadow: ${x}px ${y}px ${blur}px #a3b1c6, -${x}px -${y}px ${blur}px #ffffff;`;
      case "button":
        return `.btn {\n  background: ${color};\n  color: white;\n  border: none;\n  border-radius: ${radius}px;\n  padding: 12px 24px;\n  box-shadow: 0 ${y}px ${blur}px rgba(0,0,0,${opacity / 100});\n}`;
      case "radius":
        return `border-radius: ${radius}px;`;
      case "clip":
        return `clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);`;
      case "transform":
        return `transform: rotate(${rotate}deg) scale(${scale / 100});`;
      case "animation":
        return `@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.05); }\n}\n.animated {\n  animation: pulse 2s ease-in-out infinite;\n}`;
      case "css-color":
        return `:root {\n  --brand: ${color};\n  --brand-soft: color-mix(in srgb, ${color} 20%, white);\n}`;
      default:
        return "";
    }
  }, [tool, color, x, y, blur, spread, opacity, radius, rotate, scale]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tool === "button" || tool === "css-color") && (
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20 p-1" />
            </div>
          )}
          {["box-shadow", "neomorphism", "button"].includes(tool) && (
            <>
              <div className="space-y-1.5"><Label>Offset X: {x}px</Label><Slider min={-40} max={40} value={[x]} onValueChange={([n]) => setX(n)} /></div>
              <div className="space-y-1.5"><Label>Offset Y: {y}px</Label><Slider min={-40} max={40} value={[y]} onValueChange={([n]) => setY(n)} /></div>
            </>
          )}
          {["box-shadow", "glass", "neomorphism", "button"].includes(tool) && (
            <div className="space-y-1.5"><Label>Blur: {blur}px</Label><Slider min={0} max={80} value={[blur]} onValueChange={([n]) => setBlur(n)} /></div>
          )}
          {tool === "box-shadow" && (
            <div className="space-y-1.5"><Label>Spread: {spread}px</Label><Slider min={-20} max={40} value={[spread]} onValueChange={([n]) => setSpread(n)} /></div>
          )}
          {["box-shadow", "glass", "button"].includes(tool) && (
            <div className="space-y-1.5"><Label>Opacity: {opacity}%</Label><Slider min={0} max={100} value={[opacity]} onValueChange={([n]) => setOpacity(n)} /></div>
          )}
          {["glass", "neomorphism", "button", "radius"].includes(tool) && (
            <div className="space-y-1.5"><Label>Radius: {radius}px</Label><Slider min={0} max={80} value={[radius]} onValueChange={([n]) => setRadius(n)} /></div>
          )}
          {tool === "transform" && (
            <>
              <div className="space-y-1.5"><Label>Rotate: {rotate}°</Label><Slider min={-180} max={180} value={[rotate]} onValueChange={([n]) => setRotate(n)} /></div>
              <div className="space-y-1.5"><Label>Scale: {scale}%</Label><Slider min={50} max={150} value={[scale]} onValueChange={([n]) => setScale(n)} /></div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex h-48 items-center justify-center rounded-2xl border border-border/50"
            style={{
              background:
                tool === "glass"
                  ? "linear-gradient(135deg,#0ea5e9,#14b8a6)"
                  : tool === "neomorphism"
                    ? "#e0e5ec"
                    : undefined,
            }}
          >
            <div
              className="flex h-24 w-40 items-center justify-center font-medium text-white"
              style={{
                background: tool === "neomorphism" ? "#e0e5ec" : tool === "glass" ? `rgba(255,255,255,${opacity / 100})` : color,
                color: tool === "neomorphism" ? "#333" : undefined,
                borderRadius: radius,
                boxShadow:
                  tool === "box-shadow"
                    ? `${x}px ${y}px ${blur}px ${spread}px rgba(0,0,0,${opacity / 100})`
                    : tool === "neomorphism"
                      ? `${x}px ${y}px ${blur}px #a3b1c6, -${x}px -${y}px ${blur}px #ffffff`
                      : undefined,
                backdropFilter: tool === "glass" ? `blur(${blur}px)` : undefined,
                transform: tool === "transform" ? `rotate(${rotate}deg) scale(${scale / 100})` : undefined,
                clipPath: tool === "clip" ? "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" : undefined,
                animation: tool === "animation" ? "pulse 2s ease-in-out infinite" : undefined,
              }}
            >
              Preview
            </div>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-muted/50 p-4 text-xs">{css}</pre>
          <CopyButton value={css} label="Copy CSS" />
        </CardContent>
      </Card>
    </div>
  );
}
