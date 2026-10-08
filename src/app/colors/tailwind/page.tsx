import type { Metadata } from "next";
import { DesignSystemKit, designSystemMetadata } from "@/components/library/design-system-kit";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return designSystemMetadata("tailwind");
}

export default function TailwindColorsPage() {
  return <DesignSystemKit slug="tailwind" />;
}
