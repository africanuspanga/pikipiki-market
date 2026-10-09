import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { HeroImageManager } from "@/components/admin/hero-image-manager";
import type { SiteSetting } from "@/lib/types";

export default async function HeroAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("key", "hero_image").maybeSingle();

  return (
    <>
      <PageHeader title="Hero" subtitle="The big motorbike photo at the top of the homepage" />
      <HeroImageManager setting={(data as SiteSetting | null) ?? null} />
    </>
  );
}
