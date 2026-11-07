"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="sky-glow flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center text-ink">
      <Logo />
      <h1 className="text-[2.25rem] leading-[1.02] sm:text-5xl">Something went wrong.</h1>
      <p className="lede max-w-md">In an emergency call 112. Nonnina is not an emergency service.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/demo">Go to the demo</Link>
        </Button>
      </div>
    </main>
  );
}
