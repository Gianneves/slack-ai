import type { ComponentProps } from "react";
import { cn } from "@/app/utils/cn";

type InputProps = ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-9 w-full rounded-control border border-border-strong bg-surface px-3 text-body text-fg placeholder:text-fg-muted",
        "transition-colors duration-100",
        "focus-visible:border-focus focus-visible:outline-hidden! focus-visible:ring-4 focus-visible:ring-focus/30",
        "aria-[invalid=true]:border-danger focus-visible:aria-[invalid=true]:ring-danger/25",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
