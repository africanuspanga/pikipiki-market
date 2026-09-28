const tzs = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined) {
  if (value == null || value === 0) return "Call for price";
  return `TSh ${tzs.format(value)}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "255676406400";
export const PHONE_DISPLAY = "+255 676 406 400";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
