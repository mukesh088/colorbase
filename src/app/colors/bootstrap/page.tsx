import type { Metadata } from "next";
import { DesignSystemKit, designSystemMetadata } from "@/components/library/design-system-kit";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return designSystemMetadata("bootstrap");
}

export default function BootstrapColorsPage() {
  return <DesignSystemKit slug="bootstrap" />;
}
