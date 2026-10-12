import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/shell";
import { HeroImageManager } from "@/components/admin/hero-image-manager";
import { HERO_KEYS, type SiteSetting } from "@/lib/types";

export default async function HeroAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").in("key", [...HERO_KEYS]);

  return (
    <>
      <PageHeader title="Hero" subtitle="Up to 3 motorbike photos that slide at the top of the homepage" />
      <HeroImageManager settings={(data ?? []) as SiteSetting[]} />
    </>
  );
}
