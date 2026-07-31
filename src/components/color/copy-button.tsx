"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "icon" | "lg";
}

export function CopyButton({
  value,
  label,
  className,
  variant = "outline",
  size = "sm",
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label={label ? `Copy ${label}` : `Copy ${value}`}
      onClick={async () => {
        const ok = await copy(value);
        if (ok) toast.success(label ? `${label} copied` : "Copied to clipboard");
        else toast.error("Failed to copy");
      }}
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {size !== "icon" && <span>{copied ? "Copied" : label ?? "Copy"}</span>}
    </Button>
  );
}
