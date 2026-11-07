/**
 * Strings of the relief-amount card on /app (EN/DE/IT, same locale cookie as the marketplace
 * panel next to it). Amounts and rules come from the team's fixed rule table – never add
 * other numbers here.
 */
import type { MarketplaceLocale } from "./marketplace";

export interface ReliefStrings {
  title: string;
  subtitle: string;
  used: (used: string, available: string) => string;
  usedLabel: string;
  remaining: string;
  familyPays: string;
  carryOver: (allowance: string, amount: string) => string;
  free: string;
  overBudget: string;
  jobsTitle: string;
  noJobs: string;
  hours: (n: string) => string;
  covered: string;
  partly: (covered: string) => string;
  familyPaysTag: string;
  monthLabel: string;
  forSenior: string;
  note: string;
  leftover: (deadline: string) => string;
  trackedSince: (month: string) => string;
  noCareLevel: {
    title: (name: string) => string;
    body: string;
    stepsTitle: string;
    steps: string[];
    settings: string;
  };
  noSenior: string;
}

const en: ReliefStrings = {
  title: "Relief amount (Entlastungsbetrag)",
  subtitle: "131 € per month from care level 1 – not cash, reimbursed for recognised services.",
  used: (used, available) => `${used} of ${available} used`,
  usedLabel: "Covered by the relief amount",
  remaining: "Remaining this month",
  familyPays: "Family pays extra",
  carryOver: (allowance, amount) => `${allowance} this month + ${amount} unused from earlier months`,
  free: "free",
  overBudget: "The recognised services this month cost more than the relief amount available. The family pays the difference.",
  jobsTitle: "Completed jobs this month",
  noJobs: "No completed jobs in this month yet. When a helper marks a job as done, it appears here.",
  hours: (n) => `${n} h`,
  covered: "covered",
  partly: (covered) => `${covered} covered`,
  familyPaysTag: "family pays",
  monthLabel: "Month",
  forSenior: "For",
  note: "Only recognised services can be reimbursed. Keep the invoices; the care insurance reimburses after you submit them. Orientation only, not legal advice.",
  leftover: (deadline) => `Leftovers from this year are usable until ${deadline}.`,
  trackedSince: (month) => `Counted since ${month}, when you started with Nonnina.`,
  noCareLevel: {
    title: (name) => `No relief amount for ${name} yet`,
    body: "The relief amount (131 € per month) starts at care level 1. Without a care level there are no care insurance benefits at all.",
    stepsTitle: "How to get a care level",
    steps: [
      "Apply at the care insurance (Pflegekasse, part of the health insurance) – a phone call or a short letter is enough.",
      "The medical service visits at home and assesses how much help is needed.",
      "Free help with the application: the local care counselling office (Pflegestützpunkt).",
    ],
    settings: "Already have a care level? Add it in the settings.",
  },
  noSenior: "Add your parent first to see the relief amount.",
};

const de: ReliefStrings = {
  title: "Entlastungsbetrag",
  subtitle: "131 € im Monat ab Pflegegrad 1 – kein Bargeld, Erstattung nur für anerkannte Angebote.",
  used: (used, available) => `${used} von ${available} genutzt`,
  usedLabel: "Über den Entlastungsbetrag gedeckt",
  remaining: "Rest in diesem Monat",
  familyPays: "Familie zahlt zusätzlich",
  carryOver: (allowance, amount) => `${allowance} in diesem Monat + ${amount} nicht genutzt aus Vormonaten`,
  free: "kostenlos",
  overBudget: "Die anerkannten Angebote kosten diesen Monat mehr als der verfügbare Entlastungsbetrag. Die Differenz zahlt die Familie.",
  jobsTitle: "Erledigte Einsätze in diesem Monat",
  noJobs: "In diesem Monat noch keine erledigten Einsätze. Sobald eine Hilfe einen Einsatz als erledigt markiert, erscheint er hier.",
  hours: (n) => `${n} Std.`,
  covered: "gedeckt",
  partly: (covered) => `${covered} gedeckt`,
  familyPaysTag: "Familie zahlt",
  monthLabel: "Monat",
  forSenior: "Für",
  note: "Erstattet werden nur anerkannte Angebote. Rechnungen aufbewahren; die Pflegekasse erstattet, nachdem Sie sie eingereicht haben. Nur zur Orientierung, keine Rechtsberatung.",
  leftover: (deadline) => `Reste aus diesem Jahr können bis ${deadline} genutzt werden.`,
  trackedSince: (month) => `Gezählt seit ${month}, seit Sie Nonnina nutzen.`,
  noCareLevel: {
    title: (name) => `Noch kein Entlastungsbetrag für ${name}`,
    body: "Der Entlastungsbetrag (131 € im Monat) gilt ab Pflegegrad 1. Ohne Pflegegrad gibt es keine Leistungen der Pflegekasse.",
    stepsTitle: "So bekommen Sie einen Pflegegrad",
    steps: [
      "Antrag bei der Pflegekasse stellen (bei der Krankenkasse) – ein Anruf oder ein kurzer Brief genügt.",
      "Der Medizinische Dienst kommt nach Hause und begutachtet, wie viel Hilfe nötig ist.",
      "Kostenlose Hilfe beim Antrag: der Pflegestützpunkt vor Ort.",
    ],
    settings: "Pflegegrad schon vorhanden? In den Einstellungen eintragen.",
  },
  noSenior: "Legen Sie zuerst Ihr Elternteil an, um den Entlastungsbetrag zu sehen.",
};

const it: ReliefStrings = {
  title: "Importo di sgravio (Entlastungsbetrag)",
  subtitle: "131 € al mese dal grado di assistenza 1 – non in contanti, rimborsato solo per servizi riconosciuti.",
  used: (used, available) => `${used} di ${available} usati`,
  usedLabel: "Coperto dall'importo di sgravio",
  remaining: "Restante questo mese",
  familyPays: "La famiglia paga in più",
  carryOver: (allowance, amount) => `${allowance} questo mese + ${amount} non usati nei mesi precedenti`,
  free: "gratuito",
  overBudget: "Questo mese i servizi riconosciuti costano più dell'importo disponibile. La differenza la paga la famiglia.",
  jobsTitle: "Servizi completati questo mese",
  noJobs: "Ancora nessun servizio completato in questo mese. Quando un aiutante segna un servizio come completato, compare qui.",
  hours: (n) => `${n} ore`,
  covered: "coperto",
  partly: (covered) => `${covered} coperti`,
  familyPaysTag: "paga la famiglia",
  monthLabel: "Mese",
  forSenior: "Per",
  note: "Si possono rimborsare solo servizi riconosciuti. Conserva le fatture; la cassa di assistenza rimborsa dopo che le hai inviate. Solo orientamento, non è consulenza legale.",
  leftover: (deadline) => `Gli importi non usati quest'anno si possono usare fino al ${deadline}.`,
  trackedSince: (month) => `Conteggiato da ${month}, da quando usi Nonnina.`,
  noCareLevel: {
    title: (name) => `Ancora nessun importo di sgravio per ${name}`,
    body: "L'importo di sgravio (131 € al mese) spetta dal grado di assistenza 1. Senza grado di assistenza non ci sono prestazioni della cassa di assistenza.",
    stepsTitle: "Come ottenere un grado di assistenza",
    steps: [
      "Fai domanda alla cassa di assistenza (Pflegekasse, presso la cassa malattia) – basta una telefonata o una breve lettera.",
      "Il servizio medico viene a casa e valuta quanto aiuto serve.",
      "Aiuto gratuito per la domanda: il centro di consulenza locale (Pflegestützpunkt).",
    ],
    settings: "Il grado di assistenza c'è già? Inseriscilo nelle impostazioni.",
  },
  noSenior: "Aggiungi prima il tuo genitore per vedere l'importo di sgravio.",
};

export const reliefStrings: Record<MarketplaceLocale, ReliefStrings> = { en, de, it };

export function reliefT(locale: MarketplaceLocale): ReliefStrings {
  return reliefStrings[locale] ?? en;
}

export function intlLocale(locale: MarketplaceLocale): string {
  return locale === "de" ? "de-DE" : locale === "it" ? "it-IT" : "en-GB";
}

export function formatEur(amount: number, locale: MarketplaceLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}

export function formatHours(hours: number, locale: MarketplaceLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 2 }).format(hours);
}

/** "YYYY-MM" → "November 2026". */
export function formatMonth(month: string, locale: MarketplaceLocale): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 15)));
}

/** "YYYY-MM-DD" → localised short date (no time-zone shift). */
export function formatDay(day: string, locale: MarketplaceLocale, style: "short" | "long" = "short"): string {
  const [y, m, d] = day.split("-").map(Number);
  const opts: Intl.DateTimeFormatOptions = style === "long" ? { day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "short" };
  return new Intl.DateTimeFormat(intlLocale(locale), { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
