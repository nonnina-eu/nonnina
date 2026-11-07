import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="sky-glow flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center text-ink">
      <Logo />
      <h1 className="text-[2.25rem] leading-[1.02] sm:text-5xl">This page does not exist.</h1>
      <p className="lede max-w-md">If you were looking for a senior screen, check the device link. In an emergency call 112.</p>
      <Button asChild size="lg">
        <Link href="/demo">Go to the demo</Link>
      </Button>
    </main>
  );
}
