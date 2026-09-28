import Link from "next/link";
import Image from "next/image";
import { BRAND_LOGOS } from "@/lib/site";
import type { Brand } from "@/lib/types";

// Square-ish marks need extra height to carry the same visual weight as wide wordmarks.
const TALL = new Set(["ducati", "honda"]);

function BrandMark({ brand, className }: { brand: Brand; className: string }) {
  const logo = BRAND_LOGOS[brand.slug];
  if (!logo) {
    return <span className="font-display text-3xl font-black uppercase italic text-night">{brand.name}</span>;
  }
  return <Image src={logo} alt={brand.name} width={320} height={160} className={`w-auto object-contain ${className} ${TALL.has(brand.slug) ? "scale-[1.6]" : ""}`} />;
}

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const row = [...brands, ...brands];
  return (
    <section id="brands" aria-label="Brands we sell" className="relative scroll-mt-20 border-y border-line bg-white py-7 sm:py-9">
      <div className="mask-fade-x overflow-hidden">
        <ul className="marquee-track flex w-max animate-marquee items-center [animation-duration:32s]">
          {row.map((b, i) => (
            <li key={`${b.id}-${i}`} aria-hidden={i >= brands.length} className="px-8 sm:px-12">
              <Link
                href={`/bikes?brand=${b.slug}`}
                tabIndex={i >= brands.length ? -1 : undefined}
                className="block transition duration-300 hover:scale-105"
              >
                <BrandMark brand={b} className="h-9 sm:h-12" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function BrandGrid({ brands, counts }: { brands: Brand[]; counts: Record<string, number> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading eyebrow="Official lineup" title="Shop by brand" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/bikes?brand=${b.slug}`}
            className="group relative flex aspect-[5/4] flex-col overflow-hidden rounded-2xl border border-line bg-white p-4 text-night shadow-[0_10px_30px_-20px_rgba(0,0,0,0.3)] ring-2 ring-transparent transition hover:-translate-y-1 hover:ring-ignite sm:p-5"
          >
            <div className="flex flex-1 items-center justify-center">
              <BrandMark brand={b} className="h-12 max-w-[85%] transition duration-300 group-hover:scale-110 sm:h-16" />
            </div>
            <div className="flex items-end justify-between gap-2 border-t border-black/10 pt-3">
              <span className="truncate text-xs text-black/55">{b.tagline}</span>
              <span className="shrink-0 rounded-full bg-night px-2.5 py-1 text-[11px] font-bold text-white">
                {counts[b.id] ?? 0}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-ignite">
          <span className="h-px w-8 bg-ignite" />
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl lg:text-7xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
