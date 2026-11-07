import { Mail, MessageSquare, MonitorSmartphone } from "lucide-react";
import type { NotificationRecord } from "@/lib/db/types";
import { marketplaceT, type MarketplaceLocale } from "@/lib/i18n/marketplace";

/** Shows what was sent (or, in demo mode, what would have been sent) to a helper or family member. */
export function NotificationList({ records, locale }: { records: NotificationRecord[]; locale: MarketplaceLocale }) {
  if (records.length === 0) return null;
  const t = marketplaceT(locale);
  const demo = records.some((r) => r.status === "demo");
  return (
    <div className="mt-4 grid gap-2">
      {records.map((r, i) => (
        <div key={`${r.channel}-${r.at}-${i}`} className="rounded-sm border border-line bg-white px-3 py-2 text-xs text-ink">
          <p className="inline-flex items-center gap-1.5 font-bold">
            {r.channel === "email" ? <Mail className="size-3.5" aria-hidden /> : r.channel === "sms" ? <MessageSquare className="size-3.5" aria-hidden /> : <MonitorSmartphone className="size-3.5" aria-hidden />}
            {t.detail.notified} · {r.name} · {r.channel} · {r.status}
          </p>
          {r.status === "demo" && r.detail ? <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">{r.detail}</p> : null}
        </div>
      ))}
      {demo ? <p className="text-xs text-muted">{t.common.demoNote}</p> : null}
    </div>
  );
}
