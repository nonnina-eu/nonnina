import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Users } from "lucide-react";
import { DEMO_IDS, DEMO_TOKEN } from "@/lib/db";
import { serviceStatus } from "@/lib/env";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { AdvanceLadderButton, ResetDemoButton } from "@/components/demo/demo-controls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Live demo", robots: { index: false } };

export default function DemoPage() {
  const status = serviceStatus();
  const seniorUrl = `/senior/${DEMO_TOKEN}`;
  const alertsUrl = `/family/${DEMO_IDS.family}/alerts`;

  return (
    <div className="min-h-dvh bg-latte text-ink">
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="Nonnina home" className="inline-flex">
            <Logo />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.database === "supabase" ? "success" : "outline"}>db: {status.database}</Badge>
            <Badge variant={status.voice ? "success" : "outline"}>voice: {status.voice ? "ElevenLabs" : "off"}</Badge>
            <Badge variant={status.sms ? "success" : "outline"}>sms: {status.sms ? "Twilio" : "demo"}</Badge>
            <AdvanceLadderButton />
            <ResetDemoButton />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Live demo</p>
            <h1 className="mt-1 text-[2.25rem] leading-[1.02] sm:text-5xl">Maria’s tablet · Anna’s phone</h1>
            <p className="lede mt-2 max-w-2xl">
              Say <em>„Ich bin gestürzt und komme nicht hoch“</em> or press the red Help button on the left. The alert appears on Anna’s phone on the right within seconds. Press <strong>I’m on it</strong> on the phone and Maria’s screen says “Anna kümmert sich.”
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href={seniorUrl} target="_blank" className="inline-flex items-center gap-1 text-link hover:underline">
              Open senior screen <ExternalLink className="size-3.5" />
            </Link>
            <Link href={alertsUrl} target="_blank" className="inline-flex items-center gap-1 text-link hover:underline">
              Open alerts page <ExternalLink className="size-3.5" />
            </Link>
            <Link href="/app" className="inline-flex items-center gap-1 text-link hover:underline">
              Family app <Users className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border-[12px] border-ink bg-ink shadow-device">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-latte">
              <iframe
                data-demo-frame
                title="Senior screen (Maria)"
                src={seniorUrl}
                allow="microphone; autoplay"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[380px] rounded-[2.6rem] border-[10px] border-ink bg-ink shadow-device">
            <div className="h-[720px] overflow-hidden rounded-[2rem] bg-white">
              <div className="flex h-9 items-center justify-center gap-1.5 text-[11px] font-bold text-muted">
                <span className="size-1.5 rounded-full bg-bene" aria-hidden />
                Anna · live
              </div>
              <iframe data-demo-frame title="Family alerts (Anna)" src={`${alertsUrl}?embed=1`} className="h-[calc(100%-2.25rem)] w-full" />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-semibold text-graphite">
          Nonnina is not an emergency service and does not replace 112. Orientation, not legal or medical advice.
        </p>
      </main>
    </div>
  );
}
