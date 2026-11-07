/**
 * Who runs nonnina.eu. Every legal page reads these values.
 *
 * ⚠️ Fill in every value marked TODO before the site goes live. While any TODO is left,
 * the legal pages show a visible "draft" banner (see `operatorIsComplete`).
 * Have the final texts reviewed by a lawyer: they are a starting point, not legal advice.
 */
export const operator = {
  /** Legal name of the person or company responsible (the "controller" under the GDPR). */
  name: "TODO: legal name (e.g. Nonnina UG (haftungsbeschränkt))",
  /** Postal address, one line per entry. */
  address: ["TODO: street and number", "TODO: postcode and city", "Germany"],
  /** Address for privacy requests and general contact. */
  email: "TODO: privacy@nonnina.eu",
  /** Data protection officer, if one has been appointed (null if not required). */
  dpoEmail: null as string | null,
  /** Legal representative(s), e.g. the managing director of a UG/GmbH (null if not applicable). Impressum, § 5 DDG. */
  representative: null as string | null,
  /** VAT identification number under § 27a UStG (null if none). Impressum, § 5 DDG. */
  vatId: null as string | null,
  /** Person responsible for editorial content under § 18(2) MStV: a natural person, with address. */
  contentResponsible: "TODO: full name of the person responsible for content",
  /** Supervisory authority for the operator's seat (e.g. LfDI Baden-Württemberg for Stuttgart). */
  supervisoryAuthority: "TODO: data protection authority of the federal state where the operator is based",
  /** How long waitlist sign-ups are kept at most. */
  waitlistRetentionMonths: 24,
  /** Date the legal texts were last changed (ISO). */
  updated: "2026-11-07",
} as const;

export function operatorIsComplete(): boolean {
  return !JSON.stringify(operator).includes("TODO");
}
