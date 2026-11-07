import { operator } from "./operator";
import type { LegalChrome, LegalDoc, LegalDocId } from "./types";

const o = operator;
const address = [o.name, ...o.address].join(", ");
const months = o.waitlistRetentionMonths;

export const chrome: LegalChrome = {
  label: "Rechtliches",
  updated: "Stand",
  draft: "Entwurf: Die Angaben zum Betreiber fehlen noch. Diese Seite so nicht veröffentlichen.",
  back: "Zurück zur Startseite",
  nav: { privacy: "Datenschutzerklärung", terms: "Nutzungsbedingungen", cookies: "Cookie-Richtlinie" },
};

export const docs: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: "Datenschutzerklärung",
    description: "Wie Nonnina personenbezogene Daten auf nonnina.eu und bei der Warteliste verarbeitet.",
    intro:
      "Diese Erklärung beschreibt, welche personenbezogenen Daten wir verarbeiten, wenn Sie nonnina.eu besuchen oder sich in die Warteliste eintragen, warum wir das tun und welche Rechte Sie haben. Sie gilt nur für diese Website. Für den Nonnina-Dienst selbst (Bildschirm für Senioren, Sprachbegleiter, Benachrichtigungen an Angehörige) gibt es vor der ersten Nutzung eigene Datenschutzhinweise.",
    sections: [
      {
        heading: "1. Verantwortlicher",
        body: [
          `Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist ${address}. E-Mail: ${o.email}.`,
          ...(o.dpoEmail ? [`Unseren Datenschutzbeauftragten erreichen Sie unter ${o.dpoEmail}.`] : []),
        ],
      },
      {
        heading: "2. Besuch der Website",
        body: [
          "Wenn Sie eine Seite aufrufen, übermittelt Ihr Browser technische Daten, die unser Hosting-Anbieter in Server-Logfiles speichert: IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite, die zuvor besuchte Seite sowie Browser und Betriebssystem.",
          "Das ist nötig, um die Website auszuliefern und sicher zu betreiben. Rechtsgrundlage ist unser berechtigtes Interesse an einer funktionierenden, sicheren Website (Art. 6 Abs. 1 lit. f DSGVO). Der Hosting-Anbieter speichert die Logfiles nur kurz und löscht sie danach.",
          "Wir verwenden keine Analyse-, Werbe- oder Tracking-Tools und erstellen keine Profile von Besuchern.",
          "Unsere Schriftarten liegen auf unserem eigenen Server. Ihr Browser verbindet sich nicht mit Google oder einem anderen Schriftanbieter.",
        ],
      },
      {
        heading: "3. Eintrag in die Warteliste",
        body: [
          "Wenn Sie sich in die Warteliste eintragen, speichern wir:",
          { list: ["Ihre E-Mail-Adresse (Pflichtangabe)", "ob Sie Angehörige/r, Helfer/in, Pflegedienst oder anderes sind (Pflichtangabe)", "Ihren Ort (freiwillig)", "Ihre Nachricht (freiwillig)"] },
          "Wir nutzen diese Angaben nur, um Sie über den Start von Nonnina zu informieren und, falls Sie uns geschrieben haben, Ihnen zu antworten. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können sie jederzeit per E-Mail widerrufen; die bis dahin erfolgte Verarbeitung bleibt davon unberührt.",
          `Wir speichern Ihren Eintrag, bis Sie widerrufen, bis wir ihn nicht mehr benötigen, längstens aber ${months} Monate nach der Anmeldung. Danach löschen wir ihn.`,
          "Zum Schutz vor Missbrauch zählt das Formular Anmeldeversuche pro IP-Adresse. Die IP-Adresse wird dafür nur eine Minute im Arbeitsspeicher gehalten und nicht gespeichert. Rechtsgrundlage ist unser berechtigtes Interesse am Schutz des Formulars (Art. 6 Abs. 1 lit. f DSGVO).",
        ],
      },
      {
        heading: "4. Cookies",
        body: [
          "Wir verwenden zwei kleine Cookies: Eines merkt sich die gewählte Sprache, das andere Ihre Antwort auf den Cookie-Hinweis. Cookies für Analyse oder Werbung setzen wir nicht ein. Einzelheiten finden Sie in unserer [Cookie-Richtlinie](/cookies).",
        ],
      },
      {
        heading: "5. Empfänger Ihrer Daten",
        body: [
          "Wir setzen zwei Dienstleister ein, die Daten in unserem Auftrag verarbeiten, auf Grundlage von Verträgen zur Auftragsverarbeitung (Art. 28 DSGVO):",
          {
            table: {
              head: ["Anbieter", "Zweck", "Ort"],
              rows: [
                ["Vercel Inc.", "Hosting der Website, Server-Logfiles", "Weltweites Netzwerk; Unternehmen mit Sitz in den USA"],
                ["Supabase Inc.", "Datenbank für die Warteliste", "Server in der EU (Frankfurt); Unternehmen mit Sitz in den USA"],
              ],
            },
          },
          "Beide Unternehmen haben ihren Sitz in den USA, ein Zugriff aus den USA ist daher nicht auszuschließen. Übermittlungen stützen sich auf den Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy Framework, soweit der Anbieter zertifiziert ist, und im Übrigen auf die EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).",
          "Wir verkaufen Ihre Daten nicht und geben sie nicht an andere weiter, es sei denn, wir sind gesetzlich dazu verpflichtet.",
        ],
      },
      {
        heading: "6. Ihre Rechte",
        body: [
          "Sie haben das Recht auf:",
          {
            list: [
              "Auskunft über Ihre bei uns gespeicherten Daten (Art. 15 DSGVO)",
              "Berichtigung (Art. 16) oder Löschung (Art. 17)",
              "Einschränkung der Verarbeitung (Art. 18)",
              "Datenübertragbarkeit (Art. 20)",
              "Widerspruch gegen Verarbeitungen, die auf unserem berechtigten Interesse beruhen (Art. 21)",
              "Widerruf Ihrer Einwilligung jederzeit mit Wirkung für die Zukunft (Art. 7 Abs. 3)",
            ],
          },
          `Schreiben Sie uns dazu an ${o.email}. Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere in dem Land, in dem Sie wohnen oder arbeiten. Für uns zuständig ist: ${o.supervisoryAuthority}.`,
        ],
      },
      {
        heading: "7. Weitere Hinweise",
        body: [
          "Sie sind nicht verpflichtet, uns Daten zu geben. Ohne E-Mail-Adresse ist ein Eintrag in die Warteliste nicht möglich; der Rest der Website funktioniert wie gewohnt.",
          "Wir treffen keine ausschließlich automatisierten Entscheidungen über Sie.",
          "Wir schützen Daten bei der Übertragung mit TLS-Verschlüsselung und beschränken den Zugriff auf die Personen, die ihn benötigen.",
          "Wir passen diese Erklärung an, wenn sich unsere Website oder die Rechtslage ändert. Das Datum oben zeigt die aktuelle Fassung.",
        ],
      },
    ],
  },

  terms: {
    title: "Nutzungsbedingungen",
    description: "Die Regeln für die Nutzung von nonnina.eu und der Nonnina-Warteliste.",
    intro: `Diese Bedingungen gelten für die Website nonnina.eu und ihre Warteliste, betrieben von ${address} („wir“). Mit der Nutzung der Website akzeptieren Sie sie.`,
    sections: [
      {
        heading: "1. Was diese Website ist",
        body: [
          "nonnina.eu stellt Nonnina vor, einen Sprachbegleiter für ältere Menschen zu Hause, der sich noch in Entwicklung befindet. Die Website dient der Information. Ihre Nutzung und der Eintrag in die Warteliste sind kostenlos und begründen keinen Vertrag über den Nonnina-Dienst.",
          "Verlinkte Demos zeigen einen frühen Prototyp. Sie können sich jederzeit ändern, Fehler enthalten oder nicht erreichbar sein.",
        ],
      },
      {
        heading: "2. Kein Notrufdienst, keine Beratung",
        body: [
          "Nonnina ist kein Notrufdienst und ersetzt keinen. Im Notfall wählen Sie 112.",
          "Die Inhalte dieser Website dienen der allgemeinen Orientierung. Sie sind keine medizinische, rechtliche, steuerliche oder finanzielle Beratung und ersetzen weder Arzt noch Anwalt noch Beratungsstelle.",
        ],
      },
      {
        heading: "3. Die Warteliste",
        body: [
          "Der Eintrag in die Warteliste gibt keinen Anspruch auf Zugang zu Nonnina, weder zu einem bestimmten Zeitpunkt noch zu einem bestimmten Preis. Bitte geben Sie eine echte, eigene E-Mail-Adresse an. Sie können sich jederzeit per Nachricht an uns austragen.",
          "Wie wir mit Ihren Daten umgehen, steht in unserer [Datenschutzerklärung](/privacy).",
        ],
      },
      {
        heading: "4. Faire Nutzung",
        body: [
          "Bitte missbrauchen Sie die Website nicht, zum Beispiel durch automatisierte oder missbräuchliche Anmeldungen, Angriffe auf ihre Sicherheit oder Überlastung.",
        ],
      },
      {
        heading: "5. Inhalte und Marke",
        body: [
          "Texte, Bilder, der Name und das Logo Nonnina sowie die Gestaltung dieser Website sind geschützt. Sie dürfen die Website ansehen und Links darauf teilen. Jede weitere Nutzung bedarf unserer Zustimmung, soweit das Gesetz sie nicht erlaubt.",
          "Für Inhalte externer Websites, auf die wir verlinken, sind wir nicht verantwortlich. Wir haben sie beim Setzen des Links geprüft; erfahren wir von Rechtsverstößen, entfernen wir den Link.",
        ],
      },
      {
        heading: "6. Haftung",
        body: [
          "Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach zwingenden gesetzlichen Vorschriften wie dem Produkthaftungsgesetz.",
          "Bei leichter Fahrlässigkeit haften wir nur bei Verletzung einer Pflicht, die für die Nutzung der Website wesentlich ist, und nur für den typischen, vorhersehbaren Schaden. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.",
          "Wir bemühen uns, die Website erreichbar und richtig zu halten, können das aber nicht garantieren.",
        ],
      },
      {
        heading: "7. Änderungen",
        body: [
          "Wir können diese Bedingungen anpassen, etwa wenn sich die Website ändert. Es gilt die Fassung, die zum Zeitpunkt Ihrer Nutzung hier abrufbar ist.",
        ],
      },
      {
        heading: "8. Recht und Streitigkeiten",
        body: [
          "Es gilt deutsches Recht. Sind Sie Verbraucher, bleibt der Schutz durch zwingendes Verbraucherrecht des Landes, in dem Sie leben, unberührt.",
          "Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
          "Ist eine Bestimmung unwirksam, bleiben die übrigen Bedingungen wirksam.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie-Richtlinie",
    description: "Die zwei Cookies, die nonnina.eu verwendet, und warum.",
    intro: "Cookies sind kleine Textdateien, die eine Website in Ihrem Browser speichert. Diese Seite nennt die Cookies von nonnina.eu. Sie ist kurz, denn es gibt nur zwei, und keines verfolgt Sie.",
    sections: [
      {
        heading: "1. Welche Cookies wir verwenden",
        body: [
          {
            table: {
              head: ["Name", "Zweck", "Art", "Speicherdauer"],
              rows: [
                ["nonnina-locale", "Merkt sich die gewählte Sprache (Englisch, Deutsch oder Italienisch)", "Funktional, eigenes Cookie", "1 Jahr"],
                ["nonnina-consent", "Merkt sich Ihre Antwort auf den Cookie-Hinweis, damit er nicht erneut erscheint", "Notwendig, eigenes Cookie", "1 Jahr"],
              ],
            },
          },
          "nonnina-locale wird nur gesetzt, wenn Sie über die Auswahl EN · DE · IT eine Sprache wählen, und enthält nur das Sprachkürzel. nonnina-consent wird gesetzt, wenn Sie den Cookie-Hinweis beantworten, und enthält nur „all“ oder „necessary“.",
        ],
      },
      {
        heading: "2. Was wir nicht verwenden",
        body: [
          "Keine Analyse-, Werbe-, Social-Media- oder sonstigen Cookies von Dritten und kein vergleichbares Tracking wie Pixel oder Fingerprinting. Unsere Schriftarten liegen auf unserem eigenen Server, kein Schriftanbieter erfährt von Ihrem Besuch.",
        ],
      },
      {
        heading: "3. Rechtsgrundlage",
        body: [
          "Beide Cookies sind erforderlich, um eine von Ihnen gewünschte Funktion bereitzustellen, und brauchen daher keine Einwilligung (§ 25 Abs. 2 Nr. 2 TDDDG).",
          "Wir zeigen trotzdem einen kurzen Cookie-Hinweis, damit Sie wissen, was wir speichern. Derzeit haben „Akzeptieren“ und „Nur notwendige“ dieselbe Wirkung, weil es nichts Optionales einzuschalten gibt. Sollten wir je optionale Cookies oder Dienste einsetzen, laufen sie erst nach „Akzeptieren“, und wir passen diese Seite vorher an.",
        ],
      },
      {
        heading: "4. Ihre Wahlmöglichkeiten",
        body: [
          "Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“ im Footer ändern. Sie können Cookies auch in Ihrem Browser löschen oder blockieren; die Website funktioniert weiter, wählt die Sprache dann anhand Ihrer Browsereinstellungen und zeigt den Cookie-Hinweis erneut.",
          "Mehr zum Umgang mit personenbezogenen Daten steht in unserer [Datenschutzerklärung](/privacy).",
        ],
      },
    ],
  },
};
