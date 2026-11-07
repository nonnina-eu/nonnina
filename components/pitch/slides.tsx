import Image from "next/image";
import { Logo, Spark } from "@/components/brand";
import { Bell, CheckBadge, Mic, Phone } from "@/components/icons";

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

/* ---------- slides (5, as the jury asks: problem, solution, product, go-to-market, why us) ---------- */

const problem = (
  <div className="absolute inset-0">
    <Image src="/photos/hands.jpg" alt="" fill priority sizes="1600px" className="object-cover object-[75%_45%]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,246,240,.98)_0%,rgba(250,246,240,.95)_50%,rgba(250,246,240,.55)_68%,rgba(250,246,240,0)_85%)]" />
    <div className="absolute left-[110px] top-[80px] text-[46px]"><Logo /></div>
    <div className="absolute left-[110px] top-[200px] max-w-[900px]">
      <Kicker>1 · The problem</Kicker>
      <h1 className="mt-6 text-[78px] leading-[0.95]">Maria is 82 and lives alone. Her daughter Anna finds out too late.</h1>
      <p className="mt-6 max-w-[820px] text-[24px] leading-snug text-graphite">
        Anna, 52, works full time in Munich. She coordinates her mother’s care over calls, WhatsApp and Google. Maria cannot use apps, and a fall can go unnoticed for hours.
      </p>
      <div className="mt-10 grid grid-cols-3 gap-4">
        <Stat value="5.7 M" label="people in Germany need long-term care" tone="bg-white" />
        <Stat value="4.9 M" label="of them are cared for at home (86 %)" tone="bg-menta" />
        <Stat value="3.1 M" label="are looked after mainly by relatives" tone="bg-camomilla" />
      </div>
    </div>
    <Source>Source: Destatis, press release no. 478, 18 Dec 2024 (“5,7 Millionen Pflegebedürftige zum Jahresende 2023”).</Source>
  </div>
);

const solution = (
  <Frame tone="bg-latte">
    <Kicker>2 · The solution</Kicker>
    <Title className="max-w-[1300px] !text-[62px]">One button for Maria. One clear picture for Anna.</Title>
    <p className="mt-5 max-w-[1250px] text-[24px] leading-snug text-graphite">
      Nonnina is a voice companion on a tablet. Maria talks to Lina in German or Italian. Everything Lina cannot solve becomes an action for the family, and an emergency reaches a person in seconds.
    </p>
    <div className="mt-10 grid grid-cols-3 gap-6">
      {[
        { icon: Mic, tone: "bg-menta", who: "Maria talks", what: "“Ich habe einen Brief von der Pflegekasse, den ich nicht verstehe.” Lina listens, answers simply and creates a help request." },
        { icon: Bell, tone: "bg-glicine", who: "Anna takes it", what: "The request appears on Anna’s phone. She taps “I’m on it” and Maria’s tablet says “Anna kümmert sich.”" },
        { icon: Phone, tone: "bg-white ring-2 ring-allarme/25", who: "Emergency", what: "A fall: three independent triggers, SMS to all relatives, a call with “press 1 to confirm”, 112 one tap away on the tablet." },
      ].map(({ icon: Icon, tone, who, what }) => (
        <div key={who} className={`grid content-start gap-5 rounded-[28px] ${tone} p-8`}>
          <span className="grid size-14 place-items-center rounded-[14px] bg-white"><Icon className="size-7" /></span>
          <p className="font-display text-[38px] leading-none">{who}</p>
          <p className="text-[21px] leading-snug text-graphite">{what}</p>
        </div>
      ))}
    </div>
    <Source>Nonnina is not an emergency service and never dials 112 itself. Orientation only, no medical or legal advice.</Source>
  </Frame>
);

const product = (
  <Frame>
    <Kicker>3 · Product · live today</Kicker>
    <Title className="!text-[62px]">Built and running, end to end.</Title>
    <div className="mt-10 grid grid-cols-[1.25fr_1fr] items-start gap-14">
      <div className="rounded-[34px] border-[14px] border-ink bg-ink shadow-device">
        <div className="flex aspect-[4/3] flex-col justify-between rounded-[20px] bg-latte p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[44px] leading-none">Guten Tag, Maria!</p>
              <p className="mt-2 text-[19px] font-semibold text-graphite">Samstag, 7. November · <b>15:10</b></p>
            </div>
            <span className="rounded-full bg-salvia px-4 py-2 text-[16px] font-extrabold text-bene">Anna kümmert sich</span>
          </div>
          <div className="mx-auto grid size-[220px] place-items-center rounded-full bg-ink text-center text-white">
            <div className="grid justify-items-center gap-2 px-6 text-[19px] font-extrabold"><Mic className="size-12" />Tippen und sprechen</div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[17px] font-extrabold text-bene">Anna ist verbunden</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-allarme px-7 py-3 text-[23px] font-extrabold text-white"><Phone className="size-6" />Hilfe</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <ul className="grid gap-3 text-[20px]">
          {[
            "Voice agent Lina on ElevenLabs, German and Italian",
            "Lina’s tools create real events: emergency, help request, reminder",
            "Post-call summary, mood and “needs a person” saved via webhook",
            "SMS and call with “press 1 to confirm” (Twilio), escalation every 90 s",
            "Family login, onboarding, QR code to link the tablet",
            "EU data storage, summaries only, no voice recordings kept",
          ].map((x) => (
            <li key={x} className="flex items-start gap-3"><CheckBadge className="mt-0.5 size-6 shrink-0" />{x}</li>
          ))}
        </ul>
        <p className="mt-2 rounded-[18px] bg-ink px-5 py-4 text-[20px] font-extrabold text-white">Live demo · care-copilot-silk.vercel.app/demo</p>
      </div>
    </div>
  </Frame>
);

const gtm = (
  <Frame tone="bg-latte">
    <Kicker>4 · Go-to-market and business model</Kicker>
    <Title className="!text-[62px]">Next to the Hausnotruf, not against it.</Title>
    <p className="mt-5 max-w-[1250px] text-[23px] leading-snug text-graphite">
      A Hausnotruf answers when someone presses a button. Nonnina keeps Maria company every day and keeps the whole family in the loop. Families can use both.
    </p>
    <div className="mt-10 grid grid-cols-3 gap-6">
      <div className="rounded-[26px] bg-white p-8">
        <p className="font-display text-[34px] leading-none">First customers</p>
        <p className="mt-4 text-[20px] leading-snug text-graphite">Adult children in Stuttgart with a parent 70+ living alone. Free pilot, waitlist on nonnina.eu.</p>
      </div>
      <div className="rounded-[26px] bg-ink p-8 text-white">
        <p className="font-display text-[34px] leading-none">Family plan</p>
        <p className="mt-2 font-display text-[64px] leading-none text-sole">€19<span className="text-[24px] text-white/70"> / month</span></p>
        <p className="mt-3 text-[19px] leading-snug text-white/80">Free for the senior. All relatives included. Proposed price, tested in the pilot.</p>
      </div>
      <div className="rounded-[26px] bg-white p-8">
        <p className="font-display text-[34px] leading-none">Channels</p>
        <p className="mt-4 text-[20px] leading-snug text-graphite">Pflegestützpunkte, caregiver communities, home-care services. Stuttgart, then Germany, then Italy.</p>
      </div>
    </div>
    <div className="mt-8 flex items-center gap-6 rounded-[22px] border-2 border-dashed border-ink/20 px-8 py-6">
      <p className="w-[220px] shrink-0 font-display text-[28px] leading-none">What we ask families today</p>
      <p className="text-[21px] leading-snug text-graphite">“The last time you were not sure your parent was OK, what did you do?” · “Would you pay €19 a month for this?”</p>
    </div>
    <Source>Price comparison in docs/07-pricing.md: call-centre Hausnotruf €27–45/month, family-response systems from €19.95/month. No reimbursement is claimed.</Source>
  </Frame>
);

const whyUs = (
  <Frame tone="bg-ink" dark>
    <Kicker dark>5 · Why now · why us</Kicker>
    <Title className="max-w-[1300px] !text-[62px] text-white">Voice AI finally works for people who never learned apps.</Title>
    <div className="mt-10 grid grid-cols-[1fr_1.1fr] gap-12">
      <div className="grid content-start gap-3 text-[21px]">
        {[
          ["Ruben", "Voice agent, integration, deploy"],
          ["Glory", "Family layer: onboarding, dashboard"],
          ["Arjit", "Helpers marketplace, website"],
          ["David", "Customer interviews, go-to-market"],
          ["Megha", "Benefits and legal facts, competitors"],
        ].map(([n, r]) => (
          <p key={n} className="flex items-baseline gap-4 border-b border-white/15 pb-3"><b className="w-28 font-display text-[28px]">{n}</b><span className="text-white/75">{r}</span></p>
        ))}
        <p className="mt-6 text-[20px] font-bold text-sole">Demo · care-copilot-silk.vercel.app/demo<br />Waitlist · nonnina.eu</p>
      </div>
      <div className="grid content-start gap-4">
        {[
          ["Today", "Voice companion, emergency loop, escalation ladder, family login"],
          ["Pilot", "First Stuttgart families; we measure time from alert to “I’m on it”"],
          ["Next", "Care-insurance paperwork step by step, verified local helpers, Italy"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-5 rounded-[20px] bg-white/[0.07] p-5 ring-1 ring-white/10">
            <span className="w-28 shrink-0 font-display text-[28px] leading-none text-sole">{k}</span>
            <span className="text-[20px] leading-snug text-white/85">{v}</span>
          </div>
        ))}
        <div className="mt-4 flex items-center gap-4 text-[36px]"><Logo light /><span className="text-[20px] font-bold text-white/70">Never alone at home. And the family always knows.</span></div>
      </div>
    </div>
  </Frame>
);

export const slides = [problem, solution, product, gtm, whyUs];
