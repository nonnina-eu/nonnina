import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_IDS, getStore } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { familyT } from "@/lib/i18n/family";
import { Logo } from "@/components/logo";
import { AlertsFeed } from "@/components/family/alerts-feed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Family alerts", robots: { index: false } };

type Params = { params: Promise<{ familyId: string }>; searchParams: Promise<{ embed?: string }> };

/**
 * Link-protected read-only feed used by the /demo page (`?embed=1` inside Anna's phone frame).
 * Families use the authenticated area at /app.
 */
export default async function FamilyAlertsPage({ params, searchParams }: Params) {
  const { familyId } = await params;
  const { embed } = await searchParams;
  if (!z.string().uuid().safeParse(familyId).success) notFound();
  if (familyId !== DEMO_IDS.family) {
    const member = await getCurrentMember();
    if (!member) redirect(`/login?next=/family/${familyId}/alerts`);
    if (member.family?.id !== familyId) notFound();
  }
  const store = getStore();
  const [feed, overview] = await Promise.all([store.getFamilyFeed(familyId, 50), store.getFamilyOverview(familyId)]);
  if (!feed) notFound();

  const t = familyT();
  const senior = feed.seniors[0];
  const compact = embed === "1";
  const isDemo = familyId === DEMO_IDS.family;
  const relatives = overview ? [...overview.relatives].sort((a, b) => a.priority - b.priority) : [];
  const viewer = relatives[0] ?? null;

  return (
    <div className="min-h-dvh bg-latte">
      {!compact ? (
        <header className="border-b border-line bg-white/85 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" aria-label="Nonnina">
              <Logo />
            </Link>
            <span className="text-sm text-muted">Family {feed.family.name}</span>
          </div>
        </header>
      ) : null}
      <main className={compact ? "p-4" : "container max-w-2xl py-8"}>
        <div className="mb-5">
          <h1 className={compact ? "font-display text-2xl text-ink" : "font-display text-4xl text-ink"}>
            {senior ? senior.first_name : t.nav.alerts}
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-salvia px-2.5 py-0.5 align-middle text-xs font-bold text-bene">
              <span className="size-1.5 rounded-full bg-bene" />
              {t.live}
            </span>
          </h1>
          {senior ? (
            <p className="mt-1 text-sm text-muted">
              {senior.city} · {senior.care_level > 0 ? `Pflegegrad ${senior.care_level}` : "no care level"}
              {senior.address_note ? ` · ${senior.address_note}` : ""}
            </p>
          ) : null}
          {compact && viewer ? <p className="mt-1 text-xs text-muted">Signed in as {viewer.name}</p> : null}
        </div>
        <AlertsFeed familyId={familyId} initial={feed} compact={compact} relativeId={viewer?.id ?? null} relatives={relatives} canResolve={isDemo} />
        {!compact ? (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-muted">
            <p>
              {t.demoPageNote}{" "}
              <Link href="/app" className="font-bold text-link underline-offset-4 hover:underline">
                Open the family app
              </Link>
            </p>
            <p>{t.footer}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
