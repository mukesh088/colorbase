import type { Metadata } from "next";
import { DesignSystemKit, designSystemMetadata } from "@/components/library/design-system-kit";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return designSystemMetadata("css");
}

export default function CssNamedColorsLibraryPage() {
  return <DesignSystemKit slug="css" />;
}
