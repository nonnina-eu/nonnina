"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="sky-glow flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">In an emergency call 112. Care Copilot is not an emergency service.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
