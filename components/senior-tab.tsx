import Link from "next/link";
import { Mic } from "./icons";
import type { Dictionary } from "@/lib/i18n";

/**
 * Always-visible door for seniors: a big tab on the right edge (desktop) or a big pill at the
 * bottom (phone), straight to their own screen. Large text and target on purpose.
 */
export function SeniorTab({ t }: { t: Dictionary["seniorTab"] }) {
  return (
    <Link
      href="/senior"
      className="fixed bottom-4 right-4 z-40 inline-flex min-h-[3.75rem] items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-6 text-white shadow-float transition-transform hover:-translate-y-0.5 focus-visible:outline-sole md:bottom-auto md:right-0 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-2 md:rounded-l-lg md:rounded-r-none md:px-3 md:py-5 md:hover:-translate-x-1 md:hover:-translate-y-1/2"
      aria-label={`${t.label} – ${t.sub}`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sole text-ink">
        <Mic className="size-6" />
      </span>
      <span className="leading-tight md:[writing-mode:vertical-rl] md:rotate-180">
        <span className="block text-[1.0625rem] font-extrabold">{t.label}</span>
        <span className="block text-sm text-white/70">{t.sub}</span>
      </span>
    </Link>
  );
}
