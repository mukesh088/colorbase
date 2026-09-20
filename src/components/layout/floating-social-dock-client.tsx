"use client";

import dynamic from "next/dynamic";

const FloatingSocialDockLazy = dynamic(
  () =>
    import("@/components/layout/floating-social-dock").then((m) => ({
      default: m.FloatingSocialDock,
    })),
  { ssr: false },
);

export function FloatingSocialDockClient() {
  return <FloatingSocialDockLazy />;
}
