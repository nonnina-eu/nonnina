"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { getStore } from "@/lib/db";
import type { MedicationTime, NewRelative } from "@/lib/db/types";
import { env } from "@/lib/env";
import { familySetupSchema, medicationTimeSchema, phoneE164, relativeSchema, seniorSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, getMemberOverview, ownsRelative, ownsSenior, setDemoMemberCookie } from "@/lib/auth";

// ---------- helpers ----------

function firstIssue(error: ZodError): string {
  const issue = error.issues[0];
  return issue ? `${issue.path.join(".") || "form"}: ${issue.message}` : "Please check the form.";
}

function back(returnTo: unknown, fallback: string): string {
  const v = typeof returnTo === "string" ? returnTo : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

function withError(url: string, message: string): never {
  const sep = url.includes("?") ? "&" : "?";
  redirect(`${url}${sep}error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" ? v : undefined;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function parseMedicationTimes(raw: string | undefined): MedicationTime[] | null {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = medicationTimeSchema.array().max(8).safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

async function requireFamilyMember() {
  const member = await getCurrentMember();
  if (!member) redirect("/login?next=/app");
  if (!member.family) redirect("/app/setup");
  const overview = await getMemberOverview(member);
  if (!overview) redirect("/app/setup");
  return { member, overview };
}

// ---------- step 1: family + first relative ----------

export async function createFamilyAndMember(formData: FormData): Promise<void> {
  const member = await getCurrentMember();
  if (!member) redirect("/login?next=/app/setup");
  if (member.family) redirect("/app/setup?step=2");

  const family = familySetupSchema.safeParse({ name: str(formData, "family_name"), email: str(formData, "email"), fallback_phone: "" });
  const relative = relativeSchema.safeParse({
    name: str(formData, "name"),
    relation: str(formData, "relation"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    notify_sms: true,
    notify_call: true,
    priority: 1,
  });
  if (!family.success) withError("/app/setup?step=1", firstIssue(family.error));
  if (!relative.success) withError("/app/setup?step=1", firstIssue(relative.error));

  const store = getStore();
  const created = await store.createFamily(family.data);
  const rel = await store.createRelative({ ...relative.data, family_id: created.id, user_id: member.userId });
  if (member.mode === "demo") await setDemoMemberCookie(rel.id, created.id);
  revalidatePath("/app");
  redirect("/app/setup?step=2");
}

// ---------- senior ----------

export async function saveSenior(formData: FormData): Promise<void> {
  const { overview } = await requireFamilyMember();
  const returnTo = back(str(formData, "return_to"), "/app/setup?step=3");
  const errorTo = back(str(formData, "error_to"), "/app/setup?step=2");

  const medication = parseMedicationTimes(str(formData, "medication_times"));
  if (!medication) withError(errorTo, "Medication reminders: use HH:MM and a short label.");
  const parsed = seniorSchema.safeParse({
    first_name: str(formData, "first_name"),
    language: str(formData, "language"),
    city: str(formData, "city"),
    address_note: str(formData, "address_note"),
    care_level: str(formData, "care_level"),
    medication_times: medication,
  });
  if (!parsed.success) withError(errorTo, firstIssue(parsed.error));

  const store = getStore();
  const existing = overview.seniors[0];
  if (existing) {
    await store.updateSenior(existing.id, parsed.data);
  } else {
    await store.createSenior({ ...parsed.data, family_id: overview.family.id });
  }
  revalidatePath("/app");
  redirect(returnTo);
}

// ---------- relatives ----------

function relativeInput(formData: FormData) {
  return relativeSchema.safeParse({
    name: str(formData, "name"),
    relation: str(formData, "relation"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    notify_sms: bool(formData, "notify_sms"),
    notify_call: bool(formData, "notify_call"),
    priority: str(formData, "priority"),
  });
}

export async function addRelative(formData: FormData): Promise<void> {
  const { overview } = await requireFamilyMember();
  const returnTo = back(str(formData, "return_to"), "/app/setup?step=3");
  const parsed = relativeInput(formData);
  if (!parsed.success) withError(returnTo, firstIssue(parsed.error));
  const input: NewRelative = { ...parsed.data, family_id: overview.family.id, user_id: null };
  await getStore().createRelative(input);
  revalidatePath("/app");
  redirect(returnTo);
}

export async function updateRelative(formData: FormData): Promise<void> {
  const { overview } = await requireFamilyMember();
  const returnTo = back(str(formData, "return_to"), "/app/settings");
  const id = str(formData, "relative_id") ?? "";
  if (!ownsRelative(overview, id)) withError(returnTo, "This relative does not belong to your family.");
  const parsed = relativeInput(formData);
  if (!parsed.success) withError(returnTo, firstIssue(parsed.error));
  await getStore().updateRelative(id, parsed.data);
  revalidatePath("/app");
  redirect(returnTo);
}

export async function deleteRelative(formData: FormData): Promise<void> {
  const { member, overview } = await requireFamilyMember();
  const returnTo = back(str(formData, "return_to"), "/app/settings");
  const id = str(formData, "relative_id") ?? "";
  if (!ownsRelative(overview, id)) withError(returnTo, "This relative does not belong to your family.");
  if (member.relative?.id === id) withError(returnTo, "You cannot remove yourself.");
  if (overview.relatives.length <= 1) withError(returnTo, "A family needs at least one relative.");
  await getStore().deleteRelative(id);
  revalidatePath("/app");
  redirect(returnTo);
}

export async function inviteRelative(formData: FormData): Promise<void> {
  const { member, overview } = await requireFamilyMember();
  const returnTo = back(str(formData, "return_to"), "/app/settings");
  const id = str(formData, "relative_id") ?? "";
  const relative = overview.relatives.find((r) => r.id === id);
  if (!relative) withError(returnTo, "This relative does not belong to your family.");
  if (!relative.email) withError(returnTo, `${relative.name} has no email address yet.`);

  if (member.mode === "supabase") {
    try {
      const admin = createAdminClient();
      const redirectTo = `${env.appUrl()}/auth/callback?next=${encodeURIComponent(`/app/join?relative=${relative.id}`)}`;
      const { error } = await admin.auth.admin.inviteUserByEmail(relative.email, { redirectTo });
      if (error) {
        // Already registered users cannot be "invited" again: fall back to a magic link.
        const { error: otpError } = await admin.auth.signInWithOtp({ email: relative.email, options: { emailRedirectTo: redirectTo } });
        if (otpError) withError(returnTo, `Invitation failed: ${otpError.message}`);
      }
    } catch (e) {
      withError(returnTo, `Invitation failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }
    redirect(`${returnTo}?invited=${encodeURIComponent(relative.name)}`);
  }
  // Demo mode: the settings page shows the join link to copy.
  redirect(`${returnTo}?joinlink=${encodeURIComponent(relative.id)}`);
}

// ---------- safety net ----------

export async function saveSafety(formData: FormData): Promise<void> {
  const { overview } = await requireFamilyMember();
  const inSetup = str(formData, "setup") === "1";
  const returnTo = back(str(formData, "return_to"), inSetup ? "/app/setup?step=5" : "/app/settings");
  const errorTo = inSetup ? "/app/setup?step=4" : "/app/settings";

  const raw = (str(formData, "fallback_phone") ?? "").trim();
  const phone = raw ? phoneE164.safeParse(raw) : null;
  if (phone && !phone.success) withError(errorTo, firstIssue(phone.error));
  if (inSetup && (!bool(formData, "consent_parent") || !bool(formData, "consent_no112"))) {
    withError(errorTo, "Please confirm both statements to continue.");
  }
  await getStore().updateFamily(overview.family.id, { fallback_phone: phone ? phone.data : null });
  revalidatePath("/app");
  redirect(returnTo);
}

// ---------- tablet link ----------

export async function rotateTabletLink(formData: FormData): Promise<void> {
  const { overview } = await requireFamilyMember();
  const returnTo = back(str(formData, "return_to"), "/app/settings");
  const seniorId = str(formData, "senior_id") ?? "";
  if (!ownsSenior(overview, seniorId)) withError(returnTo, "Unknown tablet.");
  await getStore().rotateDeviceToken(seniorId);
  revalidatePath("/app");
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}qr=1`);
}
