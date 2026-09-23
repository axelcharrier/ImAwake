import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invites, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/auth-card";
import { RegisterForm } from "@/components/auth-forms";
import { buttonVariants } from "@/components/ui/button";

async function isValidToken(token: string) {
  if (process.env.BOOTSTRAP_TOKEN && token === process.env.BOOTSTRAP_TOKEN) {
    const [{ n }] = await db.select({ n: count() }).from(users);
    return n === 0 ? "bootstrap" : null;
  }
  const [invite] = await db
    .select({ token: invites.token })
    .from(invites)
    .where(and(eq(invites.token, token), isNull(invites.usedAt), gt(invites.expiresAt, new Date())));
  return invite ? "invite" : null;
}

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  if (await getCurrentUser()) redirect("/");

  const kind = await isValidToken(token);
  if (!kind) {
    return (
      <AuthCard
        title="Lien invalide"
        description="Ce lien d'invitation a expiré ou a déjà été utilisé. Demande-en un nouveau à l'admin."
      >
        <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full" })}>
          Aller à la connexion
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={kind === "bootstrap" ? "Créer le compte admin" : "Rejoindre la coloc"}
      description={
        kind === "bootstrap"
          ? "Premier compte de l'app : il aura les droits d'administration."
          : "Tu as été invité·e sur ImAwake. Crée ton compte pour commencer."
      }
    >
      <RegisterForm token={token} />
    </AuthCard>
  );
}
