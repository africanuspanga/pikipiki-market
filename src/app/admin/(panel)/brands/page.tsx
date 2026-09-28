import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { BrandManager } from "@/components/admin/brand-manager";

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="Brands" subtitle="Brands appear in the homepage marquee, brand grid and shop filters." />
      <BrandManager brands={data ?? []} />
    </>
  );
}
