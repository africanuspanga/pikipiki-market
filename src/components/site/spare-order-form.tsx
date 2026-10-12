"use client";

import { useState } from "react";
import { formatPrice, whatsappLink } from "@/lib/format";
import type { Spare } from "@/lib/types";
import { WhatsAppGlyph } from "@/components/icons";

const OTHER = "other";

/** Order form for spares: builds a WhatsApp message from the answers and opens a chat with the shop. */
export function SpareOrderForm({ spares }: { spares: Spare[] }) {
  const available = spares.filter((s) => s.stock_status !== "sold_out");
  const [partId, setPartId] = useState(available[0]?.id ?? OTHER);
  const [opened, setOpened] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const spare = available.find((s) => s.id === partId);
    const part = spare ? `${spare.name} (${formatPrice(spare.price)})` : get("part_other");

    const lines = [
      "Habari PikiPiki Market! I'd like to order a spare part.",
      "",
      `*Part:* ${part}`,
      `*Quantity:* ${get("quantity") || "1"}`,
      get("bike") ? `*Bike model:* ${get("bike")}` : null,
      `*Name:* ${get("name")}`,
      `*Phone:* ${get("phone")}`,
      `*Location:* ${get("location")}`,
      get("note") ? `*Note:* ${get("note")}` : null,
    ].filter((l) => l !== null);

    const url = whatsappLink(lines.join("\n"));
    // A new tab keeps the site open on desktop; phones hand the link to the WhatsApp app.
    const tab = window.open(url, "_blank");
    if (tab) tab.opener = null;
    else window.location.href = url;
    setOpened(true);
  }

  return (
    <form id="order" onSubmit={onSubmit} className="scroll-mt-24 space-y-4 rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-3xl font-black uppercase">Order a part</h2>
        <p className="mt-1 text-sm text-mute">Fill this in and we&apos;ll get your order on WhatsApp.</p>
      </div>

      <div>
        <label className="label" htmlFor="ord-part">Part</label>
        <select id="ord-part" className="field" value={partId} onChange={(e) => setPartId(e.target.value)}>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatPrice(s.price)}
            </option>
          ))}
          <option value={OTHER}>Another part (type it below)</option>
        </select>
      </div>
      {partId === OTHER && (
        <div>
          <label className="label" htmlFor="ord-part-other">Which part?</label>
          <input id="ord-part-other" name="part_other" required className="field" placeholder="e.g. Brake pads, chain kit…" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div>
          <label className="label" htmlFor="ord-qty">Quantity</label>
          <input id="ord-qty" name="quantity" type="number" min={1} defaultValue={1} required className="field" inputMode="numeric" />
        </div>
        <div>
          <label className="label" htmlFor="ord-bike">Bike model (optional)</label>
          <input id="ord-bike" name="bike" className="field" placeholder="e.g. Boxer BM150, 2021" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ord-name">Your name</label>
        <input id="ord-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ord-phone">Phone number</label>
          <input id="ord-phone" name="phone" required type="tel" className="field" placeholder="07XX XXX XXX" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="ord-location">Delivery location</label>
          <input id="ord-location" name="location" required className="field" placeholder="e.g. Sinza, Dar es Salaam" autoComplete="address-level2" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ord-note">Note (optional)</label>
        <textarea id="ord-note" name="note" rows={2} className="field" placeholder="Colour, size, questions…" />
      </div>

      <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-extrabold uppercase text-night transition hover:brightness-110">
        <WhatsAppGlyph className="h-5 w-5" /> Send order on WhatsApp
      </button>
      {opened && <p className="text-sm text-mute">WhatsApp opened with your order — just press send. Asante!</p>}
    </form>
  );
}
