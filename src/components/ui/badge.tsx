import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "text-foreground",
  soft: "border-transparent bg-[var(--primary-soft)] text-primary",
  ai: "border-transparent bg-[var(--primary-soft)] text-primary",
  pro: "border-transparent bg-[var(--brand-soft)] text-[var(--brand)]",
  new: "border-transparent bg-[var(--primary-soft)] text-primary",
  popular: "border-transparent bg-[var(--brand-soft)] text-[var(--brand)]",
  beta: "border-transparent bg-muted text-muted-foreground",
  success: "border-transparent bg-[color-mix(in_oklab,var(--success)_16%,transparent)] text-[var(--success)]",
} as const;

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
