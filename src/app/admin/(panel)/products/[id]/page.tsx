import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductWithRelations } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: brands }] = await Promise.all([
    supabase.from("products").select("*, brand:brands(*), images:product_images(*)").eq("id", id).maybeSingle(),
    supabase.from("brands").select("*").order("sort_order"),
  ]);
  if (!product) notFound();

  const p = product as ProductWithRelations;
  p.images = [...p.images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <PageHeader
        title="Edit bike"
        subtitle={p.name}
        action={
          p.is_published ? (
            <Link href={`/bikes/${p.slug}`} target="_blank" className="text-sm font-semibold text-ignite">
              View on site ↗
            </Link>
          ) : undefined
        }
      />
      <ProductForm brands={brands ?? []} product={p} />
    </>
  );
}
