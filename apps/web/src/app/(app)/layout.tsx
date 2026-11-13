import { BfcacheReload } from "@/app/components/session/bfcache-reload";
import { SessionBoundary } from "@/app/components/session/session-boundary";

export const instant = false;

export default function AuthenticatedLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <BfcacheReload />
      <SessionBoundary>{children}</SessionBoundary>
    </>
  );
}
