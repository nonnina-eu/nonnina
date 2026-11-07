"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type State = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; created: boolean } | { kind: "error" };

const field = "h-14 rounded-2xl border-[#e0e4ec] bg-white text-base";

export function WaitlistForm() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; created?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "failed");
      setState({ kind: "success", created: json.created ?? true });
      form.reset();
    } catch {
      setState({ kind: "error" });
    }
  }

  return (
    <section id="join" className="scroll-mt-20 bg-[#202128] px-5 py-14 text-white">
      <div className="mx-auto max-w-5xl">
        <h2 className="max-w-[12ch] text-4xl text-white sm:text-5xl">Be ready when it opens.</h2>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/75">
          We are starting with a small group of families. Leave your email and we will write to you.
        </p>

        {state.kind === "success" ? (
          <div role="status" className="mt-8 rounded-3xl bg-white p-6 text-[#202128]">
            <CheckCircle2 className="size-8 text-[#2f6b32]" />
            <p className="mt-3 text-2xl font-extrabold">You are on the list.</p>
            <p className="mt-2 text-base text-[#343a46]">
              {state.created ? "Thank you. We will write when the pilot opens." : "This email is already on the list. Thank you."}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" className={field} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">
                I am
              </Label>
              <Select id="role" name="role" defaultValue="family" required className={field}>
                <option value="family">A family member</option>
                <option value="helper">A helper</option>
                <option value="care_service">A care service</option>
                <option value="other">Someone else</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-white">
                City
              </Label>
              <Input id="city" name="city" autoComplete="address-level2" maxLength={100} className={field} />
            </div>
            <div className="hidden" aria-hidden>
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            {state.kind === "error" ? (
              <p role="alert" className="text-sm font-semibold text-red-200 sm:col-span-2">
                That did not work. Please try again.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={state.kind === "submitting"}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-6 text-base font-bold text-[#202128] disabled:opacity-60 sm:col-span-2 sm:w-fit"
            >
              {state.kind === "submitting" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {state.kind === "submitting" ? "Sending" : "Join the waitlist"}
            </button>
            <p className="text-sm text-white/60 sm:col-span-2">We only use your email to write to you about Nonnina.</p>
          </form>
        )}
      </div>
    </section>
  );
}
