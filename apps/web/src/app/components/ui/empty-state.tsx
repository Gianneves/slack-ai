import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/app/utils/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 text-center",
        compact ? "py-6" : "py-12",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-panel bg-surface-subtle text-fg-muted">
        <Icon size={24} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-title font-black text-fg">{title}</p>
        {description ? <p className="text-small text-fg-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
