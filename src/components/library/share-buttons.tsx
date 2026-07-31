"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/utils";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  // Always use the same absolute URL on server and client to avoid hydration drift
  const url = absoluteUrl(path);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          const shareUrl =
            typeof window !== "undefined" ? `${window.location.origin}${path}` : url;
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied");
        }}
      >
        Copy link
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          const shareUrl =
            typeof window !== "undefined" ? `${window.location.origin}${path}` : url;
          if (navigator.share) {
            await navigator.share({ title, url: shareUrl });
          } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied");
          }
        }}
      >
        Share
      </Button>
    </div>
  );
}
