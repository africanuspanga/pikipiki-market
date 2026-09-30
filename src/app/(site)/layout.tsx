import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/sections";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { JsonLd } from "@/components/site/json-ld";
import { PHONE_DISPLAY } from "@/lib/format";
import { SITE, SOCIALS } from "@/lib/site";

const BUSINESS = {
  "@context": "https://schema.org",
  "@type": "MotorcycleDealer",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  image: `${SITE.url}/hero-bike.png`,
  telephone: PHONE_DISPLAY.replace(/\s/g, ""),
  priceRange: "TSh",
  currenciesAccepted: "TZS",
  address: { "@type": "PostalAddress", addressLocality: "Dar es Salaam", addressCountry: "TZ" },
  areaServed: { "@type": "Country", name: "Tanzania" },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "18:00",
  },
  sameAs: SOCIALS.map((s) => s.href),
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={BUSINESS} />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
