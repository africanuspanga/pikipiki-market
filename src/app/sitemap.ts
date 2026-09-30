import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const latest = products.reduce((d, p) => (p.updated_at > d ? p.updated_at : d), "");
  return [
    { url: SITE.url, lastModified: latest || new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/bikes`, lastModified: latest || new Date(), changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${SITE.url}/bikes/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.slice(0, 5).map((i) => i.url),
    })),
  ];
}
