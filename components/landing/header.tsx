import Link from "next/link";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-5">
        <Link href="/" aria-label="Nonnina, nonnina.eu">
          <Logo wordmark />
        </Link>
        <a href="#join" className="inline-flex h-11 items-center rounded-full bg-[#202128] px-4 text-sm font-bold text-white">
          Join
        </a>
      </div>
    </header>
  );
}
