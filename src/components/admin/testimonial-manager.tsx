"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "@/components/icons";
import type { Testimonial } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

const RATINGS = [5, 4.5, 4, 3.5, 3];

export function TestimonialManager({ items }: { items: Testimonial[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);

  async function refresh() {
    await revalidateSite();
    router.refresh();
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const record = {
      name: String(f.get("name")).trim(),
      location: String(f.get("location") ?? "").trim() || null,
      bike: String(f.get("bike") ?? "").trim() || null,
      rating: Number(f.get("rating")),
      content: String(f.get("content")).trim(),
      is_published: f.get("is_published") === "on",
    };
    const supabase = createClient();
    if (editing === "new") {
      await supabase.from("testimonials").insert({ ...record, sort_order: items.length + 1 });
    } else if (editing) {
      await supabase.from("testimonials").update(record).eq("id", editing.id);
    }
    setEditing(null);
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await createClient().from("testimonials").delete().eq("id", id);
    await refresh();
  }

  async function togglePublished(t: Testimonial) {
    await createClient().from("testimonials").update({ is_published: !t.is_published }).eq("id", t.id);
    await refresh();
  }

  const current = editing && editing !== "new" ? editing : null;

  return (
    <>
      <button onClick={() => setEditing("new")} className="mb-4 rounded-full bg-ignite px-5 py-3 text-sm font-extrabold uppercase text-white">
        + Add review
      </button>

      {editing && (
        <form key={current?.id ?? "new"} onSubmit={save} className="mb-6 grid gap-4 rounded-2xl border border-ignite/50 bg-ink-2 p-4 sm:grid-cols-2 sm:p-6">
          <div>
            <label className="label">Customer name</label>
            <input name="name" required defaultValue={current?.name} className="field" />
          </div>
          <div>
            <label className="label">Rating</label>
            <select name="rating" defaultValue={current?.rating ?? 5} className="field">
              {RATINGS.map((r) => (
                <option key={r} value={r}>{r} stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" defaultValue={current?.location ?? ""} className="field" placeholder="Dar es Salaam" />
          </div>
          <div>
            <label className="label">Bike bought</label>
            <input name="bike" defaultValue={current?.bike ?? ""} className="field" placeholder="Honda CB 125" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Review</label>
            <textarea name="content" required rows={3} defaultValue={current?.content} className="field" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked={current?.is_published ?? true} className="h-4 w-4 accent-[#ff5a1f]" />
            Show on website
          </label>
          <div className="flex gap-2 sm:justify-end">
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-line px-5 py-2.5 font-bold">Cancel</button>
            <button className="rounded-full bg-ignite px-6 py-2.5 font-extrabold text-white">Save</button>
          </div>
        </form>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((t) => (
          <li key={t.id} className={`rounded-2xl border border-line bg-ink-2 p-4 ${t.is_published ? "" : "opacity-50"}`}>
            <div className="flex items-center justify-between">
              <Stars rating={t.rating} />
              <span className="text-xs text-mute">{t.rating}</span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-bone/80">&ldquo;{t.content}&rdquo;</p>
            <p className="mt-2 text-xs text-mute">
              <span className="font-bold text-bone">{t.name}</span> {t.location && `· ${t.location}`} {t.bike && `· ${t.bike}`}
            </p>
            <div className="mt-3 flex gap-2 text-xs font-semibold">
              <button onClick={() => setEditing(t)} className="rounded-full border border-line px-3 py-1.5">Edit</button>
              <button onClick={() => togglePublished(t)} className="rounded-full border border-line px-3 py-1.5">{t.is_published ? "Hide" : "Show"}</button>
              <button onClick={() => remove(t.id)} className="rounded-full border border-red-500/40 px-3 py-1.5 text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
