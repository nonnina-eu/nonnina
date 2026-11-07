"use client";

import { Logo } from "@/components/logo";
import { useLanding } from "./language-provider";

export function Footer() {
  const { t } = useLanding();

  return (
    <footer className="border-t border-[#e7ecec] bg-white">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Logo wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#343a46]">{t.footer.built}</p>
          <p className="mt-3 text-sm text-[#8b94a7]">{t.footer.photos}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-[#202128]">{t.footer.product}</p>
          <ul className="mt-4 space-y-2 text-base text-[#343a46]">
            <li><a href="#come-funziona" className="hover:text-[#202128]">{t.nav.how}</a></li>
            <li><a href="#sicurezza" className="hover:text-[#202128]">{t.nav.safety}</a></li>
            <li><a href="#famiglia" className="hover:text-[#202128]">{t.nav.family}</a></li>
            <li><a href="#domande" className="hover:text-[#202128]">FAQ</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-[#202128]">{t.footer.company}</p>
          <ul className="mt-4 space-y-2 text-base text-[#343a46]">
            <li><a href="#lista" className="hover:text-[#202128]">{t.nav.cta}</a></li>
            <li><a href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://care-copilot-silk.vercel.app"}/demo`} className="hover:text-[#202128]">{t.footer.demo}</a></li>
            <li><span>nonnina.eu</span></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-[#202128]">{t.footer.legal}</p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#343a46]">
            <li>{t.footer.emergency}</li>
            <li>{t.footer.advice}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#e7ecec]">
        <p className="container py-5 text-sm text-[#8b94a7]">{t.footer.rights}</p>
      </div>
    </footer>
  );
}
