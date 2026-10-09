"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { formatPrice, soldLast } from "@/lib/format";
import { SPARE_CATEGORIES, type Spare } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

const BUCKET = "product-images";

type Photo = { url: string; storage_path: string | null };

export function SpareManager({ items }: { items: Spare[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Spare | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    await revalidateSite();
    router.refresh();
  }

  async function update(id: string, patch: Partial<Spare>) {
    setBusy(id);
    await createClient().from("spares").update(patch).eq("id", id);
    await refresh();
    setBusy(null);
  }

  async function remove(s: Spare) {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    setBusy(s.id);
    const supabase = createClient();
    if (s.storage_path) await supabase.storage.from(BUCKET).remove([s.storage_path]);
    await supabase.from("spares").delete().eq("id", s.id);
    await refresh();
    setBusy(null);
  }

  return (
    <>
      {!editing && (
        <button onClick={() => setEditing("new")} className="mb-4 rounded-full bg-ignite px-5 py-3 text-sm font-extrabold uppercase text-white">
          + Add spare / accessory
        </button>
      )}

      {editing && (
        <SpareForm
          key={editing === "new" ? "new" : editing.id}
          spare={editing === "new" ? null : editing}
          onDone={async (saved) => {
            setEditing(null);
            if (saved) await refresh();
          }}
        />
      )}

      {items.length === 0 && !editing && (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">No spares yet. Add your first part above.</p>
      )}

      <ul className="space-y-3">
        {soldLast(items).map((s) => {
          const sold = s.stock_status === "sold_out";
          return (
            <li
              key={s.id}
              className={`flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-3 transition sm:flex-row sm:items-center ${busy === s.id ? "opacity-50" : ""}`}
            >
              <button onClick={() => setEditing(s)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                  {s.image_url ? (
                    <Image src={s.image_url} alt="" fill sizes="96px" className="object-contain p-1" />
                  ) : (
                    <span className="grid h-full place-items-center text-xs text-mute">No photo</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-mute">{s.category}{s.fits ? ` · ${s.fits}` : ""}</p>
                  <p className="truncate font-display text-xl font-extrabold uppercase">{s.name}</p>
                  <p className="text-sm font-bold text-ignite">{formatPrice(s.price)}</p>
                </div>
              </button>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Toggle on={sold} onClick={() => update(s.id, { stock_status: sold ? "in_stock" : "sold_out" })} label={sold ? "Sold ✓" : "Mark sold"} />
                <Toggle on={s.is_published} onClick={() => update(s.id, { is_published: !s.is_published })} label={s.is_published ? "Live" : "Hidden"} />
                <button onClick={() => setEditing(s)} className="rounded-full border border-line px-3 py-2 font-semibold hover:border-bone">Edit</button>
                <button onClick={() => remove(s)} className="rounded-full border border-red-500/40 px-3 py-2 font-semibold text-red-600 hover:bg-red-500/10">
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SpareForm({ spare, onDone }: { spare: Spare | null; onDone: (saved: boolean) => void }) {
  const supabase = createClient();
  const [id] = useState(() => spare?.id ?? crypto.randomUUID());
  const [photo, setPhoto] = useState<Photo | null>(spare?.image_url ? { url: spare.image_url, storage_path: spare.storage_path } : null);
  const [uploaded, setUploaded] = useState<string[]>([]); // paths uploaded in this session
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    setUploading(true);
    setError(null);
    const blob = await compressImage(file);
    const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `spares/${id}/${crypto.randomUUID()}.${ext}`;
    const { error: upError } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
    if (upError) {
      setError(`Photo upload failed: ${upError.message}`);
    } else {
      setPhoto({ url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, storage_path: path });
      setUploaded((u) => [...u, path]);
    }
    setUploading(false);
  }

  // Remove photos uploaded in this session that won't be kept.
  async function cleanup(keep: string | null) {
    const stale = uploaded.filter((p) => p !== keep);
    if (stale.length) await supabase.storage.from(BUCKET).remove(stale);
  }

  async function cancel() {
    await cleanup(spare?.storage_path ?? null);
    onDone(false);
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading) return;
    setSaving(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = String(f.get(k) ?? "").replace(/[^\d.]/g, "");
      return v ? Number(v) : null;
    };
    const str = (k: string) => String(f.get(k) ?? "").trim() || null;

    const record = {
      id,
      name: String(f.get("name")).trim(),
      category: String(f.get("category")),
      price: num("price") ?? 0,
      old_price: num("old_price"),
      fits: str("fits"),
      description: str("description"),
      image_url: photo?.url ?? null,
      storage_path: photo?.storage_path ?? null,
      stock_status: f.get("sold") === "on" ? "sold_out" : "in_stock",
      is_published: f.get("is_published") === "on",
    };

    const { error: saveError } = await supabase.from("spares").upsert(record);
    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }
    await cleanup(record.storage_path);
    // The old photo was replaced or removed.
    if (spare?.storage_path && spare.storage_path !== record.storage_path) {
      await supabase.storage.from(BUCKET).remove([spare.storage_path]);
    }
    onDone(true);
  }

  return (
    <form onSubmit={save} className="mb-6 grid gap-4 rounded-2xl border border-ignite/50 bg-ink-2 p-4 sm:grid-cols-[200px_1fr] sm:p-6">
      <div>
        <span className="label">Photo</span>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="relative flex aspect-square w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-line bg-ink-3 text-mute transition hover:border-ignite hover:text-ignite"
        >
          {photo ? (
            <Image src={photo.url} alt="" fill sizes="200px" className="object-contain p-1" />
          ) : (
            <>
              <span className="text-3xl leading-none">+</span>
              <span className="text-xs font-semibold">Add photo</span>
            </>
          )}
          {uploading && <span className="absolute inset-0 grid place-items-center bg-ink/70 text-xs font-bold text-bone">Uploading…</span>}
        </button>
        {photo && (
          <button type="button" onClick={() => setPhoto(null)} className="mt-2 text-xs font-semibold text-red-600 hover:underline">
            Remove photo
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) pick(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input name="name" required defaultValue={spare?.name} className="field" placeholder="e.g. Boxer 150 brake pads" />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" defaultValue={spare?.category ?? SPARE_CATEGORIES[0]} className="field">
            {SPARE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fits (optional)</label>
          <input name="fits" defaultValue={spare?.fits ?? ""} className="field" placeholder="Boxer 150, TVS HLX" />
        </div>
        <div>
          <label className="label">Price (TSh)</label>
          <input name="price" inputMode="numeric" defaultValue={spare?.price || ""} className="field font-bold" placeholder="25000 — blank = call for price" />
        </div>
        <div>
          <label className="label">Old price (optional)</label>
          <input name="old_price" inputMode="numeric" defaultValue={spare?.old_price ?? ""} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description (optional)</label>
          <textarea name="description" rows={3} defaultValue={spare?.description ?? ""} className="field" />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="is_published" defaultChecked={spare?.is_published ?? true} className="h-4 w-4 accent-ignite" />
          Show on website
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="sold" defaultChecked={spare?.stock_status === "sold_out"} className="h-4 w-4 accent-ignite" />
          Sold
        </label>

        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button type="button" onClick={cancel} className="rounded-full border border-line px-5 py-3 font-bold">
            Cancel
          </button>
          <button disabled={saving || uploading} className="flex-1 rounded-full bg-ignite py-3 font-extrabold uppercase text-white transition hover:bg-ignite-2 disabled:opacity-60">
            {uploading ? "Uploading photo…" : saving ? "Saving…" : spare ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>
    </form>
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
