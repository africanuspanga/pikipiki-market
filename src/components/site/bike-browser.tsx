"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Brand, type ProductWithRelations } from "@/lib/types";
import { ProductCard } from "./product-card";

type Filters = { brand: string; category: string; condition: string; q: string };
type Sort = "featured" | "price-asc" | "price-desc" | "newest";

export function BikeBrowser({
  products,
  brands,
  initial,
}: {
  products: ProductWithRelations[];
  brands: Brand[];
  initial: Filters;
}) {
  const [f, setF] = useState<Filters>(initial);
  const [sort, setSort] = useState<Sort>("featured");

  const set = (k: keyof Filters, v: string) => {
    const next = { ...f, [k]: v };
    setF(next);
    const params = new URLSearchParams(Object.entries(next).filter(([, val]) => val) as [string, string][]);
    window.history.replaceState(null, "", params.size ? `?${params}` : window.location.pathname);
  };

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const out = products.filter(
      (p) =>
        (!f.brand || p.brand?.slug === f.brand) &&
        (!f.category || p.category === f.category) &&
        (!f.condition || p.condition === f.condition) &&
        (!q || `${p.name} ${p.brand?.name ?? ""} ${p.category}`.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "newest") out.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return out;
  }, [products, f, sort]);

  const active = Object.values(f).some(Boolean);

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-line bg-ink/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border lg:top-20">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <input
            type="search"
            value={f.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Search bikes…"
            className="field col-span-2 md:col-span-1"
            aria-label="Search bikes"
          />
          <select className="field" value={f.brand} onChange={(e) => set("brand", e.target.value)} aria-label="Brand">
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
          <select className="field" value={f.category} onChange={(e) => set("category", e.target.value)} aria-label="Category">
            <option value="">All types</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="field" value={f.condition} onChange={(e) => set("condition", e.target.value)} aria-label="Condition">
            <option value="">New & used</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-mute">
        <p>
          {list.length} {list.length === 1 ? "bike" : "bikes"}
        </p>
        {active && (
          <button
            onClick={() => {
              setF({ brand: "", category: "", condition: "", q: "" });
              window.history.replaceState(null, "", window.location.pathname);
            }}
            className="font-semibold text-ignite hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {list.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-3xl border border-dashed border-line p-12 text-center text-mute">
          No bikes match those filters yet — message us on WhatsApp and we&apos;ll find one for you.
        </p>
      )}
    </>
  );
}
