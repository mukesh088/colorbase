import type { Metadata } from "next";
import { DesignSystemKit, designSystemMetadata } from "@/components/library/design-system-kit";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return designSystemMetadata("web-safe");
}

export default function WebSafeColorsPage() {
  return <DesignSystemKit slug="web-safe" />;
}
