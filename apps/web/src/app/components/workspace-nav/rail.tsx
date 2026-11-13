import { Bell, Home, MessageSquare, MoreHorizontal } from "lucide-react";

const RAIL_ITEMS = [
  { name: "home", icon: Home, isActive: true },
  { name: "direct-messages", icon: MessageSquare, isActive: false },
  { name: "activity", icon: Bell, isActive: false },
  { name: "more", icon: MoreHorizontal, isActive: false },
] as const;

export function Rail() {
  return (
    <nav
      aria-label="Seções do workspace"
      className="flex w-rail shrink-0 flex-col items-center gap-2 bg-chrome py-3"
    >
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-item bg-primary text-micro font-black text-on-primary"
      >
        FC
      </span>
      {RAIL_ITEMS.map(({ name, icon: Icon, isActive }) => (
        <span
          key={name}
          aria-hidden
          className={
            isActive
              ? "flex size-9 items-center justify-center rounded-item bg-sidebar-active text-sidebar-on-active"
              : "flex size-9 items-center justify-center rounded-item text-sidebar-fg"
          }
        >
          <Icon size={18} aria-hidden />
        </span>
      ))}
    </nav>
  );
}
