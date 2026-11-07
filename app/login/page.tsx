import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, Sparkles, Users } from "lucide-react";
import { authMode, getCurrentMember } from "@/lib/auth";
import { familyT } from "@/lib/i18n/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FamilyShell, Field, FormError, PageTitle, Section } from "@/components/family/shell";
import { continueAsDemoFamily, sendMagicLink, startDemoSetup } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; sent?: string; error?: string }> };

const errors: Record<string, string> = {
  email: "Please enter a valid email address.",
  send: "We could not send the link. Please try again in a minute.",
  link: "This sign-in link has expired. Request a new one.",
  config: "Sign-in is not configured on this deployment.",
};

export default async function LoginPage({ searchParams }: Props) {
  const { next = "/app", sent, error } = await searchParams;
  const t = familyT().login;
  const mode = authMode();

  const member = await getCurrentMember();
  if (member?.family) redirect(next.startsWith("/") ? next : "/app");

  return (
    <FamilyShell signedIn={false} active="none">
      <div className="mx-auto max-w-md">
        <PageTitle eyebrow="Family area" title={t.title} lede={mode === "supabase" ? t.lede : t.demoLede} />
        <FormError message={error ? errors[error] ?? errors.send : null} />

        {mode === "supabase" ? (
          sent ? (
            <Section tone="salvia" title={t.sent}>
              <p className="text-ink">{t.sentBody(sent)}</p>
            </Section>
          ) : (
            <Section>
              <form action={sendMagicLink} className="grid gap-5">
                <input type="hidden" name="next" value={next} />
                <Field label={t.email} htmlFor="email">
                  <Input id="email" name="email" type="email" autoComplete="email" required placeholder="anna@example.com" />
                </Field>
                <Button type="submit" size="lg">
                  <Mail /> {t.send}
                </Button>
              </form>
            </Section>
          )
        ) : (
          <div className="grid gap-4">
            <Section tone="glicine" title={t.demoTitle}>
              <div className="grid gap-3">
                <form action={continueAsDemoFamily}>
                  <input type="hidden" name="next" value={next} />
                  <Button type="submit" size="lg" className="w-full">
                    <Users /> {t.demoWeber}
                  </Button>
                </form>
                <form action={startDemoSetup}>
                  <Button type="submit" size="lg" variant="outline" className="w-full">
                    <Sparkles /> {t.demoNew}
                  </Button>
                </form>
              </div>
            </Section>
            <p className="text-center text-xs text-muted">Demo mode: no Supabase keys configured, nothing is persisted between deploys.</p>
          </div>
        )}
      </div>
    </FamilyShell>
  );
}
