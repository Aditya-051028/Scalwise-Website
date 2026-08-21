"use client";

import { useState, type FormEvent } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

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

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-line bg-void-3/50 px-4 py-3 text-sm text-paper placeholder:text-lavender/50 outline-none transition-colors duration-200 ease-premium focus:border-neon";

const labelClass = "mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-lavender";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => (data.get(key) as string) || undefined;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          phone: value("phone"),
          company: value("company"),
          businessType: value("businessType"),
          monthlyAdBudget: value("monthlyAdBudget"),
          message: value("message"),
          preferredContactMethod: value("preferredContactMethod") ?? "Email",
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setStatus("success");
      form.reset();
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Name *
            </label>
            <input id="name" name="name" type="text" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email *
            </label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input id="phone" name="phone" type="tel" className={inputClass} />
          </div>
          <div>
            <label htmlFor="company" className={labelClass}>
              Company
            </label>
            <input id="company" name="company" type="text" className={inputClass} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="businessType" className={labelClass}>
              Business type
            </label>
            <select id="businessType" name="businessType" className={inputClass} defaultValue="">
              <option value="">Select one</option>
              {BUSINESS_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="monthlyAdBudget" className={labelClass}>
              Monthly ad budget
            </label>
            <select
              id="monthlyAdBudget"
              name="monthlyAdBudget"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Select one</option>
              {AD_BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className={labelClass}>Preferred contact method</legend>
          <div className="flex gap-5">
            {CONTACT_METHODS.map((method, i) => (
              <label key={method} className="flex items-center gap-2 text-sm text-paper">
                <input
                  type="radio"
                  name="preferredContactMethod"
                  value={method}
                  defaultChecked={i === 0}
                  className="accent-neon"
                />
                {method}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="message" className={labelClass}>
            Message
          </label>
          <textarea id="message" name="message" rows={4} className={inputClass} />
        </div>

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
