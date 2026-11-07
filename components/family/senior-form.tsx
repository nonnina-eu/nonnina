import type { Senior } from "@/lib/db/types";
import { familyT } from "@/lib/i18n/family";
import { Input } from "@/components/ui/input";
import { Field } from "./shell";
import { MedicationTimesField } from "./medication-times-field";

/** Fields of the senior profile, shared by the setup wizard and the settings page. */
export function SeniorFields({ senior, errors = {} }: { senior?: Senior | null; errors?: Record<string, string> }) {
  const t = familyT().setup.parent;
  return (
    <div className="grid gap-5">
      <Field label={t.firstName} htmlFor="first_name" error={errors.first_name}>
        <Input id="first_name" name="first_name" defaultValue={senior?.first_name ?? ""} required maxLength={60} autoComplete="off" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.language} htmlFor="language" error={errors.language}>
          <select id="language" name="language" defaultValue={senior?.language ?? "de"} className="flex h-12 w-full rounded-sm border border-line bg-white px-4 text-base text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole/50">
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
          </select>
        </Field>
        <Field label={t.careLevel} htmlFor="care_level" error={errors.care_level}>
          <select id="care_level" name="care_level" defaultValue={String(senior?.care_level ?? 0)} className="flex h-12 w-full rounded-sm border border-line bg-white px-4 text-base text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sole/50">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "0 – none yet" : `Pflegegrad ${n}`}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={t.city} htmlFor="city" error={errors.city}>
        <Input id="city" name="city" defaultValue={senior?.city ?? ""} required maxLength={80} />
      </Field>
      <Field label={t.addressNote} hint={t.addressNoteHint} htmlFor="address_note" error={errors.address_note}>
        <Input id="address_note" name="address_note" defaultValue={senior?.address_note ?? ""} maxLength={200} />
      </Field>
      <Field label={t.medication} hint={t.medicationHint} error={errors.medication_times}>
        <MedicationTimesField initial={senior?.medication_times ?? []} />
      </Field>
    </div>
  );
}
