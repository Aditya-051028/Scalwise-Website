"use client";

import { useState, type FormEvent } from "react";
import { HoneypotField } from "@/components/ui/HoneypotField";
import { useHoneypot } from "@/lib/hooks/use-honeypot";
import { NEWSLETTER_FORM_SOURCE } from "@/lib/form-sources";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "h-10 w-full rounded-full border border-line bg-void-3/50 px-4 text-sm text-paper placeholder:text-lavender/50 outline-none transition-colors duration-200 ease-premium focus:border-neon";

/** Posts to /api/contact (tagged as a newsletter signup) — no fake form. */
export function FooterNewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const { website, setWebsite, formRenderedAt } = useHoneypot();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string) || "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter subscriber",
          email,
          message: "Newsletter signup from footer",
          preferredContactMethod: "Email",
          website,
          formRenderedAt,
          formSource: NEWSLETTER_FORM_SOURCE,
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
    return <p className="mt-6 font-mono text-xs text-neon">You&rsquo;re on the list.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xs gap-2">
      <HoneypotField value={website} onChange={setWebsite} />
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        name="email"
        required
        placeholder="you@company.com"
        className={inputClass}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-glow h-10 shrink-0 rounded-full bg-neon px-4 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Join
      </button>
      {status === "error" ? (
        <p role="alert" className="sr-only">
          Something went wrong — try again.
        </p>
      ) : null}
    </form>
  );
}
