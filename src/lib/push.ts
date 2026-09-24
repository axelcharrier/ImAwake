import "server-only";
import webpush from "web-push";
import { and, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions, sessions } from "@/db/schema";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const enabled = !!(publicKey && privateKey);

if (enabled) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@example.com", publicKey, privateKey);
}

export type PushPayload = { title: string; body: string; tag?: string; url?: string };

/** Sends a notification to every logged-in device except the given user's own. */
export async function notifyOthers(userId: string, payload: PushPayload) {
  if (!enabled) return;

  const targets = await db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .innerJoin(sessions, eq(pushSubscriptions.sessionId, sessions.id))
    .where(and(ne(pushSubscriptions.userId, userId), gt(sessions.expiresAt, new Date())));

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    targets.map((t) =>
      webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, body, {
        TTL: 60 * 60,
        urgency: "high",
      }),
    ),
  );

  // 404/410 mean the browser dropped the subscription: forget it.
  const gone = targets
    .filter((_, i) => {
      const r = results[i];
      return r.status === "rejected" && [404, 410].includes((r.reason as { statusCode?: number }).statusCode ?? 0);
    })
    .map((t) => t.endpoint);
  if (gone.length) await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, gone));
}
