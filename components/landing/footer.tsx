"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useLanding } from "./language-provider";

export function Footer() {
  const { t } = useLanding();
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">{t.footer.built}</p>
        </div>
        <div className="grid gap-6 text-sm sm:grid-cols-2">
          <div className="space-y-2">
            <p className="font-semibold">Care Copilot</p>
            <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground">{t.nav.how}</a>
            <a href="#safety" className="block text-muted-foreground hover:text-foreground">{t.nav.safety}</a>
            <a href="#faq" className="block text-muted-foreground hover:text-foreground">FAQ</a>
            <Link href="/demo" className="block text-muted-foreground hover:text-foreground">{t.footer.demo}</Link>
          </div>
          <div className="space-y-2 text-muted-foreground">
            <p className="font-semibold text-foreground">Important</p>
            <p>{t.footer.emergency}</p>
            <p>{t.footer.advice}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">© 2026 Care Copilot · Stuttgart</div>
    </footer>
  );
}
