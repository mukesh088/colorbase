import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "colorBase";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #120810 0%, #4c0519 50%, #831843 100%)",
          padding: "64px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #e11d48, #c026d3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            cB
          </div>
          <div style={{ fontSize: 28, opacity: 0.95 }}>colorBase</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 920 }}>
          {title}
        </div>
        <div style={{ fontSize: 24, opacity: 0.8 }}>colorbase.in · Free color tools</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
