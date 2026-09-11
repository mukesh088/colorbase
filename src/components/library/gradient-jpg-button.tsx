"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadGradientJpg } from "@/lib/gradients/download-jpg";
import type { LibraryGradient } from "@/lib/data/gradient-library";

export function GradientJpgButton({ gradient }: { gradient: LibraryGradient }) {
  return (
    <Button
      type="button"
      onClick={() => {
        downloadGradientJpg(gradient);
        toast.success("JPG downloaded");
      }}
    >
      <Download />
      Download JPG
    </Button>
  );
}
