import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import { env } from "@/lib/env";
import { SeniorScreen } from "@/components/senior/senior-screen";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const ctx = await getStore().getSeniorByToken(token);
  return { title: ctx ? `${ctx.senior.first_name}` : "Care Copilot", robots: { index: false } };
}

export default async function SeniorPage({ params }: Params) {
  const { token } = await params;
  const ctx = await getStore().getSeniorByToken(token);
  if (!ctx) notFound();
  const { senior, relatives } = ctx;

  return (
    <SeniorScreen
      token={token}
      firstName={senior.first_name}
      language={senior.language}
      city={senior.city}
      medicationTimes={senior.medication_times}
      relatives={relatives.map((r) => ({ name: r.name, phone: r.phone, priority: r.priority }))}
      voiceConfigured={env.elevenlabs()}
    />
  );
}
