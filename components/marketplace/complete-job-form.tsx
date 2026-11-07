"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { marketplaceT, type MarketplaceLocale } from "@/lib/i18n/marketplace";
import { formatEur } from "@/lib/i18n/relief";
import { defaultJobAmount } from "@/lib/relief-budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * "Record as done": date, hours and amount for an accepted helper request. The amount
 * placeholder follows hours × hourly rate; left empty, the server uses that value.
 * Used by the helper on /helpers/me and by the family on /app.
 */
export function CompleteJobForm({
  action,
  requestId,
  hourlyRate,
  today,
  locale,
  open = false,
  returnTo,
}: {
  action: (formData: FormData) => Promise<void>;
  requestId: string;
  hourlyRate: number | null;
  /** "YYYY-MM-DD" in Europe/Berlin: default and max of the date field. */
  today: string;
  locale: MarketplaceLocale;
  open?: boolean;
  returnTo?: string;
}) {
  const t = marketplaceT(locale).complete;
  const [hours, setHours] = useState("");
  const parsed = Number(hours.replace(",", "."));
  const suggested = defaultJobAmount(Number.isFinite(parsed) ? parsed : 0, hourlyRate);
  const id = (name: string) => `${name}-${requestId}`;

  return (
    <details className="group mt-4 rounded-lg border border-line bg-white" open={open}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm font-bold text-ink hover:bg-mist [&::-webkit-details-marker]:hidden">
        <Check className="size-4" aria-hidden /> {t.open}
      </summary>
      <form action={action} className="grid gap-3 border-t border-line p-4 sm:grid-cols-3">
        <input type="hidden" name="request_id" value={requestId} />
        {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
        <label className="grid gap-1.5 text-sm font-bold text-ink" htmlFor={id("date")}>
          {t.date}
          <Input id={id("date")} name="service_date" type="date" required defaultValue={today} max={today} min="2024-01-01" />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink" htmlFor={id("hours")}>
          {t.hours}
          <Input
            id={id("hours")}
            name="hours"
            type="number"
            inputMode="decimal"
            step="0.25"
            min="0.25"
            max="24"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink" htmlFor={id("amount")}>
          {t.amount}
          <Input id={id("amount")} name="amount_eur" type="number" inputMode="decimal" step="0.01" min="0" max="5000" placeholder={String(suggested)} aria-describedby={id("amount-hint")} />
        </label>
        <p id={id("amount-hint")} className="text-xs text-muted sm:col-span-3">
          {t.amountHint(formatEur(suggested, locale))}
        </p>
        <div className="sm:col-span-3">
          <Button type="submit">
            <Check aria-hidden /> {t.submit}
          </Button>
        </div>
      </form>
    </details>
  );
}
