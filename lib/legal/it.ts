import { operator } from "./operator";
import type { LegalChrome, LegalDoc, LegalDocId } from "./types";

const o = operator;
const address = [o.name, ...o.address].join(", ");
const months = o.waitlistRetentionMonths;

export const chrome: LegalChrome = {
  label: "Note legali",
  updated: "Ultimo aggiornamento",
  draft: "Bozza: mancano ancora i dati del titolare. Non pubblicare questa pagina così com'è.",
  back: "Torna all'inizio",
  nav: { privacy: "Informativa privacy", terms: "Condizioni d'uso", cookies: "Cookie policy" },
};

export const docs: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: "Informativa sulla privacy",
    description: "Come Nonnina tratta i dati personali su nonnina.eu e nella lista d'attesa.",
    intro:
      "Questa informativa spiega quali dati personali trattiamo quando visiti nonnina.eu o ti iscrivi alla lista d'attesa, perché lo facciamo e quali diritti hai. Vale solo per questo sito. Il servizio Nonnina vero e proprio (schermo per l'anziano, assistente vocale, avvisi alla famiglia) avrà una propria informativa prima di qualsiasi utilizzo.",
    sections: [
      {
        heading: "1. Titolare del trattamento",
        body: [
          `Il titolare del trattamento ai sensi del Regolamento generale sulla protezione dei dati (GDPR) è ${address}. Email: ${o.email}.`,
          ...(o.dpoEmail ? [`Puoi contattare il nostro responsabile della protezione dei dati all'indirizzo ${o.dpoEmail}.`] : []),
        ],
      },
      {
        heading: "2. Visita del sito",
        body: [
          "Quando apri una pagina, il tuo browser invia dati tecnici che il nostro fornitore di hosting registra nei log del server: indirizzo IP, data e ora, pagina richiesta, pagina di provenienza, browser e sistema operativo.",
          "Ci servono per mostrare il sito e mantenerlo sicuro. Base giuridica: il nostro legittimo interesse a un sito funzionante e sicuro (art. 6, par. 1, lett. f GDPR). Il fornitore di hosting conserva questi log per un breve periodo e poi li cancella.",
          "Non usiamo strumenti di analisi, pubblicità o tracciamento e non creiamo profili dei visitatori.",
          "I nostri font sono salvati sul nostro server. Il tuo browser non si collega a Google né ad altri fornitori di font.",
        ],
      },
      {
        heading: "3. Iscrizione alla lista d'attesa",
        body: [
          "Se ti iscrivi alla lista d'attesa salviamo:",
          { list: ["il tuo indirizzo email (obbligatorio)", "se sei un familiare, un aiutante, un servizio di assistenza o altro (obbligatorio)", "la tua città (facoltativa)", "il tuo messaggio (facoltativo)"] },
          "Usiamo questi dati solo per informarti del lancio di Nonnina e, se ci hai scritto, per risponderti. Base giuridica: il tuo consenso (art. 6, par. 1, lett. a GDPR). Puoi revocarlo in qualsiasi momento via email; la revoca non incide su quanto fatto prima.",
          `Conserviamo la tua iscrizione finché non revochi il consenso, finché non ci serve più e comunque non oltre ${months} mesi dall'iscrizione. Poi la cancelliamo.`,
          "Per evitare abusi, il modulo conta i tentativi di iscrizione per indirizzo IP. L'indirizzo IP resta solo in memoria per un minuto e non viene salvato. Base giuridica: il nostro legittimo interesse a proteggere il modulo (art. 6, par. 1, lett. f GDPR).",
        ],
      },
      {
        heading: "4. Cookie",
        body: [
          "Usiamo due piccoli cookie: uno ricorda la lingua che scegli, l'altro la tua risposta all'avviso sui cookie. Non usiamo cookie di analisi o pubblicità. I dettagli sono nella nostra [cookie policy](/cookies).",
        ],
      },
      {
        heading: "5. Chi riceve i tuoi dati",
        body: [
          "Ci avvaliamo di due fornitori che trattano i dati per nostro conto, sulla base di accordi sul trattamento dei dati (art. 28 GDPR):",
          {
            table: {
              head: ["Fornitore", "Per cosa", "Dove"],
              rows: [
                ["Vercel Inc.", "Hosting del sito, log del server", "Rete globale; società con sede negli USA"],
                ["Supabase Inc.", "Database per la lista d'attesa", "Server nell'UE (Francoforte); società con sede negli USA"],
              ],
            },
          },
          "Entrambe le società hanno sede negli USA, quindi non si può escludere un accesso dagli USA. I trasferimenti si basano sulla decisione di adeguatezza della Commissione europea per l'EU-U.S. Data Privacy Framework, se il fornitore è certificato, e altrimenti sulle clausole contrattuali tipo dell'UE (art. 46, par. 2, lett. c GDPR).",
          "Non vendiamo i tuoi dati e non li condividiamo con altri, salvo obblighi di legge.",
        ],
      },
      {
        heading: "6. I tuoi diritti",
        body: [
          "Hai il diritto di:",
          {
            list: [
              "accedere ai dati che conserviamo su di te (art. 15 GDPR)",
              "farli correggere (art. 16) o cancellare (art. 17)",
              "limitarne il trattamento (art. 18)",
              "riceverli in un formato portabile (art. 20)",
              "opporti al trattamento basato sul nostro legittimo interesse (art. 21)",
              "revocare il consenso in qualsiasi momento, con effetto per il futuro (art. 7, par. 3)",
            ],
          },
          `Scrivi a ${o.email}. Puoi anche presentare reclamo a un'autorità di controllo, in particolare nel paese in cui vivi o lavori (in Italia il Garante per la protezione dei dati personali). L'autorità competente per noi è: ${o.supervisoryAuthority}.`,
        ],
      },
      {
        heading: "7. Altre informazioni",
        body: [
          "Non sei obbligato a fornirci dati. Senza indirizzo email non puoi iscriverti alla lista d'attesa; il resto del sito funziona normalmente.",
          "Non prendiamo decisioni su di te basate unicamente su un trattamento automatizzato.",
          "Proteggiamo i dati in transito con la crittografia TLS e limitiamo l'accesso alle persone che ne hanno bisogno.",
          "Aggiorneremo questa informativa quando cambiano il sito o la legge. La data in alto indica la versione attuale.",
        ],
      },
    ],
  },

  terms: {
    title: "Condizioni d'uso",
    description: "Le regole per usare nonnina.eu e la lista d'attesa di Nonnina.",
    intro: `Queste condizioni valgono per il sito nonnina.eu e la sua lista d'attesa, gestiti da ${address} ("noi"). Usando il sito le accetti.`,
    sections: [
      {
        heading: "1. Che cos'è questo sito",
        body: [
          "nonnina.eu presenta Nonnina, un assistente vocale per le persone anziane che vivono a casa, ancora in fase di sviluppo. Il sito ha scopo informativo. Usarlo e iscriversi alla lista d'attesa è gratuito e non crea alcun contratto per il servizio Nonnina.",
          "Le demo collegate mostrano un prototipo iniziale. Possono cambiare, contenere errori o non essere disponibili in qualsiasi momento.",
        ],
      },
      {
        heading: "2. Non è un servizio di emergenza, non è consulenza",
        body: [
          "Nonnina non è un servizio di emergenza e non lo sostituisce. In caso di emergenza chiama il 112.",
          "I contenuti di questo sito offrono un orientamento generale. Non sono consulenza medica, legale, fiscale o finanziaria e non sostituiscono un medico, un avvocato o un centro di consulenza.",
        ],
      },
      {
        heading: "3. La lista d'attesa",
        body: [
          "L'iscrizione alla lista d'attesa non dà diritto ad accedere a Nonnina, né in un momento né a un prezzo determinati. Indica un indirizzo email reale e tuo. Puoi cancellarti in qualsiasi momento scrivendoci.",
          "Come trattiamo i tuoi dati è spiegato nella nostra [informativa sulla privacy](/privacy).",
        ],
      },
      {
        heading: "4. Uso corretto",
        body: [
          "Non usare il sito in modo improprio, ad esempio con iscrizioni automatiche o abusive, tentativi di violarne la sicurezza o sovraccaricandolo.",
        ],
      },
      {
        heading: "5. Contenuti e marchio",
        body: [
          "Testi, immagini, il nome e il logo Nonnina e la grafica di questo sito sono protetti. Puoi consultare il sito e condividerne i link. Ogni altro uso richiede il nostro permesso, salvo quanto consentito dalla legge.",
          "Non siamo responsabili dei contenuti dei siti esterni che colleghiamo. Li abbiamo controllati quando abbiamo inserito il link; se veniamo a sapere che un link viola la legge, lo rimuoviamo.",
        ],
      },
      {
        heading: "6. Responsabilità",
        body: [
          "Rispondiamo senza limiti per dolo e colpa grave, per danni alla vita, al corpo o alla salute e nei casi previsti da norme imperative, come la legge tedesca sulla responsabilità per danno da prodotti.",
          "Per colpa lieve rispondiamo solo in caso di violazione di un obbligo essenziale per l'uso del sito, e solo per il danno tipico e prevedibile. Per il resto la responsabilità per colpa lieve è esclusa.",
          "Cerchiamo di mantenere il sito disponibile e corretto, ma non possiamo garantirlo.",
        ],
      },
      {
        heading: "7. Modifiche",
        body: [
          "Possiamo aggiornare queste condizioni, ad esempio quando cambia il sito. Vale la versione pubblicata qui nel momento in cui usi il sito.",
        ],
      },
      {
        heading: "8. Legge applicabile e controversie",
        body: [
          "Si applica la legge tedesca. Se sei un consumatore, restano salve le tutele inderogabili previste dalla legge del paese in cui vivi.",
          "Non siamo obbligati né disposti a partecipare a procedure di risoluzione delle controversie davanti a un organismo di conciliazione per i consumatori.",
          "Se una clausola non è valida, le altre restano in vigore.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie policy",
    description: "I due cookie usati da nonnina.eu, e perché.",
    intro: "I cookie sono piccoli file di testo che un sito salva nel tuo browser. Questa pagina elenca i cookie di nonnina.eu. È breve, perché sono solo due e nessuno ti traccia.",
    sections: [
      {
        heading: "1. I cookie che usiamo",
        body: [
          {
            table: {
              head: ["Nome", "Scopo", "Tipo", "Durata"],
              rows: [
                ["nonnina-locale", "Ricorda la lingua scelta (inglese, tedesco o italiano)", "Funzionale, di prima parte", "1 anno"],
                ["nonnina-consent", "Ricorda la tua risposta all'avviso sui cookie, così non viene mostrato di nuovo", "Necessario, di prima parte", "1 anno"],
              ],
            },
          },
          "nonnina-locale viene impostato solo quando scegli una lingua con il selettore EN · DE · IT e contiene soltanto il codice della lingua. nonnina-consent viene impostato quando rispondi all'avviso sui cookie e contiene solo \"all\" o \"necessary\".",
        ],
      },
      {
        heading: "2. Cosa non usiamo",
        body: [
          "Nessun cookie di analisi, pubblicità, social media o di terze parti, e nessun tracciamento simile come pixel o fingerprinting. I nostri font sono salvati sul nostro server, quindi nessun fornitore di font vede la tua visita.",
        ],
      },
      {
        heading: "3. Base giuridica",
        body: [
          "Entrambi i cookie sono necessari per fornire una funzione che hai richiesto, quindi non serve il consenso (art. 5, par. 3 della direttiva ePrivacy; in Germania § 25, comma 2, n. 2 TDDDG; in Italia art. 122 del Codice privacy).",
          "Mostriamo comunque un breve avviso sui cookie, perché tu sappia cosa salviamo. Oggi \"Accetta\" e \"Solo necessari\" hanno lo stesso effetto, perché non c'è nulla di facoltativo da attivare. Se un giorno aggiungessimo cookie o strumenti facoltativi, funzioneranno solo dopo \"Accetta\" e aggiorneremo prima questa pagina.",
        ],
      },
      {
        heading: "4. Le tue scelte",
        body: [
          "Puoi cambiare la tua scelta in qualsiasi momento da \"Impostazioni cookie\" in fondo alla pagina. Puoi anche cancellare o bloccare i cookie dal browser; il sito funziona comunque, sceglie la lingua in base alle impostazioni del browser e mostra di nuovo l'avviso.",
          "Maggiori informazioni sul trattamento dei dati personali sono nella nostra [informativa sulla privacy](/privacy).",
        ],
      },
    ],
  },
};
