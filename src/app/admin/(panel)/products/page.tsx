import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { ProductTable } from "@/components/admin/product-table";
import type { ProductWithRelations } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, brand:brands(*), images:product_images(*)")
    .order("created_at", { ascending: false });

  const products = ((data ?? []) as ProductWithRelations[]).map((p) => ({
    ...p,
    images: [...p.images].sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <>
      <PageHeader
        title="Bikes"
        subtitle={`${products.length} in inventory`}
        action={
          <Link href="/admin/products/new" className="rounded-full bg-ignite px-5 py-3 text-sm font-extrabold uppercase text-white hover:bg-ignite-2">
            + Add bike
          </Link>
        }
      />
      <ProductTable products={products} />
    </>
  );
}
