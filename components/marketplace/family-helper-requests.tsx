import Link from "next/link";
import { HeartHandshake, Mail, Phone, Search } from "lucide-react";
import { getStore } from "@/lib/db";
import type { Helper, HelperRequest, Senior } from "@/lib/db/types";
import { getMarketplaceT } from "@/lib/i18n/marketplace-locale";
import { Badge } from "@/components/ui/badge";
import { completeHelperRequestForFamily } from "@/app/(product)/app/actions";
import { formatDay, formatEur, formatHours } from "@/lib/i18n/relief";
import { berlinDate } from "@/lib/relief-budget";
import { AutoRefresh } from "./auto-refresh";
import { CompleteJobForm } from "./complete-job-form";
import { NotificationList } from "./notification-list";

const statusVariant = { sent: "warning", accepted: "success", declined: "outline", done: "outline" } as const;

/**
 * "Helpers" panel on /app: the family's requests with their status. The helper's phone and
 * email appear only after the helper accepted.
 */
export async function FamilyHelperRequests({ familyId, seniors, completeError = false }: { familyId: string; seniors: Senior[]; completeError?: boolean }) {
  const { locale, t } = await getMarketplaceT();
  const f = t.family;
  const store = getStore();
  const requests = await store.listHelperRequestsForFamily(familyId);
  const helperIds = [...new Set(requests.map((r) => r.helper_id))];
  const helpers = new Map<string, Helper>();
  await Promise.all(
    helperIds.map(async (id) => {
      const h = await store.getHelper(id);
      if (h) helpers.set(id, h);
    }),
  );
  const seniorName = (id: string) => seniors.find((s) => s.id === id)?.first_name ?? "";
  const waiting = requests.some((r) => r.status === "sent");
  const today = berlinDate(new Date());

  return (
    <section id="helper-requests" aria-labelledby="helper-requests-title" className="mb-6 rounded-xl border border-line bg-white p-5 shadow-soft">
      {waiting ? <AutoRefresh intervalMs={5000} /> : null}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="helper-requests-title" className="font-display inline-flex items-center gap-2 text-2xl text-ink">
          <HeartHandshake className="size-5" aria-hidden /> {f.title}
        </h2>
        <Link href="/helpers" className="inline-flex h-10 items-center gap-2 rounded-sm border-[1.5px] border-ink bg-white px-4 text-sm font-bold text-ink hover:bg-mist">
          <Search className="size-4" aria-hidden /> {f.find}
        </Link>
      </div>
      {completeError ? (
        <p role="alert" className="mb-3 rounded-sm border border-allarme bg-allarme-soft px-4 py-3 text-sm font-bold text-allarme">
          {t.complete.invalid}
        </p>
      ) : null}
      {requests.length === 0 ? (
        <p className="text-sm text-muted">{f.empty}</p>
      ) : (
        <ul className="grid gap-2">
          {requests.slice(0, 8).map((r) => (
            <RequestRow key={r.id} request={r} helper={helpers.get(r.helper_id) ?? null} seniorName={seniorName(r.senior_id)} t={t} locale={locale} today={today} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RequestRow({
  request,
  helper,
  seniorName,
  t,
  locale,
  today,
}: {
  request: HelperRequest;
  helper: Helper | null;
  seniorName: string;
  t: Awaited<ReturnType<typeof getMarketplaceT>>["t"];
  locale: Awaited<ReturnType<typeof getMarketplaceT>>["locale"];
  today: string;
}) {
  const revealed = request.status === "accepted" || request.status === "done";
  return (
    <li className="rounded-lg border border-line bg-latte p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">
          {helper ? (
            <Link href={`/helpers/${helper.id}`} className="hover:underline">
              {t.family.with(helper.name, seniorName)}
            </Link>
          ) : (
            t.family.with("–", seniorName)
          )}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="default">{t.services[request.service]}</Badge>
          <Badge variant={statusVariant[request.status]}>{t.status[request.status]}</Badge>
        </div>
      </div>
      {request.status === "sent" ? <p className="mt-1 text-xs text-muted">{t.family.waiting}</p> : null}
      {request.status === "declined" ? <p className="mt-1 text-xs text-muted">{t.family.declinedHint}</p> : null}
      {revealed && helper ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {helper.phone ? (
            <a href={`tel:${helper.phone}`} className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-3 text-sm font-bold text-white hover:bg-black">
              <Phone className="size-4" aria-hidden /> {helper.phone}
            </a>
          ) : null}
          {helper.email ? (
            <a href={`mailto:${helper.email}`} className="inline-flex h-10 items-center gap-2 rounded-sm border-[1.5px] border-ink bg-white px-3 text-sm font-bold text-ink hover:bg-mist">
              <Mail className="size-4" aria-hidden /> {helper.email}
            </a>
          ) : null}
        </div>
      ) : null}
      {request.status === "done" && request.service_date && request.hours !== null ? (
        <p className="mt-1 text-xs font-bold text-bene">
          {t.complete.summary({ date: formatDay(request.service_date, locale, "long"), hours: formatHours(request.hours, locale), amount: formatEur(request.amount_eur ?? 0, locale) })}
        </p>
      ) : null}
      {request.status === "accepted" ? (
        <CompleteJobForm action={completeHelperRequestForFamily} requestId={request.id} hourlyRate={helper?.hourly_rate_eur ?? null} today={today} locale={locale} />
      ) : null}
      {/* Demo mode: the SMS the family would have received about the answer. */}
      <NotificationList records={request.notified.filter((n) => n.relative_id !== null && n.status === "demo")} locale={locale} />
    </li>
  );
}
