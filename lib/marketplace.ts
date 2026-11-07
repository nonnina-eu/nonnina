/**
 * Pure marketplace rules (no I/O, safe for client components): the public projection of a
 * helper, directory filtering + ordering, and the help-request-category → service mapping
 * used by the "Find a helper" button in the family feed.
 */
import { HELPER_SERVICES, type HelpCategory, type Helper, type HelperFilter, type HelperService, type PublicHelper } from "@/lib/db/types";

export { HELPER_SERVICES };

/** Languages a helper can tick in the profile form (ISO 639-1). */
export const HELPER_LANGUAGES = ["de", "it", "en", "tr", "pl", "ru", "fr", "es"] as const;

export const DEFAULT_CITY = "Stuttgart";

/** Columns the directory may expose. Used by the Supabase select and the memory projection. */
export const PUBLIC_HELPER_COLUMNS = "id,name,kind,city,bio,languages,services,hourly_rate_eur,verified,active,created_at";

export function isHelperService(value: unknown): value is HelperService {
  return typeof value === "string" && (HELPER_SERVICES as readonly string[]).includes(value);
}

/** Strips contact data and the auth user id. */
export function toPublicHelper(h: Helper | PublicHelper): PublicHelper {
  return {
    id: h.id,
    name: h.name,
    kind: h.kind,
    city: h.city,
    bio: h.bio,
    languages: [...h.languages],
    services: [...h.services],
    hourly_rate_eur: h.hourly_rate_eur === null ? null : Number(h.hourly_rate_eur),
    verified: h.verified,
    active: h.active,
    created_at: h.created_at,
  };
}

export function matchesHelperFilter(h: Pick<Helper, "active" | "city" | "services" | "languages" | "verified">, filter: HelperFilter = {}): boolean {
  if (!h.active) return false;
  if (filter.service && !h.services.includes(filter.service)) return false;
  if (filter.city && h.city.trim().toLowerCase() !== filter.city.trim().toLowerCase()) return false;
  if (filter.language && !h.languages.includes(filter.language)) return false;
  if (filter.verifiedOnly && !h.verified) return false;
  return true;
}

/** Verified first, then alphabetical. */
export function compareHelpers(a: Pick<Helper, "verified" | "name">, b: Pick<Helper, "verified" | "name">): number {
  if (a.verified !== b.verified) return a.verified ? -1 : 1;
  return a.name.localeCompare(b.name, "de");
}

const CATEGORY_SERVICE: Record<HelpCategory, HelperService | null> = {
  daily_help: "shopping",
  legal: "paperwork",
  money: "paperwork",
  health: "appointments",
  loneliness: "company",
  other: null,
};

/** Keywords (DE / IT / EN) that pin a request to a more specific service than its category. Order matters. */
const KEYWORD_SERVICE: Array<[RegExp, HelperService]> = [
  [/einkauf|supermarkt|spesa|supermercato|shopping|groceries/i, "shopping"],
  [/kochen|mittagessen|cucinare|pranzo|\bcook|\bmeal/i, "cooking"],
  [/putzen|haushalt|wäsche|pulire|pulizie|bucato|cleaning|laundry/i, "household"],
  [/arzt|termin|praxis|medico|visita|appuntamento|doctor|appointment/i, "appointments"],
  [/fahrt|abholen|taxi|passaggio|\blift\b|\bdrive/i, "transport"],
  [/formular|antrag|brief|behörde|modulo|documenti|lettera|\bform\b|letter|paperwork/i, "paperwork"],
  [/garten|rasen|giardino|garden/i, "gardening"],
  [/handy|tablet|computer|fernseher|telefonino|cellulare|smartphone/i, "tech_help"],
  [/einsam|gesellschaft|compagnia|lonely|\bcompany\b/i, "company"],
  [/duschen|anziehen|lavarsi|doccia|vestirsi|shower/i, "personal_care"],
];

/**
 * Which marketplace service fits a help request. A keyword in the summary wins over the
 * category default ("Ich brauche jemanden zum Arzt" in daily_help → appointments).
 * Returns null when nothing fits (the directory then shows every service).
 */
export function serviceForHelpRequest(category: HelpCategory, summary = ""): HelperService | null {
  for (const [pattern, service] of KEYWORD_SERVICE) {
    if (pattern.test(summary)) return service;
  }
  return CATEGORY_SERVICE[category] ?? null;
}

/** /helpers link for the "Find a helper" button on a help-request card. */
export function findHelperHref(request: { id: string; category: HelpCategory; summary: string }): string {
  const params = new URLSearchParams();
  const service = serviceForHelpRequest(request.category, request.summary);
  if (service) params.set("service", service);
  params.set("request", request.id);
  return `/helpers?${params.toString()}`;
}
