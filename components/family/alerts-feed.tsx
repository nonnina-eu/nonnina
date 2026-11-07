"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, HandHelping, Loader2, MessageSquareText, Phone, RefreshCw, Siren } from "lucide-react";
import type { EmergencyEvent, FamilyFeed, HelpRequest, VoiceSession } from "@/lib/db/types";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FeedItem =
  | { kind: "event"; at: string; data: EmergencyEvent }
  | { kind: "help"; at: string; data: HelpRequest }
  | { kind: "session"; at: string; data: VoiceSession };

const POLL_MS = 2_500;

function merge(feed: FamilyFeed): FeedItem[] {
  const items: FeedItem[] = [
    ...feed.events.map((e) => ({ kind: "event" as const, at: e.created_at, data: e })),
    ...feed.helpRequests.map((h) => ({ kind: "help" as const, at: h.created_at, data: h })),
    ...feed.sessions.map((s) => ({ kind: "session" as const, at: s.created_at, data: s })),
  ];
  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function timeAgo(iso: string, now: number): string {
  const diff = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff} s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function AlertsFeed({ familyId, initial, compact = false }: { familyId: string; initial: FamilyFeed; compact?: boolean }) {
  const [feed, setFeed] = useState<FamilyFeed>(initial);
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const reduce = useReducedMotion();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/family/${familyId}/feed`, { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as FamilyFeed & { ok: boolean };
      if (json.ok) setFeed(json);
    } catch {
      /* keep the last good feed */
    }
  }, [familyId]);

  // Polling always; Supabase realtime on top when configured (instant refresh).
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      void refresh();
    }, POLL_MS);
    const supabase = createBrowserSupabase();
    const channel = supabase
      ?.channel(`family-${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_events" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "help_requests" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "voice_sessions" }, () => void refresh())
      .subscribe();
    return () => {
      clearInterval(timer);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [familyId, refresh]);

  const items = useMemo(() => merge(feed), [feed]);
  const seniorName = feed.seniors[0]?.first_name ?? "your parent";

  async function acknowledge(id: string) {
    setRefreshing(true);
    try {
      await fetch(`/api/emergency/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge" }),
      });
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", compact ? "" : "")}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length === 0 ? `No alerts for ${seniorName} yet.` : `${items.length} update${items.length === 1 ? "" : "s"} · live`}
        </p>
        <button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" aria-label="Refresh">
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={`${item.kind}-${item.data.id}`}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {item.kind === "event" ? (
              <EventCard event={item.data} when={timeAgo(item.at, now)} onAcknowledge={() => void acknowledge(item.data.id)} seniorName={seniorName} />
            ) : item.kind === "help" ? (
              <HelpCard request={item.data} when={timeAgo(item.at, now)} />
            ) : (
              <SessionCard session={item.data} when={timeAgo(item.at, now)} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 ? (
        <div className="card-soft flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
          <Check className="size-6 text-emerald-600" />
          All quiet. New alerts appear here automatically.
        </div>
      ) : null}
    </div>
  );
}

function EventCard({ event, when, onAcknowledge, seniorName }: { event: EmergencyEvent; when: string; onAcknowledge: () => void; seniorName: string }) {
  const isEmergency = event.level === "emergency";
  const cancelled = event.status === "cancelled_by_senior";
  const acknowledged = event.status === "acknowledged";
  const notified = event.notified.filter((n) => n.status === "sent" || n.status === "demo");
  const sourceLabel = { agent_tool: "AI assistant", keyword_detector: "keyword safety net", manual_button: "help button", no_response: "no response" }[event.source];

  return (
    <article
      className={cn(
        "card-soft border-l-[6px] p-5",
        cancelled ? "border-l-emerald-500" : isEmergency ? "border-l-red-600" : "border-l-amber-500",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={cancelled ? "success" : isEmergency ? "danger" : "warning"}>
            {isEmergency ? <Siren className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
            {cancelled ? "All clear" : isEmergency ? "Emergency" : "Check in soon"}
          </Badge>
          {acknowledged ? (
            <Badge variant="outline">
              <Check className="size-3.5" /> On it
            </Badge>
          ) : null}
        </div>
        <time className="text-xs text-muted-foreground">{when}</time>
      </div>

      <p className="mt-3 text-base font-semibold">
        {cancelled ? `${seniorName} says she is OK now.` : event.reason}
      </p>
      {event.quote ? <p className="mt-1 text-base italic text-muted-foreground">“{event.quote}”</p> : null}

      <p className="mt-3 text-xs text-muted-foreground">
        Triggered by {sourceLabel}
        {notified.length > 0 ? ` · notified ${[...new Set(notified.map((n) => n.name))].join(", ")} (${[...new Set(notified.map((n) => n.channel))].join(", ")})` : " · nobody notified yet"}
      </p>

      {!cancelled && !acknowledged ? (
        <button
          type="button"
          onClick={onAcknowledge}
          className={cn(
            "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isEmergency ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700",
          )}
        >
          <Phone className="size-4" />
          I’m on it
        </button>
      ) : null}
    </article>
  );
}

function HelpCard({ request, when }: { request: HelpRequest; when: string }) {
  const labels: Record<HelpRequest["category"], string> = {
    daily_help: "Daily help",
    legal: "Legal",
    money: "Money",
    health: "Health",
    loneliness: "Company",
    other: "Other",
  };
  return (
    <article className="card-soft border-l-[6px] border-l-primary p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge>
            <HandHelping className="size-3.5" />
            Help request · {labels[request.category]}
          </Badge>
          <Badge variant="outline">{request.status.replace("_", " ")}</Badge>
        </div>
        <time className="text-xs text-muted-foreground">{when}</time>
      </div>
      <p className="mt-3 text-base">{request.summary}</p>
    </article>
  );
}

function SessionCard({ session, when }: { session: VoiceSession; when: string }) {
  const moodVariant = session.mood === "worried" || session.mood === "low" ? "warning" : "success";
  return (
    <article className="card-soft border-l-[6px] border-l-emerald-500 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <MessageSquareText className="size-3.5" />
            Call summary
          </Badge>
          {session.mood ? <Badge variant={moodVariant}>mood: {session.mood}</Badge> : null}
          {session.needs_human ? <Badge variant="warning">needs a person</Badge> : null}
        </div>
        <time className="text-xs text-muted-foreground">{when}</time>
      </div>
      <p className="mt-3 text-base">{session.summary ?? "No summary available."}</p>
      {session.problem_category ? <p className="mt-1 text-xs text-muted-foreground">Topic: {session.problem_category}</p> : null}
    </article>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex items-center justify-center p-10 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
