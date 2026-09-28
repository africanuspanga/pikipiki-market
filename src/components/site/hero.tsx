import Image from "next/image";
import Link from "next/link";
import { formatPrice, whatsappLink } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { ProductWithRelations } from "@/lib/types";
import { ArrowRight, GoogleG, Stars, WhatsAppGlyph } from "@/components/icons";

export function Hero({ spotlight, rating }: { spotlight: ProductWithRelations | null; rating: number }) {
  const image = SITE.heroImage;

  return (
    <section className="theme-dark grain relative isolate flex bg-ink min-h-[100svh] flex-col overflow-hidden pt-16 lg:max-h-[1000px] lg:min-h-[760px] lg:pt-20">
      {/* Backdrop */}
      <div className="speed-lines absolute inset-0 -z-10" />
      <div className="anim-glow absolute right-[-20%] top-[10%] -z-10 h-[70vmin] w-[70vmin] rounded-full bg-ignite/40 blur-[120px] lg:right-[-5%] lg:h-[80vmin] lg:w-[80vmin]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8%] left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[28vw] font-black uppercase leading-none text-white/[0.03] lg:text-[20vw]"
      >
        Pikipiki
      </p>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-6 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:pb-16">
        {/* Copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <p className="anim-rise inline-flex items-center gap-2 rounded-full border border-line bg-ink-2/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-mute backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ignite" />
            Tanzania&apos;s motorbike marketplace
          </p>

          <h1 className="mt-5 font-display font-black uppercase leading-[0.85] tracking-tight">
            <span className="anim-rise block text-[18vw] sm:text-[13vw] lg:text-[8.5rem] xl:text-[10rem]" style={{ animationDelay: "80ms" }}>
              Ride
            </span>
            <span className="anim-rise text-outline block text-[18vw] sm:text-[13vw] lg:text-[8.5rem] xl:text-[10rem]" style={{ animationDelay: "160ms" }}>
              Bolder<span className="text-ignite [-webkit-text-stroke:0]">.</span>
            </span>
          </h1>

          <p className="anim-rise mt-6 max-w-md text-base leading-relaxed text-bone/75 sm:text-lg" style={{ animationDelay: "240ms" }}>
            New and quality motorbikes from the brands Tanzania trusts. Genuine papers, fair prices and delivery from Dar to
            every region. <span className="font-semibold text-bone">{SITE.tagline}</span>
          </p>

          <div className="anim-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "320ms" }}>
            <Link
              href="/bikes"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-ignite px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-ignite-2"
            >
              Shop bikes
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappLink("Habari! Help me choose the right motorbike.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-line bg-ink-2/60 px-8 py-4 text-base font-bold backdrop-blur transition hover:border-bone"
            >
              <WhatsAppGlyph className="h-5 w-5 text-[#25D366]" /> Talk to an expert
            </a>
          </div>

          <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-3">
              <GoogleG className="h-8 w-8" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-extrabold">{rating.toFixed(1)}</span>
                  <Stars rating={rating} className="h-4 w-4" />
                </div>
                <p className="text-xs text-mute">Google reviews</p>
              </div>
            </div>
            <Stat value="8" label="Top brands" />
            <Stat value="TZ" label="Nationwide delivery" plus={false} />
          </div>
        </div>

        {/* Bike */}
        <div className="relative order-1 lg:order-2">
          <div className="anim-ride relative mx-auto aspect-[4/3] w-full max-w-2xl lg:scale-110">
            <div className="absolute inset-x-[12%] bottom-[8%] h-[12%] rounded-[50%] bg-black/80 blur-2xl" />
            <Image
              src={image}
              alt="Superbike available at PikiPiki Market"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
            />
          </div>

          {spotlight && (
            <Link
              href={`/bikes/${spotlight.slug}`}
              className="anim-rise absolute bottom-0 right-0 flex items-center gap-4 rounded-2xl border border-line bg-ink/80 p-3 pr-5 backdrop-blur-xl transition hover:border-ignite sm:bottom-4 sm:right-4"
              style={{ animationDelay: "700ms" }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-ignite font-display text-xs font-black uppercase leading-none text-white">
                New
                <br />
                in
              </span>
              <span>
                <span className="block text-xs uppercase tracking-widest text-mute">Just in · {spotlight.category}</span>
                <span className="block font-display text-lg font-extrabold uppercase leading-tight">{spotlight.name}</span>
                <span className="block text-sm font-bold text-ignite">{formatPrice(spotlight.price)}</span>
              </span>
            </Link>
          )}

          <div className="absolute left-0 top-4 hidden rounded-2xl border border-line bg-ink/70 px-4 py-3 backdrop-blur-xl sm:block lg:left-[-4%]">
            <p className="text-xs uppercase tracking-widest text-mute">Delivery</p>
            <p className="font-display text-lg font-extrabold uppercase">Dar → Anywhere TZ</p>
          </div>
        </div>
      </div>

      <a
        href="#brands"
        className="mx-auto mb-6 hidden flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-mute hover:text-bone lg:flex"
      >
        Scroll
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-ignite to-transparent" />
      </a>
    </section>
  );
}

function Stat({ value, label, plus = true }: { value: string; label: string; plus?: boolean }) {
  return (
    <div className="border-l border-line pl-6">
      <p className="font-display text-3xl font-extrabold leading-none">
        {value}
        {plus && <span className="text-ignite">+</span>}
      </p>
      <p className="mt-1 text-xs text-mute">{label}</p>
    </div>
  );
}
