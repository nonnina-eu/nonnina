"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, Lock } from "lucide-react";
import type { Helper } from "@/lib/db/types";
import { marketplaceT, type MarketplaceLocale } from "@/lib/i18n/marketplace";
import { HELPER_LANGUAGES, HELPER_SERVICES } from "@/lib/marketplace";
import type { FormState } from "@/app/helpers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProfileAction = (prev: FormState, formData: FormData) => Promise<FormState>;
type Values = Record<string, string | string[]>;

const selectClass =
  "flex h-12 w-full rounded-sm border border-line bg-white px-4 text-base text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole/50";

function initialValues(helper: Partial<Helper> | null): Values {
  return {
    name: helper?.name ?? "",
    kind: helper?.kind ?? "independent",
    city: helper?.city ?? "Stuttgart",
    bio: helper?.bio ?? "",
    languages: helper?.languages ?? [],
    services: helper?.services ?? [],
    hourly_rate_eur: helper?.hourly_rate_eur != null ? String(helper.hourly_rate_eur) : "",
    free: helper?.id && helper.hourly_rate_eur === null ? "on" : "",
    phone: helper?.phone ?? "",
    email: helper?.email ?? "",
  };
}

function ErrorText({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-bold text-allarme">
      {message}
    </p>
  );
}

/**
 * Helper profile form for /helpers/join (create, with consent) and /helpers/me (edit).
 * Errors come back per field from the server action and are announced via the summary.
 */
export function HelperProfileForm({ action, locale, helper, mode }: { action: ProfileAction; locale: MarketplaceLocale; helper: Partial<Helper> | null; mode: "create" | "edit" }) {
  const t = marketplaceT(locale);
  const f = t.form;
  const [state, formAction, pending] = useActionState(action, { errors: [] } as FormState);
  const values: Values = state.values ?? initialValues(helper);
  const v = (k: string) => (typeof values[k] === "string" ? (values[k] as string) : "");
  const list = (k: string) => (Array.isArray(values[k]) ? (values[k] as string[]) : []);
  const [kind, setKind] = useState(v("kind") || "independent");
  const [free, setFree] = useState(v("free") === "on");
  const noRate = free || kind === "volunteer";
  const err = (k: keyof typeof f.errors) => (state.errors.includes(k) ? f.errors[k] : null);
  const invalid = (k: keyof typeof f.errors) => (state.errors.includes(k) ? { "aria-invalid": true as const, "aria-describedby": `${k}-error` } : {});
  // Remount the fields after every server answer so defaultValue shows the echoed values.
  const formKey = JSON.stringify(state.values ?? null);

  return (
    <form action={formAction} className="grid gap-6" noValidate key={formKey}>
      {state.errors.length > 0 ? (
        <p role="alert" className="rounded-sm border border-allarme/30 bg-allarme-soft px-4 py-3 text-sm font-bold text-allarme">
          {f.errorSummary}
        </p>
      ) : null}
      {state.saved ? (
        <p role="status" className="inline-flex items-center gap-2 rounded-sm border border-salvia bg-salvia px-4 py-3 text-sm font-bold text-bene">
          <Check className="size-4" aria-hidden /> {f.saved}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-bold text-ink">
          {f.name}
        </label>
        <Input id="name" name="name" defaultValue={v("name")} required maxLength={80} autoComplete="name" {...invalid("name")} />
        <p className="text-xs text-muted">{f.nameHint}</p>
        <ErrorText id="name-error" message={err("name")} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kind" className="text-sm font-bold text-ink">
            {f.kind}
          </label>
          <select id="kind" name="kind" defaultValue={kind} onChange={(e) => setKind(e.target.value)} className={selectClass} {...invalid("kind")}>
            {(["independent", "service", "volunteer"] as const).map((k) => (
              <option key={k} value={k}>
                {t.kinds[k]}
              </option>
            ))}
          </select>
          <ErrorText id="kind-error" message={err("kind")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-bold text-ink">
            {f.city}
          </label>
          <Input id="city" name="city" defaultValue={v("city")} required maxLength={80} autoComplete="address-level2" {...invalid("city")} />
          <ErrorText id="city-error" message={err("city")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-bold text-ink">
          {f.bio}
        </label>
        <Textarea id="bio" name="bio" defaultValue={v("bio")} required minLength={20} maxLength={800} rows={4} {...invalid("bio")} />
        <p className="text-xs text-muted">{f.bioHint}</p>
        <ErrorText id="bio-error" message={err("bio")} />
      </div>

      <fieldset className="flex flex-col gap-2" {...invalid("services")}>
        <legend className="mb-2 text-sm font-bold text-ink">{f.services}</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HELPER_SERVICES.map((s) => (
            <label key={s} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-sm border border-line bg-white px-4 py-2 text-sm text-ink has-[:checked]:border-ink has-[:checked]:bg-glicine">
              <input type="checkbox" name="services" value={s} defaultChecked={list("services").includes(s)} className="size-5 accent-ink" />
              {t.services[s]}
            </label>
          ))}
        </div>
        <ErrorText id="services-error" message={err("services")} />
      </fieldset>

      <fieldset className="flex flex-col gap-2" {...invalid("languages")}>
        <legend className="mb-2 text-sm font-bold text-ink">{f.languages}</legend>
        <div className="flex flex-wrap gap-2">
          {HELPER_LANGUAGES.map((l) => (
            <label key={l} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink has-[:checked]:border-ink has-[:checked]:bg-glicine">
              <input type="checkbox" name="languages" value={l} defaultChecked={list("languages").includes(l)} className="size-4 accent-ink" />
              {t.languages[l]}
            </label>
          ))}
        </div>
        <ErrorText id="languages-error" message={err("languages")} />
      </fieldset>

      <div className="grid gap-3 rounded-lg border border-line bg-white p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-ink">
          <input
            type="checkbox"
            name="free"
            defaultChecked={free || kind === "volunteer"}
            disabled={kind === "volunteer"}
            onChange={(e) => setFree(e.target.checked)}
            className="size-5 accent-ink"
          />
          {f.free}
        </label>
        {kind === "volunteer" ? <input type="hidden" name="free" value="on" /> : null}
        <div className={cn("flex flex-col gap-1.5", noRate && "opacity-50")}>
          <label htmlFor="hourly_rate_eur" className="text-sm font-bold text-ink">
            {f.rate}
          </label>
          <Input
            id="hourly_rate_eur"
            name="hourly_rate_eur"
            type="number"
            inputMode="decimal"
            min={5}
            max={150}
            step="0.5"
            defaultValue={v("hourly_rate_eur")}
            disabled={noRate}
            className="max-w-40"
            {...invalid("hourly_rate_eur")}
          />
          <p className="text-xs text-muted">{f.rateHint}</p>
          <ErrorText id="hourly_rate_eur-error" message={err("hourly_rate_eur")} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-bold text-ink">
            {f.phone}
          </label>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={v("phone")} required placeholder="+4915112345678" {...invalid("phone")} />
          <p className="text-xs text-muted">{f.phoneHint}</p>
          <ErrorText id="phone-error" message={err("phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-bold text-ink">
            {f.email}
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v("email")} required {...invalid("email")} />
          <p className="text-xs text-muted">{f.emailHint}</p>
          <ErrorText id="email-error" message={err("email")} />
        </div>
      </div>
      <p className="-mt-3 inline-flex items-center gap-2 text-xs text-muted">
        <Lock className="size-3.5" aria-hidden /> {f.privateNote}
      </p>

      {mode === "create" ? (
        <div className="grid gap-3 rounded-lg border border-line bg-camomilla p-4">
          {(["consent_share", "consent_verify"] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
                <input type="checkbox" name={k} defaultChecked={v(k) === "on"} required className="mt-0.5 size-5 shrink-0 accent-ink" {...invalid(k)} />
                {k === "consent_share" ? f.consentShare : f.consentVerify}
              </label>
              <ErrorText id={`${k}-error`} message={err(k)} />
            </div>
          ))}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
        {mode === "create" ? f.create : f.save}
      </Button>
    </form>
  );
}
