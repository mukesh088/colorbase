import { ROOM_LABELS, STYLE_LABELS, type InteriorRoomType, type InteriorStyle, type InteriorSwatch } from "@/lib/interior/catalog";

export function fallbackTitle(room: InteriorRoomType, style: InteriorStyle, swatches: InteriorSwatch[]) {
  const lead = swatches[0]?.name ?? "Neutral";
  return `${STYLE_LABELS[style]} ${ROOM_LABELS[room].toLowerCase()} — ${lead.toLowerCase()} palette`;
}

export function fallbackDescription(room: InteriorRoomType, style: InteriorStyle, swatches: InteriorSwatch[]) {
  const names = swatches
    .slice(0, 4)
    .map((s) => `${s.name} (${s.hex})`)
    .join(", ");
  return `A ${STYLE_LABELS[style].toLowerCase()} ${ROOM_LABELS[room].toLowerCase()} palette sampled from the photo. Dominant notes: ${names}. HEX values are averaged from pixels in the image, not invented.`;
}

export function fallbackUsage(swatches: InteriorSwatch[]) {
  const wall = swatches.find((s) => s.suggestedRole === "wall/base");
  const accent = swatches.find((s) => s.suggestedRole === "accent");
  const dark = swatches.find((s) => s.suggestedRole === "dark contrast");
  const parts = [
    wall ? `Use ${wall.hex} on large planes (suggested wall/base).` : "Keep the largest share as the wall or sofa field.",
    accent ? `Reserve ${accent.hex} for textiles or a single architectural accent.` : "Pick the most saturated swatch for small accents only.",
    dark ? `${dark.hex} reads as a suggested dark contrast for frames, iron, or window bars.` : "A deep swatch grounds trim and metal.",
    "Roles are suggestions from share, lightness, and saturation — confirm on site with paint samples.",
  ];
  return parts.join(" ");
}

export async function suggestInteriorCopy(input: {
  roomType: InteriorRoomType;
  style: InteriorStyle;
  swatches: InteriorSwatch[];
}): Promise<{ title: string; description: string; usageNotes: string; usedAi: boolean }> {
  const fallback = {
    title: fallbackTitle(input.roomType, input.style, input.swatches),
    description: fallbackDescription(input.roomType, input.style, input.swatches),
    usageNotes: fallbackUsage(input.swatches),
    usedAi: false,
  };
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return fallback;
  try {
    const { completeCopilotJson, parseModelJson } = await import("@/lib/copilot/provider");
    const hexList = input.swatches.map((s) => `${s.name} ${s.hex}`).join(", ");
    const raw = await completeCopilotJson(
      "interior-copy",
      `Write JSON keys title, description, usageNotes for a ${input.style} ${input.roomType} palette.`,
      `Do not change or invent HEX. Palette: ${hexList}. Title ≤ 80 chars. Description 2 sentences. usageNotes 3 short practical sentences. No brand names.`
    );
    const parsed = parseModelJson(raw) as {
      title?: unknown;
      description?: unknown;
      usageNotes?: unknown;
    };
    const title = typeof parsed.title === "string" ? parsed.title.trim().slice(0, 120) : "";
    const description =
      typeof parsed.description === "string" ? parsed.description.trim().slice(0, 4000) : "";
    const usageNotes =
      typeof parsed.usageNotes === "string" ? parsed.usageNotes.trim().slice(0, 4000) : "";
    if (title.length >= 3 && description.length >= 20) {
      return {
        title,
        description,
        usageNotes: usageNotes || fallback.usageNotes,
        usedAi: true,
      };
    }
  } catch {
    // keep fallback
  }
  return fallback;
}
