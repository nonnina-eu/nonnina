export function Footer() {
  return (
    <footer className="px-5 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <p className="font-display text-3xl font-extrabold tracking-[-0.04em] text-[#202128]">Nonnina</p>
        <p className="text-sm text-[#8b94a7]">nonnina.eu</p>
        <nav className="flex flex-col gap-3 text-base font-semibold text-[#343a46]" aria-label="Footer">
          <a href="#how">How it works</a>
          <a href="#safety">Safety</a>
          <a href="#questions">Questions</a>
          <a href="#join">Join</a>
        </nav>
        <p className="max-w-sm text-sm leading-relaxed text-[#343a46]">
          Not an emergency service. In an emergency call 112. Orientation only, not medical or legal advice.
        </p>
        <p className="text-sm text-[#8b94a7]">Photographs from Pexels. © 2026 Nonnina</p>
      </div>
    </footer>
  );
}
