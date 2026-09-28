"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { STOCK_LABELS, type ProductWithRelations } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

export function ProductTable({ products }: { products: ProductWithRelations[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? products.filter((p) => `${p.name} ${p.brand?.name ?? ""}`.toLowerCase().includes(s)) : products;
  }, [products, q]);

  async function update(id: string, patch: Partial<ProductWithRelations>) {
    setBusy(id);
    await createClient().from("products").update(patch).eq("id", id);
    await revalidateSite();
    router.refresh();
    setBusy(null);
  }

  async function remove(p: ProductWithRelations) {
    if (!confirm(`Delete "${p.name}" and all its photos? This cannot be undone.`)) return;
    setBusy(p.id);
    const supabase = createClient();
    const paths = p.images.map((i) => i.storage_path).filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("product-images").remove(paths);
    await supabase.from("products").delete().eq("id", p.id);
    await revalidateSite();
    router.refresh();
    setBusy(null);
  }

  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search by name or brand…" className="field mb-4 max-w-md" />

      {list.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
          No bikes yet. <Link href="/admin/products/new" className="text-ignite">Add your first bike →</Link>
        </p>
      )}

      <ul className="space-y-3">
        {list.map((p) => (
          <li
            key={p.id}
            className={`flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-3 transition sm:flex-row sm:items-center ${busy === p.id ? "opacity-50" : ""}`}
          >
            <Link href={`/admin/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                {p.images[0] ? (
                  <Image src={p.images[0].url} alt="" fill sizes="96px" className="object-contain p-1" />
                ) : (
                  <span className="grid h-full place-items-center text-xs text-mute">No photo</span>
                )}
                {p.images.length > 1 && (
                  <span className="absolute bottom-1 right-1 rounded bg-ink/80 px-1.5 text-[10px] font-bold">{p.images.length}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-mute">{p.brand?.name ?? "No brand"} · {p.category}</p>
                <p className="truncate font-display text-xl font-extrabold uppercase">{p.name}</p>
                <p className="text-sm font-bold text-ignite">{formatPrice(p.price)}</p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={p.stock_status}
                onChange={(e) => update(p.id, { stock_status: e.target.value as ProductWithRelations["stock_status"] })}
                className="rounded-full border border-line bg-ink px-3 py-2 font-semibold"
                aria-label="Stock status"
              >
                {Object.entries(STOCK_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <Toggle on={p.is_featured} onClick={() => update(p.id, { is_featured: !p.is_featured })} label="Featured" />
              <Toggle on={p.is_published} onClick={() => update(p.id, { is_published: !p.is_published })} label={p.is_published ? "Live" : "Hidden"} />
              <Link href={`/admin/products/${p.id}`} className="rounded-full border border-line px-3 py-2 font-semibold hover:border-bone">Edit</Link>
              <button onClick={() => remove(p)} className="rounded-full border border-red-500/40 px-3 py-2 font-semibold text-red-600 hover:bg-red-500/10">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-3 py-2 font-semibold transition ${on ? "bg-ignite text-white" : "border border-line text-mute hover:text-bone"}`}
    >
      {label}
    </button>
  );
}
