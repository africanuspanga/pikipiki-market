import { GoogleG, Stars } from "@/components/icons";
import type { Testimonial } from "@/lib/types";
import { SectionHeading } from "./brands";

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  const avg = items.reduce((s, t) => s + t.rating, 0) / items.length;
  const half = Math.ceil(items.length / 2);
  const rowA = items.slice(0, half);
  const rowB = items.slice(half).length ? items.slice(half) : items;

  return (
    <section id="reviews" className="scroll-mt-20 overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Real riders"
          title="Loved across Tanzania"
          action={
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-ink-2 px-5 py-4">
              <GoogleG className="h-10 w-10" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl font-black leading-none">{avg.toFixed(1)}</span>
                  <Stars rating={Math.round(avg * 2) / 2} />
                </div>
                <p className="mt-1 text-xs text-mute">Based on {items.length}+ Google reviews</p>
              </div>
            </div>
          }
        />
      </div>

      <div className="mask-fade-x mt-12 space-y-4">
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
      </div>
    </section>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Testimonial[]; reverse?: boolean }) {
  // Repeat so the track is always wider than the viewport, then duplicate for a seamless loop.
  const base = items.length < 4 ? [...items, ...items, ...items] : items;
  const loop = [...base, ...base];
  return (
    <div className="overflow-hidden">
      <ul
        className={`marquee-track flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: `${base.length * 7}s` }}
      >
        {loop.map((t, i) => (
          <li key={`${t.id}-${i}`} aria-hidden={i >= base.length} className="w-[84vw] max-w-[396px] shrink-0 pr-4">
            <ReviewCard t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-line bg-ink-2 p-6 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)] transition hover:border-ignite/50">
      <div className="flex items-center justify-between">
        <Stars rating={t.rating} />
        <GoogleG className="h-6 w-6" />
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-bone/85">&ldquo;{t.content}&rdquo;</blockquote>
      <figcaption className="mt-6 border-t border-line pt-4">
        <span className="block text-sm font-bold">{t.name}</span>
        {t.location && <span className="block text-xs text-mute">{t.location}</span>}
      </figcaption>
    </figure>
  );
}
