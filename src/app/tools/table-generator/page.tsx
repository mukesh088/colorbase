import { redirect } from "next/navigation";

/** Canonical tool lives at /table-generator */
export default function ToolsTableGeneratorRedirect() {
  redirect("/table-generator");
}
