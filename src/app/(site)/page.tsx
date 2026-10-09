import Link from "next/link";
import { getBrands, getHeroImage, getProducts, getSpares, getTestimonials } from "@/lib/data";
import { Hero } from "@/components/site/hero";
import { BrandGrid, BrandMarquee, SectionHeading } from "@/components/site/brands";
import { ProductCard } from "@/components/site/product-card";
import { Categories, CtaBanner, HowItWorks, WhyUs } from "@/components/site/sections";
import { SparesSection } from "@/components/site/spares";
import { Testimonials } from "@/components/site/testimonials";
import { ArrowRight } from "@/components/icons";

export const revalidate = 60;

export default async function HomePage() {
  const [brands, products, spares, testimonials, heroImage] = await Promise.all([
    getBrands(),
    getProducts(),
    getSpares(),
    getTestimonials(),
    getHeroImage(),
  ]);

  const available = products.filter((p) => p.stock_status !== "sold_out");
  const featured = available.filter((p) => p.is_featured);
  const showcase = (featured.length >= 3 ? featured : available).slice(0, 6);
  const spotlight = featured.find((p) => p.images.length) ?? available.find((p) => p.images.length) ?? null;
  const rating = testimonials.length
    ? Math.round((testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length) * 10) / 10
    : 4.9;
  // "Other" is a catch-all for filters and the admin, not a brand to show off.
  const showcaseBrands = brands.filter((b) => b.slug !== "other");
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.brand_id) acc[p.brand_id] = (acc[p.brand_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Hero image={heroImage} spotlight={spotlight} rating={rating} />
      <BrandMarquee brands={showcaseBrands} />

      <section id="bikes" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-8 pt-20 sm:px-6 lg:pt-28">
        <SectionHeading
          eyebrow="Hot in the showroom"
          title="Featured bikes"
          action={
            <Link href="/bikes" className="group inline-flex items-center gap-2 font-bold text-ignite">
              View all {products.length} bikes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          }
        />
      </section>
      <Categories />
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {showcase.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-line p-12 text-center text-mute">
            New bikes are arriving soon. Message us on WhatsApp for today&apos;s stock.
          </p>
        )}
      </section>

      <SparesSection spares={spares} />
      <BrandGrid brands={showcaseBrands} counts={counts} />
      <WhyUs />
      <Testimonials items={testimonials} />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
