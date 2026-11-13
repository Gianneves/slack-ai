import { ChevronDown, Hash, Search } from "lucide-react";
import { Avatar } from "@/app/components/ui/avatar";
import { UserMenu } from "@/app/components/user/user-menu";
import type { Person } from "@/app/services/sessions";

const CHANNELS = ["geral", "produto", "suporte"];

const DIRECT_MESSAGES = ["Bruno Lima", "Carla Souza"];

type SidebarProps = {
  person: Person;
};

export function Sidebar({ person }: SidebarProps) {
  return (
    <nav
      aria-label="Navegação do workspace"
      className="flex w-sidebar shrink-0 flex-col bg-sidebar p-2.5"
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <span className="truncate text-body font-black text-sidebar-fg-strong">
          Full Cycle Chat
        </span>
        <ChevronDown size={16} aria-hidden className="text-sidebar-fg" />
      </div>
      <div className="mt-2 flex h-7 items-center gap-2 rounded-item bg-sidebar-field px-2 text-small text-sidebar-fg">
        <Search size={16} aria-hidden />
        <span className="truncate">Buscar no Full Cycle Chat</span>
      </div>
      <section className="mt-4 flex flex-col gap-1">
        <h2 className="px-2 text-small font-bold text-sidebar-fg">Canais</h2>
        {CHANNELS.map((channel) => (
          <span
            key={channel}
            className="flex h-7 items-center gap-2 rounded-item px-2 text-small text-sidebar-fg"
          >
            <Hash size={16} aria-hidden />
            <span className="truncate">{channel}</span>
          </span>
        ))}
      </section>
      <section className="mt-4 flex flex-col gap-1">
        <h2 className="px-2 text-small font-bold text-sidebar-fg">
          Mensagens diretas
        </h2>
        {DIRECT_MESSAGES.map((name) => (
          <span
            key={name}
            className="flex h-7 items-center gap-2 rounded-item px-2 text-small text-sidebar-fg"
          >
            <Avatar name={name} size="xs" />
            <span className="truncate">{name}</span>
          </span>
        ))}
      </section>
      <div className="mt-auto border-t border-sidebar-border pt-2.5">
        <UserMenu person={person} />
      </div>
    </nav>
  );
}
