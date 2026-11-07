"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import type { HelperService } from "@/lib/db/types";
import { marketplaceT, type MarketplaceLocale } from "@/lib/i18n/marketplace";
import type { FormState } from "@/app/helpers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RequestAction = (prev: FormState, formData: FormData) => Promise<FormState>;

const selectClass =
  "flex h-12 w-full rounded-sm border border-line bg-white px-4 text-base text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole/50";

/** "Send request" on /helpers/[id] for a signed-in family member. */
export function HelperRequestForm({
  action,
  locale,
  helperId,
  services,
  seniors,
  defaultService,
  helpRequestId,
  defaultMessage,
}: {
  action: RequestAction;
  locale: MarketplaceLocale;
  helperId: string;
  services: HelperService[];
  seniors: { id: string; first_name: string }[];
  defaultService: HelperService | null;
  helpRequestId: string | null;
  defaultMessage: string;
}) {
  const t = marketplaceT(locale);
  const d = t.detail;
  const [state, formAction, pending] = useActionState(action, { errors: [] } as FormState);
  const values = state.values ?? {};
  const v = (k: string, fallback: string) => (typeof values[k] === "string" ? (values[k] as string) : fallback);
  type ErrKey = keyof typeof t.requestErrors;
  const err = (k: ErrKey) => (state.errors.includes(k) ? t.requestErrors[k] : null);
  const invalid = (k: string) => (state.errors.includes(k) ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {});
  const formError = state.formError ? t.requestErrors[state.formError] : state.errors.length > 0 ? t.form.errorSummary : null;

  return (
    <form action={formAction} className="grid gap-5" noValidate key={JSON.stringify(state.values ?? null)}>
      <input type="hidden" name="helper_id" value={helperId} />
      <input type="hidden" name="help_request_id" value={helpRequestId ?? ""} />
      {formError ? (
        <p role="alert" className="rounded-sm border border-allarme/30 bg-allarme-soft px-4 py-3 text-sm font-bold text-allarme">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="senior_id" className="text-sm font-bold text-ink">
            {d.forParent}
          </label>
          <select id="senior_id" name="senior_id" defaultValue={v("senior_id", seniors[0]?.id ?? "")} className={selectClass} {...invalid("senior_id")}>
            {seniors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name}
              </option>
            ))}
          </select>
          {err("senior_id") ? (
            <p id="senior_id-error" className="text-sm font-bold text-allarme">
              {err("senior_id")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service" className="text-sm font-bold text-ink">
            {d.service}
          </label>
          <select id="service" name="service" defaultValue={v("service", defaultService && services.includes(defaultService) ? defaultService : services[0])} className={selectClass} {...invalid("service")}>
            {services.map((s) => (
              <option key={s} value={s}>
                {t.services[s]}
              </option>
            ))}
          </select>
          {err("service") ? (
            <p id="service-error" className="text-sm font-bold text-allarme">
              {err("service")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-bold text-ink">
          {d.message}
        </label>
        <Textarea id="message" name="message" rows={4} maxLength={600} required defaultValue={v("message", defaultMessage)} placeholder={d.messagePlaceholder} {...invalid("message")} />
        <p className="text-xs text-muted">{d.messageHint}</p>
        {err("message") ? (
          <p id="message-error" className="text-sm font-bold text-allarme">
            {err("message")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="preferred_time" className="text-sm font-bold text-ink">
          {d.preferredTime}
        </label>
        <Input id="preferred_time" name="preferred_time" maxLength={120} defaultValue={v("preferred_time", "")} placeholder={d.preferredTimePlaceholder} {...invalid("preferred_time")} />
        <p className="text-xs text-muted">{d.preferredTimeHint}</p>
        {err("preferred_time") ? (
          <p id="preferred_time-error" className="text-sm font-bold text-allarme">
            {err("preferred_time")}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
        {d.send}
      </Button>
    </form>
  );
}
