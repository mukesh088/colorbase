export const INTERIOR_ROOM_TYPES = [
  "living-room",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining-room",
  "home-office",
  "hallway",
  "exterior",
  "nursery",
  "other",
] as const;

export const INTERIOR_STYLES = [
  "modern",
  "scandinavian",
  "minimal",
  "traditional",
  "industrial",
  "coastal",
  "bohemian",
  "farmhouse",
  "mid-century",
  "eclectic",
] as const;

export type InteriorRoomType = (typeof INTERIOR_ROOM_TYPES)[number];
export type InteriorStyle = (typeof INTERIOR_STYLES)[number];

export const ROOM_LABELS: Record<InteriorRoomType, string> = {
  "living-room": "Living room",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  "dining-room": "Dining room",
  "home-office": "Home office",
  hallway: "Hallway",
  exterior: "Exterior",
  nursery: "Nursery",
  other: "Other",
};

export const STYLE_LABELS: Record<InteriorStyle, string> = {
  modern: "Modern",
  scandinavian: "Scandinavian",
  minimal: "Minimal",
  traditional: "Traditional",
  industrial: "Industrial",
  coastal: "Coastal",
  bohemian: "Bohemian",
  farmhouse: "Farmhouse",
  "mid-century": "Mid-century",
  eclectic: "Eclectic",
};

export const SUGGESTED_ROLES = ["wall/base", "secondary", "accent", "dark contrast"] as const;
export type SuggestedRole = (typeof SUGGESTED_ROLES)[number];

export const MAX_INTERIOR_UPLOAD_BYTES = 4 * 1024 * 1024;
export const INTERIOR_SWATCH_MIN = 5;
export const INTERIOR_SWATCH_MAX = 8;

export type InteriorSwatch = {
  hex: string;
  name: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  share: number;
  suggestedRole: SuggestedRole;
};

export function isRoomType(value: string): value is InteriorRoomType {
  return (INTERIOR_ROOM_TYPES as readonly string[]).includes(value);
}

export function isStyle(value: string): value is InteriorStyle {
  return (INTERIOR_STYLES as readonly string[]).includes(value);
}
