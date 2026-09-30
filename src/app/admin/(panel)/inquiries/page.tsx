import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { InquiryList } from "@/components/admin/inquiry-list";
import type { Inquiry } from "@/lib/types";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*, product:products(name, slug, images:product_images(url, sort_order))")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Leads" subtitle="Call-back requests from bike pages." />
      <InquiryList items={(data ?? []) as Inquiry[]} />
    </>
  );
}
