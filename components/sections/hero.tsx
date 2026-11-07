import { getImageProps } from "next/image";
import { Spark } from "../brand";
import { ArrowRight, Bell, CheckBadge } from "../icons";
import type { Dictionary } from "@/lib/i18n";

export function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section className="wrap pt-2 md:pt-3" aria-labelledby="hero-title">
      <div className="relative isolate overflow-hidden rounded-xl bg-latte md:min-h-[min(82vh,760px)]">
        {/* Art direction: hands on desktop, park (vertical, sky behind the text) on mobile. One download per device. */}
        <HeroPicture alt={t.imageAlt} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(250,246,240,.97)_0%,rgba(250,246,240,.94)_62%,rgba(250,246,240,.6)_80%,rgba(250,246,240,0)_100%)] md:bg-[linear-gradient(90deg,rgba(250,246,240,.97)_0%,rgba(250,246,240,.92)_45%,rgba(250,246,240,.7)_58%,rgba(250,246,240,0)_75%)]"
        />

        <div className="grid max-w-[42rem] gap-6 px-5 pb-8 pt-10 sm:px-8 md:px-12 md:pb-10 md:pt-16 lg:max-w-[min(54%,46rem)] lg:pb-14 lg:pt-14">
          <span className="eyebrow"><Spark className="size-3.5" />{t.eyebrow}</span>
          <h1 id="hero-title" className="text-[3rem] leading-[0.92] sm:text-6xl lg:text-[4.5rem] xl:text-[5rem]">
            {t.titleA}
            <span className="mt-[0.3em] block text-[0.56em] font-semibold leading-none tracking-[-0.01em] text-graphite">{t.titleB}</span>
          </h1>
          <p className="max-w-[32rem] text-[1.0625rem] leading-relaxed text-graphite md:text-xl">{t.lede}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#waitlist" className="btn btn-ink">{t.cta}<ArrowRight className="size-[18px]" /></a>
            <a href="/demo" className="btn btn-outline">{t.cta2}</a>
          </div>
          <ul className="flex flex-wrap gap-2">
            {t.trust.map((item) => (
              <li key={item} className="pill bg-white/85"><CheckBadge className="size-3.5" />{item}</li>
            ))}
          </ul>
        </div>

        {/* Product cards: a column in the photo area on large screens, stacked below the copy on smaller ones. */}
        <div aria-hidden="true" className="grid gap-3 px-5 pb-6 sm:px-8 md:grid-cols-2 md:px-12 md:pb-10 lg:absolute lg:bottom-10 lg:right-10 lg:flex lg:w-[min(36%,24rem)] lg:flex-col lg:items-stretch lg:p-0 xl:right-16">
          <div className="card-float grid gap-2 lg:mr-10">
            <span className="flex items-center gap-2 text-[0.9375rem] font-extrabold"><span className="size-2.5 rounded-full bg-bene ring-4 ring-bene/15" />{t.cardVoice}</span>
            <span className="wave flex h-[26px] items-center gap-[3px]"><i /><i /><i /><i /><i /><i /><i /></span>
            <span className="text-sm text-muted">{t.cardVoiceQuote}</span>
          </div>
          <div className="card-float grid gap-1.5 lg:ml-10">
            <span className="flex items-center gap-2 text-[0.9375rem] font-extrabold"><Bell className="size-[18px]" />{t.cardAlert}</span>
            <span className="text-sm text-muted">{t.cardAlertSub}</span>
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          <Spark className="twinkle absolute right-[30%] top-[18%] size-8" />
          <Spark className="twinkle absolute right-[12%] top-[28%] size-5 [animation-delay:.8s]" />
          <Spark className="twinkle absolute bottom-[38%] right-[40%] size-4 [animation-delay:1.6s]" />
        </div>
      </div>
    </section>
  );
}

function HeroPicture({ alt }: { alt: string }) {
  const common = { alt, fill: true, priority: true, sizes: "100vw" } as const;
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: "/photos/hands.jpg" });
  const { props: { srcSet: mobile, ...rest } } = getImageProps({ ...common, src: "/photos/park.jpg" });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} sizes="100vw" />
      <source media="(max-width: 767px)" srcSet={mobile} sizes="100vw" />
      <img {...rest} alt={alt} className="-z-20 object-cover object-[40%_80%] md:object-[70%_45%]" />
    </picture>
  );
}
