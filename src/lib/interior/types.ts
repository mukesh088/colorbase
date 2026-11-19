import type { InteriorRoomType, InteriorStyle, InteriorSwatch } from "@/lib/interior/catalog";

export type InteriorStatus = "draft" | "published";

export type InteriorPaletteRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  roomType: InteriorRoomType;
  style: InteriorStyle;
  altText: string;
  usageNotes: string;
  status: InteriorStatus;
  colors: InteriorSwatch[];
  imageMime: string;
  imageWidth: number;
  imageHeight: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
