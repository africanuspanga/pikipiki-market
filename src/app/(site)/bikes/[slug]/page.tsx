import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatPrice, PHONE_DISPLAY, whatsappLink } from "@/lib/format";
import { STOCK_LABELS } from "@/lib/types";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ProductCard } from "@/components/site/product-card";
import { Check, WhatsAppGlyph } from "@/components/icons";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Bike not found" };
  return {
    title: `${p.name} — ${formatPrice(p.price)}`,
    description: p.short_description ?? p.description?.slice(0, 160) ?? undefined,
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

export default async function BikePage({ params }: Props) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = (await getProducts({ limit: 12 }))
    .filter((x) => x.id !== p.id && (x.brand_id === p.brand_id || x.category === p.category))
    .slice(0, 3);

  const specs: [string, string | null][] = [
    ["Brand", p.brand?.name ?? null],
    ["Type", p.category],
    ["Condition", p.condition === "new" ? "Brand new" : "Used"],
    ["Year", p.year?.toString() ?? null],
    ["Engine", p.engine_cc ? `${p.engine_cc} cc` : null],
    ["Transmission", p.transmission],
    ["Fuel", p.fuel_type],
    ["Fuel economy", p.fuel_economy],
    ["Top speed", p.top_speed_kmh ? `${p.top_speed_kmh} km/h` : null],
    ["Mileage", p.mileage_km != null && p.condition === "used" ? `${p.mileage_km.toLocaleString()} km` : null],
    ["Colour", p.color],
  ];

  const waMsg = `Habari! I'm interested in the ${p.name} listed at ${formatPrice(p.price)}. Is it available?`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:pt-32">
      <nav className="mb-6 text-sm text-mute" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-bone">Home</Link> / <Link href="/bikes" className="hover:text-bone">Bikes</Link> /{" "}
        <span className="text-bone">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Gallery images={p.images} name={p.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {p.brand && (
              <Link href={`/bikes?brand=${p.brand.slug}`} className="rounded-full border border-line px-3 py-1 text-xs font-bold uppercase tracking-widest hover:border-ignite">
                {p.brand.name}
              </Link>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${p.stock_status === "sold_out" ? "bg-line text-mute" : "bg-ignite/15 text-ignite"}`}>
              {STOCK_LABELS[p.stock_status]}
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{p.name}</h1>
          {p.short_description && <p className="mt-4 text-lg text-bone/75">{p.short_description}</p>}

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-5xl font-black text-ignite">{formatPrice(p.price)}</p>
            {p.old_price && p.old_price > p.price && <p className="pb-1.5 text-lg text-mute line-through">{formatPrice(p.old_price)}</p>}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-extrabold text-night transition hover:brightness-110"
            >
              <WhatsAppGlyph className="h-5 w-5" /> Buy on WhatsApp
            </a>
            <a
              href={`tel:+${PHONE_DISPLAY.replace(/\D/g, "")}`}
              className="inline-flex items-center justify-center rounded-full border border-line px-6 py-4 font-bold transition hover:border-bone"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>

          <dl className="mt-10 divide-y divide-line rounded-3xl border border-line">
            {specs
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                  <dt className="text-mute">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
          </dl>

          {p.features.length > 0 && (
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {p.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ignite" /> {feat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        {p.description ? (
          <section>
            <h2 className="font-display text-3xl font-black uppercase">About this bike</h2>
            <div className="mt-4 whitespace-pre-line leading-relaxed text-bone/75">{p.description}</div>
          </section>
        ) : (
          <div />
        )}
        <InquiryForm productId={p.id} productName={p.name} />
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-4xl font-black uppercase">You may also like</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
