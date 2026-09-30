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

/** Single number for calls and WhatsApp — change it here only. */
export const WHATSAPP_NUMBER = "255764400400";
export const PHONE_DISPLAY = "+255 764 400 400";
export const PHONE_TEL = `tel:+${WHATSAPP_NUMBER}`;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Normalises a Tanzanian number to 255XXXXXXXXX (the format WhatsApp and bulk-SMS tools expect). */
export function toIntlPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `255${digits.slice(1)}`;
  if (digits.length === 9) return `255${digits}`;
  return digits;
}
