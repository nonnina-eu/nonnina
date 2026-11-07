import Image from "next/image";
import { photos, type PhotoKey } from "./media";

const steps: { n: string; title: string; body: string; image: PhotoKey; alt: string }[] = [
  {
    n: "1",
    title: "They tap one button",
    body: "The tablet stays at home. There is nothing to learn and no smartphone to unlock.",
    image: "walker",
    alt: "An older person walking through a bright hallway with a walker",
  },
  {
    n: "2",
    title: "They say it in their own words",
    body: "A reminder, a question, or “I fell.” Nonnina answers calmly and writes a short summary.",
    image: "oximeter",
    alt: "A pulse oximeter on an older person’s finger during a home visit",
  },
  {
    n: "3",
    title: "You get the next step",
    body: "Relatives get a text. If it is serious, 112 is on the screen. Nonnina never calls 112 by itself.",
    image: "hands",
    alt: "Two older people holding hands",
  },
];

const moments: { image: PhotoKey; title: string; alt: string }[] = [
  { image: "pressure", title: "A visit, then a note the family can read", alt: "Blood pressure being taken at home" },
  { image: "park", title: "Out of the house, with someone beside them", alt: "An older person in a wheelchair in a park, with a companion" },
  { image: "nurse", title: "A professional stops by. You still see the summary.", alt: "A nurse in a white coat" },
];

export function Story() {
  return (
    <section id="how" className="scroll-mt-20 px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="max-w-[14ch] text-4xl text-[#202128] sm:text-5xl">How it works</h2>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-[#343a46]">Three steps. The same ones, every day.</p>
        <ol className="mt-8 space-y-10">
          {steps.map((step) => (
            <li key={step.n}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[16/9]">
                <Image src={photos[step.image]} alt={step.alt} fill className="object-cover" sizes="(min-width: 1024px) 960px, 100vw" />
              </div>
              <p className="mt-4 text-sm font-bold text-[#476adb]">Step {step.n}</p>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#202128]">{step.title}</h3>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-[#343a46]">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 space-y-4">
          {moments.map((moment) => (
            <figure key={moment.image} className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[16/8]">
              <Image src={photos[moment.image]} alt={moment.alt} fill className="object-cover" sizes="(min-width: 1024px) 960px, 100vw" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#202128] via-[#202128]/55 to-transparent p-5 text-lg font-bold leading-snug text-white">
                {moment.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
