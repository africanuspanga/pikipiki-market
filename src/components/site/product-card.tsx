import Image from "next/image";
import Link from "next/link";
import { formatPrice, whatsappLink } from "@/lib/format";
import { STOCK_LABELS, type ProductWithRelations } from "@/lib/types";
import { ArrowRight, WhatsAppGlyph } from "@/components/icons";

export function ProductCard({ product, priority = false }: { product: ProductWithRelations; priority?: boolean }) {
  const img = product.images[0]?.url;
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : null;
  const soldOut = product.stock_status === "sold_out";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-ink-2 transition duration-300 hover:-translate-y-1 hover:border-ignite/60 hover:shadow-[0_30px_60px_-30px_rgba(227,13,25,0.45)]">
      <Link href={`/bikes/${product.slug}`} className="relative block aspect-square overflow-hidden bg-ink-3">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition duration-700 group-hover:scale-105 ${soldOut ? "grayscale" : ""}`}
          />
        ) : (
          <div className="grid h-full place-items-center font-display text-3xl uppercase text-line">No photo</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.brand && (
            <span className="rounded-full bg-ink/80 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-bone backdrop-blur">
              {product.brand.name}
            </span>
          )}
          {product.condition === "used" && (
            <span className="rounded-full bg-savanna px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-night">Used</span>
          )}
        </div>
        {discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-ignite px-3 py-1 text-[11px] font-black text-white">-{discount}%</span>
        ) : product.stock_status !== "in_stock" ? (
          <span className="absolute right-3 top-3 rounded-full border border-line bg-ink/80 px-3 py-1 text-[11px] font-bold text-bone backdrop-blur">
            {STOCK_LABELS[product.stock_status]}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-mute">
          {product.category}
          {product.year ? ` · ${product.year}` : ""}
        </p>
        <h3 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">
          <Link href={`/bikes/${product.slug}`} className="hover:text-ignite">
            {product.name}
          </Link>
        </h3>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Spec label="Engine" value={product.engine_cc ? `${product.engine_cc}cc` : "—"} />
          <Spec label="Gearbox" value={product.transmission ?? "—"} />
          <Spec label={product.condition === "used" ? "Mileage" : "Fuel"} value={product.condition === "used" && product.mileage_km != null ? `${product.mileage_km.toLocaleString()} km` : product.fuel_type ?? "—"} />
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            {product.old_price && product.old_price > product.price && (
              <p className="text-sm text-mute line-through">{formatPrice(product.old_price)}</p>
            )}
            <p className="font-display text-2xl font-extrabold text-ignite">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={`/bikes/${product.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-bold transition hover:border-bone"
          >
            View details <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={whatsappLink(`Habari! Is the ${product.name} (${formatPrice(product.price)}) available?`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask about ${product.name} on WhatsApp`}
            className="grid h-full w-12 place-items-center rounded-full bg-[#25D366] text-white transition hover:brightness-110"
          >
            <WhatsAppGlyph className="h-5 w-5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-3 px-2 py-2">
      <dt className="text-[10px] uppercase tracking-widest text-mute">{label}</dt>
      <dd className="truncate text-sm font-bold">{value}</dd>
    </div>
  );
}
