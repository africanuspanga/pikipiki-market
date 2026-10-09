"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { SITE } from "@/lib/site";
import type { SiteSetting } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

const BUCKET = "product-images";
const KEY = "hero_image";

export function HeroImageManager({ setting }: { setting: SiteSetting | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"upload" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const current = setting?.value || null;

  async function done(oldPath: string | null) {
    const supabase = createClient();
    // The previous upload is no longer used.
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    await revalidateSite();
    router.refresh();
    setSaved(true);
  }

  async function upload(file: File) {
    setBusy("upload");
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const blob = await compressImage(file);
    const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `hero/${crypto.randomUUID()}.${ext}`;
    const { error: upError } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
    if (upError) {
      setError(`Upload failed: ${upError.message}`);
      setBusy(null);
      return;
    }
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error: saveError } = await supabase.from("site_settings").upsert({ key: KEY, value: url, storage_path: path });
    if (saveError) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError(saveError.message);
      setBusy(null);
      return;
    }
    await done(setting?.storage_path ?? null);
    setBusy(null);
  }

  async function reset() {
    if (!confirm("Go back to the original hero bike photo?")) return;
    setBusy("reset");
    setError(null);
    setSaved(false);
    const { error: delError } = await createClient().from("site_settings").delete().eq("key", KEY);
    if (delError) setError(delError.message);
    else await done(setting?.storage_path ?? null);
    setBusy(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="theme-dark relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink">
        <div className="absolute right-[-10%] top-[10%] h-[70%] w-[70%] rounded-full bg-ignite/40 blur-[80px]" />
        <Image
          src={current ?? SITE.heroImage}
          alt="Current hero photo"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain p-4 drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
        />
        {busy === "upload" && <span className="absolute inset-0 grid place-items-center bg-ink/70 text-sm font-bold text-bone">Uploading…</span>}
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-bone">
          {current ? "Your photo" : "Original photo"}
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-ink-2 p-4 text-sm leading-relaxed text-mute">
          <p className="font-semibold text-bone">Tips for a great hero photo</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Use a bike cut-out with a <b className="text-bone">transparent background</b> (PNG or WebP) so it blends into the dark hero.</li>
            <li>Landscape works best — the bike side-on, filling the frame.</li>
            <li>The photo is resized and compressed automatically.</li>
          </ul>
        </div>

        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy !== null}
          className="w-full rounded-full bg-ignite py-3 font-extrabold uppercase text-white transition hover:bg-ignite-2 disabled:opacity-60"
        >
          {busy === "upload" ? "Uploading…" : "Change hero photo"}
        </button>
        {current && (
          <button
            onClick={reset}
            disabled={busy !== null}
            className="w-full rounded-full border border-line py-3 font-bold transition hover:border-bone disabled:opacity-60"
          >
            {busy === "reset" ? "Resetting…" : "Use original photo"}
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />

        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}
        {saved && !error && <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-600">Saved — the homepage is updated.</p>}
      </div>
    </div>
  );
}
