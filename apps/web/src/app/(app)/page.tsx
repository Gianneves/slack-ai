import { SessionBoundary } from "@/app/components/session/session-boundary";
import { getSession } from "@/app/queries/session";

async function HomeContent() {
  const session = await getSession();

  if (session.status !== "authenticated") {
    return null;
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-1 p-6 text-center">
      <h1 className="text-title font-black text-fg">{session.person.name}</h1>
      <p className="text-small text-fg-muted">{session.person.email}</p>
    </main>
  );
}

export default function Home() {
  return (
    <SessionBoundary>
      <HomeContent />
    </SessionBoundary>
  );
}
