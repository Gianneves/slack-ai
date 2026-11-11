import { LoaderCircle } from "lucide-react";
import { cn } from "@/app/utils/cn";

type SpinnerSize = "sm" | "md";

const SPINNER_SIZES: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
};

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
};

export function Spinner({ size = "sm", className }: SpinnerProps) {
  return (
    <LoaderCircle
      aria-hidden
      size={SPINNER_SIZES[size]}
      className={cn("animate-spin", className)}
    />
  );
}
