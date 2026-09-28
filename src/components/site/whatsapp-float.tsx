import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/format";

/** Floating WhatsApp button — the PNG fills the whole button, no background behind it. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Habari PikiPiki Market! I'm interested in a motorbike.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp: +255 676 406 400"
      className="group fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] right-4 z-50 block h-16 w-16 overflow-hidden rounded-full shadow-[0_10px_30px_-6px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:scale-110 active:scale-95 lg:bottom-7 lg:right-7"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SITE.whatsappIcon} alt="" className="block h-full w-full object-cover" draggable={false} />    </a>
  );
}
