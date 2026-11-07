import { Fragment, type ReactNode } from "react";
import { Logo } from "./brand";
import { LanguageSwitcher } from "./language-switcher";
import { Footer } from "./sections/footer";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { LEGAL_DOCS, getLegal, legalPath, localizeHref, operator, operatorIsComplete, type LegalBlock, type LegalDocId } from "@/lib/legal";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders "[text](href)" inside plain strings as links. */
function inline(text: string, locale: Locale): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <a key={m.index} href={localizeHref(locale, m[2])} className="font-bold text-link underline underline-offset-4 hover:text-ink">
        {m[1]}
      </a>,
    );
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

function Block({ block, locale }: { block: LegalBlock; locale: Locale }) {
  if (typeof block === "string") return <p>{inline(block, locale)}</p>;
  if ("list" in block) {
    return (
      <ul className="list-disc space-y-1.5 pl-6 marker:text-muted">
        {block.list.map((item) => <li key={item}>{inline(item, locale)}</li>)}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full min-w-[32rem] text-left text-[0.9375rem]">
        <thead className="bg-mist">
          <tr>{block.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, i) => (
            <tr key={i} className="border-t border-line align-top">
              {row.map((cell, j) => <td key={j} className="px-4 py-3">{j === 0 ? <code className="font-sans font-bold">{cell}</code> : cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalPage({ locale, doc }: { locale: Locale; doc: LegalDocId }) {
  const t = getDictionary(locale);
  const { chrome, docs } = getLegal(locale);
  const d = docs[doc];
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(operator.updated));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {t.skip}
      </a>
      <header className="border-b border-line bg-white">
        <div className="wrap flex h-16 items-center justify-between gap-4 md:h-20">
          <a href={localePath(locale)} title={t.nav.home} className="text-[2.125rem] leading-none">
            <Logo />
          </a>
          <LanguageSwitcher current={locale} label={t.nav.language} path={`/${doc}`} />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="wrap py-12 outline-none md:py-20">
        <div className="mx-auto grid max-w-3xl gap-10">
          {!operatorIsComplete() ? (
            <p role="note" className="rounded-sm border-[1.5px] border-sole bg-camomilla px-4 py-3 text-sm font-bold text-sole-deep">{chrome.draft}</p>
          ) : null}

          <nav aria-label={chrome.label} className="flex flex-wrap gap-2 text-sm font-bold">
            {LEGAL_DOCS.map((id) => (
              <a
                key={id}
                href={legalPath(locale, id)}
                aria-current={id === doc ? "page" : undefined}
                className={id === doc ? "rounded-full bg-ink px-4 py-2 text-white" : "rounded-full border border-line px-4 py-2 text-muted hover:text-ink"}
              >
                {chrome.nav[id]}
              </a>
            ))}
          </nav>

          <div className="grid gap-4">
            <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.02] [font-stretch:75%]">{d.title}</h1>
            <p className="text-sm text-muted">
              {chrome.updated}: <time dateTime={operator.updated}>{updated}</time>
            </p>
            <p className="text-lg text-graphite">{inline(d.intro, locale)}</p>
          </div>

          {d.sections.map((s) => (
            <section key={s.heading} className="grid gap-4 leading-relaxed text-graphite">
              <h2 className="text-2xl font-extrabold text-ink [font-stretch:75%]">{s.heading}</h2>
              {s.body.map((b, i) => (
                <Fragment key={i}>
                  <Block block={b} locale={locale} />
                </Fragment>
              ))}
            </section>
          ))}

          <a href={localePath(locale)} className="btn btn-outline w-fit">{chrome.back}</a>
        </div>
      </main>

      <Footer t={t.footer} nav={t.nav} locale={locale} cookies={t.cookies} />
    </>
  );
}
