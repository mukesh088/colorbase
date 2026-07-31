"use client";

import dynamic from "next/dynamic";

const AdvancedImageColorTools = dynamic(
  () => import("@/components/tools/advanced-image-tools").then((m) => m.AdvancedImageColorTools),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground">Loading image tools…</p> }
);

export function ImageToolsClient() {
  return <AdvancedImageColorTools />;
}
