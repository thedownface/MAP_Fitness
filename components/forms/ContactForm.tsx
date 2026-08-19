"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full border-b border-cool-grey/25 bg-transparent py-3 text-cool-white placeholder:text-cool-grey/50 outline-none transition-colors focus:border-crimson";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get("botcheck")) {
      setStatus("success");
      return;
    }

    data.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "");
    data.append("subject", "New MAP Fitness website inquiry");
    data.append("from_name", "MAP Fitness Website");

    try {
      // FormData (not JSON) — a JSON body forces a CORS preflight that
      // Web3Forms' endpoint doesn't answer with the right headers, so the
      // request fails outright. multipart/form-data is CORS-safelisted and
      // is Web3Forms' own documented submission format.
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-cool-grey">
            Name
          </label>
          <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-xs uppercase tracking-[0.2em] text-cool-grey">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" placeholder="Your phone number" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-cool-grey">
          Email
        </label>
        <input id="email" name="email" type="email" required placeholder="you@email.com" className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-xs uppercase tracking-[0.2em] text-cool-grey">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us what you're looking to train for…"
          className={cn(inputClass, "resize-none")}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={status === "submitting"} className="sm:w-auto">
          {status === "submitting" ? "Sending…" : "Send Message"}
        </Button>

        <div aria-live="polite" className="text-sm">
          {status === "success" && <p className="text-crimson">Thanks — we&rsquo;ll be in touch shortly.</p>}
          {status === "error" && (
            <p className="text-crimson">Something went wrong. Please try again or call us directly.</p>
          )}
        </div>
      </div>
    </form>
  );
}
