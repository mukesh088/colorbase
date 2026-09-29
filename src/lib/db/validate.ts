import { z } from "zod";
import { LIMITS } from "./limits";

export const favoriteKindSchema = z.enum(["color", "table", "palette"]);

export const favoriteWriteSchema = z.object({
  kind: favoriteKindSchema,
  value: z.string().trim().min(1).max(128),
});

export const favoriteBulkSchema = z.object({
  items: z.array(favoriteWriteSchema).min(1).max(LIMITS.favorites),
});

export const preferencesSchema = z.object({
  theme: z.string().trim().max(32).nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

const hexColor = z
  .string()
  .trim()
  .regex(/^#?[0-9A-Fa-f]{6}$/)
  .transform((v) => (v.startsWith("#") ? v.toLowerCase() : `#${v.toLowerCase()}`));

export const paletteWriteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  colors: z.array(hexColor).min(1).max(LIMITS.paletteColors),
});

export const recentWriteSchema = z.object({
  hex: hexColor,
});

export const tableWriteSchema = z.object({
  id: z.string().trim().min(4).max(80),
  name: z.string().trim().min(1).max(120),
  payload: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    rows: z.array(z.array(z.unknown())).max(LIMITS.tableRows),
    colWidths: z.array(z.number()).optional(),
    rowHeights: z.array(z.number()).optional(),
    hasHeader: z.boolean().optional(),
    freezeHeader: z.boolean().optional(),
    stickyFirstColumn: z.boolean().optional(),
    style: z.record(z.unknown()).optional(),
    updatedAt: z.number().optional(),
    favorite: z.boolean().optional(),
  }),
});
