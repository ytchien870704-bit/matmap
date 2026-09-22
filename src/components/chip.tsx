import { cn } from "@/lib/utils";

export function Chip({
  selected,
  muted,
  children,
  onClick,
  className,
}: {
  selected?: boolean;
  muted?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-sm border px-3.5 text-sm transition-colors duration-150",
        selected
          ? "border-primary bg-primary text-primary-fg"
          : muted
            ? "border-border/70 bg-transparent text-muted"
            : "border-border bg-surface text-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}
