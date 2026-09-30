export type VideoEmbed = { provider: "youtube" | "tiktok"; src: string; vertical: boolean };

/**
 * Turns a pasted YouTube or TikTok link into an embeddable player URL.
 * Returns null for anything we can't embed (e.g. TikTok short links like vm.tiktok.com).
 */
export function parseVideoUrl(input: string | null | undefined): VideoEmbed | null {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(input.trim().startsWith("http") ? input.trim() : `https://${input.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");

  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    let id: string | null = null;
    let vertical = false;
    if (host === "youtu.be") id = parts[0] ?? null;
    else if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (["shorts", "embed", "live", "v"].includes(parts[0])) {
      id = parts[1] ?? null;
      vertical = parts[0] === "shorts";
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`, vertical };
  }

  if (host === "tiktok.com") {
    const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
    if (!id) return null;
    return { provider: "tiktok", src: `https://www.tiktok.com/embed/v2/${id}`, vertical: true };
  }

  return null;
}
