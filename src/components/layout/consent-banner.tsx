"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readConsent, saveConsent, type ConsentChoice } from "@/components/analytics/consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 p-3 shadow-lg backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:rounded-xl sm:border"
    >
      <p className="text-sm text-muted-foreground">
        We use cookies for analytics and ads (Google Analytics and AdSense). Choose whether to allow
        them.{" "}
        <Link href="/cookies" className="underline underline-offset-2">
          Cookie policy
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
