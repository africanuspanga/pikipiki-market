import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from("brands").select("*").order("sort_order");

  return (
    <>
      <PageHeader title="Add bike" subtitle="Photos upload instantly — fill in the details and publish." />
      <ProductForm brands={brands ?? []} />
    </>
  );
}
