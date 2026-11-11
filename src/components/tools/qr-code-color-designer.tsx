"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { getContrastRatio } from "@/lib/colors/convert";
import "./flagship-tools.css";

export function QrCodeColorDesigner() {
  const [text, setText] = useState("https://colorbase.in");
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const [ec, setEc] = useState<"L" | "M" | "Q" | "H">("M");
  const [quiet, setQuiet] = useState(2);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svg, setSvg] = useState("");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ratio = getContrastRatio(fg, bg);
  const risky = ratio < 3;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const url = await QRCode.toDataURL(text || " ", {
          errorCorrectionLevel: ec,
          margin: quiet,
          color: { dark: fg, light: bg },
          width: 320,
        });
        const markup = await QRCode.toString(text || " ", {
          type: "svg",
          errorCorrectionLevel: ec,
          margin: quiet,
          color: { dark: fg, light: bg },
        });
        if (cancelled) return;
        setDataUrl(url);
        setSvg(markup);

        const jsQR = (await import("jsqr")).default;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(image.data, image.width, image.height);
          setDecoded(code?.data ?? null);
        };
        img.src = url;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "QR generation failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, fg, bg, ec, quiet]);

  return (
    <div className="flagship-tool">
      <div className="flagship-split">
        <div className="flagship-panel space-y-3">
          <h2 className="text-lg font-semibold">QR content & colors</h2>
          <textarea
            className="flagship-textarea min-h-[100px]"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1200))}
            aria-label="QR payload"
          />
          <div className="flagship-row">
            <label className="text-sm">
              Foreground
              <input type="color" className="ml-2" value={fg} onChange={(e) => setFg(e.target.value)} />
            </label>
            <label className="text-sm">
              Background
              <input type="color" className="ml-2" value={bg} onChange={(e) => setBg(e.target.value)} />
            </label>
            <label className="text-sm">
              ECC
              <select
                className="flagship-select ml-2 w-auto"
                value={ec}
                onChange={(e) => setEc(e.target.value as typeof ec)}
              >
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flagship-muted block text-xs">
            Quiet zone ({quiet})
            <input
              type="range"
              min={0}
              max={8}
              value={quiet}
              onChange={(e) => setQuiet(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          {risky ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Contrast {ratio.toFixed(2)}:1 may be hard to scan. Prefer darker modules on a light field.
            </p>
          ) : (
            <p className="flagship-muted">Module contrast ≈ {ratio.toFixed(2)}:1</p>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <div className="flagship-panel space-y-3">
          <h3 className="font-semibold">Preview & validation</h3>
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Generated QR code" className="mx-auto rounded-lg border bg-white p-3" />
          ) : null}
          <p className="flagship-muted text-xs">
            Decoder check: {decoded ? `OK — “${decoded.slice(0, 80)}”` : "Could not decode in-browser"}
          </p>
          <div className="flagship-actions">
            <Button
              variant="outline"
              onClick={() => {
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = "colorbase-qr.png";
                a.click();
              }}
            >
              PNG
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([svg], { type: "image/svg+xml" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "colorbase-qr.svg";
                a.click();
              }}
            >
              SVG
            </Button>
            <CopyButton value={svg} label="Copy SVG" />
          </div>
          <p className="flagship-muted">
            Machine decode here does not guarantee every phone camera or print. Check contrast in the{" "}
            <Link className="text-primary underline" href="/contrast-checker">
              contrast checker
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
