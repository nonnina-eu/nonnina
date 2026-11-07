"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetDemoButton() {
  const [busy, setBusy] = useState(false);
  async function reset() {
    setBusy(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      document.querySelectorAll<HTMLIFrameElement>("iframe[data-demo-frame]").forEach((f) => {
        f.contentWindow?.location.reload();
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={() => void reset()} disabled={busy}>
      {busy ? <Loader2 className="animate-spin" /> : <RotateCcw />}
      Reset demo data
    </Button>
  );
}
