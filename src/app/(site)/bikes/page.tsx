import type { Metadata } from "next";
import { getBrands, getProducts } from "@/lib/data";
import { BikeBrowser } from "@/components/site/bike-browser";

export const revalidate = 60;
export const metadata: Metadata = { title: "Shop motorbikes" };

export default async function BikesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sp, brands, products] = await Promise.all([searchParams, getBrands(), getProducts()]);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-36">
      <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-ignite">
        <span className="h-px w-8 bg-ignite" /> Showroom
      </p>
      <h1 className="mt-3 font-display text-6xl font-black uppercase leading-[0.9] sm:text-8xl">All bikes</h1>
      <BikeBrowser
        products={products}
        brands={brands}
        initial={{
          brand: one(sp.brand),
          category: one(sp.category),
          condition: one(sp.condition),
          q: one(sp.q),
        }}
      />
    </div>
  );
}
