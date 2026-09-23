import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { AwakeButton } from "@/components/awake-button";
import { RoommatesList } from "@/components/roommates-list";

async function getRoommates() {
  const rows = await db
    .select({ id: users.id, displayName: users.displayName, awakeUntil: users.awakeUntil })
    .from(users)
    .orderBy(asc(users.displayName));
  return { roommates: rows, serverNow: Date.now() };
}

export default async function Home() {
  const user = await requireUser();
  const { roommates, serverNow } = await getRoommates();

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-4 py-10">
        <section className="flex flex-col items-center gap-2">
          <h1 className="mb-6 text-lg text-muted-foreground">Salut {user.displayName} 👋</h1>
          <AwakeButton awakeUntil={user.awakeUntil?.getTime() ?? null} serverNow={serverNow} />
        </section>
        <section className="grid gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">La coloc</h2>
          <RoommatesList
            roommates={roommates.map((r) => ({ ...r, awakeUntil: r.awakeUntil?.getTime() ?? null }))}
            currentUserId={user.id}
            serverNow={serverNow}
          />
        </section>
      </main>
    </>
  );
}
