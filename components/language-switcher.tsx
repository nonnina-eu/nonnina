"use client";

import { localePath, locales, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** EN · DE · IT. Plain links (crawlable); remembers the explicit choice in a cookie. */
export function LanguageSwitcher({ current, label, className }: { current: Locale; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("inline-flex rounded-full border border-line bg-white p-[3px]", className)}>
      {locales.map((l) => (
        <a
          key={l}
          href={localePath(l)}
          hrefLang={l}
          lang={l}
          aria-current={l === current ? "true" : undefined}
          onClick={() => {
            document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
          }}
          className={cn(
            "rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-[0.06em] transition-colors",
            l === current ? "bg-ink text-white" : "text-muted hover:text-ink",
          )}
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
