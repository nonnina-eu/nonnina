import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { Logo } from "@/components/logo";
import { AlertsFeed } from "@/components/family/alerts-feed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Family alerts", robots: { index: false } };

type Params = { params: Promise<{ familyId: string }>; searchParams: Promise<{ embed?: string }> };

export default async function FamilyAlertsPage({ params, searchParams }: Params) {
  const { familyId } = await params;
  const { embed } = await searchParams;
  if (!z.string().uuid().safeParse(familyId).success) notFound();
  const feed = await getStore().getFamilyFeed(familyId, 50);
  if (!feed) notFound();

  const senior = feed.seniors[0];
  const compact = embed === "1";

  return (
    <div className="min-h-dvh bg-background">
      {!compact ? (
        <header className="border-b border-border/70 bg-card/80 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" aria-label="Care Copilot home">
              <Logo />
            </Link>
            <span className="text-sm text-muted-foreground">Family {feed.family.name}</span>
          </div>
        </header>
      ) : null}
      <main className={compact ? "p-4" : "container max-w-2xl py-8"}>
        <div className="mb-5">
          <h1 className={compact ? "text-xl font-semibold tracking-tight" : "text-3xl font-semibold tracking-tight"}>
            {senior ? `${senior.first_name}` : "Alerts"}
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 align-middle text-xs font-semibold text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              live
            </span>
          </h1>
          {senior ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {senior.city} · care level {senior.care_level}
              {senior.address_note ? ` · ${senior.address_note}` : ""}
            </p>
          ) : null}
        </div>
        <AlertsFeed familyId={familyId} initial={feed} compact={compact} />
        {!compact ? (
          <p className="mt-8 text-center text-xs text-muted-foreground">Care Copilot is not an emergency service. In an emergency call 112.</p>
        ) : null}
      </main>
    </div>
  );
}
