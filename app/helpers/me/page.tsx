import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Check, Clock, LogOut, Mail, Phone, X } from "lucide-react";
import { getCurrentMember } from "@/lib/auth";
import { getStore } from "@/lib/db";
import type { HelperRequest, Relative, Senior } from "@/lib/db/types";
import { getHelperSession } from "@/lib/helper-auth";
import { getMarketplaceT } from "@/lib/i18n/marketplace-locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormError, PageTitle, Section } from "@/components/family/shell";
import { HelperProfileForm } from "@/components/marketplace/helper-profile-form";
import { NotificationList } from "@/components/marketplace/notification-list";
import { MarketplaceShell } from "@/components/marketplace/shell";
import { AutoRefresh } from "@/components/marketplace/auto-refresh";
import { respondToHelperRequest, saveHelperProfile, signOutHelper } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My helper profile", robots: { index: false } };

type Props = { searchParams: Promise<{ welcome?: string; error?: string }> };

interface RequestView {
  request: HelperRequest;
  senior: Pick<Senior, "first_name" | "city"> | null;
  /** Only filled once the helper accepted: the family contact is revealed then. */
  contact: Pick<Relative, "name" | "phone" | "email"> | null;
}

const statusVariant = { sent: "warning", accepted: "success", declined: "outline", done: "outline" } as const;

export default async function HelperMePage({ searchParams }: Props) {
  const { welcome, error } = await searchParams;
  const session = await getHelperSession();
  if (!session?.helper) redirect("/helpers/join");
  const helper = session.helper;
  const { locale, t } = await getMarketplaceT();
  const m = t.me;
  const store = getStore();
  const member = await getCurrentMember();

  const requests = await store.listHelperRequestsForHelper(helper.id);
  const views: RequestView[] = await Promise.all(
    requests.map(async (request) => {
      const ctx = await store.getSeniorById(request.senior_id);
      const revealed = request.status === "accepted" || request.status === "done";
      const relative = revealed && request.relative_id ? await store.getRelative(request.relative_id) : null;
      return {
        request,
        // Before accepting: first name and city only.
        senior: ctx ? { first_name: ctx.senior.first_name, city: ctx.senior.city } : null,
        contact: relative ? { name: relative.name, phone: relative.phone, email: relative.email } : null,
      };
    }),
  );
  const pending = views.some((v) => v.request.status === "sent");

  return (
    <MarketplaceShell locale={locale} active="offer" isHelper isFamily={Boolean(member?.family)} here="/helpers/me" narrow>
      <AutoRefresh intervalMs={5000} />
      <PageTitle eyebrow={t.join.eyebrow} title={m.title(helper.name.split(" ")[0])} />

      <div className="mb-6 grid gap-3">
        <FormError message={error ? t.requestErrors.generic : null} />
        {welcome ? (
          <p role="status" className="rounded-sm border border-salvia bg-salvia px-4 py-3 text-sm font-bold text-bene">
            {t.form.saved}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-soft">
          {helper.verified ? (
            <Badge variant="success">
              <BadgeCheck className="size-3.5" aria-hidden /> {t.common.verified}
            </Badge>
          ) : (
            <Badge variant="warning">
              <Clock className="size-3.5" aria-hidden /> {t.common.notVerified}
            </Badge>
          )}
          <p className="flex-1 text-sm text-ink">{helper.verified ? m.verified : m.pending}</p>
          <Link href={`/helpers/${helper.id}`} className="text-sm font-bold text-link underline-offset-4 hover:underline">
            {m.viewPublic}
          </Link>
        </div>
        {!helper.active ? <p className="text-sm text-muted">{m.inactive}</p> : null}
      </div>

      <div className="grid gap-6">
        <section aria-labelledby="requests-title" className="grid gap-3">
          <h2 id="requests-title" className="font-display text-2xl text-ink">
            {m.requests}
            {pending ? <span className="ml-2 align-middle text-sm font-bold text-sole-deep">● {views.filter((v) => v.request.status === "sent").length}</span> : null}
          </h2>
          {views.length === 0 ? <p className="rounded-xl border border-line bg-white p-6 text-sm text-muted">{m.noRequests}</p> : null}
          {views.map(({ request, senior, contact }) => (
            <article key={request.id} id={`request-${request.id}`} className="rounded-xl border border-line bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="default">{t.services[request.service]}</Badge>
                <Badge variant={statusVariant[request.status]}>{t.status[request.status]}</Badge>
              </div>
              <p className="mt-3 font-bold text-ink">{senior ? m.requestFrom(senior.first_name, senior.city) : "–"}</p>
              <p className="mt-1 whitespace-pre-line text-ink">{request.message}</p>
              {request.preferred_time ? (
                <p className="mt-2 text-sm text-muted">
                  {m.preferredTime}: {request.preferred_time}
                </p>
              ) : null}
              <time className="mt-2 block text-xs text-muted" dateTime={request.created_at}>
                {new Date(request.created_at).toLocaleString(locale === "en" ? "en-GB" : locale, { dateStyle: "medium", timeStyle: "short" })}
              </time>

              {contact ? (
                <div className="mt-4 rounded-lg border border-line bg-salvia p-4">
                  <p className="text-sm font-bold text-ink">{m.contactTitle}</p>
                  <p className="mt-1 text-ink">{m.familyContact(contact.name)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="inline-flex h-11 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-bold text-white hover:bg-black">
                        <Phone className="size-4" aria-hidden /> {contact.phone}
                      </a>
                    ) : null}
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="inline-flex h-11 items-center gap-2 rounded-sm border-[1.5px] border-ink bg-white px-4 text-sm font-bold text-ink hover:bg-mist">
                        <Mail className="size-4" aria-hidden /> {contact.email}
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-muted">{m.contactHint}</p>
                </div>
              ) : null}

              {request.status === "sent" || request.status === "accepted" ? (
                <form action={respondToHelperRequest} className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="request_id" value={request.id} />
                  {request.status === "sent" ? (
                    <>
                      <Button type="submit" name="action" value="accept">
                        <Check aria-hidden /> {m.accept}
                      </Button>
                      <Button type="submit" name="action" value="decline" variant="outline">
                        <X aria-hidden /> {m.decline}
                      </Button>
                    </>
                  ) : (
                    <Button type="submit" name="action" value="done" variant="outline">
                      <Check aria-hidden /> {m.markDone}
                    </Button>
                  )}
                </form>
              ) : null}
              {request.status !== "sent" ? <NotificationList records={request.notified.filter((n) => n.relative_id !== null)} locale={locale} /> : null}
            </article>
          ))}
        </section>

        <Section title={m.profile}>
          <HelperProfileForm action={saveHelperProfile} locale={locale} mode="edit" helper={helper} />
        </Section>

        <form action={signOutHelper}>
          <Button type="submit" variant="ghost" className="text-muted">
            <LogOut aria-hidden /> {t.nav.signOut}
          </Button>
        </form>
      </div>
    </MarketplaceShell>
  );
}
