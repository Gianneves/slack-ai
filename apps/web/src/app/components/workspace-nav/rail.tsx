import { Bell, Home, MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/app/utils/cn";

const RAIL_ITEMS = [
  { id: "home", label: "Início", icon: Home, isActive: true },
  { id: "direct-messages", label: "DMs", icon: MessageSquare, isActive: false },
  { id: "activity", label: "Atividade", icon: Bell, isActive: false },
  { id: "more", label: "Mais", icon: MoreHorizontal, isActive: false },
] as const;

const ROW_CLASS =
  "flex w-full flex-col items-center gap-0.5 rounded-item py-1 text-micro";

export function Rail() {
  return (
    <nav
      aria-label="Seções do workspace"
      className="flex w-rail shrink-0 flex-col items-center gap-1 bg-chrome px-1.5 py-3"
    >
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-item bg-primary font-black text-on-primary"
      >
        FC
      </span>
      {RAIL_ITEMS.map(({ id, label, icon: Icon, isActive }) => (
        <span
          key={id}
          className={cn(
            ROW_CLASS,
            isActive
              ? "bg-sidebar-active text-sidebar-on-active"
              : "text-sidebar-fg",
          )}
        >
          <Icon size={18} aria-hidden />
          <span>{label}</span>
        </span>
      ))}
    </nav>
  );
}
