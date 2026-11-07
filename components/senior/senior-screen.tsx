"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Check, Clock3, Phone, RotateCcw } from "lucide-react";
import type { Language, MedicationTime } from "@/lib/db/types";
import { seniorT } from "@/lib/i18n/senior";
import { detectEmergency } from "@/lib/emergency-keywords";
import { formatReminder, nextReminder } from "@/lib/time";
import { useEmergency } from "@/hooks/use-emergency";
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
      trigger_emergency: async (params: { level?: string; reason?: string; quote?: string }) => {
        const level = params.level === "warning" ? "warning" : "emergency";
        await triggerRef.current({
          level,
          reason: params.reason?.slice(0, 300) || (level === "emergency" ? "Emergency reported by assistant" : "Warning reported by assistant"),
          quote: params.quote?.slice(0, 600) || "",
          source: "agent_tool",
        });
        return "relatives_notified";
      },
      create_help_request: async (params: { category?: string; summary?: string }) => {
        try {
          await fetch("/api/help-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, category: params.category ?? "other", summary: params.summary?.slice(0, 500) || "Help requested" }),
          });
        } catch {
          /* the agent still tells the senior; the webhook escalation is a second chance */
        }
        return "family_informed";
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
        <div>
          <Greeting name={firstName} language={language} greetings={t.greeting} />
          <Clock language={language} />
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-[1em] py-[0.6em] font-semibold text-primary">
          <Clock3 className="size-[1.3em]" />
          <span>{reminder}</span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[0.8em]">
        <TalkButton state={talkState} label={label} onPress={onPress} getVolume={getVolume} />
        {voiceError ? (
          <div role="alert" className="flex max-w-3xl flex-col items-center gap-4 text-center">
            <p className="text-[1.15em] font-semibold">{voiceError.title}</p>
            {voiceError.body ? <p className="text-muted-foreground">{voiceError.body}</p> : null}
            {voiceError.retry ? (
              <button
                type="button"
                onClick={() => void start()}
                className="flex min-h-[88px] items-center gap-3 rounded-full border-2 border-primary/30 bg-card px-10 text-[1.1em] font-semibold text-primary shadow-soft"
              >
                <RotateCcw className="size-8" />
                {t.retry}
              </button>
            ) : null}
          </div>
        ) : voiceConfigured ? (
          <Captions text={caption} speaker={t.captionsAgent} />
        ) : (
          <p className="max-w-3xl text-balance text-center text-muted-foreground">
            {t.voiceUnavailableTitle}. {t.voiceUnavailableBody}
          </p>
        )}
      </main>

      <footer className="flex items-end justify-between gap-6">
        <p className="flex items-center gap-2 font-medium text-emerald-700">
          {relativeNames.length > 0 ? (
            <>
              <Check className="size-[1.2em]" />
              {t.connected(relativeNames[0])}
            </>
          ) : (
            t.nobodyConnected
          )}
        </p>
        {emergency.state.allClearSent ? <p className="text-muted-foreground">{t.allClearSent}</p> : null}
        <HelpButton label={t.help} onClick={manualHelp} inline />
      </footer>

      <WarningBanner t={t} state={emergency.state} relativeNames={relativeNames} onCancel={emergency.cancel} onDismiss={emergency.dismiss} />
      <EmergencyOverlay t={t} state={emergency.state} relativeNames={relativeNames} primaryRelative={primaryRelative} onCancel={emergency.cancel} />
    </div>
  );
}

/** Red help button, ≥ 88 px, always visible bottom right, separated from the main button. */
function HelpButton({ label, onClick, inline = false }: { label: string; onClick: () => void; inline?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        (inline ? "" : "fixed bottom-[var(--s-pad)] right-[var(--s-pad)] z-30 ") +
        "flex min-h-[var(--s-help)] min-w-[calc(var(--s-help)*2)] items-center justify-center gap-[0.5em] rounded-full bg-red-600 px-[1.2em] text-[length:var(--s-help-text)] font-bold text-white shadow-[0_16px_40px_-12px_rgba(220,38,38,0.7)] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-red-300"
      }
    >
      <Phone className="size-[1.25em]" />
      {label}
    </button>
  );
}
