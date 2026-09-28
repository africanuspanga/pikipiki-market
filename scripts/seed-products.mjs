// Seeds starter bikes from the photos in assets/bike-photos. Usage: npm run db:seed
// Names, brands and prices are placeholders — correct them in /admin.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const photo = (t) => `assets/bike-photos/WhatsApp Image 2026-09-22 at ${t}.jpeg`;

const BIKES = [
  {
    name: "Boxer BM 150",
    brand: "boxer",
    category: "Boda Boda",
    price: 2_650_000,
    engine_cc: 150,
    color: "Black",
    short_description: "Tanzania's favourite boda boda — tough, fuel-smart and easy to maintain.",
    features: ["Rear carrier rack", "Kick & electric start", "Registered plates"],
    photos: [photo("11.46.43 (1)"), photo("11.46.42 (2)")],
    featured: true,
  },
  {
    name: "Adventure 200 — Orange Edition",
    brand: null,
    category: "Adventure",
    price: 4_300_000,
    engine_cc: 200,
    color: "Orange / Grey",
    short_description: "Off-road ready adventure bike with long-travel suspension and knobby tyres.",
    features: ["Upside-down front forks", "Hand guards", "Dual-purpose tyres"],
    photos: [photo("11.46.42"), photo("11.46.42 (1)")],
    featured: true,
  },
  {
    name: "Sport Tourer 250",
    brand: null,
    category: "Sport",
    price: 6_900_000,
    engine_cc: 250,
    color: "Matte Black",
    short_description: "Sporty tourer with a tall windscreen and gold forks — built for long highway runs.",
    features: ["Adjustable windscreen", "Gold upside-down forks", "LED headlights"],
    photos: [photo("11.48.16")],
    featured: true,
  },
  {
    name: "Street 150 — Red",
    brand: null,
    category: "Commuter",
    price: 2_850_000,
    engine_cc: 150,
    color: "Red / Black",
    short_description: "Reliable everyday commuter with a comfortable seat and carrier rack.",
    features: ["Rear carrier rack", "Alloy wheels", "Registered plates"],
    photos: [photo("11.46.43")],
    featured: true,
  },
  {
    name: "Maxi Scooter 150 — White",
    brand: null,
    category: "Scooter",
    price: 5_200_000,
    engine_cc: 150,
    transmission: "Automatic",
    color: "Pearl White",
    short_description: "Automatic maxi-scooter with gold wheels — effortless city riding in style.",
    features: ["Automatic (CVT)", "Under-seat storage", "Digital dashboard"],
    photos: [photo("11.46.41")],
    featured: true,
  },
  {
    name: "Urban Scooter 150 — Black",
    brand: null,
    category: "Scooter",
    price: 3_900_000,
    engine_cc: 150,
    transmission: "Automatic",
    color: "Black / Maroon",
    short_description: "Rugged automatic scooter with a rear rack — perfect for deliveries and daily errands.",
    features: ["Automatic (CVT)", "Rear carrier", "Chunky all-road tyres"],
    photos: [photo("11.49.50"), photo("11.49.51")],
    featured: true,
  },
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const { data: brands, error: brandErr } = await supabase.from("brands").select("id, slug");
if (brandErr) throw brandErr;

for (const bike of BIKES) {
  const slug = slugify(bike.name);
  const { data: exists } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
  if (exists) {
    console.log(`• skip ${bike.name} (exists)`);
    continue;
  }

  const { photos, brand, featured, ...fields } = bike;
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      ...fields,
      slug,
      brand_id: brands.find((b) => b.slug === brand)?.id ?? null,
      condition: "used",
      fuel_type: "Petrol",
      transmission: fields.transmission ?? "Manual",
      stock_status: "in_stock",
      is_featured: featured,
      is_published: true,
    })
    .select("id")
    .single();
  if (error) {
    console.error(`✖ ${bike.name}:`, error.message);
    continue;
  }

  for (const [i, file] of photos.entries()) {
    const storagePath = `products/${product.id}/${i + 1}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(storagePath, await readFile(file), { contentType: "image/jpeg", upsert: true });
    if (upErr) {
      console.error(`✖ upload ${file}:`, upErr.message);
      continue;
    }
    const url = supabase.storage.from("product-images").getPublicUrl(storagePath).data.publicUrl;
    await supabase.from("product_images").insert({ product_id: product.id, url, storage_path: storagePath, sort_order: i });
  }
  console.log(`✔ ${bike.name} (${photos.length} photo${photos.length > 1 ? "s" : ""})`);
}
