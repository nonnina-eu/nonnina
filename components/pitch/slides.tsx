import Image from "next/image";
import { Logo, Mark, Spark } from "@/components/brand";
import { Bell, CheckBadge, Clock, Doc, Mic, Phone, Users } from "@/components/icons";

/* ---------- building blocks (1600×900 canvas, px units on purpose) ---------- */

function Frame({ children, tone = "bg-white", dark = false }: { children: React.ReactNode; tone?: string; dark?: boolean }) {
  return <div className={`absolute inset-0 px-[110px] py-[90px] ${tone} ${dark ? "text-white" : "text-ink"}`}>{children}</div>;
}

function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[20px] font-extrabold uppercase tracking-[0.1em] ${dark ? "text-white/70" : "text-graphite"}`}>
      <Spark className="size-5" />
      {children}
    </p>
  );
}

function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`mt-6 text-[76px] leading-[0.95] ${className}`}>{children}</h2>;
}

function Source({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={`absolute bottom-7 left-[110px] text-[14px] ${dark ? "text-white/50" : "text-muted"}`}>{children}</p>;
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className={`rounded-[24px] ${tone} p-8`}>
      <p className="font-display text-[68px] leading-none">{value}</p>
      <p className="mt-3 text-[21px] leading-snug text-graphite">{label}</p>
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border-[3px] border-dashed border-sole bg-camomilla/60 p-6 text-[20px] font-bold text-sole-deep">
      {children}
    </div>
  );
}

/* ---------- slides ---------- */

const cover = (
  <div className="absolute inset-0">
    <Image src="/photos/hands.jpg" alt="" fill priority sizes="1600px" className="object-cover object-[70%_45%]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,246,240,.97)_0%,rgba(250,246,240,.93)_42%,rgba(250,246,240,.4)_62%,rgba(250,246,240,0)_78%)]" />
    <div className="absolute left-[110px] top-[110px] text-[54px]"><Logo /></div>
    <div className="absolute bottom-[120px] left-[110px] max-w-[820px]">
      <Kicker>Voice companion for older people at home</Kicker>
      <h1 className="mt-6 text-[104px] leading-[0.92]">
        One button for Nonna.
        <span className="mt-4 block text-[58px] font-semibold leading-none text-graphite">Peace of mind for the whole family.</span>
      </h1>
      <p className="mt-10 text-[22px] font-bold text-graphite">Cursor x Sandbox Hackathon · Stuttgart · 7 November 2026</p>
    </div>
  </div>
);

const problem = (
  <Frame>
    <Kicker>The problem</Kicker>
    <Title>Maria is 82 and lives alone.<br />Anna finds out too late.</Title>
    <div className="mt-14 grid grid-cols-[1.05fr_1fr] gap-12">
      <ul className="grid content-start gap-6 text-[25px] leading-snug">
        <li className="flex gap-4"><span className="w-12 shrink-0 font-display text-[34px] leading-none text-ink/25">01</span><span><b>Anna, 52</b>, works full time in Munich and coordinates her mother’s care over calls, WhatsApp and Google.</span></li>
        <li className="flex gap-4"><span className="w-12 shrink-0 font-display text-[34px] leading-none text-ink/25">02</span><span><b>Maria, 82</b>, care level 3 in Stuttgart, cannot use apps. A fall can go unnoticed for hours.</span></li>
        <li className="flex gap-4"><span className="w-12 shrink-0 font-display text-[34px] leading-none text-ink/25">03</span><span>Benefits, contracts and helpers are a maze. <b>Help that exists goes unused.</b></span></li>
      </ul>
      <div className="grid grid-cols-2 gap-5">
        <Stat value="5.5 M" label="people in Germany receive care benefits and are cared for at home" tone="bg-menta" />
        <Stat value="6 → ~9 M" label="people aged 80+ today → in 2050 (8.5–9.8 M)" tone="bg-camomilla" />
        <Stat value="280–690 k" label="professional carers missing by 2049" tone="bg-glicine" />
        <Stat value="1 in 3" label="Europeans aged 65–74 has basic digital skills" tone="bg-salvia" />
      </div>
    </div>
    <Source>Sources: Destatis 2025 (care statistics, population projection), Pflegekräftevorausberechnung 2049, Eurostat digital skills 2024 · see docs/05-market-and-evidence.md</Source>
  </Frame>
);

const solution = (
  <Frame tone="bg-latte">
    <Kicker>The solution</Kicker>
    <Title className="max-w-[1300px] !text-[62px]">Nonnina is a voice-first care companion that connects seniors, their families and trusted local helpers.</Title>
    <div className="mt-14 grid grid-cols-3 gap-6">
      {[
        { icon: Mic, tone: "bg-menta", who: "For Maria", what: "One big button on a tablet. She talks, Lina answers in German or Italian, reminds her of her tablets and listens.", tenx: "1 button instead of apps" },
        { icon: Bell, tone: "bg-glicine", who: "For Anna", what: "Real-time alerts, a short summary after every conversation and an “I’m on it” button for the whole family.", tenx: "1 place instead of 5 channels" },
        { icon: Users, tone: "bg-camomilla", who: "For helpers (next)", what: "Verified local helpers and the paperwork for care insurance, step by step.", tenx: "Every need ends in an action" },
      ].map(({ icon: Icon, tone, who, what, tenx }) => (
        <div key={who} className={`grid content-between gap-8 rounded-[28px] ${tone} p-9`}>
          <span className="grid size-16 place-items-center rounded-[16px] bg-white"><Icon className="size-8" /></span>
          <div>
            <p className="font-display text-[40px] leading-none">{who}</p>
            <p className="mt-3 text-[21px] leading-snug text-graphite">{what}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[18px] font-extrabold"><CheckBadge className="size-5" />{tenx}</p>
          </div>
        </div>
      ))}
    </div>
  </Frame>
);

const safety = (
  <Frame tone="bg-ink" dark>
    <Kicker dark>How the safety loop works</Kicker>
    <Title className="max-w-[1200px] text-white">From signal to the right person in seconds.</Title>
    <div className="mt-14 grid grid-cols-4 gap-5">
      {[
        { n: "01", t: "Signal", d: "Maria says “Ich bin gestürzt”, or presses the red Help button." },
        { n: "02", t: "Triage in code", d: "Three independent triggers: Lina, a keyword net, the button. Two levels: warning and emergency." },
        { n: "03", t: "Escalation ladder", d: "SMS to all relatives. Anna is called: “press 1 to confirm”. No answer in 90 s → next relative → fallback." },
        { n: "04", t: "Loop closed", d: "Maria sees “Anna kümmert sich”. 112 is one tap away on the tablet. The family gets the all-clear." },
      ].map((s) => (
        <div key={s.n} className="rounded-[24px] bg-white/[0.06] p-7 ring-1 ring-white/10">
          <p className="font-display text-[44px] leading-none text-sole">{s.n}</p>
          <p className="mt-5 font-display text-[34px] leading-none">{s.t}</p>
          <p className="mt-3 text-[20px] leading-snug text-white/75">{s.d}</p>
        </div>
      ))}
    </div>
    <blockquote className="mt-12 max-w-[1150px] border-l-4 border-sole pl-6 text-[26px] leading-snug text-white/85">
      “The value is not the device, but the shorter distance between a signal and a meaningful intervention.”
    </blockquote>
    <Source dark>Nonnina is not an emergency service and never dials 112 itself. Research thesis: deep-research report “Silver Society, Instant Care”, Nov 2026.</Source>
  </Frame>
);

const product = (
  <Frame>
    <Kicker>Product · live today</Kicker>
    <Title>Built and running, end to end.</Title>
    <div className="mt-12 grid grid-cols-[1.25fr_1fr] items-start gap-14">
      {/* Tablet */}
      <div className="rounded-[34px] border-[14px] border-ink bg-ink shadow-device">
        <div className="flex aspect-[4/3] flex-col justify-between rounded-[20px] bg-latte p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[46px] leading-none">Guten Morgen, Maria!</p>
              <p className="mt-2 text-[20px] font-semibold text-graphite">Samstag, 7. November · <b>10:30</b></p>
            </div>
            <span className="rounded-full bg-camomilla px-4 py-2 text-[17px] font-extrabold text-sole-deep">Tabletten um 18:00</span>
          </div>
          <div className="mx-auto grid size-[230px] place-items-center rounded-full bg-ink text-center text-white">
            <div className="grid justify-items-center gap-2 text-[20px] font-extrabold"><Mic className="size-14" />Tippen und sprechen</div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[18px] font-extrabold text-bene">✓ Anna ist verbunden</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-allarme px-7 py-3 text-[24px] font-extrabold text-white"><Phone className="size-6" />Hilfe</span>
          </div>
        </div>
      </div>
      {/* Phone feed + facts */}
      <div className="grid gap-5">
        <div className="rounded-[22px] border-l-[8px] border-allarme bg-white p-6 shadow-float">
          <p className="inline-flex rounded-full bg-allarme-soft px-3 py-1 text-[15px] font-extrabold text-allarme">Emergency · 4 s ago</p>
          <p className="mt-3 text-[22px] font-extrabold">Fall, cannot get up</p>
          <p className="text-[19px] italic text-muted">“Ich bin gestürzt und komme nicht hoch”</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2 text-[17px] font-bold text-white"><Phone className="size-4" />I’m on it</p>
        </div>
        <ul className="grid gap-3 text-[20px]">
          {["Voice in German and Italian (ElevenLabs)", "SMS + call with “press 1” (Twilio)", "Family login, onboarding, QR to link the tablet", "Supabase in the EU · no voice recordings stored"].map((x) => (
            <li key={x} className="flex items-center gap-3"><CheckBadge className="size-6 shrink-0" />{x}</li>
          ))}
        </ul>
        <p className="text-[20px] font-extrabold">Live demo: care-copilot-silk.vercel.app/demo</p>
      </div>
    </div>
  </Frame>
);

const validation = (
  <Frame tone="bg-latte">
    <Kicker>Validation</Kicker>
    <Title>What families told us.</Title>
    <div className="mt-12 grid grid-cols-[1.3fr_1fr] gap-10">
      <Placeholder>
        Real quote from an interview goes here (first name or initials only).
        <span className="mt-3 block text-[17px] font-semibold">To fill by David / Megha · docs/agents/agent-research-pitch.md</span>
      </Placeholder>
      <div className="grid gap-5">
        <Placeholder>[N] interviews with adult children and carers</Placeholder>
        <Placeholder>[N] sign-ups on the waitlist (nonnina-website.vercel.app)</Placeholder>
      </div>
    </div>
    <div className="relative mt-10 h-[230px] overflow-hidden rounded-[28px]">
      <Image src="/photos/park.jpg" alt="" fill sizes="1400px" className="object-cover object-[40%_58%]" />
    </div>
  </Frame>
);

const market = (
  <Frame>
    <Kicker>Market and competition</Kicker>
    <Title className="!text-[60px]">Others sell devices and call centres. We put the family in the loop.</Title>
    <table className="mt-10 w-full border-separate border-spacing-0 text-left text-[19px] leading-snug">
      <thead>
        <tr className="text-[16px] uppercase tracking-[0.08em] text-muted">
          <th className="pb-3 font-extrabold">Who</th><th className="pb-3 font-extrabold">What they sell</th><th className="pb-3 font-extrabold">Price</th><th className="pb-3 font-extrabold">Gap</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Hausnotruf (Malteser, libify…)", "Button + 24/7 call centre", "€27–65 / month", "No conversation, family not in the loop"],
          ["easierLife HOME Family", "Emergency system, family responds", "€19.95 / month + setup", "No voice companion, no coordination"],
          ["VmedD", "Contactless sensors", "€239 + €12.95 / month", "Detects, does not talk or coordinate"],
          ["LINDERA", "Mobility analysis app", "€10–12 / month", "Prevention only, no alerts"],
          ["ElliQ", "Companion robot", "$39–59 / month", "Not in DE/IT, no family workflow"],
        ].map((r) => (
          <tr key={r[0]} className="align-top">
            {r.map((c, i) => <td key={i} className={`border-t border-line py-3 pr-6 ${i === 0 ? "font-extrabold" : "text-graphite"} ${i === 2 ? "whitespace-nowrap" : ""}`}>{c}</td>)}
          </tr>
        ))}
        <tr className="align-top">
          <td className="rounded-l-[16px] bg-ink py-3 pl-4 pr-6 font-extrabold text-white"><span className="inline-flex items-center gap-2"><Mark light className="size-6" />Nonnina</span></td>
          <td className="bg-ink py-3 pr-6 text-white/85">Voice companion + family coordination</td>
          <td className="whitespace-nowrap bg-ink py-3 pr-6 font-bold text-sole">€19 / month</td>
          <td className="rounded-r-[16px] bg-ink py-3 pr-4 text-white/85">Talks, triages, alerts, guides the paperwork</td>
        </tr>
      </tbody>
    </table>
    <Source>Prices from public price lists collected in docs/reference/pricing-report.md and docs/05-market-and-evidence.md. Market sizes overlap and are not added up.</Source>
  </Frame>
);

const gtm = (
  <Frame tone="bg-latte">
    <Kicker>Go-to-market and business model</Kicker>
    <Title>Free for the senior. Families pay €19 a month.</Title>
    <div className="mt-12 grid grid-cols-3 gap-6">
      <div className="rounded-[26px] bg-white p-8">
        <p className="font-display text-[36px] leading-none">Pilot</p>
        <p className="mt-2 font-display text-[60px] leading-none">Free</p>
        <p className="mt-4 text-[20px] leading-snug text-graphite">Stuttgart families with a parent 70+ living alone. Waitlist from the website.</p>
      </div>
      <div className="rounded-[26px] bg-ink p-8 text-white">
        <p className="font-display text-[36px] leading-none">Family plan</p>
        <p className="mt-2 font-display text-[60px] leading-none text-sole" data-pricing="family">€19<span className="text-[26px] text-white/70"> / month</span></p>
        <p className="mt-4 text-[20px] leading-snug text-white/80">All relatives included. Own tablet, cancel monthly. €29 with a ready-to-use tablet. Below call-centre Hausnotruf (€27–45).</p>
      </div>
      <div className="rounded-[26px] bg-white p-8">
        <p className="font-display text-[36px] leading-none">Reimbursement path</p>
        <p className="mt-2 font-display text-[60px] leading-none">DiPA</p>
        <p className="mt-4 text-[20px] leading-snug text-graphite">§40b SGB XI: up to €40/month + €30 support. Open to apps that relieve family carers since July 2026. Not listed yet.</p>
      </div>
    </div>
    <div className="mt-10 grid grid-cols-3 gap-6 text-[20px] font-bold">
      <p className="flex items-center gap-3"><Users className="size-7 shrink-0" />Channels: Pflegestützpunkte, caregiver communities, home-help providers</p>
      <p className="flex items-center gap-3"><Doc className="size-7 shrink-0" />Later: provider subscriptions, B2B2C via care insurers</p>
      <p className="flex items-center gap-3"><Clock className="size-7" />Stuttgart → Germany → Italy</p>
    </div>
    <Source>Proposed pricing, to be validated in pilot interviews (docs/07-pricing.md). DiPA is a path we are preparing, not a reimbursement we have today.</Source>
  </Frame>
);

const whyUs = (
  <Frame>
    <Kicker>Why now · why us · what is next</Kicker>
    <Title className="!text-[60px]">Voice AI finally works for people who never learned apps.</Title>
    <div className="mt-12 grid grid-cols-[1fr_1.1fr] gap-12">
      <div className="grid content-start gap-4 text-[22px]">
        {[
          ["Ruben", "Voice agent, integration, deploy"],
          ["Glory", "Family layer: onboarding, dashboard"],
          ["Arjit", "Helpers marketplace, website"],
          ["David", "Customer interviews, go-to-market"],
          ["Megha", "Benefits and legal facts, competitors"],
        ].map(([n, r]) => (
          <p key={n} className="flex items-baseline gap-4 border-b border-line pb-3"><b className="w-28 font-display text-[30px]">{n}</b><span className="text-graphite">{r}</span></p>
        ))}
      </div>
      <ol className="grid content-start gap-4">
        {[
          ["Today", "MVP: voice, emergency loop, escalation ladder, family login"],
          ["Pilot", "First Stuttgart families on real phones, measure time-to-acknowledge"],
          ["Layer 2", "Care-insurance benefits and paperwork, step by step"],
          ["Layer 3", "Verified local helpers · Italy"],
        ].map(([k, v], i) => (
          <li key={k} className={`flex items-center gap-5 rounded-[20px] p-5 ${["bg-salvia", "bg-menta", "bg-cielo", "bg-glicine"][i]}`}>
            <span className="w-36 shrink-0 font-display text-[30px] leading-none">{k}</span>
            <span className="text-[21px] leading-snug">{v}</span>
          </li>
        ))}
      </ol>
    </div>
  </Frame>
);

const closing = (
  <div className="absolute inset-0 bg-ink text-white">
    <div className="absolute inset-0 opacity-30">
      <Image src="/photos/tea.jpg" alt="" fill sizes="1600px" className="object-cover" />
    </div>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,33,40,.55),rgba(32,33,40,.92))]" />
    <div className="absolute inset-0 grid place-items-center text-center">
      <div>
        <Spark className="mx-auto size-14" />
        <p className="mt-8 font-display text-[92px] leading-[0.95]">Never alone at home.<br />And the family always knows.</p>
        <div className="mt-12 flex items-center justify-center gap-10 text-[24px] font-bold text-white/85">
          <span>Demo · care-copilot-silk.vercel.app/demo</span>
          <span>Waitlist · nonnina-website.vercel.app</span>
        </div>
        <div className="mt-10 inline-flex text-[44px]"><Logo light /></div>
      </div>
    </div>
  </div>
);

export const slides = [cover, problem, solution, safety, product, validation, market, gtm, whyUs, closing];
