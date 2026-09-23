import { headers } from "next/headers";
import { and, asc, desc, gt, isNull } from "drizzle-orm";
import { PlusIcon, TrashIcon } from "lucide-react";
import { db } from "@/db";
import { invites, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvite, deleteUser, resetStatus, revokeInvite, toggleAdmin } from "./actions";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export default async function AdminPage() {
  const admin = await requireAdmin();
  const now = new Date();

  const [members, pendingInvites, headerList] = await Promise.all([
    db.select().from(users).orderBy(asc(users.displayName)),
    db
      .select()
      .from(invites)
      .where(and(isNull(invites.usedAt), gt(invites.expiresAt, now)))
      .orderBy(desc(invites.createdAt)),
    headers(),
  ]);

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  return (
    <>
      <AppHeader user={admin} />
      <main className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>

        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Chaque lien ne sert qu&apos;une fois et expire au bout de 7 jours.
            </CardDescription>
            <CardAction>
              <form action={createInvite}>
                <Button type="submit" size="sm">
                  <PlusIcon />
                  Nouveau lien
                </Button>
              </form>
            </CardAction>
          </CardHeader>
          <CardContent>
            {pendingInvites.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune invitation en attente.</p>
            ) : (
              <ul className="grid gap-3">
                {pendingInvites.map((invite) => {
                  const url = `${origin}/invite/${invite.token}`;
                  return (
                    <li key={invite.token} className="grid gap-2 rounded-lg border p-3">
                      <code className="truncate text-xs text-muted-foreground">{url}</code>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          Expire le {dateFormat.format(invite.expiresAt)}
                        </span>
                        <div className="flex gap-1">
                          <CopyButton value={url} />
                          <form action={revokeInvite.bind(null, invite.token)}>
                            <Button type="submit" variant="destructive" size="sm" aria-label="Révoquer">
                              <TrashIcon />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membres ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {members.map((m) => {
                const awake = !!m.awakeUntil && m.awakeUntil > now;
                const isSelf = m.id === admin.id;
                return (
                  <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium">
                        {m.displayName}
                        {m.isAdmin && <Badge variant="secondary">Admin</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{m.username} · {awake ? "☀️ réveillé·e" : "🌙 dort"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {awake && (
                        <form action={resetStatus.bind(null, m.id)}>
                          <Button type="submit" variant="outline" size="sm">
                            Remettre à dormir
                          </Button>
                        </form>
                      )}
                      {!isSelf && (
                        <>
                          <form action={toggleAdmin.bind(null, m.id)}>
                            <Button type="submit" variant="outline" size="sm">
                              {m.isAdmin ? "Retirer admin" : "Passer admin"}
                            </Button>
                          </form>
                          <form action={deleteUser.bind(null, m.id)}>
                            <Button type="submit" variant="destructive" size="sm" aria-label={`Supprimer ${m.displayName}`}>
                              <TrashIcon />
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
