"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass, Sheet } from "@/components/ui/sheet";
import { clinicians, sites } from "@/data/clinicians";
import { newClientId, regionForSuburb, type ClientRecord } from "@/data/records";
import type { Funding, Site } from "@/data/types";
import { useDemoStore } from "@/state/demo-store";

const FORM_ID = "client-form";

export const blankClient: ClientRecord = {
  id: "",
  name: "",
  age: null,
  funding: "NDIS",
  clinician: clinicians[0]?.name ?? "",
  region: "Brisbane North",
  suburb: "",
  service: "",
  contactName: "",
  contactPhone: "",
  state: "New",
};

/** Creating, editing and confirming a client all use this form, so the rules stay in one place. */
export function ClientFormSheet({
  title,
  description,
  initial,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string;
  description?: ReactNode;
  initial: ClientRecord;
  submitLabel: string;
  onSubmit: (client: ClientRecord) => void;
  onClose: () => void;
}) {
  const added = useDemoStore((s) => s.addedClients);
  const [form, setForm] = useState(initial);
  const [age, setAge] = useState(initial.age === null ? "" : String(initial.age));
  const [errors, setErrors] = useState<{ name?: string; age?: string; service?: string }>({});
  const set = <K extends keyof ClientRecord>(key: K, value: ClientRecord[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const name = form.name.trim();
    const ageNumber = age.trim() === "" ? null : Number(age);
    const problems = {
      name: name ? undefined : "Enter the client's name",
      service: form.service.trim() ? undefined : "Enter the service",
      age:
        ageNumber !== null && (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 120)
          ? "Enter an age in whole years, or leave it blank"
          : undefined,
    };
    setErrors(problems);
    if (problems.name || problems.service || problems.age) return;
    onSubmit({
      ...form,
      id: form.id || newClientId(name, added),
      name,
      age: ageNumber,
      service: form.service.trim(),
      suburb: form.suburb.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
    });
  }

  return (
    <Sheet
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" type="submit" form={FORM_ID}>
            {submitLabel}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full name" error={errors.name}>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Age" hint="Optional" error={errors.age}>
          <input
            className={inputClass}
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </Field>
        <Field label="Funding">
          <select
            className={inputClass}
            value={form.funding}
            onChange={(e) => set("funding", e.target.value as Funding)}
          >
            <option>NDIS</option>
            <option>Aged care</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Service" error={errors.service}>
            <input
              className={inputClass}
              value={form.service}
              onChange={(e) => set("service", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Suburb">
          <input
            className={inputClass}
            value={form.suburb}
            onChange={(e) => {
              const region = regionForSuburb(e.target.value);
              setForm((f) => ({ ...f, suburb: e.target.value, region: region ?? f.region }));
            }}
          />
        </Field>
        <Field label="Region">
          <select
            className={inputClass}
            value={form.region}
            onChange={(e) => set("region", e.target.value as Site)}
          >
            {sites.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Clinician">
            <select
              className={inputClass}
              value={form.clinician}
              onChange={(e) => set("clinician", e.target.value)}
            >
              {clinicians.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}, {c.discipline}, {c.utilisation}% full
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Main contact">
          <input
            className={inputClass}
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </Field>
        <Field label="Contact details">
          <input
            className={inputClass}
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Field>
        <Field label="Status">
          <select
            className={inputClass}
            value={form.state}
            onChange={(e) => set("state", e.target.value as ClientRecord["state"])}
          >
            <option>New</option>
            <option>Active</option>
            <option>Paused</option>
          </select>
        </Field>
      </form>
    </Sheet>
  );
}
