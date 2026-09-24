"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { refresh } from "next/cache";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invites, pushSubscriptions, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentSessionId,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { AWAKE_DURATION_MS } from "@/lib/awake";
import { notifyOthers } from "@/lib/push";

export type FormState = { error?: string } | undefined;

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function register(
  token: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!displayName || displayName.length > 40) return { error: "Prénom invalide." };
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
    return { error: "Identifiant : 3 à 30 caractères (lettres, chiffres, . _ -)." };
  }
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };

  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
  if (taken) return { error: "Cet identifiant est déjà pris." };

  const passwordHash = await hashPassword(password);
  const isBootstrap = !!process.env.BOOTSTRAP_TOKEN && token === process.env.BOOTSTRAP_TOKEN;

  const userId = await db.transaction(async (tx) => {
    if (isBootstrap) {
      const [{ n }] = await tx.select({ n: count() }).from(users);
      if (n > 0) return null;
      const [created] = await tx
        .insert(users)
        .values({ username, displayName, passwordHash, isAdmin: true })
        .returning({ id: users.id });
      return created.id;
    }

    // Claim the invite atomically so a link can never be used twice.
    const [claimed] = await tx
      .update(invites)
      .set({ usedAt: new Date() })
      .where(
        and(eq(invites.token, token), isNull(invites.usedAt), gt(invites.expiresAt, new Date())),
      )
      .returning({ token: invites.token });
    if (!claimed) return null;

    const [created] = await tx
      .insert(users)
      .values({ username, displayName, passwordHash })
      .returning({ id: users.id });
    await tx.update(invites).set({ usedBy: created.id }).where(eq(invites.token, token));
    return created.id;
  });

  if (!userId) return { error: "Ce lien d'invitation n'est plus valide." };

  await createSession(userId);
  redirect("/");
}

export async function wakeUp() {
  const user = await requireUser();
  const wasAwake = !!user.awakeUntil && user.awakeUntil > new Date();
  await db
    .update(users)
    .set({ awakeUntil: new Date(Date.now() + AWAKE_DURATION_MS) })
    .where(eq(users.id, user.id));
  // Only ping the others when you actually wake up, not when extending your awake window.
  if (!wasAwake) {
    after(() =>
      notifyOthers(user.id, {
        title: `☀️ ${user.displayName} est réveillé·e`,
        body: "Viens voir qui est debout dans la coloc.",
        tag: `awake-${user.id}`,
      }),
    );
  }
  refresh();
}

export async function goToSleep() {
  const user = await requireUser();
  await db.update(users).set({ awakeUntil: null }).where(eq(users.id, user.id));
  refresh();
}

export type SerializedPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(sub: SerializedPushSubscription) {
  const user = await requireUser();
  const sessionId = await getCurrentSessionId();
  if (!sessionId || !sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) {
    throw new Error("Invalid push subscription");
  }
  const values = { userId: user.id, sessionId, p256dh: sub.keys.p256dh, auth: sub.keys.auth };
  await db
    .insert(pushSubscriptions)
    .values({ endpoint: sub.endpoint, ...values })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: values });
}

export async function deletePushSubscription(endpoint: string) {
  const user = await requireUser();
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, user.id)));
}
