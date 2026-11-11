import { cn } from "@/app/utils/cn";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const AVATAR_SIZES: Record<AvatarSize, string> = {
  xs: "size-5 text-micro",
  sm: "size-6 text-micro",
  md: "size-9 text-small",
  lg: "size-12 text-title",
  xl: "size-24 text-display",
};

const AVATAR_RADII: Record<AvatarSize, string> = {
  xs: "rounded-item",
  sm: "rounded-item",
  md: "rounded-item",
  lg: "rounded-card",
  xl: "rounded-panel",
};

const AVATAR_COLORS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
];

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";

  return `${first}${last}`.toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % AVATAR_COLORS.length;
  }

  return hash;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-black text-on-primary",
        AVATAR_SIZES[size],
        AVATAR_RADII[size],
        AVATAR_COLORS[getColorIndex(name)],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
