"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { MedicationTime } from "@/lib/db/types";
import { Input } from "@/components/ui/input";

/**
 * Editable list of medication reminders. Submits as one hidden JSON field
 * `medication_times` so the server action can parse it robustly.
 */
export function MedicationTimesField({ initial = [], name = "medication_times" }: { initial?: MedicationTime[]; name?: string }) {
  const [rows, setRows] = useState<MedicationTime[]>(initial.length ? initial : [{ time: "08:00", label: "Tablets" }]);

  function update(i: number, patch: Partial<MedicationTime>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(rows.filter((r) => r.time && r.label.trim()))} />
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input type="time" value={row.time} onChange={(e) => update(i, { time: e.target.value })} className="w-32" aria-label={`Time ${i + 1}`} required />
          <Input value={row.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Tablets" aria-label={`Label ${i + 1}`} maxLength={60} />
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
            className="flex size-11 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-mist hover:text-ink"
            aria-label={`Remove reminder ${i + 1}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      {rows.length < 8 ? (
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { time: "18:00", label: "Tablets" }])}
          className="inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-bold text-ink hover:bg-camomilla"
        >
          <Plus className="size-4" /> Add reminder
        </button>
      ) : null}
    </div>
  );
}
