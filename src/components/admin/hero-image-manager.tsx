"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { SITE } from "@/lib/site";
import { HERO_KEYS, type SiteSetting } from "@/lib/types";
import { revalidateSite } from "@/app/admin/actions";

const BUCKET = "product-images";

/** Up to three hero photos; the homepage slides through the ones that are set, in slot order. */
export function HeroImageManager({ settings }: { settings: SiteSetting[] }) {
  const [saved, setSaved] = useState(false);
  const hasAny = settings.some((s) => s.value);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-ink-2 p-4 text-sm leading-relaxed text-mute">
        <p className="font-semibold text-bone">Tips for great hero photos</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Add up to <b className="text-bone">3 photos</b> — the homepage slides between them every 5 seconds.</li>
          <li>Use bike cut-outs with a <b className="text-bone">transparent background</b> (PNG or WebP) so they blend into the dark hero.</li>
          <li>Landscape works best — the bike side-on, filling the frame. Photos are resized and compressed automatically.</li>
          {!hasAny && <li>Until you add one, the original bike photo is shown.</li>}
        </ul>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {HERO_KEYS.map((key, i) => (
          <HeroSlot
            key={key}
            slot={i + 1}
            settingKey={key}
            setting={settings.find((s) => s.key === key) ?? null}
            onSaved={() => setSaved(true)}
            onStart={() => setSaved(false)}
          />
        ))}
      </div>

      {saved && <p className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-600">Saved — the homepage is updated.</p>}
    </div>
  );
}

function HeroSlot({
  slot,
  settingKey,
  setting,
  onSaved,
  onStart,
}: {
  slot: number;
  settingKey: string;
  setting: SiteSetting | null;
  onSaved: () => void;
  onStart: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const current = setting?.value || null;

  async function done(oldPath: string | null) {
    const supabase = createClient();
    // The previous upload is no longer used.
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    await revalidateSite();
    router.refresh();
    onSaved();
  }

  async function upload(file: File) {
    setBusy("upload");
    setError(null);
    onStart();
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
    const { error: saveError } = await supabase.from("site_settings").upsert({ key: settingKey, value: url, storage_path: path });
    if (saveError) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError(saveError.message);
      setBusy(null);
      return;
    }
    await done(setting?.storage_path ?? null);
    setBusy(null);
  }

  async function remove() {
    if (!confirm(`Remove hero photo ${slot}?`)) return;
    setBusy("remove");
    setError(null);
    onStart();
    const { error: delError } = await createClient().from("site_settings").delete().eq("key", settingKey);
    if (delError) setError(delError.message);
    else await done(setting?.storage_path ?? null);
    setBusy(null);
  }

  return (
    <div className="space-y-3">
      <div className="theme-dark relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink">
        <div className="absolute right-[-10%] top-[10%] h-[70%] w-[70%] rounded-full bg-ignite/40 blur-[80px]" />
        {current ? (
          <Image
            src={current}
            alt={`Hero photo ${slot}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-4 drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
          />
        ) : slot === 1 ? (
          <Image src={SITE.heroImage} alt="Original hero photo" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-4 opacity-40" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-mute">Empty</span>
        )}
        {busy === "upload" && <span className="absolute inset-0 grid place-items-center bg-ink/70 text-sm font-bold text-bone">Uploading…</span>}
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-bone">
          Photo {slot}
          {!current && slot === 1 ? " · original" : ""}
        </span>
      </div>

      <button
        onClick={() => fileInput.current?.click()}
        disabled={busy !== null}
        className="w-full rounded-full bg-ignite py-3 font-extrabold uppercase text-white transition hover:bg-ignite-2 disabled:opacity-60"
      >
        {busy === "upload" ? "Uploading…" : current ? "Replace photo" : "Add photo"}
      </button>
      {current && (
        <button
          onClick={remove}
          disabled={busy !== null}
          className="w-full rounded-full border border-line py-3 font-bold transition hover:border-bone disabled:opacity-60"
        >
          {busy === "remove" ? "Removing…" : "Remove"}
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
    </div>
  );
}
