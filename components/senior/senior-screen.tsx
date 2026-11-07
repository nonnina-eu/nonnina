"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Check, Clock3, HandHelping, Phone, RotateCcw } from "lucide-react";
import { Mark } from "@/components/logo";
import type { HelpCategory, Language, MedicationTime, NotificationRecord } from "@/lib/db/types";
import { seniorT, type SeniorStrings } from "@/lib/i18n/senior";
import { detectEmergency } from "@/lib/emergency-keywords";
import { formatReminder, nextReminder } from "@/lib/time";
import { emergencyToolOutcome, helpRequestToolOutcome } from "@/lib/tool-outcomes";
import { useEmergency } from "@/hooks/use-emergency";
import { useSeniorStatus } from "@/hooks/use-senior-status";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { Captions } from "./captions";
import { Clock, Greeting, useNow } from "./clock";
import { EmergencyOverlay, WarningBanner } from "./emergency-overlay";
import { MicPermission } from "./mic-permission";
import { TalkButton, type TalkState } from "./talk-button";

export interface SeniorScreenProps {
  token: string;
  firstName: string;
  language: Language;
  city: string;
  medicationTimes: MedicationTime[];
  relatives: { name: string; phone: string | null; priority: number }[];
  voiceConfigured: boolean;
}

type VoiceError = { title: string; body?: string; retry: boolean } | null;

const MIC_KEY = "care-copilot.mic-granted";

const HELP_CATEGORIES: readonly HelpCategory[] = ["daily_help", "legal", "money", "health", "loneliness", "other"];
/** The agent may send an unknown category; the API would reject it (422), so fall back to "other". */
function normalizeCategory(value: string | undefined): HelpCategory {
  return HELP_CATEGORIES.includes(value as HelpCategory) ? (value as HelpCategory) : "other";
}

export function SeniorScreen(props: SeniorScreenProps) {
  const { token, firstName, language, medicationTimes, relatives, voiceConfigured } = props;
  const t = useMemo(() => seniorT(language), [language]);
  useWakeLock();

  const now = useNow(30_000);
  const reminder = useMemo(() => formatReminder(nextReminder(medicationTimes, now ?? new Date()), language), [medicationTimes, now, language]);
  const reminderRef = useRef(reminder);
  reminderRef.current = reminder;

  const relativeNames = useMemo(() => [...relatives].sort((a, b) => a.priority - b.priority).map((r) => r.name), [relatives]);
  const primaryRelative = useMemo(() => [...relatives].sort((a, b) => a.priority - b.priority)[0] ?? null, [relatives]);

  const emergency = useEmergency(token);
  const takenHelp = useSeniorStatus(token)?.helpRequest ?? null;
  const triggerRef = useRef(emergency.trigger);
  triggerRef.current = emergency.trigger;

  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<VoiceError>(null);
  const [ended, setEnded] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    try {
      setMicGranted(window.localStorage.getItem(MIC_KEY) === "1");
    } catch {
      setMicGranted(false);
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      setVoiceError(null);
      setCaption(null);
    },
    onDisconnect: () => {
      setEnded(true);
      setTimeout(() => setEnded(false), 2000);
    },
    onError: (message: string) => {
      console.warn("[voice] error", message);
      setVoiceError({ title: t.errorTitle, retry: true });
    },
    onMessage: ({ message, role }: { message: string; role: "user" | "agent" }) => {
      if (role === "agent") {
        setCaption(message);
        return;
      }
      // Keyword safety net: deterministic, independent from the agent.
      const match = detectEmergency(message);
      if (match) {
        void triggerRef.current({
          level: match.level,
          reason: `Keyword: "${match.phrase}"`,
          quote: message,
          source: "keyword_detector",
        });
      }
    },
    clientTools: {
      // Tool results are the real outcome (lib/tool-outcomes.ts), so Lina never claims an SMS that was not sent.
      trigger_emergency: async (params: { level?: string; reason?: string; quote?: string }) => {
        const level = params.level === "warning" ? "warning" : "emergency";
        const result = await triggerRef.current({
          level,
          reason: params.reason?.slice(0, 300) || (level === "emergency" ? "Emergency reported by assistant" : "Warning reported by assistant"),
          quote: params.quote?.slice(0, 600) || "",
          source: "agent_tool",
        });
        return emergencyToolOutcome(result);
      },
      create_help_request: async (params: { category?: string; summary?: string }) => {
        try {
          const res = await fetch("/api/help-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, category: normalizeCategory(params.category), summary: params.summary?.trim().slice(0, 500) || "Help requested" }),
          });
          const json = (await res.json().catch(() => null)) as { ok?: boolean; notified?: NotificationRecord[] } | null;
          return helpRequestToolOutcome({ ok: res.ok && Boolean(json?.ok), notified: json?.notified });
        } catch {
          // Network down: the post-call webhook is a second chance, but Lina must not promise anything.
          return helpRequestToolOutcome({ ok: false });
        }
      },
      get_next_reminder: () => reminderRef.current,
    },
  });

  const { status, isSpeaking, startSession, endSession, getInputVolume, getOutputVolume } = conversation;

  const start = useCallback(async () => {
    setVoiceError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/elevenlabs/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { ok: boolean; signedUrl?: string; dynamicVariables?: Record<string, string>; code?: string };
      if (!res.ok || !json.ok || !json.signedUrl) {
        if (json.code === "voice_unavailable") {
          setVoiceError({ title: t.voiceUnavailableTitle, body: t.voiceUnavailableBody, retry: false });
        } else {
          setVoiceError({ title: t.errorTitle, retry: true });
        }
        return;
      }
      await startSession({
        signedUrl: json.signedUrl,
        connectionType: "websocket",
        dynamicVariables: json.dynamicVariables,
      });
    } catch (e) {
      console.warn("[voice] start failed", e);
      setVoiceError({ title: t.errorTitle, retry: true });
    } finally {
      setStarting(false);
    }
  }, [startSession, t, token]);

  const onPress = useCallback(() => {
    if (status === "connected" || status === "connecting") {
      void endSession();
      return;
    }
    void start();
  }, [status, endSession, start]);

  const allowMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
      try {
        window.localStorage.setItem(MIC_KEY, "1");
      } catch {
        /* ignore */
      }
      setMicGranted(true);
    } catch {
      setMicDenied(true);
    }
  }, []);

  const manualHelp = useCallback(() => {
    void emergency.trigger({
      level: "emergency",
      reason: language === "de" ? "Hilfe-Knopf gedrückt" : "Pulsante Aiuto premuto",
      quote: "",
      source: "manual_button",
    });
  }, [emergency, language]);

  const talkState: TalkState = ended
    ? "ended"
    : status === "connecting" || starting
      ? "connecting"
      : status === "connected"
        ? isSpeaking
          ? "speaking"
          : "listening"
        : "idle";

  const label =
    talkState === "connecting" ? t.connecting : talkState === "listening" ? t.listening : talkState === "speaking" ? t.tapToEnd : talkState === "ended" ? t.ended : t.talk;

  const getVolume = useCallback(() => (talkState === "speaking" ? getOutputVolume() : getInputVolume()), [talkState, getInputVolume, getOutputVolume]);

  if (micGranted === null) {
    return <div className="h-dvh w-full" aria-busy="true" />;
  }
  if (!micGranted && voiceConfigured) {
    return (
      <>
        <MicPermission t={t} onAllow={allowMic} denied={micDenied} />
        <HelpButton label={t.help} onClick={manualHelp} />
        <EmergencyOverlay t={t} state={emergency.state} relativeNames={relativeNames} primaryRelative={primaryRelative} onCancel={emergency.cancel} />
      </>
    );
  }

  return (
    <div className="sky-glow relative flex h-dvh w-full select-none flex-col overflow-hidden p-[var(--s-pad)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-[0.7em]">
          <Mark className="mt-[0.15em] size-[1.9em] shrink-0" />
          <div>
            <Greeting name={firstName} language={language} greetings={t.greeting} />
            <Clock language={language} />
          </div>
        </div>
        {/* reminder card: Camomilla surface, Sole-deep text */}
        <div className="flex items-center gap-2 rounded-xl bg-camomilla px-[1em] py-[0.6em] font-bold text-sole-deep">
          <Clock3 className="size-[1.3em]" />
          <span>
            <span className="sr-only">{t.nextReminder}: </span>
            {reminder}
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[0.8em]">
        <TalkButton state={talkState} label={label} onPress={onPress} getVolume={getVolume} />
        {voiceError ? (
          <div role="alert" className="flex max-w-3xl flex-col items-center gap-4 text-center">
            <p className="font-display text-[1.35em] text-ink">{voiceError.title}</p>
            {voiceError.body ? <p className="text-graphite">{voiceError.body}</p> : null}
            {voiceError.retry ? (
              <button
                type="button"
                onClick={() => void start()}
                className="flex min-h-[88px] items-center gap-3 rounded-xl border-2 border-ink bg-white px-10 text-[1.1em] font-bold text-ink shadow-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sole/50"
              >
                <RotateCcw className="size-8" />
                {t.retry}
              </button>
            ) : null}
          </div>
        ) : voiceConfigured ? (
          <Captions text={caption} speaker={t.captionsAgent} />
        ) : (
          <p className="max-w-3xl text-balance text-center font-semibold text-graphite">
            {t.voiceUnavailableTitle}. {t.voiceUnavailableBody}
          </p>
        )}
      </main>

      <footer className="flex items-end justify-between gap-6">
        <StatusPill
          t={t}
          relativeName={relativeNames[0] ?? null}
          takenHelp={takenHelp ? t.helpTaken(takenHelp.acknowledgedBy, takenHelp.summary) : null}
        />
        {emergency.state.allClearSent ? <p className="font-semibold text-bene">{t.allClearSent}</p> : null}
        <HelpButton label={t.help} onClick={manualHelp} inline />
      </footer>

      <WarningBanner t={t} state={emergency.state} relativeNames={relativeNames} onCancel={emergency.cancel} onDismiss={emergency.dismiss} />
      <EmergencyOverlay t={t} state={emergency.state} relativeNames={relativeNames} primaryRelative={primaryRelative} onCancel={emergency.cancel} />
    </div>
  );
}

/**
 * Footer pill. Default: "Anna ist verbunden" (Salvia surface, Bene text). When a relative has taken a
 * help request ("I'm on it" in the family feed) it becomes "Anna kümmert sich um: …".
 */
function StatusPill({ t, relativeName, takenHelp }: { t: SeniorStrings; relativeName: string | null; takenHelp: string | null }) {
  if (takenHelp) {
    return (
      <p role="status" aria-live="polite" className="flex min-w-0 max-w-[60%] items-center gap-2 rounded-2xl bg-salvia px-[1em] py-[0.5em] font-bold text-bene">
        <HandHelping className="size-[1.3em] shrink-0" />
        <span className="line-clamp-2">{takenHelp}</span>
      </p>
    );
  }
  if (!relativeName) {
    return <p className="flex items-center gap-2 rounded-full bg-mist px-[1em] py-[0.5em] font-bold text-graphite">{t.nobodyConnected}</p>;
  }
  return (
    <p className="flex items-center gap-2 rounded-full bg-salvia px-[1em] py-[0.5em] font-bold text-bene">
      <Check className="size-[1.2em]" />
      {t.connected(relativeName)}
    </p>
  );
}

/** Allarme help button, ≥ 88 px, always visible bottom right, separated from the main button. Red is used for nothing else. */
function HelpButton({ label, onClick, inline = false }: { label: string; onClick: () => void; inline?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        (inline ? "" : "fixed bottom-[var(--s-pad)] right-[var(--s-pad)] z-30 ") +
        "flex min-h-[var(--s-help)] min-w-[calc(var(--s-help)*2)] items-center justify-center gap-[0.5em] rounded-xl bg-allarme px-[1.2em] text-[length:var(--s-help-text)] font-bold text-white shadow-[0_16px_40px_-12px_rgba(180,35,24,0.6)] transition-transform hover:bg-allarme-deep active:scale-[0.98] focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-allarme/30"
      }
    >
      <Phone className="size-[1.25em]" />
      {label}
    </button>
  );
}
