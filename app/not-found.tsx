import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="sky-glow flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <Logo />
      <h1 className="text-3xl font-semibold tracking-tight">This page does not exist.</h1>
      <p className="max-w-md text-muted-foreground">If you were looking for a senior screen, check the device link. In an emergency call 112.</p>
      <Button asChild>
        <Link href="/">Back to the start</Link>
      </Button>
    </main>
  );
}
