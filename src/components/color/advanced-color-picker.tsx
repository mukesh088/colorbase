"use client";

import { ColorWorkbench } from "@/components/color/color-workbench";

export function AdvancedColorPicker({
  initialColor,
  className,
}: {
  initialColor?: string;
  className?: string;
}) {
  return <ColorWorkbench initialColor={initialColor} className={className} />;
}
