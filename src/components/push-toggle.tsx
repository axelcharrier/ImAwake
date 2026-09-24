"use client";

import { useEffect, useState, useTransition } from "react";
import { BellIcon, BellOffIcon } from "lucide-react";
import { deletePushSubscription, savePushSubscription, type SerializedPushSubscription } from "@/app/actions";
import { Button } from "@/components/ui/button";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Status = "loading" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

const serialize = (sub: PushSubscription) => sub.toJSON() as SerializedPushSubscription;

async function initialStatus(): Promise<Status> {
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  // Re-attach an existing subscription to the current session (e.g. after logging back in).
  if (sub) await savePushSubscription(serialize(sub));
  return sub ? "on" : "off";
}

export function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // iOS only exposes PushManager once the app is added to the home screen.
    if (!VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    initialStatus().then(setStatus, () => setStatus("off"));
  }, []);

  function toggle() {
    startTransition(async () => {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (status === "on") {
        if (existing) {
          await existing.unsubscribe();
          await deletePushSubscription(existing.endpoint);
        }
        setStatus("off");
        return;
      }
      if ((await Notification.requestPermission()) !== "granted") {
        setStatus(Notification.permission === "denied" ? "denied" : "off");
        return;
      }
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
        }));
      await savePushSubscription(serialize(sub));
      setStatus("on");
    });
  }

  if (status === "loading") return null;

  const label =
    status === "on"
      ? "Désactiver les notifications"
      : status === "denied"
        ? "Notifications bloquées dans les réglages du navigateur"
        : "Activer les notifications";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      aria-pressed={status === "on"}
      disabled={pending || status === "denied"}
      onClick={toggle}
    >
      {status === "on" ? <BellIcon /> : <BellOffIcon />}
    </Button>
  );
}
