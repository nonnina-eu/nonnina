import { Spark } from "../brand";
import type { Dictionary } from "@/lib/i18n";

export function PromiseBand({ t }: { t: Dictionary["promise"] }) {
  return (
    <section className="wrap py-16 md:py-28">
      <div className="reveal relative mx-auto max-w-[60rem] text-center">
        <Spark className="twinkle mx-auto mb-6 size-10" />
        <p className="font-display text-balance text-[2.5rem] leading-[0.95] sm:text-6xl lg:text-[4.5rem]">{t.title}</p>
        <p className="mt-6 text-lg text-muted">{t.body}</p>
      </div>
    </section>
  );
}
