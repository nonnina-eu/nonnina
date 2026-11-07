import { Spark } from "../brand";

export function TrustStrip({ items }: { items: string[] }) {
  return (
    <section aria-label="Nonnina" className="wrap py-8 md:py-10">
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.9375rem] font-bold text-graphite">
        {items.map((item) => (
          <li key={item} className="inline-flex items-center gap-2"><Spark className="size-3.5" />{item}</li>
        ))}
      </ul>
    </section>
  );
}
