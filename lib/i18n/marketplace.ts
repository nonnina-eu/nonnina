/**
 * Strings of the marketplace (/helpers, /helpers/join, /helpers/me and the helper-request
 * panel in /app). English is the default; German and Italian have the same shape.
 * The locale comes from the `nonnina_lang` cookie (see lib/i18n/marketplace-locale.ts).
 */
import type { HelperKind, HelperRequestStatus, HelperService } from "@/lib/db/types";

export const MARKETPLACE_LOCALES = ["en", "de", "it"] as const;
export type MarketplaceLocale = (typeof MARKETPLACE_LOCALES)[number];
export const LOCALE_COOKIE = "nonnina_lang";

export function isMarketplaceLocale(v: unknown): v is MarketplaceLocale {
  return typeof v === "string" && (MARKETPLACE_LOCALES as readonly string[]).includes(v);
}

type ProfileField = "name" | "kind" | "city" | "bio" | "languages" | "services" | "hourly_rate_eur" | "phone" | "email" | "consent_share" | "consent_verify";
type RequestField = "senior_id" | "service" | "message" | "preferred_time";

export interface MarketplaceStrings {
  nav: { find: string; offer: string; myProfile: string; family: string; signOut: string; language: string };
  services: Record<HelperService, string>;
  kinds: Record<HelperKind, string>;
  languages: Record<string, string>;
  status: Record<HelperRequestStatus, string>;
  common: { verified: string; notVerified: string; volunteer: string; free: string; perHour: (eur: string) => string; back: string; demoNote: string; demoProfile: string; demoProfileHint: string };
  directory: {
    eyebrow: string;
    title: string;
    lede: string;
    service: string;
    anyService: string;
    city: string;
    language: string;
    anyLanguage: string;
    verifiedOnly: string;
    apply: string;
    reset: string;
    count: (n: number) => string;
    empty: string;
    forRequest: (name: string) => string;
    view: string;
    offerCta: string;
    offerCtaBody: string;
  };
  detail: {
    about: string;
    offers: string;
    speaks: string;
    rate: string;
    contactHidden: string;
    verifiedNote: string;
    unverifiedNote: string;
    sendTitle: string;
    sendLede: string;
    forParent: string;
    service: string;
    message: string;
    messageHint: string;
    messagePlaceholder: string;
    preferredTime: string;
    preferredTimeHint: string;
    preferredTimePlaceholder: string;
    send: string;
    signInTitle: string;
    signInBody: string;
    signIn: string;
    setupFirst: string;
    sent: (name: string) => string;
    sentBody: string;
    notified: string;
    toFamily: string;
    ownProfile: string;
  };
  join: {
    eyebrow: string;
    title: string;
    lede: string;
    emailTitle: string;
    emailLede: string;
    email: string;
    sendLink: string;
    sentTitle: string;
    sentBody: (email: string) => string;
    demoTitle: string;
    demoLede: string;
    demoContinue: string;
    formTitle: string;
    how: string[];
  };
  form: {
    name: string;
    nameHint: string;
    kind: string;
    city: string;
    bio: string;
    bioHint: string;
    languages: string;
    services: string;
    rate: string;
    rateHint: string;
    free: string;
    phone: string;
    phoneHint: string;
    email: string;
    emailHint: string;
    consentShare: string;
    consentVerify: string;
    privateNote: string;
    create: string;
    save: string;
    saved: string;
    errorSummary: string;
    errors: Record<ProfileField, string>;
  };
  requestErrors: Record<RequestField, string> & { generic: string; notFound: string };
  me: {
    title: (name: string) => string;
    pending: string;
    verified: string;
    viewPublic: string;
    requests: string;
    noRequests: string;
    requestFrom: (senior: string, city: string) => string;
    preferredTime: string;
    accept: string;
    decline: string;
    markDone: string;
    contactTitle: string;
    contactHint: string;
    familyContact: (name: string) => string;
    profile: string;
    inactive: string;
  };
  family: {
    title: string;
    empty: string;
    find: string;
    with: (helper: string, senior: string) => string;
    contact: string;
    waiting: string;
    declinedHint: string;
  };
  feed: { findHelper: string };
  sms: {
    newRequest: (args: { senior: string; city: string; service: string; url: string }) => string;
    accepted: (args: { helper: string; senior: string; service: string; url: string }) => string;
    declined: (args: { helper: string; senior: string; url: string }) => string;
    subjectNew: string;
    subjectAccepted: string;
    subjectDeclined: string;
  };
}

const en: MarketplaceStrings = {
  nav: { find: "Find help", offer: "Offer help", myProfile: "My helper profile", family: "Family area", signOut: "Sign out", language: "Language" },
  services: {
    shopping: "Shopping",
    cooking: "Cooking",
    company: "Company",
    household: "Household",
    transport: "Transport",
    appointments: "Appointments",
    paperwork: "Paperwork",
    personal_care: "Personal care",
    gardening: "Gardening",
    tech_help: "Phone & tablet help",
  },
  kinds: { independent: "Independent helper", service: "Care service", volunteer: "Volunteer" },
  languages: { de: "German", it: "Italian", en: "English", tr: "Turkish", pl: "Polish", ru: "Russian", fr: "French", es: "Spanish", uk: "Ukrainian", el: "Greek", pt: "Portuguese" },
  status: { sent: "Sent", accepted: "Accepted", declined: "Declined", done: "Done" },
  common: {
    verified: "Verified by Nonnina",
    notVerified: "Not yet verified",
    volunteer: "Volunteer · free",
    free: "Free",
    perHour: (eur) => `${eur} €/hour`,
    back: "Back to all helpers",
    demoNote: "Demo mode: notifications are shown here instead of being sent.",
    demoProfile: "Demo profile",
    demoProfileHint: "Fictional example profile to show how Nonnina works. This person does not exist.",
  },
  directory: {
    eyebrow: "Nonnina helpers",
    title: "Help for your parents, nearby",
    lede: "People who do what you would do if you were there: shopping, cooking, a visit, a lift to the doctor.",
    service: "Service",
    anyService: "Any service",
    city: "City",
    language: "Speaks",
    anyLanguage: "Any language",
    verifiedOnly: "Verified only",
    apply: "Show helpers",
    reset: "Reset",
    count: (n) => `${n} helper${n === 1 ? "" : "s"}`,
    empty: "No helper matches these filters yet. Try another service or untick “verified only”.",
    forRequest: (name) => `Finding help for ${name}`,
    view: "View profile",
    offerCta: "Do you want to help?",
    offerCtaBody: "Create a free helper profile. Families nearby can then send you requests.",
  },
  detail: {
    about: "About",
    offers: "Offers",
    speaks: "Speaks",
    rate: "Rate",
    contactHidden: "Phone and email are shared only after the helper accepts your request.",
    verifiedNote: "A person on the Nonnina team has checked this helper's documents.",
    unverifiedNote: "Nonnina has not checked this profile yet. Meet first and trust your judgement.",
    sendTitle: "Send a request",
    sendLede: "The helper sees your parent's first name, the city, the service and your message. Your contact is shared only if they accept.",
    forParent: "For",
    service: "What do you need?",
    message: "Message",
    messageHint: "A few words about what is needed and anything the helper should know.",
    messagePlaceholder: "My mother needs help with the weekly shopping. She speaks Italian.",
    preferredTime: "When (optional)",
    preferredTimeHint: "e.g. Tuesday mornings, every week",
    preferredTimePlaceholder: "Tuesday morning",
    send: "Send request",
    signInTitle: "Ask this helper",
    signInBody: "Sign in to the family area to send a request for your parent.",
    signIn: "Sign in as a family",
    setupFirst: "Add your parent in the family area first.",
    sent: (name) => `Request sent to ${name}`,
    sentBody: "You will see the answer in the family area. When they accept, you get their phone number.",
    notified: "Notification",
    toFamily: "See status in the family area",
    ownProfile: "This is your profile.",
  },
  join: {
    eyebrow: "For helpers",
    title: "Offer your help",
    lede: "Shopping, cooking, a visit, a lift: families in your city are looking for someone they can trust.",
    emailTitle: "Create your account",
    emailLede: "Enter your email. We send you a link, no password needed. Then you fill in your profile.",
    email: "Your email",
    sendLink: "Send me a link",
    sentTitle: "Check your email",
    sentBody: (email) => `We sent a link to ${email}. Open it on this device to continue.`,
    demoTitle: "Demo mode",
    demoLede: "No account needed. Fill in the form below, or look around as Lucia, one of the demo helpers.",
    demoContinue: "Continue as Lucia (demo helper)",
    formTitle: "Your helper profile",
    how: [
      "Your profile appears in the directory as “not yet verified”.",
      "The Nonnina team checks helpers by hand and adds the verified badge.",
      "Families send you requests. You accept or decline. Contact details are shared only when you accept.",
    ],
  },
  form: {
    name: "Name",
    nameHint: "Your full name, or the name of your service or association",
    kind: "You are …",
    city: "City",
    bio: "About you",
    bioHint: "What you do, where, and what you enjoy. At least 20 characters.",
    languages: "Languages you speak",
    services: "What you offer",
    rate: "Hourly rate in €",
    rateHint: "Between 5 and 150 €. Volunteers leave it empty.",
    free: "I help for free",
    phone: "Mobile number",
    phoneHint: "International format, e.g. +4915112345678. We text you when a family sends a request.",
    email: "Email",
    emailHint: "For requests and verification.",
    consentShare: "My phone and email are shared only with families whose request I accept.",
    consentVerify: "I understand that Nonnina verifies helpers by hand and my profile shows “not yet verified” until then.",
    privateNote: "Phone and email are never shown in the public directory.",
    create: "Create my profile",
    save: "Save profile",
    saved: "Profile saved.",
    errorSummary: "Please check the highlighted fields.",
    errors: {
      name: "Enter a name (2–80 characters).",
      kind: "Choose what kind of helper you are.",
      city: "Enter your city.",
      bio: "Write at least 20 characters about yourself.",
      languages: "Tick at least one language.",
      services: "Tick at least one service.",
      hourly_rate_eur: "Enter a rate between 5 and 150 €, or tick “I help for free”.",
      phone: "Use the international format, e.g. +4915112345678.",
      email: "Enter a valid email address.",
      consent_share: "Please confirm.",
      consent_verify: "Please confirm.",
    },
  },
  requestErrors: {
    senior_id: "Choose who the help is for.",
    service: "Choose a service this helper offers.",
    message: "Write a short message (at least 5 characters).",
    preferred_time: "Keep it short (max. 120 characters).",
    generic: "Something went wrong. Please try again.",
    notFound: "This helper is not available any more.",
  },
  me: {
    title: (name) => `Hello ${name}`,
    pending: "Your profile is listed as “not yet verified”. The Nonnina team checks helpers by hand.",
    verified: "Your profile is verified.",
    viewPublic: "See my public profile",
    requests: "Requests",
    noRequests: "No requests yet. Families see your profile in the directory.",
    requestFrom: (senior, city) => `For ${senior} in ${city}`,
    preferredTime: "When",
    accept: "Accept",
    decline: "Decline",
    markDone: "Mark as done",
    contactTitle: "Family contact",
    contactHint: "Please call within a day to agree on the details.",
    familyContact: (name) => `${name} (family)`,
    profile: "Edit profile",
    inactive: "Your profile is hidden from the directory.",
  },
  family: {
    title: "Helpers",
    empty: "No helper requests yet. Find someone for shopping, cooking or company.",
    find: "Find a helper",
    with: (helper, senior) => `${helper} · for ${senior}`,
    contact: "Contact",
    waiting: "Waiting for an answer",
    declinedHint: "Not available – try another helper.",
  },
  feed: { findHelper: "Find a helper" },
  sms: {
    newRequest: ({ senior, city, service, url }) => `Nonnina: New request – ${service} for ${senior} in ${city}. Accept or decline: ${url}`,
    accepted: ({ helper, senior, service, url }) => `Nonnina: ${helper} accepted your request (${service} for ${senior}). Contact: ${url}`,
    declined: ({ helper, senior, url }) => `Nonnina: ${helper} cannot help ${senior} this time. Find another helper: ${url}`,
    subjectNew: "New help request on Nonnina",
    subjectAccepted: "Your helper request was accepted",
    subjectDeclined: "Your helper request was declined",
  },
};

const de: MarketplaceStrings = {
  nav: { find: "Hilfe finden", offer: "Hilfe anbieten", myProfile: "Mein Helferprofil", family: "Familienbereich", signOut: "Abmelden", language: "Sprache" },
  services: {
    shopping: "Einkaufen",
    cooking: "Kochen",
    company: "Gesellschaft",
    household: "Haushalt",
    transport: "Fahrdienst",
    appointments: "Arzttermine",
    paperwork: "Formulare",
    personal_care: "Körperpflege",
    gardening: "Garten",
    tech_help: "Handy & Tablet",
  },
  kinds: { independent: "Selbstständige Hilfe", service: "Pflegedienst", volunteer: "Ehrenamtlich" },
  languages: { de: "Deutsch", it: "Italienisch", en: "Englisch", tr: "Türkisch", pl: "Polnisch", ru: "Russisch", fr: "Französisch", es: "Spanisch", uk: "Ukrainisch", el: "Griechisch", pt: "Portugiesisch" },
  status: { sent: "Gesendet", accepted: "Angenommen", declined: "Abgelehnt", done: "Erledigt" },
  common: {
    verified: "Von Nonnina geprüft",
    notVerified: "Noch nicht geprüft",
    volunteer: "Ehrenamtlich · kostenlos",
    free: "Kostenlos",
    perHour: (eur) => `${eur} €/Stunde`,
    back: "Zurück zu allen Helfern",
    demoNote: "Demo-Modus: Benachrichtigungen werden hier angezeigt statt verschickt.",
    demoProfile: "Demo-Profil",
    demoProfileHint: "Erfundenes Beispielprofil, um zu zeigen, wie Nonnina funktioniert. Diese Person gibt es nicht.",
  },
  directory: {
    eyebrow: "Nonnina Helfer",
    title: "Hilfe für Ihre Eltern, in der Nähe",
    lede: "Menschen, die tun, was Sie tun würden, wenn Sie da wären: einkaufen, kochen, besuchen, zum Arzt fahren.",
    service: "Leistung",
    anyService: "Alle Leistungen",
    city: "Stadt",
    language: "Spricht",
    anyLanguage: "Alle Sprachen",
    verifiedOnly: "Nur geprüfte",
    apply: "Helfer anzeigen",
    reset: "Zurücksetzen",
    count: (n) => `${n} Helfer`,
    empty: "Noch kein Helfer passt zu diesen Filtern. Versuchen Sie eine andere Leistung oder entfernen Sie „nur geprüfte“.",
    forRequest: (name) => `Hilfe für ${name} finden`,
    view: "Profil ansehen",
    offerCta: "Möchten Sie helfen?",
    offerCtaBody: "Legen Sie kostenlos ein Helferprofil an. Familien in der Nähe können Ihnen dann Anfragen schicken.",
  },
  detail: {
    about: "Über mich",
    offers: "Bietet an",
    speaks: "Spricht",
    rate: "Preis",
    contactHidden: "Telefon und E-Mail werden erst geteilt, wenn die Hilfe Ihre Anfrage annimmt.",
    verifiedNote: "Eine Person aus dem Nonnina-Team hat die Unterlagen geprüft.",
    unverifiedNote: "Nonnina hat dieses Profil noch nicht geprüft. Lernen Sie sich zuerst kennen.",
    sendTitle: "Anfrage senden",
    sendLede: "Die Hilfe sieht den Vornamen Ihres Elternteils, die Stadt, die Leistung und Ihre Nachricht. Ihre Kontaktdaten erst nach Zusage.",
    forParent: "Für",
    service: "Was wird gebraucht?",
    message: "Nachricht",
    messageHint: "Ein paar Worte dazu, was gebraucht wird.",
    messagePlaceholder: "Meine Mutter braucht Hilfe beim Wocheneinkauf.",
    preferredTime: "Wann (optional)",
    preferredTimeHint: "z. B. dienstags vormittags, jede Woche",
    preferredTimePlaceholder: "Dienstag vormittag",
    send: "Anfrage senden",
    signInTitle: "Diese Hilfe anfragen",
    signInBody: "Melden Sie sich im Familienbereich an, um eine Anfrage für Ihr Elternteil zu senden.",
    signIn: "Als Familie anmelden",
    setupFirst: "Legen Sie zuerst Ihr Elternteil im Familienbereich an.",
    sent: (name) => `Anfrage an ${name} gesendet`,
    sentBody: "Die Antwort sehen Sie im Familienbereich. Bei einer Zusage bekommen Sie die Telefonnummer.",
    notified: "Benachrichtigung",
    toFamily: "Status im Familienbereich ansehen",
    ownProfile: "Das ist Ihr Profil.",
  },
  join: {
    eyebrow: "Für Helfer",
    title: "Bieten Sie Ihre Hilfe an",
    lede: "Einkaufen, kochen, besuchen, fahren: Familien in Ihrer Stadt suchen jemanden, dem sie vertrauen können.",
    emailTitle: "Konto anlegen",
    emailLede: "Geben Sie Ihre E-Mail ein. Wir schicken Ihnen einen Link, ohne Passwort. Danach füllen Sie Ihr Profil aus.",
    email: "Ihre E-Mail",
    sendLink: "Link schicken",
    sentTitle: "Bitte E-Mails prüfen",
    sentBody: (email) => `Wir haben einen Link an ${email} geschickt. Öffnen Sie ihn auf diesem Gerät.`,
    demoTitle: "Demo-Modus",
    demoLede: "Kein Konto nötig. Füllen Sie das Formular aus oder schauen Sie sich als Lucia um.",
    demoContinue: "Weiter als Lucia (Demo-Helferin)",
    formTitle: "Ihr Helferprofil",
    how: [
      "Ihr Profil erscheint im Verzeichnis als „noch nicht geprüft“.",
      "Das Nonnina-Team prüft Helfer persönlich und vergibt das Prüfsiegel.",
      "Familien schicken Ihnen Anfragen. Sie sagen zu oder ab. Kontaktdaten werden nur bei Zusage geteilt.",
    ],
  },
  form: {
    name: "Name",
    nameHint: "Ihr vollständiger Name oder der Name Ihres Dienstes / Vereins",
    kind: "Sie sind …",
    city: "Stadt",
    bio: "Über Sie",
    bioHint: "Was Sie machen, wo, und was Ihnen Freude macht. Mindestens 20 Zeichen.",
    languages: "Sprachen",
    services: "Was Sie anbieten",
    rate: "Stundensatz in €",
    rateHint: "Zwischen 5 und 150 €. Ehrenamtliche lassen das Feld leer.",
    free: "Ich helfe kostenlos",
    phone: "Handynummer",
    phoneHint: "Internationales Format, z. B. +4915112345678. Wir schicken eine SMS bei neuen Anfragen.",
    email: "E-Mail",
    emailHint: "Für Anfragen und die Prüfung.",
    consentShare: "Telefon und E-Mail werden nur mit Familien geteilt, deren Anfrage ich annehme.",
    consentVerify: "Mir ist klar, dass Nonnina Helfer persönlich prüft und mein Profil bis dahin „noch nicht geprüft“ zeigt.",
    privateNote: "Telefon und E-Mail stehen nie im öffentlichen Verzeichnis.",
    create: "Profil anlegen",
    save: "Profil speichern",
    saved: "Profil gespeichert.",
    errorSummary: "Bitte prüfen Sie die markierten Felder.",
    errors: {
      name: "Bitte einen Namen eingeben (2–80 Zeichen).",
      kind: "Bitte wählen Sie eine Art.",
      city: "Bitte Ihre Stadt eingeben.",
      bio: "Bitte mindestens 20 Zeichen über sich schreiben.",
      languages: "Bitte mindestens eine Sprache wählen.",
      services: "Bitte mindestens eine Leistung wählen.",
      hourly_rate_eur: "Bitte einen Preis zwischen 5 und 150 € eingeben oder „kostenlos“ wählen.",
      phone: "Bitte im internationalen Format, z. B. +4915112345678.",
      email: "Bitte eine gültige E-Mail-Adresse eingeben.",
      consent_share: "Bitte bestätigen.",
      consent_verify: "Bitte bestätigen.",
    },
  },
  requestErrors: {
    senior_id: "Bitte wählen Sie, für wen die Hilfe ist.",
    service: "Bitte eine Leistung dieser Hilfe wählen.",
    message: "Bitte eine kurze Nachricht schreiben (mindestens 5 Zeichen).",
    preferred_time: "Bitte kurz halten (max. 120 Zeichen).",
    generic: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    notFound: "Diese Hilfe ist nicht mehr verfügbar.",
  },
  me: {
    title: (name) => `Hallo ${name}`,
    pending: "Ihr Profil steht als „noch nicht geprüft“ im Verzeichnis. Das Nonnina-Team prüft Helfer persönlich.",
    verified: "Ihr Profil ist geprüft.",
    viewPublic: "Mein öffentliches Profil",
    requests: "Anfragen",
    noRequests: "Noch keine Anfragen. Familien sehen Ihr Profil im Verzeichnis.",
    requestFrom: (senior, city) => `Für ${senior} in ${city}`,
    preferredTime: "Wann",
    accept: "Annehmen",
    decline: "Ablehnen",
    markDone: "Als erledigt markieren",
    contactTitle: "Kontakt der Familie",
    contactHint: "Bitte innerhalb eines Tages anrufen und die Details absprechen.",
    familyContact: (name) => `${name} (Familie)`,
    profile: "Profil bearbeiten",
    inactive: "Ihr Profil ist im Verzeichnis ausgeblendet.",
  },
  family: {
    title: "Helfer",
    empty: "Noch keine Anfragen an Helfer. Finden Sie jemanden fürs Einkaufen, Kochen oder für Gesellschaft.",
    find: "Hilfe finden",
    with: (helper, senior) => `${helper} · für ${senior}`,
    contact: "Kontakt",
    waiting: "Wartet auf Antwort",
    declinedHint: "Nicht verfügbar – fragen Sie eine andere Hilfe.",
  },
  feed: { findHelper: "Hilfe finden" },
  sms: {
    newRequest: ({ senior, city, service, url }) => `Nonnina: Neue Anfrage – ${service} für ${senior} in ${city}. Annehmen oder ablehnen: ${url}`,
    accepted: ({ helper, senior, service, url }) => `Nonnina: ${helper} hat Ihre Anfrage angenommen (${service} für ${senior}). Kontakt: ${url}`,
    declined: ({ helper, senior, url }) => `Nonnina: ${helper} kann ${senior} diesmal nicht helfen. Andere Hilfe finden: ${url}`,
    subjectNew: "Neue Anfrage bei Nonnina",
    subjectAccepted: "Ihre Anfrage wurde angenommen",
    subjectDeclined: "Ihre Anfrage wurde abgelehnt",
  },
};

const it: MarketplaceStrings = {
  nav: { find: "Trova aiuto", offer: "Offri aiuto", myProfile: "Il mio profilo", family: "Area famiglia", signOut: "Esci", language: "Lingua" },
  services: {
    shopping: "Spesa",
    cooking: "Cucinare",
    company: "Compagnia",
    household: "Faccende di casa",
    transport: "Accompagnamento in auto",
    appointments: "Visite mediche",
    paperwork: "Pratiche e moduli",
    personal_care: "Cura della persona",
    gardening: "Giardino",
    tech_help: "Telefono e tablet",
  },
  kinds: { independent: "Aiutante indipendente", service: "Servizio di assistenza", volunteer: "Volontario" },
  languages: { de: "Tedesco", it: "Italiano", en: "Inglese", tr: "Turco", pl: "Polacco", ru: "Russo", fr: "Francese", es: "Spagnolo", uk: "Ucraino", el: "Greco", pt: "Portoghese" },
  status: { sent: "Inviata", accepted: "Accettata", declined: "Rifiutata", done: "Completata" },
  common: {
    verified: "Verificato da Nonnina",
    notVerified: "Non ancora verificato",
    volunteer: "Volontario · gratuito",
    free: "Gratuito",
    perHour: (eur) => `${eur} €/ora`,
    back: "Torna a tutti gli aiutanti",
    demoNote: "Modalità demo: le notifiche vengono mostrate qui invece di essere inviate.",
    demoProfile: "Profilo demo",
    demoProfileHint: "Profilo di esempio inventato per mostrare come funziona Nonnina. Questa persona non esiste.",
  },
  directory: {
    eyebrow: "Aiutanti Nonnina",
    title: "Aiuto per i tuoi genitori, vicino a loro",
    lede: "Persone che fanno quello che faresti tu se fossi lì: la spesa, cucinare, una visita, un passaggio dal medico.",
    service: "Servizio",
    anyService: "Tutti i servizi",
    city: "Città",
    language: "Parla",
    anyLanguage: "Tutte le lingue",
    verifiedOnly: "Solo verificati",
    apply: "Mostra aiutanti",
    reset: "Azzera",
    count: (n) => `${n} aiutant${n === 1 ? "e" : "i"}`,
    empty: "Nessun aiutante corrisponde a questi filtri. Prova un altro servizio o togli “solo verificati”.",
    forRequest: (name) => `Trova aiuto per ${name}`,
    view: "Vedi profilo",
    offerCta: "Vuoi aiutare?",
    offerCtaBody: "Crea gratis un profilo da aiutante. Le famiglie vicine potranno inviarti richieste.",
  },
  detail: {
    about: "Chi sono",
    offers: "Offre",
    speaks: "Parla",
    rate: "Tariffa",
    contactHidden: "Telefono ed email vengono condivisi solo dopo che l'aiutante accetta la richiesta.",
    verifiedNote: "Una persona del team Nonnina ha controllato i documenti.",
    unverifiedNote: "Nonnina non ha ancora controllato questo profilo. Conoscetevi prima.",
    sendTitle: "Invia una richiesta",
    sendLede: "L'aiutante vede il nome del tuo genitore, la città, il servizio e il messaggio. I tuoi contatti solo se accetta.",
    forParent: "Per",
    service: "Di cosa c'è bisogno?",
    message: "Messaggio",
    messageHint: "Poche parole su cosa serve.",
    messagePlaceholder: "Mia madre ha bisogno di aiuto per la spesa settimanale.",
    preferredTime: "Quando (facoltativo)",
    preferredTimeHint: "es. il martedì mattina, ogni settimana",
    preferredTimePlaceholder: "Martedì mattina",
    send: "Invia richiesta",
    signInTitle: "Chiedi a questo aiutante",
    signInBody: "Accedi all'area famiglia per inviare una richiesta per il tuo genitore.",
    signIn: "Accedi come famiglia",
    setupFirst: "Aggiungi prima il tuo genitore nell'area famiglia.",
    sent: (name) => `Richiesta inviata a ${name}`,
    sentBody: "Vedrai la risposta nell'area famiglia. Se accetta, ricevi il suo numero di telefono.",
    notified: "Notifica",
    toFamily: "Vedi lo stato nell'area famiglia",
    ownProfile: "Questo è il tuo profilo.",
  },
  join: {
    eyebrow: "Per gli aiutanti",
    title: "Offri il tuo aiuto",
    lede: "Spesa, cucina, una visita, un passaggio: le famiglie della tua città cercano qualcuno di cui fidarsi.",
    emailTitle: "Crea il tuo account",
    emailLede: "Inserisci la tua email. Ti inviamo un link, senza password. Poi compili il profilo.",
    email: "La tua email",
    sendLink: "Inviami un link",
    sentTitle: "Controlla la tua email",
    sentBody: (email) => `Abbiamo inviato un link a ${email}. Aprilo su questo dispositivo.`,
    demoTitle: "Modalità demo",
    demoLede: "Nessun account necessario. Compila il modulo oppure guarda come Lucia, un'aiutante demo.",
    demoContinue: "Continua come Lucia (aiutante demo)",
    formTitle: "Il tuo profilo da aiutante",
    how: [
      "Il tuo profilo appare nell'elenco come “non ancora verificato”.",
      "Il team Nonnina verifica gli aiutanti di persona e aggiunge il badge.",
      "Le famiglie ti inviano richieste. Tu accetti o rifiuti. I contatti vengono condivisi solo se accetti.",
    ],
  },
  form: {
    name: "Nome",
    nameHint: "Nome e cognome, oppure il nome del servizio o dell'associazione",
    kind: "Sei …",
    city: "Città",
    bio: "Su di te",
    bioHint: "Cosa fai, dove, e cosa ti piace. Almeno 20 caratteri.",
    languages: "Lingue che parli",
    services: "Cosa offri",
    rate: "Tariffa oraria in €",
    rateHint: "Tra 5 e 150 €. I volontari lasciano vuoto.",
    free: "Aiuto gratuitamente",
    phone: "Cellulare",
    phoneHint: "Formato internazionale, es. +393331234567. Ti mandiamo un SMS per ogni nuova richiesta.",
    email: "Email",
    emailHint: "Per le richieste e la verifica.",
    consentShare: "Telefono ed email vengono condivisi solo con le famiglie di cui accetto la richiesta.",
    consentVerify: "So che Nonnina verifica gli aiutanti di persona e che fino ad allora il mio profilo è “non ancora verificato”.",
    privateNote: "Telefono ed email non compaiono mai nell'elenco pubblico.",
    create: "Crea il mio profilo",
    save: "Salva profilo",
    saved: "Profilo salvato.",
    errorSummary: "Controlla i campi evidenziati.",
    errors: {
      name: "Inserisci un nome (2–80 caratteri).",
      kind: "Scegli che tipo di aiutante sei.",
      city: "Inserisci la tua città.",
      bio: "Scrivi almeno 20 caratteri su di te.",
      languages: "Scegli almeno una lingua.",
      services: "Scegli almeno un servizio.",
      hourly_rate_eur: "Inserisci una tariffa tra 5 e 150 € oppure scegli “gratuitamente”.",
      phone: "Usa il formato internazionale, es. +393331234567.",
      email: "Inserisci un'email valida.",
      consent_share: "Conferma, per favore.",
      consent_verify: "Conferma, per favore.",
    },
  },
  requestErrors: {
    senior_id: "Scegli per chi è l'aiuto.",
    service: "Scegli un servizio offerto da questo aiutante.",
    message: "Scrivi un breve messaggio (almeno 5 caratteri).",
    preferred_time: "Breve, per favore (max. 120 caratteri).",
    generic: "Qualcosa è andato storto. Riprova.",
    notFound: "Questo aiutante non è più disponibile.",
  },
  me: {
    title: (name) => `Ciao ${name}`,
    pending: "Il tuo profilo è nell'elenco come “non ancora verificato”. Il team Nonnina verifica gli aiutanti di persona.",
    verified: "Il tuo profilo è verificato.",
    viewPublic: "Il mio profilo pubblico",
    requests: "Richieste",
    noRequests: "Ancora nessuna richiesta. Le famiglie vedono il tuo profilo nell'elenco.",
    requestFrom: (senior, city) => `Per ${senior} a ${city}`,
    preferredTime: "Quando",
    accept: "Accetta",
    decline: "Rifiuta",
    markDone: "Segna come completata",
    contactTitle: "Contatto della famiglia",
    contactHint: "Chiama entro un giorno per accordarvi sui dettagli.",
    familyContact: (name) => `${name} (famiglia)`,
    profile: "Modifica profilo",
    inactive: "Il tuo profilo è nascosto dall'elenco.",
  },
  family: {
    title: "Aiutanti",
    empty: "Ancora nessuna richiesta. Trova qualcuno per la spesa, la cucina o un po' di compagnia.",
    find: "Trova un aiutante",
    with: (helper, senior) => `${helper} · per ${senior}`,
    contact: "Contatto",
    waiting: "In attesa di risposta",
    declinedHint: "Non disponibile – prova un altro aiutante.",
  },
  feed: { findHelper: "Trova un aiutante" },
  sms: {
    newRequest: ({ senior, city, service, url }) => `Nonnina: Nuova richiesta – ${service} per ${senior} a ${city}. Accetta o rifiuta: ${url}`,
    accepted: ({ helper, senior, service, url }) => `Nonnina: ${helper} ha accettato la richiesta (${service} per ${senior}). Contatto: ${url}`,
    declined: ({ helper, senior, url }) => `Nonnina: ${helper} questa volta non può aiutare ${senior}. Trova un altro aiutante: ${url}`,
    subjectNew: "Nuova richiesta su Nonnina",
    subjectAccepted: "La tua richiesta è stata accettata",
    subjectDeclined: "La tua richiesta è stata rifiutata",
  },
};

export const marketplaceStrings: Record<MarketplaceLocale, MarketplaceStrings> = { en, de, it };

export function marketplaceT(locale: MarketplaceLocale = "en"): MarketplaceStrings {
  return marketplaceStrings[locale] ?? en;
}

/** Locale for messages to a helper: German if they speak it, else Italian, else English. */
export function localeForLanguages(languages: readonly string[]): MarketplaceLocale {
  if (languages.includes("de")) return "de";
  if (languages.includes("it")) return "it";
  return "en";
}

export function formatRate(rate: number | null, locale: MarketplaceLocale): string {
  const t = marketplaceT(locale);
  if (rate === null) return t.common.free;
  const eur = Number.isInteger(rate) ? String(rate) : rate.toFixed(2).replace(".", locale === "en" ? "." : ",");
  return t.common.perHour(eur);
}
