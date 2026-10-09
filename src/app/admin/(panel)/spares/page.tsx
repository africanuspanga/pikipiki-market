import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { SpareManager } from "@/components/admin/spare-manager";
import type { Spare } from "@/lib/types";

export default async function SparesAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("spares").select("*").order("created_at", { ascending: false });
  const items = (data ?? []) as Spare[];

  return (
    <>
      <PageHeader title="Spares" subtitle={`${items.length} parts & accessories · shown on the homepage and /spares`} />
      <SpareManager items={items} />
    </>
  );
}
