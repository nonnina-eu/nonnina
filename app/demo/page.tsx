import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DEMO_IDS, DEMO_TOKEN } from "@/lib/db";
import { serviceStatus } from "@/lib/env";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { ResetDemoButton } from "@/components/demo/demo-controls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Live demo", robots: { index: false } };

export default function DemoPage() {
  const status = serviceStatus();
  const seniorUrl = `/senior/${DEMO_TOKEN}`;
  const alertsUrl = `/family/${DEMO_IDS.family}/alerts`;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="Nonnina home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant={status.database === "supabase" ? "success" : "outline"}>db: {status.database}</Badge>
            <Badge variant={status.voice ? "success" : "outline"}>voice: {status.voice ? "ElevenLabs" : "off"}</Badge>
            <Badge variant={status.sms ? "success" : "outline"}>sms: {status.sms ? "Twilio" : "demo"}</Badge>
            <ResetDemoButton />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Maria’s tablet · Anna’s phone</h1>
            <p className="mt-1 text-muted-foreground">
              Say <em>„Ich bin gestürzt und komme nicht hoch“</em> or press the red button on the left. The alert appears on the right in real time.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href={seniorUrl} target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline">
              Open senior screen <ExternalLink className="size-3.5" />
            </Link>
            <Link href={alertsUrl} target="_blank" className="inline-flex items-center gap-1 text-primary hover:underline">
              Open alerts page <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[2rem] border-[12px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
            <div className="aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-white">
              <iframe
                data-demo-frame
                title="Senior screen (Maria)"
                src={seniorUrl}
                allow="microphone; autoplay"
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[380px] rounded-[2.6rem] border-[10px] border-slate-900 bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]">
            <div className="h-[720px] overflow-hidden rounded-[2rem] bg-background">
              <div className="flex h-9 items-center justify-center text-[11px] font-semibold text-muted-foreground">Anna · live</div>
              <iframe data-demo-frame title="Family alerts (Anna)" src={`${alertsUrl}?embed=1`} className="h-[calc(100%-2.25rem)] w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
