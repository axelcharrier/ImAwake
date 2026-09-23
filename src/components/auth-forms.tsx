"use client";

import { useActionState } from "react";
import { login, register } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field(props: { label: string } & React.ComponentProps<"input">) {
  const { label, ...inputProps } = props;
  return (
    <div className="grid gap-2">
      <Label htmlFor={inputProps.name}>{label}</Label>
      <Input id={inputProps.name} required className="h-10" {...inputProps} />
    </div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Identifiant" name="username" autoComplete="username" autoCapitalize="none" />
      <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" />
      <FormError message={state?.error} />
      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

export function RegisterForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(register.bind(null, token), undefined);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Prénom" name="displayName" autoComplete="given-name" maxLength={40} />
      <Field
        label="Identifiant"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        pattern="[a-zA-Z0-9_.\-]{3,30}"
      />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />
      <FormError message={state?.error} />
      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
