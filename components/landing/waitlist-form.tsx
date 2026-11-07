"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanding } from "./language-provider";

type State = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; created: boolean } | { kind: "error"; message: string };

const field = "rounded-lg border-[#e0e4ec] bg-white";

export function WaitlistForm() {
  const { t } = useLanding();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; created?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "failed");
      setState({ kind: "success", created: json.created ?? true });
      form.reset();
    } catch {
      setState({ kind: "error", message: t.waitlist.error });
    }
  }

  return (
    <section id="lista" className="scroll-mt-24 bg-[#f5f7fb] py-20 md:py-28">
      <div className="container">
        <h2 className="max-w-[14ch] text-4xl text-[#202128] sm:text-5xl lg:text-[4.4rem]">{t.lead.title}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.5rem] bg-white p-6 sm:p-8">
            <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em]">{t.lead.homeTitle}</h3>
            <p className="mt-3 text-base leading-relaxed text-[#343a46]">{t.lead.homeBody}</p>
          </article>
          <article className="rounded-[1.5rem] bg-[#202128] p-6 text-white sm:p-8">
            <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em]">{t.lead.familyTitle}</h3>
            <p className="mt-3 text-base leading-relaxed text-white/75">{t.lead.familyBody}</p>
          </article>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-white p-6 sm:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#476adb]">{t.waitlist.eyebrow}</p>
          <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{t.waitlist.title}</h3>
          <p className="mt-3 max-w-2xl text-base text-[#343a46]">{t.waitlist.body}</p>

          {state.kind === "success" ? (
            <div role="status" className="mt-8 flex flex-col items-start gap-3 rounded-2xl bg-[#e9f3df] p-8">
              <CheckCircle2 className="size-8 text-[#10bb48]" />
              <p className="text-xl font-bold">{t.waitlist.successTitle}</p>
              <p>{state.created ? t.waitlist.successBody : t.waitlist.duplicate}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">{t.waitlist.email}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder="tu@email.it" className={field} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t.waitlist.role}</Label>
                <Select id="role" name="role" defaultValue="family" required className={field}>
                  <option value="family">{t.waitlist.roles.family}</option>
                  <option value="helper">{t.waitlist.roles.helper}</option>
                  <option value="care_service">{t.waitlist.roles.care_service}</option>
                  <option value="other">{t.waitlist.roles.other}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t.waitlist.city}</Label>
                <Input id="city" name="city" autoComplete="address-level2" maxLength={100} className={field} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="message">{t.waitlist.message}</Label>
                <Textarea id="message" name="message" placeholder={t.waitlist.messagePlaceholder} maxLength={1000} className="rounded-lg border-[#e0e4ec]" />
              </div>
              <div className="hidden" aria-hidden>
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              {state.kind === "error" ? (
                <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-2">{state.message}</p>
              ) : null}
              <div className="flex flex-col items-start gap-3 sm:col-span-2">
                <Button type="submit" variant="ink" size="lg" disabled={state.kind === "submitting"}>
                  {state.kind === "submitting" ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                  {state.kind === "submitting" ? t.waitlist.submitting : t.waitlist.submit}
                </Button>
                <p className="text-xs text-[#8b94a7]">{t.waitlist.privacy}</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
