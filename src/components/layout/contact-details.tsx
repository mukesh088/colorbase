import { SUPPORT_EMAIL, formatBusinessAddress } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function ContactDetails({ className }: { className?: string }) {
  const address = formatBusinessAddress();
  return (
    <address
      className={cn("not-italic text-sm leading-relaxed text-muted-foreground", className)}
    >
      <p>
        Email:{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </p>
      <p className="mt-1">Address: {address}</p>
      <p className="mt-1">Queries are received in this mailbox and answered by email.</p>
    </address>
  );
}
