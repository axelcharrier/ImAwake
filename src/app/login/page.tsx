import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/auth-forms";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <AuthCard
      title="Connexion"
      description="Pas de compte ? Demande un lien d'invitation à l'admin de la coloc."
    >
      <LoginForm />
    </AuthCard>
  );
}
