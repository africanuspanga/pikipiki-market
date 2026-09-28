"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/format";
import type { Brand } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

export function BrandManager({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    await revalidateSite();
    router.refresh();
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name")).trim();
    const { error } = await createClient()
      .from("brands")
      .insert({ name, slug: slugify(name), tagline: String(f.get("tagline") ?? "").trim() || null, sort_order: brands.length + 1 });
    setError(error?.message ?? null);
    if (!error) {
      form.reset();
      await refresh();
    }
  }

  async function update(id: string, patch: Partial<Brand>) {
    await createClient().from("brands").update(patch).eq("id", id);
    await refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= brands.length) return;
    const supabase = createClient();
    const order = [...brands];
    [order[index], order[j]] = [order[j], order[index]];
    await Promise.all(order.map((b, k) => supabase.from("brands").update({ sort_order: k + 1 }).eq("id", b.id)));
    await refresh();
  }

  async function remove(b: Brand) {
    if (!confirm(`Delete ${b.name}? Bikes of this brand will become "No brand".`)) return;
    await createClient().from("brands").delete().eq("id", b.id);
    await refresh();
  }

  return (
    <>
      <form onSubmit={add} className="mb-6 grid gap-2 rounded-2xl border border-line bg-ink-2 p-4 sm:grid-cols-[1fr_2fr_auto]">
        <input name="name" required placeholder="Brand name" className="field" />
        <input name="tagline" placeholder="Tagline (optional)" className="field" />
        <button className="rounded-full bg-ignite px-6 py-3 font-extrabold text-white">Add</button>
        {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
      </form>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ink-2">
        {brands.map((b, i) => (
          <li key={b.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="px-2 text-mute disabled:opacity-20" aria-label="Move up">▲</button>
              <button onClick={() => move(i, 1)} disabled={i === brands.length - 1} className="px-2 text-mute disabled:opacity-20" aria-label="Move down">▼</button>
            </div>
            <p className="w-28 font-display text-2xl font-black uppercase">{b.name}</p>
            <input
              defaultValue={b.tagline ?? ""}
              onBlur={(e) => e.target.value !== (b.tagline ?? "") && update(b.id, { tagline: e.target.value || null })}
              placeholder="Tagline"
              className="field min-w-0 flex-1"
              aria-label={`${b.name} tagline`}
            />
            <button onClick={() => remove(b)} className="rounded-full border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-600">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
