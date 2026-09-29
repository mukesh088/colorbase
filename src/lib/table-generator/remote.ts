import type { TableDocument } from "@/lib/table-generator/types";
import { apiFetch } from "@/lib/client/user-data";
import { canPersistDoc, slimSavedDocs } from "@/lib/table-generator/storage";

export async function pushTable(doc: TableDocument) {
  if (!canPersistDoc(doc)) return;
  await apiFetch("/api/me/tables", {
    method: "POST",
    body: JSON.stringify({
      id: doc.id,
      name: doc.name.slice(0, 120) || "Untitled table",
      payload: doc,
    }),
  });
}

export async function pushTableFavorite(id: string, on: boolean) {
  if (on) {
    await apiFetch("/api/me/favorites", {
      method: "POST",
      body: JSON.stringify({ kind: "table", value: id }),
    });
    return;
  }
  await apiFetch(`/api/me/favorites?kind=table&value=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function syncTables(
  getSaved: () => TableDocument[],
  setSaved: (docs: TableDocument[]) => void
) {
  const list = await apiFetch<{ items: { id: string }[] }>("/api/me/tables?limit=8");
  if (!list) return;
  const local = getSaved();
  const localIds = new Set(local.map((d) => d.id));
  const merged = [...local];

  for (const item of list.items) {
    if (localIds.has(item.id)) continue;
    const detail = await apiFetch<{ payload: TableDocument }>(
      `/api/me/tables/${encodeURIComponent(item.id)}`
    );
    if (detail?.payload?.rows) {
      merged.push(detail.payload);
      localIds.add(item.id);
    }
  }

  setSaved(slimSavedDocs(merged));

  for (const doc of local.slice(0, 8)) {
    if (!list.items.some((i) => i.id === doc.id) && canPersistDoc(doc)) {
      await pushTable(doc);
    }
  }
}
