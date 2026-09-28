"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function InquiryForm({ productId, productName }: { productId: string; productName: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const { error } = await createClient()
      .from("inquiries")
      .insert({
        product_id: productId,
        name: String(form.get("name")).trim(),
        phone: String(form.get("phone")).trim(),
        message: String(form.get("message") ?? "").trim() || null,
      });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="rounded-3xl border border-ignite/50 bg-ignite/10 p-8">
        <h2 className="font-display text-3xl font-black uppercase">Asante! 🙌</h2>
        <p className="mt-2 text-bone/75">We received your request about the {productName}. Our team will call you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
      <h2 className="font-display text-3xl font-black uppercase">Request a call back</h2>
      <div>
        <label className="label" htmlFor="inq-name">Your name</label>
        <input id="inq-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="inq-phone">Phone number</label>
        <input id="inq-phone" name="phone" required type="tel" className="field" placeholder="07XX XXX XXX" autoComplete="tel" />
      </div>
      <div>
        <label className="label" htmlFor="inq-msg">Message (optional)</label>
        <textarea id="inq-msg" name="message" rows={3} className="field" placeholder="Payment plan, delivery region, trade-in…" />
      </div>
      <button disabled={state === "sending"} className="w-full rounded-full bg-ignite py-4 font-extrabold uppercase text-white transition hover:bg-ignite-2 disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Send request"}
      </button>
      {state === "error" && <p className="text-sm text-red-600">Something went wrong. Please try WhatsApp instead.</p>}
    </form>
  );
}
