"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatRemaining, useNow } from "@/components/use-now";
import { cn } from "@/lib/utils";

type Roommate = { id: string; displayName: string; awakeUntil: number | null };

const REFRESH_MS = 30_000;

export function RoommatesList({
  roommates,
  currentUserId,
  serverNow,
}: {
  roommates: Roommate[];
  currentUserId: string;
  serverNow: number;
}) {
  const now = useNow(serverNow, 15_000);
  const router = useRouter();

  // Poll for roommates' status changes, and refresh right away when the app comes back to the foreground.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  const sorted = [...roommates].sort((a, b) => {
    const aAwake = (a.awakeUntil ?? 0) > now ? 1 : 0;
    const bAwake = (b.awakeUntil ?? 0) > now ? 1 : 0;
    return bAwake - aAwake || a.displayName.localeCompare(b.displayName);
  });

  return (
    <ul className="divide-y rounded-xl border bg-card">
      {sorted.map((r) => {
        const remaining = (r.awakeUntil ?? 0) - now;
        const awake = remaining > 0;
        return (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <span
              aria-hidden
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                awake ? "bg-amber-400 text-amber-950" : "bg-muted text-muted-foreground",
              )}
            >
              {r.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {r.displayName}
              {r.id === currentUserId && <span className="text-muted-foreground"> (toi)</span>}
            </span>
            <span className={cn("text-sm", awake ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
              {awake ? `☀️ Réveillé·e · ${formatRemaining(remaining)}` : "🌙 Dort"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
