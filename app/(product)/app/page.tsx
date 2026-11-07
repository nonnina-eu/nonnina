import type { Metadata } from "next";
import Link from "next/link";
import { getStore } from "@/lib/db";
import { getMemberOverview, requireMember } from "@/lib/auth";
import { familyT } from "@/lib/i18n/family";
import { AlertsFeed } from "@/components/family/alerts-feed";
import { FamilyShell } from "@/components/family/shell";
import { FamilyHelperRequests } from "@/components/marketplace/family-helper-requests";
import { ReliefBudgetCard } from "@/components/family/relief-budget-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Alerts", robots: { index: false } };

type Props = { searchParams: Promise<{ budget_month?: string; budget_senior?: string; complete_error?: string }> };

export default async function FamilyHomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const member = await requireMember();
  const overview = await getMemberOverview(member);
  const senior = overview?.seniors[0];
  const family = member.family!;
  const feed = await getStore().getFamilyFeed(family.id, 50);
  const t = familyT();

  return (
    <FamilyShell active="alerts" seniorName={senior?.first_name ?? null}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-ink">
            {senior ? senior.first_name : t.nav.alerts}
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-salvia px-2.5 py-0.5 align-middle text-xs font-bold text-bene">
              <span className="size-1.5 rounded-full bg-bene" />
              {t.live}
            </span>
          </h1>
          {senior ? (
            <p className="mt-1 text-sm text-muted">
              {senior.city} · {senior.care_level > 0 ? `Pflegegrad ${senior.care_level}` : "no care level yet"}
              {senior.address_note ? ` · ${senior.address_note}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              No parent profile yet.{" "}
              <Link href="/app/setup?step=2" className="font-bold text-link underline-offset-4 hover:underline">
                Finish the setup
              </Link>
              .
            </p>
          )}
        </div>
        {overview && overview.relatives.length > 0 ? (
          <p className="text-xs text-muted">
            Alert order: {[...overview.relatives].sort((a, b) => a.priority - b.priority).map((r) => r.name).join(" → ")}
            {family.fallback_phone ? " → fallback" : ""}
          </p>
        ) : null}
      </div>

      <ReliefBudgetCard familyId={family.id} seniors={overview?.seniors ?? []} month={sp.budget_month} seniorId={sp.budget_senior} />

      <FamilyHelperRequests familyId={family.id} seniors={overview?.seniors ?? []} completeError={sp.complete_error === "1"} />

      {feed ? (
        <AlertsFeed familyId={family.id} initial={feed} relativeId={member.relative?.id ?? null} relatives={overview?.relatives ?? []} />
      ) : (
        <p className="text-muted">No data for this family yet.</p>
      )}
    </FamilyShell>
  );
}
