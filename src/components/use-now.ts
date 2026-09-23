"use client";

import { useEffect, useState } from "react";

/** Current timestamp, seeded from the server to avoid hydration mismatches. */
export function useNow(serverNow: number, intervalMs = 1000) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
