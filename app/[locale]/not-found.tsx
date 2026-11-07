import Link from "next/link";
import { headers } from "next/headers";
import { Wordmark } from "@/components/brand";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";

export default async function NotFound() {
  const h = (await headers()).get("x-locale") ?? "en";
  const locale = isLocale(h) ? h : "en";
  const t = getDictionary(locale);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-latte p-8 text-center">
      <Wordmark className="text-5xl" />
      <h1 className="text-4xl">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <Link href={localePath(locale)} className="btn btn-ink">{t.notFound.back}</Link>
    </main>
  );
}
