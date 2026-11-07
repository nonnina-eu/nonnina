"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";

/** Stores the visitor's choice. "all" will gate optional tools if any are ever added. */
export const CONSENT_COOKIE = "nonnina-consent";
const OPEN_EVENT = "nonnina:cookie-settings";
const MAX_AGE = 60 * 60 * 24 * 365;

export type Consent = "all" | "necessary";

export function readConsent(): Consent | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|necessary)`));
  return (m?.[1] as Consent) ?? null;
}

/**
 * Cookie notice with two equally weighted choices. Today both choices behave the same,
 * because the site has no optional cookies; the choice is stored so that anything optional
 * added later only runs after "Accept". Not modal: the page stays usable behind it.
 */
export function CookieBanner({ t, policyHref }: { t: Dictionary["cookies"]; policyHref: string }) {
  const [open, setOpen] = useState(false);
  // Never cover the pitch deck while presenting.
  const onPitch = /\/pitch\/?$/.test(usePathname() ?? "");

  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  if (!open || onPitch) return null;

  const choose = (value: Consent) => {
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`;
    setOpen(false);
  };

  return (
    <section
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 z-[70] print:hidden mx-auto max-w-xl rounded-md border border-line bg-white p-5 shadow-float sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <h2 id="cookie-title" className="text-xl font-extrabold [font-stretch:75%]">{t.title}</h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite">
        {t.body}{" "}
        <a href={policyHref} className="font-bold text-ink underline underline-offset-4">{t.policy}</a>
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => choose("necessary")} className="btn btn-outline btn-sm">{t.necessary}</button>
        <button type="button" onClick={() => choose("all")} className="btn btn-outline btn-sm">{t.accept}</button>
      </div>
    </section>
  );
}

/** Footer link that reopens the banner. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="w-fit text-left text-muted hover:text-ink">
      {label}
    </button>
  );
}
