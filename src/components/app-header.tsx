import Link from "next/link";
import { LogOutIcon, ShieldIcon } from "lucide-react";
import { logout } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import type { User } from "@/db/schema";

export function AppHeader({ user }: { user: User }) {
  return (
    <header className="flex items-center justify-between gap-2 border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <Link href="/" className="font-semibold tracking-tight">
        ☀️ ImAwake
      </Link>
      <div className="flex items-center gap-1">
        {user.isAdmin && (
          <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ShieldIcon />
            Admin
          </Link>
        )}
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" aria-label="Se déconnecter">
            <LogOutIcon />
          </Button>
        </form>
      </div>
    </header>
  );
}
