import Link from "next/link";
import { PHONE_DISPLAY, whatsappLink } from "@/lib/format";
import { SITE } from "@/lib/site";
import { CATEGORIES } from "@/lib/types";
import { ArrowRight, Check, WhatsAppGlyph } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SectionHeading } from "./brands";

const REASONS = [
  {
    n: "01",
    title: "Genuine bikes & papers",
    body: "Every bike comes with verified documents, TRA-ready paperwork and help with registration and plates.",
  },
  {
    n: "02",
    title: "Nationwide delivery",
    body: "From our Dar es Salaam showroom to Arusha, Mwanza, Dodoma, Mbeya, Zanzibar and every region in between.",
  },
  {
    n: "03",
    title: "Fair, clear pricing",
    body: "No hidden costs. The price you see is what you pay — with flexible payment options for boda boda owners.",
  },
  {
    n: "04",
    title: "After-sales support",
    body: "Warranty on new bikes, genuine spare parts and trusted mechanics who know every model we sell.",
  },
];

export function WhyUs() {
  return (
    <section id="why" className="relative scroll-mt-20 border-y border-line bg-ink-2">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="Why PikiPiki Market" title="More than a bike shop" />
          <p className="mt-6 max-w-md text-bone/70">
            Whether it&apos;s your first boda boda, a daily commuter or a weekend superbike — we help you choose right, pay
            fairly and ride away with confidence.
          </p>
          <a
            href={whatsappLink("Habari! I'd like advice on choosing a motorbike.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 font-bold text-ignite hover:underline"
          >
            Get free advice on WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {REASONS.map((r) => (
            <div key={r.n} className="group rounded-3xl border border-line bg-ink p-6 transition hover:border-ignite/60 sm:p-8">
              <p className="font-display text-5xl font-black text-ignite/30 transition group-hover:text-ignite">{r.n}</p>
              <h3 className="mt-6 font-display text-2xl font-extrabold uppercase">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bone/65">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/bikes?category=${encodeURIComponent(c)}`}
            className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-bone/80 transition hover:border-ignite hover:text-ignite"
          >
            {c}
          </Link>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Choose", body: "Browse online or visit the showroom. Ask us anything on WhatsApp." },
  { title: "Test & pay", body: "Inspect the bike, then pay by M-Pesa, Tigo Pesa, Airtel Money, bank or cash." },
  { title: "Ride away", body: "We sort papers and plates and deliver anywhere in Tanzania." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading eyebrow="Simple process" title="Key in hand in 3 steps" />
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative overflow-hidden rounded-3xl border border-line p-6 sm:p-8">
            <span className="absolute -right-2 -top-8 font-display text-[9rem] font-black leading-none text-bone/[0.06]">{i + 1}</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ignite font-black text-white">{i + 1}</span>
            <h3 className="mt-6 font-display text-3xl font-extrabold uppercase">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-bone/65">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="grain relative overflow-hidden rounded-[2rem] bg-ignite px-6 py-14 text-white sm:px-12 lg:py-20">
        <div className="speed-lines absolute inset-0 opacity-60 mix-blend-multiply" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.88] sm:text-7xl">
              Your next ride
              <br />
              is one message away.
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              {["Fast replies", "Swahili & English", "Photos & videos on request"].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink("Habari! I'm ready to buy a motorbike.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-night px-8 py-5 text-lg font-extrabold text-white transition hover:bg-black"
            >
              <WhatsAppGlyph className="h-6 w-6 text-[#25D366]" /> WhatsApp {PHONE_DISPLAY}
            </a>
            <Link
              href="/bikes"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-8 py-4 font-extrabold uppercase transition hover:bg-white hover:text-ignite"
            >
              Browse all bikes <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="theme-dark border-t border-line bg-ink-2 pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-mute">{SITE.description}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-mute">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/bikes" className="hover:text-ignite">All bikes</Link></li>
            <li><Link href="/bikes?condition=new" className="hover:text-ignite">New bikes</Link></li>
            <li><Link href="/bikes?condition=used" className="hover:text-ignite">Used bikes</Link></li>
            <li><Link href="/bikes?category=Boda%20Boda" className="hover:text-ignite">Boda boda</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-mute">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href={`tel:+${PHONE_DISPLAY.replace(/\D/g, "")}`} className="hover:text-ignite">{PHONE_DISPLAY}</a></li>
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-ignite">WhatsApp</a></li>
            <li className="text-mute">{SITE.location}</li>
            <li className="text-mute">Mon – Sat · 8:00 – 18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-mute sm:px-6">
          © {new Date().getFullYear()} {SITE.name}. All brand names are trademarks of their respective owners.
        </p>
      </div>
    </footer>
  );
}
