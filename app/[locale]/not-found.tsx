import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { getDictionary } from "@/lib/i18n";

export default function NotFound() {
  const t = getDictionary("en");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-latte p-8 text-center">
      <Wordmark className="text-5xl" />
      <h1 className="text-4xl">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <Link href="/" className="btn btn-ink">{t.notFound.back}</Link>
    </main>
  );
}
