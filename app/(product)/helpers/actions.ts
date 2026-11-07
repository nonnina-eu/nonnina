"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authMode, getCurrentMember, getMemberOverview, ownsSenior } from "@/lib/auth";
import { DEMO_HELPER_IDS, getStore } from "@/lib/db";
import type { HelperRequest, NotificationRecord } from "@/lib/db/types";
import { env } from "@/lib/env";
import { clearDemoHelperCookie, getHelperSession, setDemoHelperCookie } from "@/lib/helper-auth";
import { localeForLanguages, marketplaceT } from "@/lib/i18n/marketplace";
import { notifyMarketplaceContact } from "@/lib/notify-marketplace";
import { createClient } from "@/lib/supabase/server";
import { berlinDate, completionPatch } from "@/lib/relief-budget";
import { helperProfileSchema, helperRequestFormSchema, parseCompletionForm } from "@/lib/validation";

// ---------- shared ----------

export interface FormState {
  /** Field names with an error (the UI translates them). */
  errors: string[];
  /** Free text error (not tied to a field), already a translation key of requestErrors. */
  formError?: "generic" | "notFound" | null;
  saved?: boolean;
  /** Echo of the submitted values so the form keeps them after a failed submit. */
  values?: Record<string, string | string[]>;
}

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" ? v : undefined;
}

function strings(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string");
}

function fieldsOf(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((i) => String(i.path[0] ?? "form")))];
}

function echo(formData: FormData, multi: string[]): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key.startsWith("$")) continue;
    if (multi.includes(key)) out[key] = strings(formData, key);
    else out[key] = value;
  }
  for (const key of multi) out[key] ??= [];
  return out;
}

// ---------- helper account ----------

const emailSchema = z.string().trim().email().max(120);

/** Supabase mode: magic link that lands back on /helpers/join (the same auth users as the family area). */
export async function sendHelperMagicLink(formData: FormData): Promise<void> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) redirect("/helpers/join?error=email");
  const supabase = await createClient();
  if (!supabase) redirect("/helpers/join?error=config");
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${env.appUrl()}/auth/callback?next=${encodeURIComponent("/helpers/join")}`, shouldCreateUser: true },
  });
  if (error) redirect("/helpers/join?error=send");
  redirect(`/helpers/join?sent=${encodeURIComponent(email.data)}`);
}

/** Demo mode: look around as the seeded helper Lucia. */
export async function continueAsDemoHelper(): Promise<void> {
  if (authMode() !== "demo") redirect("/helpers/join");
  await setDemoHelperCookie(DEMO_HELPER_IDS.lucia);
  redirect("/helpers/me");
}

export async function signOutHelper(): Promise<void> {
  if (authMode() === "supabase") {
    const supabase = await createClient();
    await supabase?.auth.signOut();
  } else {
    await clearDemoHelperCookie();
  }
  redirect("/helpers");
}

/** Create (join) or update (me) the helper profile of the current session. */
export async function saveHelperProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getHelperSession();
  if (authMode() === "supabase" && !session) redirect("/helpers/join");
  const existing = session?.helper ?? null;

  const parsed = helperProfileSchema({ requireConsent: !existing }).safeParse({
    name: str(formData, "name"),
    kind: str(formData, "kind"),
    city: str(formData, "city"),
    bio: str(formData, "bio"),
    languages: strings(formData, "languages"),
    services: strings(formData, "services"),
    free: formData.get("free") === "on",
    hourly_rate_eur: str(formData, "hourly_rate_eur"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    consent_share: formData.get("consent_share") === "on",
    consent_verify: formData.get("consent_verify") === "on",
  });
  if (!parsed.success) {
    return { errors: fieldsOf(parsed.error), values: echo(formData, ["languages", "services"]) };
  }

  const store = getStore();
  if (existing) {
    await store.updateHelper(existing.id, parsed.data);
    revalidatePath("/helpers");
    revalidatePath(`/helpers/${existing.id}`);
    return { errors: [], saved: true };
  }

  // New profiles are never verified automatically.
  const helper = await store.createHelper({ ...parsed.data, user_id: session?.userId ?? null, verified: false, active: true });
  if (authMode() === "demo") await setDemoHelperCookie(helper.id);
  revalidatePath("/helpers");
  redirect("/helpers/me?welcome=1");
}

// ---------- family → helper request ----------

export async function sendHelperRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const member = await getCurrentMember();
  const helperId = str(formData, "helper_id") ?? "";
  if (!member) redirect(`/login?next=${encodeURIComponent(`/helpers/${helperId}`)}`);
  if (!member.family) redirect("/app/setup");
  const overview = await getMemberOverview(member);
  const values = echo(formData, []);

  const parsed = helperRequestFormSchema.safeParse({
    helper_id: helperId,
    senior_id: str(formData, "senior_id"),
    service: str(formData, "service"),
    message: str(formData, "message"),
    preferred_time: str(formData, "preferred_time"),
    help_request_id: str(formData, "help_request_id"),
  });
  if (!parsed.success) return { errors: fieldsOf(parsed.error), values };
  const input = parsed.data;

  if (!ownsSenior(overview, input.senior_id)) return { errors: ["senior_id"], values };
  const store = getStore();
  const helper = await store.getHelper(input.helper_id);
  if (!helper || !helper.active) return { errors: [], formError: "notFound", values };
  if (!helper.services.includes(input.service)) return { errors: ["service"], values };

  // A linked help request must belong to this family (otherwise it is dropped silently).
  let helpRequestId: string | null = null;
  if (input.help_request_id) {
    const feed = await store.getFamilyFeed(member.family.id, 200);
    if (feed?.helpRequests.some((h) => h.id === input.help_request_id)) helpRequestId = input.help_request_id;
  }

  const senior = overview!.seniors.find((s) => s.id === input.senior_id)!;
  const request = await store.createHelperRequest({
    family_id: member.family.id,
    senior_id: senior.id,
    helper_id: helper.id,
    relative_id: member.relative?.id ?? null,
    help_request_id: helpRequestId,
    service: input.service,
    message: input.message,
    preferred_time: input.preferred_time,
  });

  const t = marketplaceT(localeForLanguages(helper.languages));
  const notified = await notifyMarketplaceContact(
    { relativeId: null, name: helper.name, phone: helper.phone, email: helper.email },
    {
      subject: t.sms.subjectNew,
      body: t.sms.newRequest({ senior: senior.first_name, city: senior.city, service: t.services[input.service], url: `${env.appUrl()}/helpers/me` }),
    },
  );
  await store.updateHelperRequest(request.id, { notified });

  revalidatePath("/app");
  revalidatePath("/helpers/me");
  redirect(`/helpers/${helper.id}?sent=${request.id}`);
}

// ---------- helper answers ----------

const respondSchema = z.object({ request_id: z.string().uuid(), action: z.enum(["accept", "decline", "done"]) });

export async function respondToHelperRequest(formData: FormData): Promise<void> {
  const session = await getHelperSession();
  if (!session?.helper) redirect("/helpers/join");
  const parsed = respondSchema.safeParse({ request_id: str(formData, "request_id"), action: str(formData, "action") });
  if (!parsed.success) redirect("/helpers/me?error=generic");

  const store = getStore();
  const req = await store.getHelperRequest(parsed.data.request_id);
  if (!req || req.helper_id !== session.helper.id) redirect("/helpers/me?error=generic");

  const { action } = parsed.data;
  const next: HelperRequest["status"] | null =
    action === "accept" && req.status === "sent" ? "accepted" : action === "decline" && req.status === "sent" ? "declined" : action === "done" && req.status === "accepted" ? "done" : null;
  if (!next) redirect("/helpers/me");

  let notified: NotificationRecord[] = req.notified;
  if (next === "accepted" && req.help_request_id) {
    await store.updateHelpRequest(req.help_request_id, { status: "matched" });
  }
  if (next === "accepted" || next === "declined") {
    const [relative, ctx] = await Promise.all([req.relative_id ? store.getRelative(req.relative_id) : null, store.getSeniorById(req.senior_id)]);
    if (relative && ctx) {
      const t = marketplaceT(ctx.senior.language);
      const url = `${env.appUrl()}/app`;
      const message =
        next === "accepted"
          ? { subject: t.sms.subjectAccepted, body: t.sms.accepted({ helper: session.helper.name, senior: ctx.senior.first_name, service: t.services[req.service], url }) }
          : { subject: t.sms.subjectDeclined, body: t.sms.declined({ helper: session.helper.name, senior: ctx.senior.first_name, url: `${env.appUrl()}/helpers` }) };
      const records = await notifyMarketplaceContact({ relativeId: relative.id, name: relative.name, phone: relative.phone, email: relative.email }, message);
      notified = [...notified, ...records];
    }
  }

  await store.updateHelperRequest(req.id, { status: next, notified });
  revalidatePath("/helpers/me");
  revalidatePath("/app");
  redirect(`/helpers/me#request-${req.id}`);
}

// ---------- helper records a finished job ----------

/** Accepted → done with date, hours and amount (empty amount = hours × hourly rate). */
export async function completeHelperRequest(formData: FormData): Promise<void> {
  const session = await getHelperSession();
  if (!session?.helper) redirect("/helpers/join");
  const parsed = parseCompletionForm(formData, berlinDate(new Date()));
  if (!parsed.success) redirect("/helpers/me?error=complete");

  const store = getStore();
  const req = await store.getHelperRequest(parsed.data.request_id);
  if (!req || req.helper_id !== session.helper.id || (req.status !== "accepted" && req.status !== "done")) redirect("/helpers/me?error=generic");

  await store.updateHelperRequest(req.id, completionPatch(parsed.data, session.helper.hourly_rate_eur));
  revalidatePath("/helpers/me");
  revalidatePath("/app");
  redirect(`/helpers/me#request-${req.id}`);
}
