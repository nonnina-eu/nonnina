import { cn } from "@/lib/utils";

const SPARK = "M10 0c.9 6.4 3.1 8.6 10 10-6.9 1.4-9.1 3.6-10 10-.9-6.4-3.1-8.6-10-10 6.9-1.4 9.1-3.6 10-10z";

/** The Sole spark: the voice. Lights up when Nonnina listens. */
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

/** "Nonnina" wordmark – the spark replaces the dot of the i. Text stays real for screen readers. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("wm", className)} aria-label="Nonnina" role="img">
      <span aria-hidden="true">Nonn</span>
      <span className="wm-i" aria-hidden="true">
        ı
        <svg viewBox="0 0 20 20" className="wm-spark">
          <path d={SPARK} />
        </svg>
      </span>
      <span aria-hidden="true">na</span>
    </span>
  );
}

/** Backwards-compatible alias used by older components. */
export function LogoMark({ className }: { className?: string }) {
  return <Mark className={cn("size-9", className)} />;
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-[0.32em] text-[1.35rem]", className)}>
      <Mark className="h-[1.05em] w-[1.05em]" light={light} />
      <Wordmark className={light ? "text-white" : "text-ink"} />
    </span>
  );
}
