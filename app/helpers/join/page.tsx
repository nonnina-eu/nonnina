import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, UserRound } from "lucide-react";
import { authMode, getCurrentMember } from "@/lib/auth";
import { getHelperSession } from "@/lib/helper-auth";
import { getMarketplaceT } from "@/lib/i18n/marketplace-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError, PageTitle, Section } from "@/components/family/shell";
import { HelperProfileForm } from "@/components/marketplace/helper-profile-form";
import { MarketplaceShell } from "@/components/marketplace/shell";
import { continueAsDemoHelper, saveHelperProfile, sendHelperMagicLink } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Offer help", description: "Create a free helper profile on Nonnina and receive requests from families nearby." };

type Props = { searchParams: Promise<{ sent?: string; error?: string }> };

const errors: Record<string, string> = {
  email: "Please enter a valid email address.",
  send: "We could not send the link. Please try again in a minute.",
  config: "Sign-in is not configured on this deployment.",
};

export default async function HelperJoinPage({ searchParams }: Props) {
  const { sent, error } = await searchParams;
  const { locale, t } = await getMarketplaceT();
  const j = t.join;
  const [session, member] = await Promise.all([getHelperSession(), getCurrentMember()]);
  if (session?.helper) redirect("/helpers/me");
  const mode = authMode();
  const needsAccount = mode === "supabase" && !session;

  return (
    <MarketplaceShell locale={locale} active="offer" isFamily={Boolean(member?.family)} here="/helpers/join" narrow>
      <PageTitle eyebrow={j.eyebrow} title={j.title} lede={j.lede} />

      <ol className="mb-6 grid gap-2 text-sm text-ink">
        {j.how.map((step, i) => (
          <li key={step} className="flex gap-3 rounded-lg border border-line bg-white px-4 py-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white" aria-hidden>
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <div className="grid gap-6">
        {needsAccount ? (
          sent ? (
            <Section tone="salvia" title={j.sentTitle}>
              <p className="text-ink">{j.sentBody(sent)}</p>
            </Section>
          ) : (
            <Section title={j.emailTitle}>
              <p className="mb-4 text-sm text-ink">{j.emailLede}</p>
              <FormError message={error ? (errors[error] ?? errors.send) : null} />
              <form action={sendHelperMagicLink} className="mt-4 grid gap-5">
                <Field label={j.email} htmlFor="email">
                  <Input id="email" name="email" type="email" autoComplete="email" required placeholder="lucia@example.com" />
                </Field>
                <Button type="submit" size="lg">
                  <Mail aria-hidden /> {j.sendLink}
                </Button>
              </form>
            </Section>
          )
        ) : (
          <>
            {mode === "demo" ? (
              <Section tone="glicine" title={j.demoTitle}>
                <p className="mb-4 text-sm text-ink">{j.demoLede}</p>
                <form action={continueAsDemoHelper}>
                  <Button type="submit" variant="outline" size="lg" className="w-full">
                    <UserRound aria-hidden /> {j.demoContinue}
                  </Button>
                </form>
              </Section>
            ) : null}
            <Section title={j.formTitle}>
              <HelperProfileForm action={saveHelperProfile} locale={locale} mode="create" helper={{ email: session?.email ?? "", city: "Stuttgart" }} />
            </Section>
          </>
        )}
      </div>
    </MarketplaceShell>
  );
}
