"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (navigator.share && /Mobi/.test(navigator.userAgent)) {
      await navigator.share({ title: "Invitation ImAwake", url: value }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copié" : "Partager"}
    </Button>
  );
}
