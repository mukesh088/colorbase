import { getInteriorById, getInteriorImage } from "@/lib/db/interior";
import { isAdminRequest } from "@/lib/interior/auth";
import { interiorImageUrl } from "@/lib/interior/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const record = await getInteriorById(id);
  if (!record) return new Response("Not found", { status: 404 });
  if (record.status !== "published" && !(await isAdminRequest(request))) {
    return new Response("Not found", { status: 404 });
  }
  if (record.status === "published") {
    return Response.redirect(new URL(interiorImageUrl(record), request.url), 302);
  }
  const row = await getInteriorImage(id);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.image_bytes), {
    headers: {
      "Content-Type": row.image_mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
