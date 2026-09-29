export type FavoriteKind = "color" | "table" | "palette";

export type UserRow = {
  id: string;
  created_at: Date;
  last_seen_at: Date;
};

export type FavoriteRow = {
  kind: FavoriteKind;
  value: string;
  created_at: Date;
};

export type PaletteListRow = {
  id: string;
  name: string;
  updated_at: Date;
};

export type TableListRow = {
  id: string;
  name: string;
  row_count: number;
  byte_size: number;
  updated_at: Date;
};
