import { Spark } from "../brand";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, lede, id, center = false, invert = false }: { eyebrow: string; title: string; lede?: string; id?: string; center?: boolean; invert?: boolean }) {
  return (
    <div className={cn("reveal mb-10 grid max-w-[52rem] gap-4 md:mb-14", center && "mx-auto justify-items-center text-center")}>
      <span className={cn("eyebrow", invert && "text-white/75")}><Spark className="size-3.5" />{eyebrow}</span>
      <h2 id={id} className={cn("h-section text-balance", invert && "text-white")}>{title}</h2>
      {lede ? <p className={cn("lede max-w-[44rem] text-balance", invert && "text-white/75")}>{lede}</p> : null}
    </div>
  );
}
