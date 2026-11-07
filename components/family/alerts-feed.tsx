"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, Check, HandHelping, Loader2, MessageSquareText, Phone, PhoneOutgoing, RefreshCw, Search, Siren, Undo2 } from "lucide-react";
import type { EmergencyEvent, FamilyFeed, HelpRequest, Relative, VoiceSession } from "@/lib/db/types";
import { familyT } from "@/lib/i18n/family";
import { findHelperHref } from "@/lib/marketplace";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FeedItem =
  | { kind: "event"; at: string; data: EmergencyEvent }
  | { kind: "help"; at: string; data: HelpRequest }
  | { kind: "session"; at: string; data: VoiceSession };

type RelativeLite = Pick<Relative, "id" | "name" | "priority" | "phone">;

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
  return clock(iso);
}

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export interface AlertsFeedProps {
  familyId: string;
  initial: FamilyFeed;
  compact?: boolean;
  /** The signed-in relative (sent with "I'm on it"). */
  relativeId?: string | null;
  relatives?: RelativeLite[];
  /** Whether help requests can be resolved from this view. */
  canResolve?: boolean;
}

export function AlertsFeed({ familyId, initial, compact = false, relativeId = null, relatives = [], canResolve = true }: AlertsFeedProps) {
  const t = familyT().feed;
  const [feed, setFeed] = useState<FamilyFeed>(initial);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);
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
  const seniorNameFor = (id: string) => feed.seniors.find((x) => x.id === id)?.first_name ?? seniorName;
  const sortedRelatives = useMemo(() => [...relatives].sort((a, b) => a.priority - b.priority), [relatives]);

  async function patch(url: string, body: Record<string, unknown>, key: string) {
    setBusy(key);
    try {
      await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{items.length === 0 ? t.none(seniorName) : t.updates(items.length)}</p>
        <button type="button" onClick={() => void refresh()} className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold text-muted hover:bg-mist hover:text-ink" aria-label={t.refresh}>
          <RefreshCw className="size-3.5" />
          {t.refresh}
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
              <EventCard
                event={item.data}
                when={timeAgo(item.at, now)}
                seniorName={seniorNameFor(item.data.senior_id)}
                relatives={sortedRelatives}
                busy={busy === item.data.id}
                onAcknowledge={() => void patch(`/api/emergency/${item.data.id}`, relativeId ? { action: "acknowledge", relative_id: relativeId } : { action: "acknowledge" }, item.data.id)}
              />
            ) : item.kind === "help" ? (
              <HelpCard
                request={item.data}
                when={timeAgo(item.at, now)}
                busy={busy === item.data.id}
                canResolve={canResolve}
                seniorName={feed.seniors.length > 1 ? seniorNameFor(item.data.senior_id) : null}
                ackName={item.data.acknowledged_by ? (sortedRelatives.find((r) => r.id === item.data.acknowledged_by)?.name ?? null) : null}
                onToggle={(action) => void patch(`/api/help-request/${item.data.id}`, { action }, item.data.id)}
                onAcknowledge={() =>
                  void patch(`/api/help-request/${item.data.id}`, relativeId ? { action: "acknowledge", relative_id: relativeId } : { action: "acknowledge" }, item.data.id)
                }
              />
            ) : (
              <SessionCard session={item.data} when={timeAgo(item.at, now)} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 ? (
        <div className={cn("flex flex-col items-center gap-3 rounded-xl border border-line bg-salvia p-8 text-center text-sm text-ink", compact && "p-6")}>
          <span className="flex size-10 items-center justify-center rounded-full bg-white text-bene">
            <Check className="size-5" />
          </span>
          {t.none(seniorName)}
        </div>
      ) : null}
    </div>
  );
}

function EventCard({ event, when, onAcknowledge, seniorName, relatives, busy }: { event: EmergencyEvent; when: string; onAcknowledge: () => void; seniorName: string; relatives: RelativeLite[]; busy: boolean }) {
  const t = familyT().feed;
  const isEmergency = event.level === "emergency";
  const cancelled = event.status === "cancelled_by_senior";
  const acknowledged = event.status === "acknowledged";
  const notified = event.notified.filter((n) => n.status === "sent" || n.status === "demo");
  const calls = event.notified.filter((n) => n.channel === "call" && (n.status === "sent" || n.status === "demo"));
  const ackName = acknowledged ? relatives.find((r) => r.id === event.acknowledged_by)?.name ?? null : null;
  const nextRelative = !acknowledged && !cancelled && event.next_step_at ? relatives[event.escalation_step] ?? null : null;
  const fallbackReached = !acknowledged && !cancelled && event.next_step_at && !nextRelative && isEmergency && relatives.length > 0;
  const primaryPhone = relatives[0]?.phone ?? null;

  return (
    <article
      className={cn(
        "rounded-xl border border-line border-l-[6px] bg-white p-5 shadow-soft",
        cancelled ? "border-l-bene" : isEmergency ? "border-l-allarme" : "border-l-sole",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={cancelled ? "success" : isEmergency ? "danger" : "warning"}>
            {isEmergency ? <Siren className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
            {cancelled ? t.allClear : isEmergency ? t.emergency : t.warning}
          </Badge>
          {acknowledged ? (
            <Badge variant="success">
              <Check className="size-3.5" /> {ackName ? t.isOnIt(ackName) : t.onIt}
            </Badge>
          ) : null}
        </div>
        <time className="text-xs text-muted">{when}</time>
      </div>

      <p className="mt-3 text-base font-bold text-ink">{cancelled ? t.saysOk(seniorName) : event.reason}</p>
      {event.quote ? <p className="mt-1 text-base italic text-muted">“{event.quote}”</p> : null}

      <ul className="mt-3 flex flex-col gap-1 text-xs text-muted">
        <li>
          {t.triggeredBy} {t.sources[event.source]}
          {notified.length > 0 ? ` · ${t.notified.toLowerCase()} ${[...new Set(notified.map((n) => n.name))].join(", ")}` : ` · ${t.nobodyNotified}`}
        </li>
        {calls.map((c) => (
          <li key={`${c.relative_id}-${c.at}`} className="inline-flex items-center gap-1.5">
            <PhoneOutgoing className="size-3.5" /> {t.called(c.name, clock(c.at))}
          </li>
        ))}
        {nextRelative ? (
          <li className="inline-flex items-center gap-1.5 font-bold text-ink">
            <Loader2 className="size-3.5 animate-spin" /> {t.callingNext(nextRelative.name)}
          </li>
        ) : null}
        {fallbackReached ? <li className="font-bold text-allarme">{t.nobodyConfirmed}</li> : null}
      </ul>

      {!cancelled && !acknowledged ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={onAcknowledge}
            disabled={busy}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-sm text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole disabled:opacity-60",
              isEmergency ? "bg-allarme hover:bg-allarme-deep" : "bg-ink hover:bg-black",
            )}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {t.onIt}
          </button>
          {primaryPhone && isEmergency ? (
            <a href={`tel:${primaryPhone}`} className="flex h-12 items-center justify-center gap-2 rounded-sm border-[1.5px] border-ink bg-white px-4 text-sm font-bold text-ink hover:bg-mist">
              <Phone className="size-4" /> {t.call(seniorName)}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function HelpCard({
  request,
  when,
  onToggle,
  onAcknowledge,
  busy,
  canResolve,
  seniorName,
  ackName,
}: {
  request: HelpRequest;
  when: string;
  onToggle: (action: "resolve" | "reopen") => void;
  onAcknowledge: () => void;
  busy: boolean;
  canResolve: boolean;
  /** Shown only when the family has more than one senior. */
  seniorName: string | null;
  ackName: string | null;
}) {
  const t = familyT().feed;
  const paperwork = request.category === "legal" || request.category === "money";
  const resolved = Boolean(request.resolved_at);
  const acknowledged = Boolean(request.acknowledged_at);
  return (
    <article className={cn("rounded-xl border border-line p-5 shadow-soft", resolved ? "bg-white" : paperwork ? "bg-cielo" : "bg-glicine")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            <HandHelping className="size-3.5" />
            {seniorName ? `${seniorName} · ` : ""}
            {t.helpRequest} · {t.categories[request.category]}
          </Badge>
          {resolved ? (
            <Badge variant="success">{t.resolved}</Badge>
          ) : acknowledged ? (
            <Badge variant="success">
              <Check className="size-3.5" /> {ackName ? t.isOnIt(ackName) : t.onIt}
            </Badge>
          ) : (
            <Badge variant="outline">{request.status.replace("_", " ")}</Badge>
          )}
        </div>
        <time className="text-xs text-muted">{when}</time>
      </div>
      <p className={cn("mt-3 text-base text-ink", resolved && "text-muted line-through")}>{request.summary}</p>
      {canResolve ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {!resolved && !acknowledged ? (
            <button
              type="button"
              disabled={busy}
              onClick={onAcknowledge}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-bold text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <HandHelping className="size-4" />}
              {t.onIt}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggle(resolved ? "reopen" : "resolve")}
            className="inline-flex h-10 items-center gap-2 rounded-sm border-[1.5px] border-ink bg-white px-4 text-sm font-bold text-ink hover:bg-mist disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : resolved ? <Undo2 className="size-4" /> : <Check className="size-4" />}
            {resolved ? t.reopen : t.done}
          </button>
          {!resolved ? (
            <Link
              href={findHelperHref(request)}
              className="inline-flex h-10 items-center gap-2 rounded-sm border-[1.5px] border-ink bg-sole px-4 text-sm font-bold text-ink hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <Search className="size-4" />
              {t.findHelper}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function SessionCard({ session, when }: { session: VoiceSession; when: string }) {
  const t = familyT().feed;
  const lowMood = session.mood === "worried" || session.mood === "low";
  return (
    <article className="rounded-xl border border-line bg-menta p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            <MessageSquareText className="size-3.5" />
            {t.callSummary}
          </Badge>
          {session.mood ? <Badge variant={lowMood ? "warning" : "success"}>{t.mood}: {session.mood}</Badge> : null}
          {session.needs_human ? <Badge variant="warning">{t.needsPerson}</Badge> : null}
        </div>
        <time className="text-xs text-muted">{when}</time>
      </div>
      <p className="mt-3 text-base text-ink">{session.summary ?? t.noSummary}</p>
      {session.problem_category ? (
        <p className="mt-1 text-xs text-muted">
          {t.topic}: {session.problem_category}
        </p>
      ) : null}
    </article>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex items-center justify-center p-10 text-muted">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
