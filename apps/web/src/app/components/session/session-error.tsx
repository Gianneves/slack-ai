import { CloudOff } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty-state";

type SessionErrorProps = {
  retryHref: string;
};

export function SessionError({ retryHref }: SessionErrorProps) {
  return (
    <div
      role="alert"
      className="flex min-h-svh items-center justify-center p-6"
    >
      <EmptyState
        icon={CloudOff}
        title="Não foi possível verificar sua sessão"
        action={
          <Link
            href={retryHref}
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            Tentar de novo
          </Link>
        }
      />
    </div>
  );
}
