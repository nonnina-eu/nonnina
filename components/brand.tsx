import { cn } from "@/lib/utils";

const SPARK = "M10 0c.9 6.4 3.1 8.6 10 10-6.9 1.4-9.1 3.6-10 10-.9-6.4-3.1-8.6-10-10 6.9-1.4 9.1-3.6 10-10z";

export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("fill-sole", className)}>
      <path d={SPARK} />
    </svg>
  );
}

/** The symbol: a lowercase n drawn as a doorway arch, with the voice spark. */
export function Mark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("shrink-0", className)}>
      <rect width="100" height="100" rx="24" fill={light ? "#FAF6F0" : "#202128"} />
      <path d="M32 74V46a18 18 0 0 1 36 0v28" fill="none" stroke={light ? "#202128" : "#fff"} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M79 13c1.1 7.4 3.6 9.9 11 11-7.4 1.1-9.9 3.6-11 11-1.1-7.4-3.6-9.9-11-11 7.4-1.1 9.9-3.6 11-11z" fill="#F4B740" />
    </svg>
  );
}

/**
 * The logo: the symbol takes the place of the "N", followed by "onnina".
 * The spark lives in the symbol, so the "i" keeps its normal dot.
 */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span role="img" aria-label="Nonnina" className={cn("wm inline-flex items-baseline", light ? "text-white" : "text-ink", className)}>
      <Mark light={light} className="mr-[0.05em] h-[0.7em] w-[0.7em] self-baseline" />
      <span aria-hidden="true">onnina</span>
    </span>
  );
}

/** Kept for existing imports: same as Logo. */
export const Wordmark = Logo;
