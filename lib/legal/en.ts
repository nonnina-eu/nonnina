import { operator } from "./operator";
import type { LegalChrome, LegalDoc, LegalDocId } from "./types";

const o = operator;
const address = [o.name, ...o.address].join(", ");
const months = o.waitlistRetentionMonths;

export const chrome: LegalChrome = {
  label: "Legal",
  updated: "Last updated",
  draft: "Draft: the operator's details are not filled in yet. Do not publish this page as it is.",
  back: "Back to the start",
  nav: { privacy: "Privacy policy", terms: "Terms of use", cookies: "Cookie policy" },
};

export const docs: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: "Privacy policy",
    description: "How Nonnina handles personal data on nonnina.eu and the waitlist.",
    intro:
      "This policy explains what personal data we process when you visit nonnina.eu or join the waitlist, why we do it and what rights you have. It covers this website only. The Nonnina service itself (the senior screen, voice companion and family alerts) will come with its own privacy information before anyone uses it.",
    sections: [
      {
        heading: "1. Who is responsible",
        body: [
          `The controller under the EU General Data Protection Regulation (GDPR) is ${address}. Email: ${o.email}.`,
          ...(o.dpoEmail ? [`You can reach our data protection officer at ${o.dpoEmail}.`] : []),
        ],
      },
      {
        heading: "2. Visiting the website",
        body: [
          "When you open a page, your browser sends technical data that our hosting provider records in server logs: IP address, date and time, the page requested, the referring page and your browser and operating system.",
          "We need this to deliver the website and keep it secure. Legal basis: our legitimate interest in a working, secure website (Art. 6(1)(f) GDPR). The hosting provider keeps these logs for a short period and then deletes them.",
          "We do not use analytics, advertising or tracking tools, and we do not build profiles of visitors.",
          "Our fonts are stored on our own server. Your browser does not connect to Google or any other font provider.",
        ],
      },
      {
        heading: "3. Joining the waitlist",
        body: [
          "If you join the waitlist we store:",
          { list: ["your email address (required)", "whether you are a family member, helper, care service or other (required)", "your city (optional)", "your message (optional)"] },
          "We use this only to tell you about Nonnina's launch and, if you wrote to us, to answer you. Legal basis: your consent (Art. 6(1)(a) GDPR). You can withdraw it at any time by email; this does not affect what we did before.",
          `We keep your sign-up until you withdraw, until we no longer need it, and at the latest ${months} months after you signed up. Then we delete it.`,
          "To prevent abuse, the form counts sign-up attempts per IP address. The IP address is held only in memory for one minute and is not stored. Legal basis: our legitimate interest in protecting the form (Art. 6(1)(f) GDPR).",
        ],
      },
      {
        heading: "4. Cookies",
        body: [
          "We use two small cookies: one remembers the language you choose, the other remembers your answer to the cookie notice. We do not use cookies for analytics or advertising. Details are in our [cookie policy](/cookies).",
        ],
      },
      {
        heading: "5. Who receives your data",
        body: [
          "We use two service providers who process data on our behalf, under data processing agreements (Art. 28 GDPR):",
          {
            table: {
              head: ["Provider", "What for", "Where"],
              rows: [
                ["Vercel Inc.", "Hosting of the website, server logs", "Global network; company based in the USA"],
                ["Supabase Inc.", "Database for waitlist sign-ups", "Servers in the EU (Frankfurt); company based in the USA"],
              ],
            },
          },
          "Both companies are based in the USA, so access from the USA cannot be ruled out. Transfers rely on the EU Commission's adequacy decision for the EU-U.S. Data Privacy Framework where the provider is certified, and otherwise on the EU standard contractual clauses (Art. 46(2)(c) GDPR).",
          "We do not sell your data or share it with anyone else, unless we are legally required to.",
        ],
      },
      {
        heading: "6. Your rights",
        body: [
          "You have the right to:",
          {
            list: [
              "access the data we hold about you (Art. 15 GDPR)",
              "have it corrected (Art. 16) or deleted (Art. 17)",
              "restrict its processing (Art. 18)",
              "receive it in a portable format (Art. 20)",
              "object to processing based on our legitimate interest (Art. 21)",
              "withdraw your consent at any time, with effect for the future (Art. 7(3))",
            ],
          },
          `Write to ${o.email}. You can also complain to a data protection authority, in particular in the country where you live or work. The authority responsible for us is: ${o.supervisoryAuthority}.`,
        ],
      },
      {
        heading: "7. Other points",
        body: [
          "You are not required to give us any data. Without an email address you cannot join the waitlist; the rest of the website works as usual.",
          "We do not make decisions about you based solely on automated processing.",
          "We protect data in transit with TLS encryption and limit access to the people who need it.",
          "We will update this policy when our website or the law changes. The date at the top shows the current version.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms of use",
    description: "The rules for using nonnina.eu and the Nonnina waitlist.",
    intro: `These terms apply to the website nonnina.eu and its waitlist, operated by ${address} ("we"). By using the website you accept them.`,
    sections: [
      {
        heading: "1. What this website is",
        body: [
          "nonnina.eu presents Nonnina, a voice companion for older people living at home that is still in development. The website is for information. Using it, and joining the waitlist, is free and does not create a contract for the Nonnina service.",
          "Linked demos show an early prototype. They may change, contain errors or be unavailable at any time.",
        ],
      },
      {
        heading: "2. Not an emergency service, not advice",
        body: [
          "Nonnina is not an emergency service and does not replace one. In an emergency call 112.",
          "Content on this website gives general orientation. It is not medical, legal, tax or financial advice and does not replace a doctor, lawyer or advice centre.",
        ],
      },
      {
        heading: "3. The waitlist",
        body: [
          "Joining the waitlist gives you no right to access Nonnina, at any particular time or price. Please give a real email address that belongs to you. You can leave the waitlist at any time by writing to us.",
          "How we handle your data is described in our [privacy policy](/privacy).",
        ],
      },
      {
        heading: "4. Fair use",
        body: [
          "Please do not misuse the website, for example by sending automated or abusive sign-ups, trying to break its security or overloading it.",
        ],
      },
      {
        heading: "5. Content and brand",
        body: [
          "Texts, images, the Nonnina name and logo and the design of this website are protected. You may view and share links to the website. Any other use needs our permission, unless the law allows it.",
          "We are not responsible for the content of external websites we link to. We checked them when we added the link; if we learn that a link breaks the law, we remove it.",
        ],
      },
      {
        heading: "6. Liability",
        body: [
          "We are liable without limitation for intent and gross negligence, for injury to life, body or health, and where mandatory law such as the German Product Liability Act applies.",
          "For slight negligence we are liable only if we breach an obligation that is essential for using the website, and only for the typical, foreseeable damage. Otherwise our liability for slight negligence is excluded.",
          "We aim to keep the website available and accurate but cannot guarantee it.",
        ],
      },
      {
        heading: "7. Changes",
        body: [
          "We may update these terms, for example when the website changes. The version shown here at the time you use the website applies.",
        ],
      },
      {
        heading: "8. Law and disputes",
        body: [
          "German law applies. If you are a consumer, this does not take away the protection of mandatory consumer law in the country where you live.",
          "We are neither obliged nor willing to take part in dispute resolution proceedings before a consumer arbitration board.",
          "If one clause is invalid, the rest of these terms remain in force.",
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie policy",
    description: "The two cookies nonnina.eu uses, and why.",
    intro: "Cookies are small text files a website stores in your browser. This page lists the cookies nonnina.eu uses. It is short, because there are only two and neither tracks you.",
    sections: [
      {
        heading: "1. The cookies we use",
        body: [
          {
            table: {
              head: ["Name", "Purpose", "Type", "Duration"],
              rows: [
                ["nonnina-locale", "Remembers the language you chose (English, German or Italian)", "Functional, first-party", "1 year"],
                ["nonnina-consent", "Remembers your choice in the cookie notice, so it is not shown again", "Necessary, first-party", "1 year"],
              ],
            },
          },
          "nonnina-locale is set only when you pick a language in the EN · DE · IT switcher and contains nothing but the language code. nonnina-consent is set when you answer the cookie notice and contains only \"all\" or \"necessary\".",
        ],
      },
      {
        heading: "2. What we do not use",
        body: [
          "No analytics, advertising, social media or other third-party cookies, and no similar tracking such as pixels or fingerprinting. Our fonts are stored on our own server, so no font provider sees your visit.",
        ],
      },
      {
        heading: "3. Legal basis",
        body: [
          "Both cookies are needed to provide a function you asked for, so they do not require consent (§ 25(2) no. 2 of the German Telecommunications Digital Services Data Protection Act, TDDDG).",
          "We still show a short cookie notice so you know what we store. Today \"Accept\" and \"Only necessary\" have the same effect, because there is nothing optional to switch on. If we ever add optional cookies or tools, they will only run after you choose \"Accept\", and we will update this page first.",
        ],
      },
      {
        heading: "4. Your choices",
        body: [
          "You can change your choice at any time with \"Cookie settings\" in the footer. You can also delete or block cookies in your browser; the website still works, it then chooses the language from your browser settings and shows the cookie notice again.",
          "More about how we handle personal data is in our [privacy policy](/privacy).",
        ],
      },
    ],
  },
};
