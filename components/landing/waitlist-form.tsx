"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow, Reveal, Section } from "./section";
import { useLanding } from "./language-provider";

type State = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; created: boolean } | { kind: "error"; message: string };

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
    <Section id="waitlist" className="bg-gradient-to-b from-background to-secondary/60">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="card-soft p-6 sm:p-10">
            <div className="text-center">
              <Eyebrow>{t.waitlist.eyebrow}</Eyebrow>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight md:text-4xl">{t.waitlist.title}</h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">{t.waitlist.body}</p>
            </div>

            {state.kind === "success" ? (
              <div role="status" className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-emerald-50 p-8 text-center">
                <CheckCircle2 className="size-10 text-emerald-600" />
                <p className="text-xl font-semibold text-emerald-900">{t.waitlist.successTitle}</p>
                <p className="text-emerald-800">{state.created ? t.waitlist.successBody : t.waitlist.duplicate}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2" noValidate={false}>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">{t.waitlist.email}</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t.waitlist.role}</Label>
                  <Select id="role" name="role" defaultValue="family" required>
                    <option value="family">{t.waitlist.roles.family}</option>
                    <option value="helper">{t.waitlist.roles.helper}</option>
                    <option value="care_service">{t.waitlist.roles.care_service}</option>
                    <option value="other">{t.waitlist.roles.other}</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t.waitlist.city}</Label>
                  <Input id="city" name="city" autoComplete="address-level2" placeholder="Stuttgart" maxLength={100} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">{t.waitlist.message}</Label>
                  <Textarea id="message" name="message" placeholder={t.waitlist.messagePlaceholder} maxLength={1000} />
                </div>
                {/* honeypot */}
                <div className="hidden" aria-hidden>
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                {state.kind === "error" ? (
                  <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-2">{state.message}</p>
                ) : null}
                <div className="flex flex-col items-center gap-3 sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={state.kind === "submitting"}>
                    {state.kind === "submitting" ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                    {state.kind === "submitting" ? t.waitlist.submitting : t.waitlist.submit}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t.waitlist.privacy}</p>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
