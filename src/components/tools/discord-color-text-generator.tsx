"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/color/copy-button";
import {
  ANSI_BACKGROUND_COLORS,
  ANSI_TEXT_COLORS,
  DISCORD_ANSI_SOURCE,
  buildDiscordAnsi,
  visibleAnsi,
  type AnsiSegment,
} from "@/lib/discord-ansi";

const START: AnsiSegment[] = [
  { text: "Welcome ", fg: 34, bold: true },
  { text: "to the ", fg: 37 },
  { text: "server", fg: 32, underline: true },
  { text: "!", fg: 31 },
];

function previewStyle(seg: AnsiSegment): React.CSSProperties {
  return {
    color: ANSI_TEXT_COLORS.find((c) => c.code === seg.fg)?.preview ?? "#b9bbbe",
    background: ANSI_BACKGROUND_COLORS.find((c) => c.code === seg.bg)?.preview,
    fontWeight: seg.bold ? 700 : 400,
    textDecoration: seg.underline ? "underline" : undefined,
  };
}

export function DiscordColorTextGenerator() {
  const [segments, setSegments] = useState<AnsiSegment[]>(START);
  const [active, setActive] = useState(0);
  const output = useMemo(() => buildDiscordAnsi(segments), [segments]);
  const seg = segments[active] ?? segments[0];

  const update = (patch: Partial<AnsiSegment>) =>
    setSegments((list) => list.map((s, i) => (i === active ? { ...s, ...patch } : s)));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Text segments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="flex flex-wrap gap-2">
            {segments.map((s, i) => (
              <li key={i}>
                <Button type="button" size="sm" variant={i === active ? "default" : "outline"} onClick={() => setActive(i)}>
                  {i + 1}. {s.text.trim().slice(0, 14) || "(empty)"}
                </Button>
              </li>
            ))}
            <li>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSegments((list) => [...list, { text: " more text", fg: 37 }]);
                  setActive(segments.length);
                }}
              >
                + Add segment
              </Button>
            </li>
          </ol>
          {seg && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="ansi-text">Text for segment {active + 1}</Label>
                <Input id="ansi-text" value={seg.text} onChange={(e) => update({ text: e.target.value })} />
              </div>
              <fieldset>
                <legend className="text-sm font-medium">Text color</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Button type="button" size="sm" variant={!seg.fg ? "default" : "outline"} onClick={() => update({ fg: undefined })}>
                    Default
                  </Button>
                  {ANSI_TEXT_COLORS.map((c) => (
                    <Button key={c.code} type="button" size="sm" variant={seg.fg === c.code ? "default" : "outline"} onClick={() => update({ fg: c.code })}>
                      <span aria-hidden className="mr-1 inline-block h-3 w-3 rounded-sm border" style={{ background: c.preview }} />
                      {c.name} ({c.code})
                    </Button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium">Background</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Button type="button" size="sm" variant={!seg.bg ? "default" : "outline"} onClick={() => update({ bg: undefined })}>
                    None
                  </Button>
                  {ANSI_BACKGROUND_COLORS.map((c) => (
                    <Button key={c.code} type="button" size="sm" variant={seg.bg === c.code ? "default" : "outline"} onClick={() => update({ bg: c.code })}>
                      <span aria-hidden className="mr-1 inline-block h-3 w-3 rounded-sm border" style={{ background: c.preview }} />
                      {c.name} ({c.code})
                    </Button>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={seg.bold ? "default" : "outline"} onClick={() => update({ bold: !seg.bold })}>
                  Bold (1)
                </Button>
                <Button type="button" size="sm" variant={seg.underline ? "default" : "outline"} onClick={() => update({ underline: !seg.underline })}>
                  Underline (4)
                </Button>
                {segments.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSegments((list) => list.filter((_, i) => i !== active));
                      setActive(0);
                    }}
                  >
                    Remove segment
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg p-4 font-mono text-sm" style={{ background: "#2f3136" }}>
              {segments.map((s, i) => (
                <span key={i} style={previewStyle(s)}>
                  {s.text}
                </span>
              ))}
            </pre>
            <p className="text-muted-foreground mt-2 text-xs">
              Approximate Discord desktop colors from the{" "}
              <a href={DISCORD_ANSI_SOURCE} className="underline underline-offset-4" rel="noreferrer" target="_blank">
                community ANSI reference
              </a>
              . Mobile apps show plain text.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Message to paste</CardTitle>
            <CopyButton value={output} label="Copy for Discord" />
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/50 overflow-x-auto rounded-lg p-3 text-xs">{visibleAnsi(output)}</pre>
            <p className="text-muted-foreground mt-2 text-xs">The copied text contains real escape characters; \u001b is shown here so you can read it.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
