import type { HelpCategory } from "@/lib/db/types";

export const HELP_CATEGORIES: readonly HelpCategory[] = [
  "daily_help",
  "legal",
  "money",
  "health",
  "loneliness",
  "other",
];

/** Categories that always need a human in the family loop (paperwork, money). */
const ALWAYS_ESCALATE: ReadonlySet<string> = new Set<HelpCategory>(["legal", "money"]);

export interface PostCallAnalysis {
  needs_human?: boolean | null;
  problem_category?: string | null;
}

/** Normalises a free-text category from the agent into our enum. */
export function toHelpCategory(value: string | null | undefined): HelpCategory {
  const v = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if ((HELP_CATEGORIES as readonly string[]).includes(v)) return v as HelpCategory;
  if (/(recht|legal|vertrag|contract|contratt|avvocat|giuridic)/.test(v)) return "legal";
  if (/(geld|money|finanz|kosten|soldi|denaro|pflegegeld|insurance|versicherung|assicurazione)/.test(v)) return "money";
  if (/(health|gesund|arzt|salute|medic|dottore)/.test(v)) return "health";
  if (/(lonel|einsam|allein|sol[ao]|solitudine)/.test(v)) return "loneliness";
  if (/(daily|alltag|einkauf|putzen|shopping|cleaning|spesa|pulizie|termin|appointment)/.test(v)) return "daily_help";
  return "other";
}

/**
 * Escalation rule used by the post-call webhook:
 * create an escalated help request when the agent says a human is needed,
 * or when the topic is legal or money (these are never "AI solved").
 */
export function shouldEscalate(analysis: PostCallAnalysis): boolean {
  if (analysis.needs_human === true) return true;
  const category = toHelpCategory(analysis.problem_category);
  return ALWAYS_ESCALATE.has(category);
}
