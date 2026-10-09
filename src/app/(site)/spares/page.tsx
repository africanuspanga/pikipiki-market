import type { Metadata } from "next";
import { getSpares } from "@/lib/data";
import { whatsappLink } from "@/lib/format";
import { SparesGrid } from "@/components/site/spares";
import { WhatsAppGlyph } from "@/components/icons";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Spares & accessories — motorbike parts for sale",
  description:
    "Genuine motorbike spare parts and accessories in Tanzania — engine parts, brakes, tyres, electrical, helmets and more. Prices in TSh, nationwide delivery.",
  alternates: { canonical: "/spares" },
  openGraph: { url: "/spares" },
};

export default async function SparesPage() {
  const spares = await getSpares();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-36">
      <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-ignite">
        <span className="h-px w-8 bg-ignite" /> Genuine parts
      </p>
      <h1 className="mt-3 font-display text-6xl font-black uppercase leading-[0.9] sm:text-8xl">Spares &amp; accessories</h1>
      <p className="mt-4 max-w-xl text-bone/70">
        Can&apos;t see the part you need? Send us the bike model on WhatsApp and we&apos;ll check stock for you.
      </p>
      <a
        href={whatsappLink("Habari! I'm looking for a spare part.")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-extrabold text-night transition hover:brightness-110"
      >
        <WhatsAppGlyph className="h-5 w-5" /> Ask for a part
      </a>
      <div className="mt-10">
        <SparesGrid spares={spares} />
      </div>
    </div>
  );
}
