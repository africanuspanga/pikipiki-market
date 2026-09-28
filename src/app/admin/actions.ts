"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Refresh the cached public pages after the admin changes data. */
export async function revalidateSite() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin");
  if (!data) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
