import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/app/components/ui/empty-state";
import { Rail } from "@/app/components/workspace-nav/rail";
import { Sidebar } from "@/app/components/workspace-nav/sidebar";
import { getSession } from "@/app/queries/session";

export default async function Home() {
  const session = await getSession();

  if (session.status !== "authenticated") {
    return null;
  }

  return (
    <div className="flex min-h-svh bg-surface">
      <Rail />
      <Sidebar person={session.person} />
      <main className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={MessageSquare}
          title="Bem-vindo ao Full Cycle Chat"
          titleAs="h1"
          description="Escolha uma conversa na barra lateral para começar."
        />
      </main>
    </div>
  );
}
