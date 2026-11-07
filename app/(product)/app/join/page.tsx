import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getStore } from "@/lib/db";
import { authMode, decodeDemoCookie, getCurrentMember, setDemoMemberCookie } from "@/lib/auth";
import { familyT } from "@/lib/i18n/family";
import { Button } from "@/components/ui/button";
import { FamilyShell, PageTitle, Section } from "@/components/family/shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Join", robots: { index: false } };

type Props = { searchParams: Promise<{ relative?: string; key?: string }> };

/**
 * Invite landing. Supabase mode: the signed-in user is linked to the invited relative row.
 * Demo mode: the link carries a signed key that becomes the member cookie.
 */
export default async function JoinPage({ searchParams }: Props) {
  const { relative: relativeId, key } = await searchParams;
  const t = familyT().join;
  const valid = z.string().uuid().safeParse(relativeId).success;

  if (valid && authMode() === "demo" && key) {
    const decoded = decodeDemoCookie(key);
    if (decoded && decoded.relativeId === relativeId) {
      await setDemoMemberCookie(decoded.relativeId, decoded.familyId);
      redirect("/app");
    }
  }

  if (valid && authMode() === "supabase") {
    const member = await getCurrentMember();
    if (!member) redirect(`/login?next=${encodeURIComponent(`/app/join?relative=${relativeId}`)}`);
    if (member.userId) {
      const linked = await getStore().linkRelativeToUser(relativeId!, member.userId);
      if (linked) redirect("/app");
    }
  }

  return (
    <FamilyShell signedIn={false}>
      <div className="mx-auto max-w-md">
        <PageTitle title={t.title} lede={valid ? t.lede : t.invalid} />
        <Section>
          <Button asChild size="lg">
            <Link href={valid ? `/login?next=${encodeURIComponent(`/app/join?relative=${relativeId}`)}` : "/login"}>{familyT().nav.login}</Link>
          </Button>
        </Section>
      </div>
    </FamilyShell>
  );
}
