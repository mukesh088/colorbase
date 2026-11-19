import { redirect } from "next/navigation";
import { InteriorAdmin } from "@/components/interior/interior-admin";
import { isAdminConfigured, isAdminRequest } from "@/lib/interior/auth";
import { listInteriorPalettesAdmin } from "@/lib/db/interior";

export const dynamic = "force-dynamic";

export default async function InteriorPalettesAdminPage() {
  if (!(await isAdminRequest())) redirect("/admin/login");

  if (!isAdminConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-10">
        <h1 className="font-display text-3xl font-semibold">Interior palettes</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Set <code className="font-mono">ADMIN_SECRET</code> in the Hostinger environment, then sign in at
          /admin/login.
        </p>
      </div>
    );
  }

  const items = await listInteriorPalettesAdmin();
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Admin</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Interior color palettes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload a room photo, extract exact HEX values from pixels, edit the page, then publish to
          /interior-colors. Files are stored in <code className="font-mono">public/assets/interior-colors</code>{" "}
          (one optimized image plus compact JSON). No database required.
        </p>
      </header>
      <InteriorAdmin initial={items} />
    </div>
  );
}
