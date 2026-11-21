import { permanentRedirect } from "next/navigation";

/** Duplicate of /palette-generator; next.config.js 308s here first. */
export default function Page() {
  permanentRedirect("/palette-generator");
}
