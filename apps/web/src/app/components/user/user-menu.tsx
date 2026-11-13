"use client";

import { ChevronUp, LogOut } from "lucide-react";
import { sair } from "@/app/actions/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Avatar } from "@/app/components/ui/avatar";
import type { Person } from "@/app/services/sessions";

type UserMenuProps = {
  person: Person;
};

export function UserMenu({ person }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2 rounded-item p-1.5 text-left text-sidebar-fg transition-colors duration-100 hover:bg-sidebar-hover data-[state=open]:bg-sidebar-hover"
      >
        <span className="sr-only">Menu de </span>
        <Avatar name={person.name} size="md" />
        <span className="min-w-0 flex-1 truncate text-small font-bold text-sidebar-fg-strong">
          {person.name}
        </span>
        <ChevronUp size={16} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-60">
        <div className="flex items-center gap-2 p-2">
          <Avatar name={person.name} size="md" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-body font-black text-fg">
              {person.name}
            </span>
            <span className="truncate text-small text-fg-muted">
              {person.email}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <form action={sair}>
          <DropdownMenuItem
            asChild
            onSelect={(event) => event.preventDefault()}
          >
            <button type="submit" className="w-full text-left">
              <LogOut size={16} aria-hidden />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
