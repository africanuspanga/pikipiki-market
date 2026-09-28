import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { TestimonialManager } from "@/components/admin/testimonial-manager";
import type { Testimonial } from "@/lib/types";

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  const items = ((data ?? []) as Testimonial[]).map((t) => ({ ...t, rating: Number(t.rating) }));

  return (
    <>
      <PageHeader title="Reviews" subtitle="Shown in the scrolling Google reviews section on the homepage." />
      <TestimonialManager items={items} />
    </>
  );
}
