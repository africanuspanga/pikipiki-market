import { createPublicClient } from "@/lib/supabase/server";
import { soldLast } from "@/lib/format";
import type { Brand, ProductWithRelations, Spare, Testimonial } from "@/lib/types";

const PRODUCT_SELECT = "*, brand:brands(*), images:product_images(*)";

function sortImages(p: ProductWithRelations): ProductWithRelations {
  return { ...p, images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order) };
}

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await createPublicClient().from("brands").select("*").order("sort_order");
  if (error) console.error("getBrands", error.message);
  return data ?? [];
}

export async function getProducts(opts: { featured?: boolean; limit?: number } = {}) {
  let q = createPublicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts.featured) q = q.eq("is_featured", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) console.error("getProducts", error.message);
  return soldLast(((data ?? []) as ProductWithRelations[]).map(sortImages));
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) console.error("getProductBySlug", error.message);
  return data ? sortImages(data as ProductWithRelations) : null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await createPublicClient()
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) console.error("getTestimonials", error.message);
  return (data ?? []).map((t) => ({ ...t, rating: Number(t.rating) }));
}

export async function getSpares(): Promise<Spare[]> {
  const { data, error } = await createPublicClient()
    .from("spares")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) console.error("getSpares", error.message);
  return soldLast((data ?? []) as Spare[]);
}
