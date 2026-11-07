"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 16:9 presentation stage. Slides are designed on a 1600×900 canvas and scaled to fit.
 * Keys: → / Space / PageDown next, ← / PageUp previous, Home/End, F fullscreen.
 * Print (Cmd+P) renders one slide per page.
 */
export function Deck({ slides }: { slides: React.ReactNode[] }) {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const total = slides.length;

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(total - 1, i))), [total]);

  useEffect(() => {
    const fromHash = Number(window.location.hash.replace("#", ""));
    if (fromHash >= 1 && fromHash <= total) setIndex(fromHash - 1);
  }, [total]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1600, window.innerHeight / 900));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(index + 1); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(index - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total]);

  return (
    <div className="deck-root fixed inset-0 overflow-hidden bg-[#15161B]">
      {/* Screen: one slide, scaled */}
      <div className="deck-screen absolute inset-0">
        <div
          ref={stageRef}
          className="absolute left-1/2 top-1/2 h-[900px] w-[1600px] overflow-hidden bg-white"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
          onClick={(e) => {
            const x = e.clientX / window.innerWidth;
            go(x < 0.25 ? index - 1 : index + 1);
          }}
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${total}`}
        >
          {slides[index]}
          <div className="pointer-events-none absolute bottom-6 right-8 text-[15px] font-bold text-muted">
            {index + 1} / {total}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="deck-ui fixed inset-x-0 bottom-0 h-1 bg-white/10">
        <div className="h-full bg-sole transition-[width] duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <div className="deck-ui fixed bottom-3 left-4 flex gap-2 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
        <button type="button" onClick={() => go(index - 1)} className="rounded-xs bg-white/10 px-3 py-1.5 text-sm font-bold text-white">←</button>
        <button type="button" onClick={() => go(index + 1)} className="rounded-xs bg-white/10 px-3 py-1.5 text-sm font-bold text-white">→</button>
        <span className="px-2 py-1.5 text-sm text-white/60">F fullscreen · ⌘P PDF</span>
      </div>

      {/* Print: every slide on its own page */}
      <div className="deck-print hidden">
        {slides.map((s, i) => (
          <div key={i} className={cn("relative h-[900px] w-[1600px] overflow-hidden bg-white")}>{s}</div>
        ))}
      </div>
    </div>
  );
}
