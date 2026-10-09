import Image from "next/image";
import Link from "next/link";
import { formatPrice, whatsappLink } from "@/lib/format";
import type { Spare } from "@/lib/types";
import { ArrowRight, WhatsAppGlyph } from "@/components/icons";
import { SectionHeading } from "./brands";

export function SpareCard({ spare }: { spare: Spare }) {
  const sold = spare.stock_status === "sold_out";
  const hasDiscount = spare.old_price != null && spare.old_price > spare.price;

  return (
    <article className={`flex flex-col overflow-hidden rounded-3xl border border-line bg-ink-2 transition hover:border-ignite/60 ${sold ? "opacity-75" : ""}`}>
      <div className="relative aspect-square bg-ink-3">
        {spare.image_url && (
          <Image
            src={spare.image_url}
            alt={spare.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover ${sold ? "grayscale" : ""}`}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bone backdrop-blur">
          {spare.category}
        </span>
        {sold && (
          <span className="absolute right-3 top-3 rounded-full bg-night px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Sold
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl font-extrabold uppercase leading-tight">{spare.name}</h3>
        {spare.fits && <p className="mt-1 text-xs text-mute">Fits: {spare.fits}</p>}
        {spare.description && <p className="mt-2 line-clamp-2 text-sm text-bone/70">{spare.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {hasDiscount && <p className="text-xs text-mute line-through">{formatPrice(spare.old_price)}</p>}
            <p className="font-display text-xl font-extrabold text-ignite">{formatPrice(spare.price)}</p>
          </div>
          <a
            href={whatsappLink(`Habari! Do you have the ${spare.name} (${formatPrice(spare.price)})?`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask about ${spare.name} on WhatsApp`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white transition hover:brightness-110"
          >
            <WhatsAppGlyph className="h-5 w-5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function SparesGrid({ spares }: { spares: Spare[] }) {
  if (!spares.length) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid aspect-[4/5] place-items-center rounded-3xl border border-dashed border-line bg-ink-2 p-4 text-center text-xs font-semibold uppercase tracking-widest text-mute">
            Coming soon
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {spares.map((s) => (
        <SpareCard key={s.id} spare={s} />
      ))}
    </div>
  );
}

export function SparesSection({ spares }: { spares: Spare[] }) {
  return (
    <section id="spares" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 sm:px-6 lg:pt-28">
      <SectionHeading
        eyebrow="Genuine parts"
        title="Spares & accessories"
        action={
          <Link href="/spares" className="group inline-flex items-center gap-2 font-bold text-ignite">
            View all spares <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        }
      />
      <div className="mt-10">
        <SparesGrid spares={spares.slice(0, 8)} />
      </div>
    </section>
  );
}
