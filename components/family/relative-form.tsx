import type { Relative } from "@/lib/db/types";
import { familyT } from "@/lib/i18n/family";
import { Input } from "@/components/ui/input";
import { Field } from "./shell";

/** Fields of one relative, shared by the setup wizard and the settings page. */
export function RelativeFields({ relative, defaultPriority = 2, errors = {}, idPrefix = "rel" }: { relative?: Relative | null; defaultPriority?: number; errors?: Record<string, string>; idPrefix?: string }) {
  const t = familyT().setup.relatives;
  const id = (f: string) => `${idPrefix}-${f}`;
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.name} htmlFor={id("name")} error={errors.name}>
          <Input id={id("name")} name="name" defaultValue={relative?.name ?? ""} required maxLength={60} />
        </Field>
        <Field label={t.relation} htmlFor={id("relation")} error={errors.relation}>
          <Input id={id("relation")} name="relation" defaultValue={relative?.relation ?? ""} placeholder="son, neighbour, …" required maxLength={40} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.phone} htmlFor={id("phone")} error={errors.phone} hint="+49… or +39…, no spaces">
          <Input id={id("phone")} name="phone" type="tel" inputMode="tel" defaultValue={relative?.phone ?? ""} placeholder="+4915112345678" required />
        </Field>
        <Field label={t.email} htmlFor={id("email")} error={errors.email}>
          <Input id={id("email")} name="email" type="email" defaultValue={relative?.email ?? ""} maxLength={120} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t.priority} htmlFor={id("priority")} error={errors.priority}>
          <Input id={id("priority")} name="priority" type="number" min={1} max={10} defaultValue={relative?.priority ?? defaultPriority} required />
        </Field>
        <label className="flex items-center gap-3 self-end rounded-sm border border-line bg-white px-4 py-3 text-sm font-bold text-ink">
          <input type="checkbox" name="notify_sms" value="on" defaultChecked={relative?.notify_sms ?? true} className="size-5 accent-ink" />
          {t.notifySms}
        </label>
        <label className="flex items-center gap-3 self-end rounded-sm border border-line bg-white px-4 py-3 text-sm font-bold text-ink">
          <input type="checkbox" name="notify_call" value="on" defaultChecked={relative?.notify_call ?? true} className="size-5 accent-ink" />
          {t.notifyCall}
        </label>
      </div>
    </div>
  );
}
