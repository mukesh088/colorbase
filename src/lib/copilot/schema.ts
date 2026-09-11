import { z } from "zod";
import { COLOR_ROLES, type CopilotIntent } from "@/lib/copilot/types";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";

const roleSchema = z.enum(COLOR_ROLES);

const operationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("desaturate"), amount: z.number().min(0).max(1).optional() }),
  z.object({ type: z.literal("saturate"), amount: z.number().min(0).max(1).optional() }),
  z.object({ type: z.literal("warmer") }),
  z.object({ type: z.literal("cooler") }),
  z.object({ type: z.literal("increaseContrast") }),
  z.object({ type: z.literal("setHueFamily"), family: z.string() }),
  z.object({ type: z.literal("setAccentHue"), hue: z.number() }),
  z.object({ type: z.literal("darkMode") }),
  z.object({ type: z.literal("lightMode") }),
  z.object({ type: z.literal("keepPrimary") }),
]);

export const copilotIntentSchema = z.object({
  industry: z.string().default("general"),
  style: z.string().default("professional"),
  product: z.string().default("web app"),
  mood: z.string().default("trustworthy"),
  theme: z.enum(["light", "dark"]).default("light"),
  accessibility: z.enum(["AA", "AAA"]).default("AA"),
  primaryHue: z.number().min(0).max(360).optional(),
  secondaryHue: z.number().min(0).max(360).optional(),
  accentHue: z.number().min(0).max(360).optional(),
  seedPrimary: z.string().optional(),
  seedSecondary: z.string().optional(),
  seedAccent: z.string().optional(),
  existingColors: z.array(z.string()).default([]),
  lockedRoles: z.array(roleSchema).default([]),
  operations: z.array(operationSchema).default([]),
  query: z.string().optional(),
  count: z.number().int().min(1).max(12).optional(),
  explanation: z.string().optional(),
});

export const copilotRequestSchema = z.object({
  action: z.enum(["generate", "refine", "review", "search"]),
  prompt: z.string().min(1).max(4000),
  lockedRoles: z.array(roleSchema).optional(),
  currentTheme: z.enum(["light", "dark"]).optional(),
  history: z.array(z.string()).max(12).optional(),
  currentTokens: z
    .array(
      z.object({
        role: roleSchema,
        hex: z.string(),
        locked: z.boolean().optional(),
      })
    )
    .optional(),
});

export type CopilotRequest = z.infer<typeof copilotRequestSchema>;

function cleanHex(value?: string) {
  if (!value || !isValidHex(value)) return undefined;
  return normalizeHex(value);
}

export function parseIntentJson(raw: unknown): CopilotIntent & { explanation?: string } {
  const parsed = copilotIntentSchema.safeParse(raw);
  const data = parsed.success ? parsed.data : copilotIntentSchema.parse({});
  return {
    industry: data.industry,
    style: data.style,
    product: data.product,
    mood: data.mood,
    theme: data.theme,
    accessibility: data.accessibility,
    primaryHue: data.primaryHue,
    secondaryHue: data.secondaryHue,
    accentHue: data.accentHue,
    seedPrimary: cleanHex(data.seedPrimary),
    seedSecondary: cleanHex(data.seedSecondary),
    seedAccent: cleanHex(data.seedAccent),
    existingColors: data.existingColors.map(cleanHex).filter((x): x is string => Boolean(x)),
    lockedRoles: data.lockedRoles,
    operations: data.operations,
    query: data.query,
    count: data.count,
    explanation: data.explanation,
  };
}
