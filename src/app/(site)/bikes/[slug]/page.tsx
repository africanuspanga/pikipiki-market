import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatPrice, PHONE_DISPLAY, PHONE_TEL, whatsappLink } from "@/lib/format";
import { STOCK_LABELS } from "@/lib/types";
import { parseVideoUrl } from "@/lib/video";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ProductCard } from "@/components/site/product-card";
import { Check, WhatsAppGlyph } from "@/components/icons";
import { JsonLd } from "@/components/site/json-ld";
import { SITE } from "@/lib/site";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Bike not found", robots: { index: false } };
  const title = `${p.name} — ${formatPrice(p.price)}`;
  const description =
    p.short_description ??
    p.description?.slice(0, 160) ??
    `${p.condition === "new" ? "Brand new" : "Used"} ${p.name} for sale in Tanzania at ${formatPrice(p.price)}. Genuine papers, nationwide delivery.`;
  const url = `/bikes/${p.slug}`;
  const images = p.images.slice(0, 4).map((i) => ({ url: i.url, alt: p.name }));
  return {
    title,
    description,
    alternates: { canonical: url },
    // Without a photo, fall through to the site-wide share card.
    ...(images.length && {
      openGraph: { title, description, url, type: "website", images },
      twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
    }),
  };
}

export default async function BikePage({ params }: Props) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const related = (await getProducts({ limit: 12 }))
    .filter((x) => x.id !== p.id && x.stock_status !== "sold_out" && (x.brand_id === p.brand_id || x.category === p.category))
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

  const video = parseVideoUrl(p.video_url);
  const AVAILABILITY = { in_stock: "InStock", low_stock: "LimitedAvailability", sold_out: "SoldOut", pre_order: "PreOrder" } as const;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short_description ?? p.description ?? undefined,
    image: p.images.map((i) => i.url),
    url: `${SITE.url}/bikes/${p.slug}`,
    sku: p.id,
    category: p.category,
    color: p.color ?? undefined,
    brand: p.brand && !["other", "electric-bike"].includes(p.brand.slug) ? { "@type": "Brand", name: p.brand.name } : undefined,
    itemCondition: p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    ...(p.price > 0 && {
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "TZS",
        availability: `https://schema.org/${AVAILABILITY[p.stock_status]}`,
        url: `${SITE.url}/bikes/${p.slug}`,
        seller: { "@id": `${SITE.url}/#business` },
      },
    }),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Bikes", item: `${SITE.url}/bikes` },
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE.url}/bikes/${p.slug}` },
    ],
  };
  const sold = p.stock_status === "sold_out";
  const waMsg = sold
    ? `Habari! I saw the ${p.name} is sold. Do you have a similar bike?`
    : `Habari! I'm interested in the ${p.name} listed at ${formatPrice(p.price)}. Is it available?`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:pt-32">
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
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
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${sold ? "bg-line text-mute" : "bg-ignite/15 text-ignite"}`}>
              {STOCK_LABELS[p.stock_status]}
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{p.name}</h1>
          {p.short_description && <p className="mt-4 text-lg text-bone/75">{p.short_description}</p>}

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-5xl font-black text-ignite">{formatPrice(p.price)}</p>
            {p.old_price && p.old_price > p.price && <p className="pb-1.5 text-lg text-mute line-through">{formatPrice(p.old_price)}</p>}
          </div>

          {sold && (
            <p className="mt-6 rounded-2xl border border-line bg-ink-2 px-5 py-4 text-sm text-bone/80">
              This bike has been sold. Many of our bikes are one of a kind — message us and we&apos;ll find you something similar.
            </p>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-extrabold text-night transition hover:brightness-110"
            >
              <WhatsAppGlyph className="h-5 w-5" /> {sold ? "Ask for a similar bike" : "Buy on WhatsApp"}
            </a>
            <a
              href={PHONE_TEL}
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

      {video && (
        <section className="mt-16">
          <h2 className="font-display text-3xl font-black uppercase">Watch it in action</h2>
          <div
            className={`mt-6 overflow-hidden rounded-3xl border border-line bg-black ${
              video.vertical ? "mx-auto aspect-[9/16] max-w-sm" : "aspect-video max-w-4xl"
            }`}
          >
            <iframe
              src={video.src}
              title={`${p.name} video`}
              loading="lazy"
              className="h-full w-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </section>
      )}

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
