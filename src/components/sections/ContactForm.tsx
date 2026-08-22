"use client";

import { useState, type FormEvent } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelTextarea";
import { FloatingLabelSelect } from "@/components/ui/FloatingLabelSelect";

const BUSINESS_TYPES = [
  "D2C / Ecommerce",
  "Local Business",
  "Real Estate",
  "Healthcare",
  "Coaching / Consulting",
  "Startup",
  "Luxury Brand",
  "Other",
];

const AD_BUDGETS = [
  "Not yet spending",
  "Under ₹50,000",
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000+",
];

const CONTACT_METHODS = ["Email", "Phone", "WhatsApp"];

// Mirrors the real categories in the Services section — not generic agency options.
const SERVICE_INTERESTS = [
  "Performance Marketing",
  "SEO & Local",
  "Web & Landing Pages",
  "Content & Social",
  "Automation & CRO",
  "Brand & Strategy",
];

type Status = "idle" | "submitting" | "success" | "error";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  businessType: string;
  interestedServices: string[];
  monthlyAdBudget: string;
  message: string;
  preferredContactMethod: string;
  website: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  businessType: "",
  interestedServices: [],
  monthlyAdBudget: "",
  message: "",
  preferredContactMethod: "Email",
  website: "",
};

const legendClass = "font-mono text-[11px] uppercase tracking-wide text-lavender";

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const [formRenderedAt] = useState(() => Date.now());

  function toggleService(service: string) {
    setForm((prev) => ({
      ...prev,
      interestedServices: prev.interestedServices.includes(service)
        ? prev.interestedServices.filter((s) => s !== service)
        : [...prev.interestedServices, service],
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
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
          interestedServices: form.interestedServices.length
            ? form.interestedServices
            : undefined,
          monthlyAdBudget: form.monthlyAdBudget || undefined,
          message: form.message || undefined,
          preferredContactMethod: form.preferredContactMethod,
          website: form.website,
          formRenderedAt,
          formSource: "Contact Form",
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setStatus("success");
      setForm(initialState);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <GlassPanel className="p-10 text-center">
        <p className="font-display text-xl font-bold text-paper">Got it.</p>
        <p className="mt-2 text-sm text-lavender">
          We&rsquo;ll get back to you shortly. In the meantime, feel free to look around.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
        />
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

        <fieldset>
          <legend className={legendClass}>I&rsquo;m interested in</legend>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SERVICE_INTERESTS.map((service) => {
              const checked = form.interestedServices.includes(service);
              return (
                <label
                  key={service}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs leading-snug transition-colors duration-200 ease-premium ${
                    checked
                      ? "border-neon/50 bg-neon/10 text-paper"
                      : "border-line text-lavender hover:border-purple-light/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service)}
                    className="accent-neon"
                  />
                  {service}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legendClass}>Preferred contact method</legend>
          <div className="mt-3 flex gap-5">
            {CONTACT_METHODS.map((method) => (
              <label key={method} className="flex items-center gap-2 text-sm text-paper">
                <input
                  type="radio"
                  name="preferredContactMethod"
                  checked={form.preferredContactMethod === method}
                  onChange={() => setForm((f) => ({ ...f, preferredContactMethod: method }))}
                  className="accent-neon"
                />
                {method}
              </label>
            ))}
          </div>
        </fieldset>

        <FloatingLabelTextarea
          label="Briefly describe your project"
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
          disabled={status === "submitting"}
          className="w-full sm:w-auto"
        >
          {status === "submitting" ? "Sending…" : "Send it over"}
        </Button>
      </form>
    </GlassPanel>
  );
}
