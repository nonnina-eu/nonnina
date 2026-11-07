const points = [
  "Data stays in Europe.",
  "Nothing turns on unless your parent says yes.",
  "Voice is not saved. Only a short written summary.",
];

export function Safety() {
  return (
    <section id="safety" className="scroll-mt-20 bg-[#f5f7fb] px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="max-w-[14ch] text-4xl text-[#202128] sm:text-5xl">Safe enough to leave on the table.</h2>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="rounded-2xl bg-white px-5 py-4 text-lg font-semibold text-[#202128]">
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-[#343a46]">Nonnina is not an emergency service and does not replace 112.</p>
      </div>
    </section>
  );
}
