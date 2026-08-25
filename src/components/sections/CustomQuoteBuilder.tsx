"use client";

import { useState, type FormEvent } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelTextarea";
import { FloatingLabelSelect } from "@/components/ui/FloatingLabelSelect";
import { HoneypotField } from "@/components/ui/HoneypotField";
import { useHoneypot } from "@/lib/hooks/use-honeypot";
import { CUSTOM_QUOTE_FORM_SOURCE } from "@/lib/form-sources";
import { BUSINESS_TYPES, AD_BUDGETS, SERVICE_INTERESTS, SERVICE_BLURBS } from "@/lib/content/plan-options";

type Status = "idle" | "submitting" | "success" | "error";
type ServiceInterest = (typeof SERVICE_INTERESTS)[number];

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  businessType: string;
  monthlyAdBudget: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  businessType: "",
  monthlyAdBudget: "",
  message: "",
};

export function CustomQuoteBuilder() {
  const [services, setServices] = useState<ServiceInterest[]>([]);
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const { website, setWebsite, formRenderedAt } = useHoneypot();

  function toggleService(service: ServiceInterest) {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    );
  }

  const canSubmit = services.length > 0 && form.name.trim() !== "" && form.email.trim() !== "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting" || !canSubmit) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          company: form.company || undefined,
          businessType: form.businessType || undefined,
          interestedServices: services,
          monthlyAdBudget: form.monthlyAdBudget || undefined,
          message: form.message || undefined,
          preferredContactMethod: "Email",
          website,
          formRenderedAt,
          formSource: CUSTOM_QUOTE_FORM_SOURCE,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setStatus("success");
      setServices([]);
      setForm(initialState);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <GlassPanel className="p-10 text-center">
        <p className="font-display text-xl font-bold text-paper">Got your plan.</p>
        <p className="mt-2 text-sm text-lavender">
          We&rsquo;ll size a real quote around what you picked and get back to you shortly.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <HoneypotField value={website} onChange={setWebsite} />

        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-wide text-lavender">
            Pick what you need *
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SERVICE_INTERESTS.map((service) => {
              const checked = services.includes(service);
              return (
                <label
                  key={service}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors duration-200 ease-premium ${
                    checked
                      ? "border-neon/50 bg-neon/[0.07]"
                      : "border-line hover:border-purple-light/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service)}
                    className="mt-0.5 accent-neon"
                  />
                  <span>
                    <span className="block font-display text-sm font-bold text-paper">
                      {service}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-lavender">
                      {SERVICE_BLURBS[service]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {services.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <span
                key={service}
                className="flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/[0.07] px-3 py-1 font-mono text-[10.5px] uppercase tracking-wide text-paper"
              >
                {service}
                <button
                  type="button"
                  onClick={() => toggleService(service)}
                  aria-label={`Remove ${service}`}
                  className="text-neon hover:text-paper"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <FloatingLabelSelect
            label="Business type"
            value={form.businessType}
            onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
            options={BUSINESS_TYPES}
          />
          <FloatingLabelSelect
            label="Monthly ad budget"
            value={form.monthlyAdBudget}
            onChange={(e) => setForm((f) => ({ ...f, monthlyAdBudget: e.target.value }))}
            options={AD_BUDGETS}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FloatingLabelInput
            label="Your name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <FloatingLabelInput
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FloatingLabelInput
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <FloatingLabelInput
            label="Company"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          />
        </div>

        <FloatingLabelTextarea
          label="Anything else we should know?"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />

        {status === "error" ? (
          <p role="alert" className="text-sm text-[#FF8A8A]">
            Something went wrong — try again, or email us directly.
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          disabled={status === "submitting" || !canSubmit}
          className="w-full sm:w-auto"
        >
          {status === "submitting" ? "Sending…" : "Get My Custom Quote"}
        </Button>
      </form>
    </GlassPanel>
  );
}
