"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry } from "@/lib/types";

const STATUSES: Inquiry["status"][] = ["new", "contacted", "closed"];

export function InquiryList({ items }: { items: Inquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Inquiry["status"] | "all">("all");
  const list = filter === "all" ? items : items.filter((i) => i.status === filter);

  async function setStatus(id: string, status: Inquiry["status"]) {
    await createClient().from("inquiries").update({ status }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead?")) return;
    await createClient().from("inquiries").delete().eq("id", id);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === s ? "bg-ignite text-white" : "border border-line text-mute"}`}
          >
            {s} {s === "all" ? items.length : items.filter((i) => i.status === s).length}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {list.map((l) => {
          const wa = `https://wa.me/${l.phone.replace(/\D/g, "").replace(/^0/, "255")}`;
          return (
            <li key={l.id} className="rounded-2xl border border-line bg-ink-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{l.name}</p>
                  <p className="text-xs text-mute">
                    {l.product?.name ?? "General inquiry"} · {new Date(l.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
                <select
                  value={l.status}
                  onChange={(e) => setStatus(l.id, e.target.value as Inquiry["status"])}
                  className="rounded-full border border-line bg-ink px-3 py-1.5 text-sm capitalize"
                  aria-label="Lead status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {l.message && <p className="mt-3 text-sm text-bone/80">{l.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                <a href={`tel:${l.phone}`} className="rounded-full bg-ignite px-4 py-2 text-white">Call {l.phone}</a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-night">WhatsApp</a>
                <button onClick={() => remove(l.id)} className="rounded-full border border-red-500/40 px-4 py-2 text-red-600">Delete</button>
              </div>
            </li>
          );
        })}
        {!list.length && <li className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">No leads here.</li>}
      </ul>
    </>
  );
}
