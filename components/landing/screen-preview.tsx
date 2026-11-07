"use client";

import { useState } from "react";
import { Mic, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const scenes = [
  { id: "talk", label: "Talk", caption: "One big button. They tap and speak." },
  { id: "remind", label: "Remind", caption: "Nonnina says the small things out loud." },
  { id: "help", label: "Help", caption: "If something is wrong, the family is told." },
] as const;

type SceneId = (typeof scenes)[number]["id"];

export function ScreenPreview() {
  const [scene, setScene] = useState<SceneId>("talk");
  const current = scenes.find((item) => item.id === scene) ?? scenes[0];

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-3 flex rounded-full bg-[#f5f7fb] p-1" role="tablist" aria-label="How the screen works">
        {scenes.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={scene === item.id}
            onClick={() => setScene(item.id)}
            className={cn("h-11 flex-1 rounded-full text-sm font-bold", scene === item.id ? "bg-[#202128] text-white" : "text-[#343a46]")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_24px_60px_-28px_rgba(32,33,40,0.45)]">
        <div className="flex items-center justify-between border-b border-[#eef1f4] px-5 py-4">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-[#202128]">Hello, Maria</p>
            <p className="text-sm text-[#8b94a7]">Friday · 10:30</p>
          </div>
          <p className="max-w-[7rem] rounded-full bg-[#e9f3df] px-3 py-1 text-center text-xs font-bold text-[#2f6b32]">Tablets at 6 pm</p>
        </div>

        <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-8 text-center">
          {scene === "talk" ? <TalkScene /> : null}
          {scene === "remind" ? <RemindScene /> : null}
          {scene === "help" ? <HelpScene /> : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#eef1f4] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f6b32]">Anna is connected</p>
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-bold text-white">
            <Phone className="size-4" />
            Help
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-[#343a46]">{current.caption}</p>
    </div>
  );
}

function TalkScene() {
  return (
    <div className="flex flex-col items-center">
      <div className="btn-glossy flex size-36 flex-col items-center justify-center gap-2 rounded-full text-white">
        <Mic className="size-8" strokeWidth={2.2} />
        <span className="text-sm font-bold">Tap and talk</span>
      </div>
      <p className="mt-5 max-w-[16rem] text-base text-[#343a46]">No menus. No password. Just one button.</p>
    </div>
  );
}

function RemindScene() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#476adb]">Nonnina</p>
      <p className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[#202128]">Maria, it is time for your tablets.</p>
      <p className="mt-3 text-base text-[#343a46]">Spoken slowly, with the words on the screen.</p>
    </div>
  );
}

function HelpScene() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-red-600">Help is on the way</p>
      <p className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[#202128]">I have told Anna.</p>
      <p className="mt-4 rounded-2xl bg-[#f5f7fb] px-4 py-3 text-left text-sm leading-relaxed text-[#343a46]">
        Nonnina: EMERGENCY for Maria. She said “I fell and I can’t get up.” Call her now, or 112.
      </p>
    </div>
  );
}
