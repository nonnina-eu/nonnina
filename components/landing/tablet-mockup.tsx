import { Mic, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pure HTML/CSS mockup of the senior screen inside a tablet frame.
 * Used in the hero and on the demo page. No stock photos.
 */
export function TabletMockup({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      aria-label="Tablet showing the Care Copilot senior screen"
      role="img"
      className={cn(
        "relative mx-auto aspect-[4/3] w-full max-w-[640px] rounded-[2rem] border-[10px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)]",
        className,
      )}
    >
      <div className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-700" />
      <div className="sky-glow flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.4rem] bg-white p-[5%]">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn("font-semibold tracking-tight text-foreground", compact ? "text-2xl" : "text-2xl sm:text-3xl md:text-4xl")}>Hallo Maria!</p>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Freitag, 7. November · 10:30</p>
          </div>
          <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary sm:text-sm">Tabletten um 18:00</div>
        </div>

        <div className="flex flex-1 items-center justify-center py-2">
          <div className="relative flex items-center justify-center">
            <span className="absolute size-[60%] rounded-full bg-primary/15 blur-xl motion-safe:animate-breathe" />
            <span className="absolute inset-[-14%] rounded-full border-2 border-primary/15" />
            <div className="btn-glossy relative flex aspect-square w-[34vw] max-w-[180px] flex-col items-center justify-center gap-1 rounded-full text-white sm:w-[180px]">
              <Mic className="size-[34%]" strokeWidth={2.2} />
              <span className="text-[11px] font-semibold sm:text-sm">Tippen und sprechen</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-xs font-medium text-emerald-700 sm:text-sm">Anna ist verbunden ✓</p>
          <div className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(220,38,38,0.6)] sm:px-5 sm:py-3 sm:text-base">
            <Phone className="size-4 sm:size-5" />
            Hilfe
          </div>
        </div>
      </div>
    </div>
  );
}
