"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invites, users } from "@/db/schema";
import { randomToken, requireAdmin } from "@/lib/auth";

const INVITE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInvite() {
  const admin = await requireAdmin();
  await db.insert(invites).values({
    token: randomToken(24),
    createdBy: admin.id,
    expiresAt: new Date(Date.now() + INVITE_DURATION_MS),
  });
  refresh();
}

export async function revokeInvite(token: string) {
  await requireAdmin();
  await db.delete(invites).where(eq(invites.token, token));
  refresh();
}

export async function toggleAdmin(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;
  const [target] = await db.select().from(users).where(eq(users.id, userId));
  if (!target) return;
  await db.update(users).set({ isAdmin: !target.isAdmin }).where(eq(users.id, userId));
  refresh();
}

export async function resetStatus(userId: string) {
  await requireAdmin();
  await db.update(users).set({ awakeUntil: null }).where(eq(users.id, userId));
  refresh();
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;
  await db.delete(users).where(eq(users.id, userId));
  refresh();
}
