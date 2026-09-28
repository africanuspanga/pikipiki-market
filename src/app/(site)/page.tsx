import Link from "next/link";
import { getBrands, getProducts, getTestimonials } from "@/lib/data";
import { Hero } from "@/components/site/hero";
import { BrandGrid, BrandMarquee, SectionHeading } from "@/components/site/brands";
import { ProductCard } from "@/components/site/product-card";
import { Categories, CtaBanner, HowItWorks, WhyUs } from "@/components/site/sections";
import { Testimonials } from "@/components/site/testimonials";
import { ArrowRight } from "@/components/icons";

export const revalidate = 60;

export default async function HomePage() {
  const [brands, products, testimonials] = await Promise.all([getBrands(), getProducts(), getTestimonials()]);

  const featured = products.filter((p) => p.is_featured);
  const showcase = (featured.length >= 3 ? featured : products).slice(0, 6);
  const spotlight = featured.find((p) => p.images.length) ?? products.find((p) => p.images.length) ?? null;
  const rating = testimonials.length
    ? Math.round((testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length) * 10) / 10
    : 4.9;
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.brand_id) acc[p.brand_id] = (acc[p.brand_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Hero spotlight={spotlight} rating={rating} />
      <BrandMarquee brands={brands} />

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

      <BrandGrid brands={brands} counts={counts} />
      <WhyUs />
      <Testimonials items={testimonials} />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
