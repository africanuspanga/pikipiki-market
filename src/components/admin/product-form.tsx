"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { slugify } from "@/lib/format";
import { CATEGORIES, STOCK_LABELS, type Brand, type ProductWithRelations } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

const BUCKET = "product-images";

type DraftImage = {
  key: string;
  id?: string; // existing product_images row
  url: string;
  storage_path: string | null;
  uploading?: boolean;
  error?: boolean;
};

type Props = { brands: Brand[]; product?: ProductWithRelations };

export function ProductForm({ brands, product }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [productId] = useState(() => product?.id ?? crypto.randomUUID());
  const [images, setImages] = useState<DraftImage[]>(
    () => product?.images.map((i) => ({ key: i.id, id: i.id, url: i.url, storage_path: i.storage_path })) ?? [],
  );
  const [removed, setRemoved] = useState<DraftImage[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [condition, setCondition] = useState(product?.condition ?? "new");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const uploading = images.some((i) => i.uploading);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const drafts = list.map((f) => ({ key: crypto.randomUUID(), url: URL.createObjectURL(f), storage_path: null, uploading: true, file: f }));
    setImages((prev) => [...prev, ...drafts.map(({ file: _file, ...d }) => d)]);

    await Promise.all(
      drafts.map(async (d) => {
        const blob = await compressImage(d.file);
        const ext = blob.type === "image/webp" ? "webp" : d.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `products/${productId}/${d.key}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
        const url = error ? d.url : supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        setImages((prev) =>
          prev.map((i) => (i.key === d.key ? { ...i, url, storage_path: error ? null : path, uploading: false, error: Boolean(error) } : i)),
        );
      }),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function makeCover(index: number) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const img = prev[index];
      if (img.id || img.storage_path) setRemoved((r) => [...r, img]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      id: productId,
      name: name.trim(),
      slug: slugify(slug || name),
      brand_id: str("brand_id"),
      category: String(f.get("category")),
      condition,
      price: num("price") ?? 0,
      old_price: num("old_price"),
      year: num("year"),
      engine_cc: num("engine_cc"),
      mileage_km: condition === "used" ? num("mileage_km") : null,
      fuel_type: str("fuel_type"),
      transmission: str("transmission"),
      top_speed_kmh: num("top_speed_kmh"),
      fuel_economy: str("fuel_economy"),
      color: str("color"),
      stock_status: String(f.get("stock_status")),
      short_description: str("short_description"),
      description: str("description"),
      features: String(f.get("features") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      is_featured: f.get("is_featured") === "on",
      is_published: f.get("is_published") === "on",
    };

    const { error: upsertError } = await supabase.from("products").upsert(record);
    if (upsertError) {
      setError(upsertError.message.includes("products_slug_key") ? "Another bike already uses this URL slug — change the slug." : upsertError.message);
      setSaving(false);
      return;
    }

    // Sync images: remove deleted ones, then upsert order for the rest.
    const toDeleteIds = removed.map((r) => r.id).filter(Boolean) as string[];
    const toDeletePaths = removed.map((r) => r.storage_path).filter(Boolean) as string[];
    if (toDeleteIds.length) await supabase.from("product_images").delete().in("id", toDeleteIds);
    if (toDeletePaths.length) await supabase.storage.from(BUCKET).remove(toDeletePaths);

    const rows = images
      .filter((i) => !i.error)
      .map((i, index) => ({
        id: i.id ?? crypto.randomUUID(),
        product_id: productId,
        url: i.url,
        storage_path: i.storage_path,
        sort_order: index,
      }));
    if (rows.length) {
      const { error: imgError } = await supabase.from("product_images").upsert(rows);
      if (imgError) {
        setError(imgError.message);
        setSaving(false);
        return;
      }
    }

    await revalidateSite();
    router.push("/admin/products");
    router.refresh();
  }

  const p = product;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 pb-20 xl:grid-cols-[1fr_380px] xl:pb-0">
      <div className="space-y-6">
        {/* Photos */}
        <Card title="Photos" hint="First photo is the cover. Drag & drop or tap to add many at once.">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`grid grid-cols-2 gap-3 rounded-2xl border-2 border-dashed p-3 transition sm:grid-cols-3 lg:grid-cols-4 ${dragOver ? "border-ignite bg-ignite/5" : "border-line"}`}
          >
            {images.map((img, i) => (
              <div key={img.key} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-ink-3">
                <Image src={img.url} alt="" fill sizes="200px" className="object-contain p-1" unoptimized={img.url.startsWith("blob:")} />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ignite px-2 py-0.5 text-[10px] font-black uppercase text-white">Cover</span>}
                {img.uploading && <div className="absolute inset-0 grid place-items-center bg-ink/70 text-xs font-bold">Uploading…</div>}
                {img.error && <div className="absolute inset-0 grid place-items-center bg-red-900/75 p-2 text-center text-xs font-bold text-white">Upload failed</div>}
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                  <div className="flex gap-1">
                    <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}>‹</IconBtn>
                    <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}>›</IconBtn>
                    {i !== 0 && <IconBtn label="Make cover" onClick={() => makeCover(i)}>★</IconBtn>}
                  </div>
                  <IconBtn label="Remove photo" onClick={() => removeImage(i)} danger>✕</IconBtn>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-line bg-ink-2 text-mute transition hover:border-ignite hover:text-ignite"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="text-xs font-semibold">Add photos</span>
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </Card>

        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bike name" className="sm:col-span-2">
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className="field"
                placeholder="e.g. Honda CB 150R"
              />
            </Field>
            <Field label="URL slug" className="sm:col-span-2">
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="field"
                placeholder="honda-cb-150r"
              />
            </Field>
            <Field label="Brand">
              <select name="brand_id" defaultValue={p?.brand_id ?? ""} className="field">
                <option value="">— Select brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select name="category" defaultValue={p?.category ?? "Commuter"} className="field">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Condition" className="sm:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                {(["new", "used"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`rounded-xl py-3 font-bold capitalize transition ${condition === c ? "bg-ignite text-white" : "border border-line text-mute"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Short description" className="sm:col-span-2">
              <input name="short_description" defaultValue={p?.short_description ?? ""} className="field" placeholder="One line that sells the bike" />
            </Field>
            <Field label="Full description" className="sm:col-span-2">
              <textarea name="description" defaultValue={p?.description ?? ""} rows={5} className="field" />
            </Field>
            <Field label="Key features (one per line)" className="sm:col-span-2">
              <textarea
                name="features"
                defaultValue={p?.features.join("\n") ?? ""}
                rows={4}
                className="field"
                placeholder={"Disc brakes\nElectric start\n1-year warranty"}
              />
            </Field>
          </div>
        </Card>

        <Card title="Specifications">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Year"><input name="year" inputMode="numeric" defaultValue={p?.year ?? ""} className="field" /></Field>
            <Field label="Engine (cc)"><input name="engine_cc" inputMode="numeric" defaultValue={p?.engine_cc ?? ""} className="field" /></Field>
            {condition === "used" && (
              <Field label="Mileage (km)"><input name="mileage_km" inputMode="numeric" defaultValue={p?.mileage_km ?? ""} className="field" /></Field>
            )}
            <Field label="Transmission">
              <select name="transmission" defaultValue={p?.transmission ?? "Manual"} className="field">
                <option>Manual</option>
                <option>Automatic</option>
                <option>Semi-auto</option>
              </select>
            </Field>
            <Field label="Fuel">
              <select name="fuel_type" defaultValue={p?.fuel_type ?? "Petrol"} className="field">
                <option>Petrol</option>
                <option>Electric</option>
              </select>
            </Field>
            <Field label="Top speed (km/h)"><input name="top_speed_kmh" inputMode="numeric" defaultValue={p?.top_speed_kmh ?? ""} className="field" /></Field>
            <Field label="Fuel economy"><input name="fuel_economy" defaultValue={p?.fuel_economy ?? ""} className="field" placeholder="45 km/L" /></Field>
            <Field label="Colour(s)"><input name="color" defaultValue={p?.color ?? ""} className="field" placeholder="Red, Black" /></Field>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <Card title="Price (TSh)">
          <div className="space-y-4">
            <Field label="Selling price">
              <input name="price" required inputMode="numeric" defaultValue={p?.price ?? ""} className="field text-lg font-bold" placeholder="3500000" />
            </Field>
            <Field label="Old price (optional, shows discount)">
              <input name="old_price" inputMode="numeric" defaultValue={p?.old_price ?? ""} className="field" />
            </Field>
          </div>
        </Card>

        <Card title="Visibility">
          <div className="space-y-4">
            <Field label="Stock">
              <select name="stock_status" defaultValue={p?.stock_status ?? "in_stock"} className="field">
                {Object.entries(STOCK_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Check name="is_published" label="Show on website" defaultChecked={p?.is_published ?? true} />
            <Check name="is_featured" label="Feature on homepage" defaultChecked={p?.is_featured ?? false} />
          </div>
        </Card>

        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 flex gap-2 border-t border-line bg-ink/95 p-3 backdrop-blur-xl lg:bottom-0 lg:left-[240px] xl:static xl:border-0 xl:bg-transparent xl:p-0">
          <Link href="/admin/products" className="rounded-full border border-line px-5 py-3.5 font-bold">Cancel</Link>
          <button
            disabled={saving || uploading}
            className="flex-1 rounded-full bg-ignite py-3.5 font-extrabold uppercase text-white transition hover:bg-ignite-2 disabled:opacity-60"
          >
            {uploading ? "Uploading photos…" : saving ? "Saving…" : product ? "Save changes" : "Publish bike"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-ink-2 p-4 sm:p-6">
      <h2 className="font-display text-xl font-black uppercase">{title}</h2>
      {hint && <p className="mb-4 mt-0.5 text-xs text-mute">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-line transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-bone after:transition peer-checked:bg-ignite peer-checked:after:translate-x-5" />
    </label>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold backdrop-blur transition disabled:opacity-30 ${
        danger ? "bg-red-600/90 text-white" : "bg-ink/80 text-bone hover:bg-ignite hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
