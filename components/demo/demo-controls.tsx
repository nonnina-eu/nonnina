"use client";

import { useState } from "react";
import { FastForward, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { escalateDemoAction, resetDemoAction } from "@/app/(product)/demo/actions";

function reloadFrames() {
  document.querySelectorAll<HTMLIFrameElement>("iframe[data-demo-frame]").forEach((f) => {
    f.contentWindow?.location.reload();
  });
}

export function ResetDemoButton() {
  const [busy, setBusy] = useState(false);
  async function reset() {
    setBusy(true);
    try {
      await resetDemoAction();
      reloadFrames();
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

/** Runs the next step of the escalation ladder immediately instead of waiting 90 seconds. */
export function AdvanceLadderButton() {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  async function advance() {
    setBusy(true);
    try {
      const { action } = await escalateDemoAction();
      setLast(action ? action.replace(/_/g, " ") : "nothing due");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={() => void advance()} disabled={busy} title="Skip the 90 s wait: call the next relative now">
      {busy ? <Loader2 className="animate-spin" /> : <FastForward />}
      Next ladder step{last ? ` · ${last}` : ""}
    </Button>
  );
}
