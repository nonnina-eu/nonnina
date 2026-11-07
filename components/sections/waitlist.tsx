"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Spark } from "../brand";
import { ArrowRight, CheckBadge } from "../icons";
import type { Dictionary } from "@/lib/i18n";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; created: boolean } | { kind: "error"; message: string };
const ROLES = ["family", "helper", "care_service", "other"] as const;

const field =
  "h-[3.25rem] w-full rounded-md border border-line bg-white px-4 text-base text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none focus:ring-2 focus:ring-sole/50";

export function Waitlist({ t }: { t: Dictionary["waitlist"] }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [role, setRole] = useState<(typeof ROLES)[number]>("family");
  const resultRef = useRef<HTMLDivElement>(null);

  // "Join as a helper" links to ?role=helper#waitlist
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("role");
    if (r && (ROLES as readonly string[]).includes(r)) setRole(r as (typeof ROLES)[number]);
  }, []);

  useEffect(() => {
    if (status.kind === "done") resultRef.current?.focus();
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    if (!email.checkValidity()) {
      setStatus({ kind: "error", message: t.invalidEmail });
      email.focus();
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const json = (await res.json()) as { ok?: boolean; created?: boolean };
      if (!res.ok || !json.ok) throw new Error("failed");
      setStatus({ kind: "done", created: json.created ?? true });
    } catch {
      setStatus({ kind: "error", message: t.error });
    }
  }

  return (
    <section id="waitlist" className="wrap py-8 md:py-12" aria-labelledby="waitlist-title">
      <div className="grid gap-10 rounded-xl bg-latte p-6 sm:p-10 md:grid-cols-[0.9fr_1.1fr] md:p-14">
        <div className="reveal">
          <span className="eyebrow"><Spark className="size-3.5" />{t.eyebrow}</span>
          <h2 id="waitlist-title" className="mt-4 text-balance text-[2.25rem] leading-[0.95] sm:text-5xl">{t.title}</h2>
          <p className="lede mt-4">{t.lede}</p>
        </div>

        {status.kind === "done" ? (
          <div ref={resultRef} tabIndex={-1} role="status" className="grid content-center justify-items-start gap-3 rounded-lg bg-white p-8 outline-none">
            <CheckBadge className="size-10" />
            <p className="font-display text-3xl leading-none">{t.successTitle}</p>
            <p className="text-graphite">{status.created ? t.successBody : t.duplicate}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="reveal reveal-d1 grid gap-4 rounded-lg bg-white p-5 sm:grid-cols-2 sm:p-7">
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="wl-email" className="text-sm font-bold">{t.email}</label>
              <input id="wl-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder={t.emailPlaceholder} className={field} aria-describedby="wl-privacy" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="wl-role" className="text-sm font-bold">{t.role}</label>
              <select id="wl-role" name="role" value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])} className={field}>
                {ROLES.map((r) => (<option key={r} value={r}>{t.roles[r]}</option>))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="wl-city" className="text-sm font-bold">{t.city}</label>
              <input id="wl-city" name="city" autoComplete="address-level2" maxLength={100} placeholder={t.cityPlaceholder} className={field} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="wl-message" className="text-sm font-bold">{t.message}</label>
              <textarea id="wl-message" name="message" rows={4} maxLength={1000} placeholder={t.messagePlaceholder} className={`${field} h-auto py-3`} />
            </div>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="wl-website">Website</label>
              <input id="wl-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            {status.kind === "error" ? <p role="alert" className="text-sm font-bold text-allarme sm:col-span-2">{status.message}</p> : null}
            <div className="flex flex-col items-start gap-3 sm:col-span-2">
              <button type="submit" className="btn btn-ink w-full sm:w-auto" disabled={status.kind === "sending"} aria-busy={status.kind === "sending"}>
                {status.kind === "sending" ? t.submitting : t.submit}
                <ArrowRight className="size-[18px]" />
              </button>
              <p id="wl-privacy" className="text-xs text-muted">{t.privacy}</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
