export function ogCard(swatches: string[], title: string, subtitle: string) {
  const colors = (swatches.length > 0 ? swatches : ["#e11d48"]).slice(0, 6);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0c0a09",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ width: 460, height: "100%", display: "flex" }}>
        {colors.map((hex) => (
          <div key={hex} style={{ flex: 1, height: "100%", background: hex }} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "56px 48px",
          width: 740,
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 3, color: "#fda4af" }}>COLORBASE</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 18, color: "#e7e5e4" }}>{subtitle}</div>
      </div>
    </div>
  );
}
