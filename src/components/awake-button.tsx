"use client";

import { useTransition } from "react";
import { goToSleep, wakeUp } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useNow } from "@/components/use-now";
import { awakeSince, formatElapsed } from "@/lib/awake";
import { cn } from "@/lib/utils";

export function AwakeButton({ awakeUntil, serverNow }: { awakeUntil: number | null; serverNow: number }) {
  const now = useNow(serverNow);
  const [pending, startTransition] = useTransition();
  const remaining = awakeUntil ? awakeUntil - now : 0;
  const awake = remaining > 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        {awake && (
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
        )}
        <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => wakeUp())}
        className={cn(
          "relative flex size-56 flex-col items-center justify-center rounded-full text-3xl font-bold tracking-tight shadow-xl transition-all outline-none select-none",
          "focus-visible:ring-4 focus-visible:ring-ring/50 active:scale-95 disabled:opacity-70",
          awake
            ? "bg-amber-400 text-amber-950 shadow-amber-400/40"
            : "bg-primary text-primary-foreground",
        )}
      >
        <span aria-hidden className="text-5xl">{awake ? "☀️" : "🌙"}</span>
        ImAwake
      </button>
      </div>

      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        {awake ? (
          <>
            Réveillé·e <strong className="text-foreground">{formatElapsed(now - awakeSince(awakeUntil!))}</strong>.
            <br />
            Appuie à nouveau si tu es toujours réveillé·e.
          </>
        ) : (
          "Appuie pour dire à la coloc que tu es réveillé·e."
        )}
      </p>

      {awake && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(() => goToSleep())}>
          Je me recouche
        </Button>
      )}
    </div>
  );
}
